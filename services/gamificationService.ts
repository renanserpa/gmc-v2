import { supabase } from '../lib/supabaseClient.ts';
import { config } from '../config.ts';
import { notify } from '../lib/notification.ts';
import { haptics } from '../lib/haptics.ts';

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
 * Sistema de Conquistas Ocultas (Hidden Achievements)
 * Analisa o comportamento do aluno e libera recompensas surpresa.
 */
export const checkHiddenMissions = async (studentId: string, durationMinutes: number) => {
    const now = new Date();
    const hour = now.getHours();
    
    // Missão Secreta: Corujão (Praticar entre 00:00 e 05:00)
    if (hour >= 0 && hour < 5) {
        await applyXpEvent({
            studentId,
            eventType: 'HIDDEN_NIGHT_OWL',
            xpAmount: 100,
            contextType: 'hidden_mission'
        });
        notify.success("🏆 Conquista Secreta: Corujão! (+100 XP)");
    }

    // Missão Secreta: Maratonista (Praticar mais de 120 min)
    if (durationMinutes >= 120) {
        await applyXpEvent({
            studentId,
            eventType: 'HIDDEN_MARATHONER',
            xpAmount: 250,
            contextType: 'hidden_mission'
        });
        notify.success("🏆 Conquista Secreta: Maratonista! (+250 XP)");
    }
};

/**
 * Lógica de Streak com Revive Automático
 * Se o aluno possui o item 'Escudo de Ofensiva', o streak não quebra.
 */
export const processDailyStreak = async (studentId: string) => {
    const { data: student } = await supabase.from('students').select('last_activity_date, current_streak_days').eq('id', studentId).single();
    if (!student) return;

    const lastDate = student.last_activity_date ? new Date(student.last_activity_date) : null;
    const today = new Date();
    today.setHours(0,0,0,0);

    if (lastDate) {
        lastDate.setHours(0,0,0,0);
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
            // Tenta consumir o Escudo de Ofensiva de forma atômica via RPC
            const { data: reviveSuccess } = await supabase.rpc('consume_streak_shield', { student_uuid: studentId });
            
            if (reviveSuccess) {
                notify.warning("🛡️ Escudo de Ofensiva ativado! Seu Streak foi preservado.");
            } else {
                // Se não tem escudo, reseta o streak
                await supabase.from('students').update({ current_streak_days: 1 }).eq('id', studentId);
            }
        } else if (diffDays === 1) {
            await supabase.from('students').update({ current_streak_days: student.current_streak_days + 1 }).eq('id', studentId);
        }
    }
    
    await supabase.from('students').update({ last_activity_date: new Date().toISOString() }).eq('id', studentId);
};

export const applyXpEvent = async ({ studentId, eventType, xpAmount, contextType, contextId }: any): Promise<void> => {
    try {
        const { data: student, error: fetchError } = await supabase
            .from('students')
            .select('xp, coins, professor_id, name')
            .eq('id', studentId)
            .single();

        if (fetchError || !student) throw new Error("Estudante não encontrado.");

        const oldLevelInfo = getLevelInfo(student.xp || 0);
        const newTotalXp = (student.xp || 0) + xpAmount;
        const newLevelInfo = getLevelInfo(newTotalXp);
        const coinsEarned = Math.floor(xpAmount / 10);

        await supabase.from('xp_events').insert({
            player_id: studentId,
            event_type: eventType,
            xp_amount: xpAmount,
            coins_amount: coinsEarned,
            context_type: contextType,
            context_id: contextId,
        });

        await supabase.from('students').update({
            xp: newTotalXp,
            coins: (student.coins || 0) + coinsEarned,
            current_level: newLevelInfo.currentLevel,
            updated_at: new Date().toISOString()
        }).eq('id', studentId);

        // Multiplayer Pulse: Notifica a turma em tempo real via Supabase Broadcast
        if (newLevelInfo.currentLevel > oldLevelInfo.currentLevel) {
            haptics.success();
            const channel = supabase.channel(`classroom_${student.professor_id}`);
            channel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.send({
                        type: 'broadcast',
                        event: 'level_up',
                        payload: { studentName: student.name, level: newLevelInfo.currentLevel }
                    });
                }
            });
        }
    } catch (error) {
        console.error("Erro ao aplicar XP:", error);
    }
};

/**
 * Marca um item da biblioteca como concluído e premia o aluno.
 */
export const completeLibraryItem = async (studentId: string, itemId: string) => {
    try {
        const { data: student } = await supabase.from('students').select('completed_content_ids').eq('id', studentId).single();
        if (!student) return;

        const alreadyCompleted = student.completed_content_ids?.includes(itemId);
        if (alreadyCompleted) {
            notify.info("Você já masterizou este conteúdo!");
            return;
        }

        const newIds = [...(student.completed_content_ids || []), itemId];
        
        await supabase.from('students').update({ 
            completed_content_ids: newIds 
        }).eq('id', studentId);

        await applyXpEvent({
            studentId,
            eventType: 'LIBRARY_CONTENT_MASTERED',
            xpAmount: 20,
            contextType: 'library',
            contextId: itemId
        });

        notify.success("Estudo concluído! +20 XP ✨");
        haptics.success();
    } catch (e) {
        console.error("Erro ao completar item da biblioteca:", e);
    }
};

export const logPracticeSession = async (studentId: string, minutes: number) => {
    const xpBonus = Math.min(Math.floor(minutes / 10) * 5, 30);
    if (xpBonus <= 0) return;

    await applyXpEvent({
        studentId,
        eventType: 'PRACTICE_SESSION',
        xpAmount: xpBonus,
        contextType: 'practice_room'
    });

    await checkHiddenMissions(studentId, minutes);
};

export const getLeaderboard = async (professorId: string) => {
    const { data } = await supabase
        .from('students')
        .select('id, name, avatar_url, xp, current_level, current_streak_days')
        .eq('professor_id', professorId)
        .order('xp', { ascending: false })
        .limit(10);
    return data || [];
};

export const getPlayerAchievements = async (studentId: string) => {
    const { data } = await supabase
        .from('player_achievements')
        .select('*, achievement:achievements(*)')
        .eq('player_id', studentId);
    return data || [];
};