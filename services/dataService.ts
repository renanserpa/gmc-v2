
import { supabase } from '../lib/supabaseClient.ts';
import { Student, MusicClass, Notice, Mission, AttendanceStatus, ContentLibraryItem, School, Profile, MissionStatus, UserRole, LessonPlan } from '../types.ts';
import { applyXpEvent } from './gamificationService.ts';

// --- CONTENT VAULT SERVICES ---

export const getLibraryItems = async (professorId: string) => {
    const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .eq('professor_id', professorId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data as ContentLibraryItem[];
};

export const toggleFavoriteItem = async (itemId: string, status: boolean) => {
    const { error } = await supabase.from('content_library').update({ is_favorite: !status }).eq('id', itemId);
    if (error) throw error;
};

// --- LESSON PLANNER SERVICES ---

export const saveLessonPlan = async (plan: Partial<LessonPlan>) => {
    const { data, error } = await supabase.from('lesson_plans').upsert(plan).select().single();
    if (error) throw error;
    return data;
};

export const getLessonPlanByClass = async (classId: string) => {
    const { data, error } = await supabase.from('lesson_plans').select('*').eq('class_id', classId).maybeSingle();
    if (error) throw error;
    return data as LessonPlan;
};

/* Added updateStudent export */
export const updateStudent = async (id: string, updates: Partial<Student>) => {
    const { error } = await supabase.from('students').update(updates).eq('id', id);
    if (error) throw error;
};

/* Added linkStudentAccount export */
export const linkStudentAccount = async (code: string) => {
    // Mock logic for piloto
    if (code === 'DEV123') return { success: true };
    return { success: false, message: "Código inválido" };
};

/* Added linkGuardianAccount export */
export const linkGuardianAccount = async (code: string) => {
    // Mock logic for piloto
    if (code === 'KIDS123') return { success: true };
    return { success: false, message: "Código inválido" };
};

/* Added getMusicClasses export */
export const getMusicClasses = async (professorId: string) => {
    const { data, error } = await supabase.from('music_classes').select('*').eq('professor_id', professorId);
    if (error) throw error;
    return data as MusicClass[];
};

/* Added getLessonsByTeacher export */
export const getLessonsByTeacher = async (professorId: string) => {
    const { data, error } = await supabase
        .from('music_classes')
        .select('*')
        .eq('professor_id', professorId)
        .order('start_time', { ascending: true });
    if (error) throw error;
    return data as MusicClass[];
};

/* Added getStudentRepertoire export */
export const getStudentRepertoire = async (studentId: string) => {
    const { data, error } = await supabase.from('student_songs').select('*, songs(*)').eq('student_id', studentId);
    if (error) throw error;
    return data;
};

/* Added savePracticeSession export */
export const savePracticeSession = async (session: any) => {
    const { error } = await supabase.from('practice_sessions').insert([session]);
    if (error) throw error;
};

/* Added giveHighFive export */
export const giveHighFive = async (hallId: string) => {
    const { error } = await supabase.from('concert_hall').update({ high_fives_count: supabase.rpc('increment') }).eq('id', hallId);
    if (error) throw error;
};

/* Added getStudentAttendanceRate export */
export const getStudentAttendanceRate = async (studentId: string) => {
    // Mock logic
    return 85;
};

/* Added getStudentDetailedStats export */
export const getStudentDetailedStats = async (studentId: string) => {
    const [recordings, sessions] = await Promise.all([
        supabase.from('performance_recordings').select('*, songs(title)').eq('student_id', studentId),
        supabase.from('practice_sessions').select('*').eq('student_id', studentId)
    ]);
    return { recordings: recordings.data || [], sessions: sessions.data || [] };
};

/* Added addLibraryItem export */
export const addLibraryItem = async (item: Partial<ContentLibraryItem>) => {
    const { error } = await supabase.from('content_library').insert([item]);
    if (error) throw error;
};

/* Added getNotices export */
export const getNotices = async (userId: string, audience: string) => {
    const { data, error } = await supabase.from('notices').select('*').or(`target_audience.eq.all,target_audience.eq.${audience}`);
    if (error) throw error;
    return data as Notice[];
};

/* Added createNotice export */
export const createNotice = async (notice: Partial<Notice>) => {
    const { error } = await supabase.from('notices').insert([notice]);
    if (error) throw error;
};

/* Added updateUserInfo export */
export const updateUserInfo = async (userId: string, updates: Partial<Profile>) => {
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) throw error;
};

/* Added createTeacher export */
export const createTeacher = async (data: any) => {
    const { error } = await supabase.from('profiles').insert([data]);
    if (error) throw error;
};

/* Added getMissionsByStudent export */
export const getMissionsByStudent = async (studentId: string) => {
    const { data, error } = await supabase.from('missions').select('*, students(name)').eq('student_id', studentId);
    if (error) throw error;
    return data as Mission[];
};

/* Added getMissionsByTeacher export */
export const getMissionsByTeacher = async (teacherId: string) => {
    const { data, error } = await supabase
        .from('missions')
        .select('*, students(name)')
        .eq('professor_id', teacherId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Mission[];
};

/* Added getStudentMilestones export */
export const getStudentMilestones = async (studentId: string) => {
    const { data, error } = await supabase.from('player_milestones').select('*').eq('student_id', studentId);
    if (error) throw error;
    return data;
};

/* Added getLatestPracticeStats export */
export const getLatestPracticeStats = async (studentId: string) => {
    const { data, error } = await supabase.from('practice_sessions').select('*').eq('student_id', studentId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    return data;
};

/* Added updateMissionStatus export */
export const updateMissionStatus = async (missionId: string, studentId: string, status: MissionStatus, xpReward: number) => {
    const { error } = await supabase.from('missions').update({ status }).eq('id', missionId);
    if (error) throw error;
};

/* Added createMission export */
export const createMission = async (mission: Partial<Mission>) => {
    const { error } = await supabase.from('missions').insert([mission]);
    if (error) throw error;
};

/* Added getStudentsByTeacher export */
export const getStudentsByTeacher = async (teacherId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('role', 'student').eq('professor_id', teacherId);
    if (error) throw error;
    return data;
};

/* Added getProfessorAuditLogs export */
export const getProfessorAuditLogs = async (professorId: string) => {
    const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', professorId)
        .order('created_at', { ascending: false })
        .limit(20);
    if (error) throw error;
    return data;
};

/* Added updateMission export */
export const updateMission = async (id: string, updates: Partial<Mission>) => {
    const { error } = await supabase.from('missions').update(updates).eq('id', id);
    if (error) throw error;
};

/* Added deleteMission export */
export const deleteMission = async (id: string) => {
    const { error } = await supabase.from('missions').delete().eq('id', id);
    if (error) throw error;
};

/* Added provisionStaffMember export */
export const provisionStaffMember = async (data: any) => {
    const { error } = await supabase.from('profiles').insert([data]);
    if (error) throw error;
};

// ... restante das funções existentes ...
export const logSecurityAudit = async (action: string, metadata: any = {}) => {
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

export const getStudentsInClass = async (classId: string) => {
    const { data, error } = await supabase
        .from('enrollments')
        .select(`
            student_id,
            profiles:student_id (
                id,
                full_name,
                avatar_url,
                role
            )
        `)
        .eq('class_id', classId);

    if (error) throw error;
    return data?.map((d: any) => ({
        id: d.profiles.id,
        name: d.profiles.full_name,
        avatar_url: d.profiles.avatar_url
    })) || [];
};

export const markAttendance = async (studentId: string, classId: string, status: AttendanceStatus, professorId: string) => {
    const { error } = await supabase.from('attendance').upsert({
        student_id: studentId,
        class_id: classId,
        status,
        professor_id: professorId,
        date: new Date().toISOString().split('T')[0]
    }, { onConflict: 'student_id,class_id,date' });
    if (error) throw error;
};

export const getTodayAttendanceForClass = async (classId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('class_id', classId)
        .eq('date', today);
        
    const map: Record<string, AttendanceStatus> = {};
    data?.forEach(row => map[row.student_id] = row.status as AttendanceStatus);
    return map;
};

export const logClassSession = async (log: any) => {
    const { error } = await supabase.from('class_logs').insert([log]);
    if (error) throw error;
};
