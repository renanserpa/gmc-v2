
import { supabase } from '../lib/supabaseClient.ts';
import { Student, MusicClass, Notice, Mission, AttendanceStatus, ContentLibraryItem, School, Profile, MissionStatus, UserRole, LessonPlan } from '../types.ts';
import { applyXpEvent } from './gamificationService.ts';

// --- STUDENT SERVICES ---

export const getLatestFamilyReport = async (studentId: string) => {
    const { data, error } = await supabase
        .from('family_reports')
        .select('*')
        .eq('student_id', studentId)
        .order('sent_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (error) throw error;
    return data;
};

export const updatePracticeMinutes = async (studentId: string, minutes: number) => {
    // Busca os minutos atuais para somar
    const { data: profile } = await supabase.from('profiles').select('metadata').eq('id', studentId).single();
    const currentMinutes = profile?.metadata?.weekly_practice_minutes || 0;
    const newTotal = currentMinutes + minutes;

    const { error } = await supabase.from('profiles').update({
        metadata: { 
            ...(profile?.metadata || {}), 
            weekly_practice_minutes: newTotal,
            last_practice_at: new Date().toISOString()
        }
    }).eq('id', studentId);
    
    if (error) throw error;

    // Se bater a meta de 15 min, concede badge (simulado no metadata por enquanto)
    if (newTotal >= 15 && !profile?.metadata?.badges?.includes('disciplined')) {
        await applyXpEvent({
            studentId,
            eventType: 'DISCIPLINED_MUSICIAN',
            xpAmount: 50,
            schoolId: profile?.school_id || ""
        });
    }
    return newTotal;
};

export const getActiveLessonMaterial = async (classId: string) => {
    const { data, error } = await supabase
        .from('classroom_orchestration')
        .select(`
            active_exercise_id,
            content_library:active_exercise_id (*)
        `)
        .eq('class_id', classId)
        .maybeSingle();
    
    if (error) return null;
    return data?.content_library;
};

export const savePracticeTime = async (studentId: string, seconds: number, instrument: string) => {
    const { error } = await supabase.from('practice_sessions').insert([{
        student_id: studentId,
        duration_seconds: seconds,
        instrument: instrument,
        created_at: new Date().toISOString()
    }]);
    if (error) throw error;
    
    // Concede 10 XP a cada 5 min de treino (300s)
    const xpBonus = Math.floor(seconds / 300) * 10;
    if (xpBonus > 0) {
        const { data: student } = await supabase.from('students').select('school_id').eq('id', studentId).single();
        if (student) {
            await applyXpEvent({
                studentId,
                eventType: 'SOLO_PRACTICE',
                xpAmount: xpBonus,
                schoolId: student.school_id
            });
        }
    }
};

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

// --- PRESETS SERVICES ---

export const saveLivePreset = async (professorId: string, toolName: string, settings: any) => {
    const { data, error } = await supabase.from('live_tool_presets').insert([{
        professor_id: professorId,
        tool_name: toolName,
        settings
    }]).select();
    if (error) throw error;
    return data;
};

export const getLivePresets = async (professorId: string, toolName: string) => {
    const { data, error } = await supabase
        .from('live_tool_presets')
        .select('*')
        .eq('professor_id', professorId)
        .eq('tool_name', toolName);
    if (error) throw error;
    return data;
};

// --- REPORT SERVICES ---

export const saveFamilyReport = async (report: { student_id?: string, teacher_id: string, report_text: string, class_id: string, metadata?: any }) => {
    const { error } = await supabase.from('family_reports').insert([report]);
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

export const updateStudent = async (id: string, updates: Partial<Student>) => {
    const { error } = await supabase.from('students').update(updates).eq('id', id);
    if (error) throw error;
};

export const linkStudentAccount = async (code: string) => {
    if (code === 'DEV123') return { success: true };
    return { success: false, message: "Código inválido" };
};

export const linkGuardianAccount = async (code: string) => {
    if (code === 'KIDS123') return { success: true };
    return { success: false, message: "Código inválido" };
};

export const getMusicClasses = async (professorId: string) => {
    const { data, error } = await supabase.from('music_classes').select('*').eq('professor_id', professorId);
    if (error) throw error;
    return data as MusicClass[];
};

export const getLessonsByTeacher = async (professorId: string) => {
    const { data, error } = await supabase
        .from('music_classes')
        .select('*')
        .eq('professor_id', professorId)
        .order('start_time', { ascending: true });
    if (error) throw error;
    return data as MusicClass[];
};

export const getStudentRepertoire = async (studentId: string) => {
    const { data, error } = await supabase.from('student_songs').select('*, songs(*)').eq('student_id', studentId);
    if (error) throw error;
    return data;
};

export const giveHighFive = async (hallId: string) => {
    const { error } = await supabase.from('concert_hall').update({ high_fives_count: supabase.rpc('increment') }).eq('id', hallId);
    if (error) throw error;
};

export const getStudentAttendanceRate = async (studentId: string) => {
    return 85;
};

export const getStudentDetailedStats = async (studentId: string) => {
    const [recordings, sessions] = await Promise.all([
        supabase.from('performance_recordings').select('*, songs(title)').eq('student_id', studentId),
        supabase.from('practice_sessions').select('*').eq('student_id', studentId)
    ]);
    return { recordings: recordings.data || [], sessions: sessions.data || [] };
};

export const addLibraryItem = async (item: Partial<ContentLibraryItem>) => {
    const { error } = await supabase.from('content_library').insert([item]);
    if (error) throw error;
};

export const getNotices = async (userId: string, audience: string) => {
    const { data, error } = await supabase.from('notices').select('*').or(`target_audience.eq.all,target_audience.eq.${audience}`);
    if (error) throw error;
    return data as Notice[];
};

export const createNotice = async (notice: Partial<Notice>) => {
    const { error } = await supabase.from('notices').insert([notice]);
    if (error) throw error;
};

export const updateUserInfo = async (userId: string, updates: Partial<Profile>) => {
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) throw error;
};

export const getMissionsByStudent = async (studentId: string) => {
    const { data, error } = await supabase.from('missions').select('*, students(name)').eq('student_id', studentId);
    if (error) throw error;
    return data as Mission[];
};

export const getMissionsByTeacher = async (teacherId: string) => {
    const { data, error } = await supabase
        .from('missions')
        .select('*, students(name)')
        .eq('professor_id', teacherId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Mission[];
};

export const updateMissionStatus = async (missionId: string, studentId: string, status: MissionStatus, xpReward: number) => {
    const { error } = await supabase.from('missions').update({ status }).eq('id', missionId);
    if (error) throw error;
};

export const createMission = async (mission: Partial<Mission>) => {
    const { error } = await supabase.from('missions').insert([mission]);
    if (error) throw error;
};

export const getStudentsByTeacher = async (teacherId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('role', 'student').eq('professor_id', teacherId);
    if (error) throw error;
    return data;
};

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

export const updateMission = async (id: string, updates: Partial<Mission>) => {
    const { error } = await supabase.from('missions').update(updates).eq('id', id);
    if (error) throw error;
};

export const deleteMission = async (id: string) => {
    const { error } = await supabase.from('missions').delete().eq('id', id);
    if (error) throw error;
};

export const provisionStaffMember = async (data: any) => {
    const { error } = await supabase.from('profiles').insert([data]);
    if (error) throw error;
};

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

export const createTeacher = async (data: any) => {
    const { error } = await supabase.from('profiles').insert([{ ...data, role: 'professor' }]);
    if (error) throw error;
};

export const getStudentMilestones = async (studentId: string) => {
    return [];
};

export const getLatestPracticeStats = async (studentId: string) => {
    return null;
};
