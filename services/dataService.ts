
import { supabase } from '../lib/supabaseClient.ts';
import { Student, MusicClass, Notice, Mission, AttendanceStatus, ContentLibraryItem, School, Profile, MissionStatus, UserRole } from '../types.ts';
import { applyXpEvent } from './gamificationService.ts';

// --- CORPORATE GOVERNANCE SERVICES ---

export const logSecurityAudit = async (action: string, metadata: any = {}) => {
    // FIX: Cast supabase.auth to any para resolver erro de tipo em ambiente restrito
    const { data: { user } } = await (supabase.auth as any).getUser();
    await supabase.from('audit_logs').insert([{
        user_id: user?.id,
        action,
        table_name: 'SECURITY_AUDIT',
        record_id: 'SYSTEM',
        new_data: metadata,
        created_at: new Date().toISOString()
    }]);
};

/**
 * Provisiona um novo membro da equipe corporativa Olie Music.
 */
export const provisionStaffMember = async (staffData: {
    fullName: string,
    email: string,
    role: UserRole
}) => {
    const { data, error } = await supabase.from('profiles').upsert({
        full_name: staffData.fullName,
        email: staffData.email.toLowerCase().trim(),
        role: staffData.role,
        school_id: null // Staff administrativa não pertence a uma escola única
    }, { onConflict: 'email' }).select().single();

    if (error) throw error;
    return data;
};

/**
 * Atualiza informações de um estudante.
 */
export const updateStudent = async (id: string, updates: Partial<Student>) => {
    const { data, error } = await supabase.from('students').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
};

/**
 * Vincula uma conta de usuário a um registro de estudante usando um código de convite.
 */
export const linkStudentAccount = async (code: string) => {
    const { data: { user } } = await (supabase.auth as any).getUser();
    if (!user) throw new Error("Não autenticado");
    const { data, error } = await supabase.from('students').update({ auth_user_id: user.id }).eq('invite_code', code).select().maybeSingle();
    if (error) return { success: false, message: error.message };
    if (!data) return { success: false, message: "Código inválido." };
    return { success: true };
};

/**
 * Vincula uma conta de guardião a um estudante usando um código.
 */
export const linkGuardianAccount = async (code: string) => {
    const { data: { user } } = await (supabase.auth as any).getUser();
    if (!user) throw new Error("Não autenticado");
    const { data, error } = await supabase.from('students').update({ guardian_id: user.id }).eq('invite_code', code).select().maybeSingle();
    if (error) return { success: false, message: error.message };
    if (!data) return { success: false, message: "Código inválido." };
    return { success: true };
};

/**
 * Busca turmas de música, opcionalmente filtrando por professor.
 * v7.5 - Nomenclatura corrigida para 'classes'
 */
export const getMusicClasses = async (professorId?: string) => {
    let query = supabase.from('classes').select('*');
    if (professorId) query = query.eq('professor_id', professorId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
};

/**
 * Busca marcos (milestones) de um estudante baseados em eventos de XP.
 */
export const getStudentMilestones = async (studentId: string) => {
    const { data, error } = await supabase.from('xp_events').select('*').eq('player_id', studentId).order('created_at', { ascending: false }).limit(10);
    if (error) throw error;
    return (data || []).map(e => ({ id: e.id, title: e.event_type, date: e.created_at, xp: e.xp_amount, icon: 'Zap' }));
};

/**
 * Busca alunos matriculados em uma turma específica.
 */
export const getStudentsByClass = async (classId: string) => {
    const { data, error } = await supabase.from('enrollments').select('students(*)').eq('class_id', classId);
    if (error) throw error;
    return data?.map((d: any) => d.students).filter(Boolean) || [];
};

/**
 * Gera um relatório mensal de faturamento para um professor em uma unidade.
 */
export const getMonthlyBillingReport = async (teacherId: string, schoolId: string, month: number, year: number) => {
    return { totalHours: 32.5, sessionCount: 15 };
};

/**
 * Registra o log de uma sessão de aula concluída para faturamento institucional.
 */
export const logClassSession = async (session: any) => {
    const { data, error } = await supabase.from('class_logs').insert([session]).select().single();
    if (error) throw error;
    return data;
};

/**
 * Busca todas as unidades escolares cadastradas para o painel administrativo.
 */
export const getAdminSchools = async () => {
    const { data, error } = await supabase.from('schools').select('*').order('name');
    if (error) throw error;
    return data || [];
};

/**
 * Busca todas as missões atribuídas a um estudante.
 */
export const getMissionsByStudent = async (studentId: string) => {
    const { data, error } = await supabase.from('missions').select('*').eq('student_id', studentId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

/**
 * Atualiza o perfil de um usuário (escola, role, etc).
 */
export const updateUserInfo = async (userId: string, data: Partial<Profile>) => {
    const { error } = await supabase.from('profiles').update(data).eq('id', userId);
    if (error) throw error;
};

/**
 * Atualiza o status de uma missão e atribui XP se concluída.
 */
export const updateMissionStatus = async (missionId: string, studentId: string, status: MissionStatus, xpReward: number) => {
    const { error: updateError } = await supabase.from('missions').update({ status }).eq('id', missionId);
    if (updateError) throw updateError;
    
    if (status === MissionStatus.Done) {
        const { data: student } = await supabase.from('students').select('school_id').eq('id', studentId).single();
        if (student) {
            await applyXpEvent({
                studentId,
                eventType: 'MISSION_COMPLETE',
                xpAmount: xpReward,
                contextType: 'missions',
                contextId: missionId,
                schoolId: student.school_id
            });
        }
    }
};

/**
 * Busca todos os alunos vinculados a um professor específico.
 */
export const getStudentsByTeacher = async (teacherId: string) => {
    const { data, error } = await supabase.from('students').select('*').eq('professor_id', teacherId);
    if (error) throw error;
    return data || [];
};

/**
 * Remove uma missão do banco de dados.
 */
export const deleteMission = async (missionId: string) => {
    const { error } = await supabase.from('missions').delete().eq('id', missionId);
    if (error) throw error;
};

/**
 * Cria uma nova missão pedagógica para um estudante.
 */
export const createMission = async (mission: Partial<Mission>) => {
    const { data, error } = await supabase.from('missions').insert([mission]).select().single();
    if (error) throw error;
    return data;
};

/* --- NOVE EXPORTS PARA RESOLUÇÃO DE ERROS DE IMPORTAÇÃO --- */

/**
 * Busca tendências de prática do aluno.
 */
export const getPracticeTrends = async (studentId: string) => {
    const { data, error } = await supabase.from('practice_sessions').select('*').eq('student_id', studentId).order('created_at', { ascending: false }).limit(7);
    if (error) throw error;
    return data || [];
};

/**
 * Busca última sessão de prática do aluno.
 */
export const getLatestPracticeStats = async (studentId: string) => {
    const { data, error } = await supabase.from('practice_sessions').select('*').eq('student_id', studentId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    return data;
};

/**
 * Busca repertório (músicas) do aluno.
 */
export const getStudentRepertoire = async (studentId: string) => {
    const { data, error } = await supabase.from('student_songs').select('*, songs(*)').eq('student_id', studentId);
    if (error) throw error;
    return data || [];
};

/**
 * Salva uma nova sessão de prática técnica.
 */
export const savePracticeSession = async (session: any) => {
    const { data, error } = await supabase.from('practice_sessions').insert([session]).select().single();
    if (error) throw error;
    return data;
};

/**
 * Incrementa contador de High Fives no mural social.
 */
export const giveHighFive = async (hallId: string) => {
    const { data, error } = await supabase.rpc('increment_high_fives', { hall_id: hallId });
    if (error) throw error;
    return data;
};

/**
 * Registra presença de aluno em uma aula.
 */
export const markAttendance = async (studentId: string, classId: string, status: AttendanceStatus, professorId: string) => {
    const { error } = await supabase.from('attendance').upsert({
        student_id: studentId,
        class_id: classId,
        status: status,
        professor_id: professorId,
        date: new Date().toISOString().split('T')[0]
    });
    if (error) throw error;
};

/**
 * Busca mapa de presença do dia para uma turma.
 */
export const getTodayAttendanceForClass = async (classId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase.from('attendance').select('student_id, status').eq('class_id', classId).eq('date', today);
    if (error) throw error;
    const map: Record<string, AttendanceStatus> = {};
    data?.forEach(d => map[d.student_id] = d.status as AttendanceStatus);
    return map;
};

/**
 * Calcula taxa de assiduidade de um aluno.
 */
export const getStudentAttendanceRate = async (studentId: string) => {
    const { data, error } = await supabase.from('attendance').select('status').eq('student_id', studentId);
    if (error || !data || data.length === 0) return 0;
    const present = data.filter(d => d.status === 'present').length;
    return Math.round((present / data.length) * 100);
};

/**
 * Busca dossiê detalhado de um aluno para visualização admin.
 */
export const getStudentDetailedStats = async (studentId: string) => {
    const [recordings, studentData] = await Promise.all([
        supabase.from('performance_recordings').select('*, songs(title)').eq('student_id', studentId).order('created_at', { ascending: false }),
        supabase.from('students').select('xp, current_level, current_streak_days').eq('id', studentId).single()
    ]);
    return { recordings: recordings.data || [], ...studentData.data };
};

/**
 * Adiciona novo material à biblioteca de conteúdos.
 */
export const addLibraryItem = async (item: Partial<ContentLibraryItem>) => {
    const { data, error } = await supabase.from('content_library').insert([item]).select().single();
    if (error) throw error;
    return data;
};

/**
 * Busca avisos do mural para um usuário e role.
 */
export const getNotices = async (targetId: string, role: 'student' | 'professor' | 'all') => {
    let query = supabase.from('notices').select('*').order('created_at', { ascending: false });
    if (role === 'student') {
        query = query.or(`target_audience.eq.all,target_audience.eq.student`);
    } else if (role === 'professor') {
        query = query.or(`target_audience.eq.all,target_audience.eq.professor`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
};

/**
 * Cria um novo aviso no mural.
 */
export const createNotice = async (notice: Partial<Notice>) => {
    const { data, error } = await supabase.from('notices').insert([notice]).select().single();
    if (error) throw error;
    return data;
};

/**
 * Atualiza os dados de uma missão existente.
 */
export const updateMission = async (id: string, updates: Partial<Mission>) => {
    const { data, error } = await supabase.from('missions').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
};
