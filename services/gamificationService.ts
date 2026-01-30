import { supabase } from '../lib/supabaseClient.ts';
import { config } from '../config.ts';
import { notify } from '../lib/notification.ts';
import { haptics } from '../lib/haptics.ts';
import { PlayerAchievement } from '../types.ts';

const LEVEL_THRESHOLDS = config.gamification.levels;

export const getLevelInfo = (totalXp: number) => {
    let currentLevel = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (totalXp >= LEVEL_THRESHOLDS[i]) {
            currentLevel = i + 1;
            break;
        }
    }
    const xpToNextLevel = LEVEL_THRESHOLDS[currentLevel] || (LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 500);
    return { currentLevel, xpToNextLevel };
};

/**
 * DNA OLIE: Transação Segura com injeção de school_id e auditoria de RLS.
 */
export const applyXpEvent = async ({ studentId, eventType, xpAmount, contextType, contextId, schoolId }: {
    studentId: string,
    eventType: string,
    xpAmount: number,
    contextType?: string,
    contextId?: string,
    schoolId: string
}): Promise<void> => {
    // Hardening: Validação de Tenancy obrigatória
    if (!schoolId || schoolId === "") {
        console.error("[Maestro Security] FALHA DE RLS: school_id ausente na transação.");
        throw new Error("Violacao de Tenancy: school_id eh obrigatorio.");
    }

    try {
        const { data: student, error: fetchError } = await supabase
            .from('students')
            .select('xp, coins')
            .eq('id', studentId)
            .eq('school_id', schoolId) // Filtro explícito de RLS
            .single();

        if (fetchError || !student) throw new Error("Estudante nao autorizado ou inexistente no tenant.");

        const oldLevelInfo = getLevelInfo(student.xp || 0);
        const newTotalXp = (student.xp || 0) + xpAmount;
        const newLevelInfo = getLevelInfo(newTotalXp);
        const coinsEarned = Math.floor(xpAmount / 10);

        // Registro de auditoria
        await supabase.from('xp_events').insert({
            player_id: studentId,
            event_type: eventType,
            xp_amount: xpAmount,
            coins_amount: coinsEarned,
            context_type: contextType,
            context_id: contextId,
            school_id: schoolId 
        });

        // Atualização de estado
        await supabase.from('students').update({
            xp: newTotalXp,
            coins: (student.coins || 0) + coinsEarned,
            current_level: newLevelInfo.currentLevel,
            updated_at: new Date().toISOString()
        }).eq('id', studentId).eq('school_id', schoolId);

        if (newLevelInfo.currentLevel > oldLevelInfo.currentLevel) {
            haptics.success();
            notify.success(`LEVEL UP! Nível ${newLevelInfo.currentLevel}`);
        }
    } catch (error) {
        console.error("[Gamification Fatal]", error);
    }
};

/**
 * Leaderboard Anonimizado (COPPA/LGPD Compliance)
 * Aplica máscara "Primeiro Nome + S."
 */
export const getLeaderboard = async (professorId: string, schoolId: string) => {
    if (!schoolId) return [];

    const { data } = await supabase
        .from('students')
        .select('id, name, avatar_url, xp, current_level')
        .eq('professor_id', professorId)
        .eq('school_id', schoolId)
        .order('xp', { ascending: false })
        .limit(10);

    return (data || []).map(s => {
        // Regex para anonimização: Enzo Serpa -> Enzo S.
        const anonymizedName = s.name.replace(/^(\S+)\s+(\S).*/, '$1 $2.');
        
        return { 
            ...s, 
            name: anonymizedName === s.name && s.name.includes(' ') 
                ? anonymizedName 
                : s.name.split(' ')[0] + (s.name.split(' ').length > 1 ? ` ${s.name.split(' ')[1][0]}.` : '')
        };
    });
};

export const getPlayerAchievements = async (playerId: string): Promise<PlayerAchievement[]> => {
    const { data } = await supabase
        .from('player_achievements')
        .select('*, achievements(*)')
        .eq('player_id', playerId);
    return data || [];
};

export const completeLibraryItem = async (studentId: string, itemId: string): Promise<void> => {
    try {
        const { data: student } = await supabase
            .from('students')
            .select('school_id')
            .eq('id', studentId)
            .single();

        if (student?.school_id) {
            await applyXpEvent({
                studentId,
                eventType: 'CONTENT_MASTERED',
                xpAmount: 20,
                contextType: 'library',
                contextId: itemId,
                schoolId: student.school_id
            });
        }
    } catch (error) {
        console.error("Erro ao completar item:", error);
    }
};
