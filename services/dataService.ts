import { supabase } from '../lib/supabaseClient.ts';
import { Student, MusicClass, Notice, Mission, AttendanceStatus, ContentLibraryItem, School, Profile, MissionStatus } from '../types.ts';
import { Star, Zap, Trophy, Flag } from 'lucide-react';
import { applyXpEvent } from './gamificationService.ts';

// --- ADMIN & GOVERNANCE SERVICES ---

export const getAdminSchools = async (): Promise<School[]> => {
    const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

/**
 * Mutação Reativa de Status de Unidade.
 * O retorno .select().single() é crucial para o broadcast CDC do Realtime.
 */
export const updateSchoolStatus = async (schoolId: string, isActive: boolean) => {
    const { data, error } = await supabase
        .from('schools')
        .update({ is_active: isActive })
        .eq('id', schoolId)
        .select()
        .single();
    
    if (error) throw error;

    // Broadcast manual para eventos que exigem ação imediata do cliente (Kill Switch)
    if (!isActive) {
        await supabase.channel('maestro_global_control').send({
            type: 'broadcast',
            event: 'tenant_suspended',
            payload: { school_id: schoolId }
        });
    }

    return data;
};

export const getStudentCountBySchool = async (schoolId: string): Promise<number> => {
    const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId);
    
    if (error) return 0;
    return count || 0;
};

export const logSecurityAudit = async (action: string, metadata: any = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('audit_logs').insert([{
        professor_id: user.id,
        event_type: `SECURITY_${action}`,
        description: JSON.stringify(metadata),
        created_at: new Date().toISOString()
    }]);
};

export const updateUserInfo = async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const createAdminSchool = async (schoolData: Partial<School> & { slug: string }) => {
    const { data, error } = await supabase
        .from('schools')
        .insert([{
            name: schoolData.name,
            slug: schoolData.slug,
            is_active: true,
            branding: schoolData.branding || { primaryColor: '#38bdf8', secondaryColor: '#a78bfa', borderRadius: '24px', logoUrl: null },
            settings: schoolData.settings || { max_students: 50, storage_gb: 5 }
        }])
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const createAdminProfessor = async (profData: { email: string, full_name: string, school_id?: string }) => {
    const { data: profile, error: pError } = await supabase
        .from('profiles')
        .insert([{
            email: profData.email,
            full_name: profData.full_name,
            role: 'professor',
            school_id: profData.school_id || null
        }])
        .select()
        .single();

    if (pError) throw pError;
    return profile;
};

// --- MISSION SERVICES ---

export const getMissionsByStudent = async (studentId: string): Promise<Mission[]> => {
    const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
    return data || [];
};

export const updateMissionStatus = async (missionId: string, studentId: string, status: MissionStatus, xpReward: number) => {
    const { data, error } = await supabase
        .from('missions')
        .update({ status })
        .eq('id', missionId)
        .select()
        .single();

    if (error) throw error;

    if (status === MissionStatus.Done) {
        const { data: student } = await supabase.from('students').select('school_id').eq('id', studentId).single();
        await applyXpEvent({
            studentId,
            eventType: 'MISSION_COMPLETE',
            xpAmount: xpReward,
            contextType: 'mission',
            contextId: missionId,
            schoolId: student?.school_id || ""
        });
    }
    return data;
};

export const updateMission = async (missionId: string, updates: Partial<Mission>) => {
    const { data, error } = await supabase
        .from('missions')
        .update(updates)
        .eq('id', missionId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteMission = async (missionId: string) => {
    const { error } = await supabase.from('missions').delete().eq('id', missionId);
    if (error) throw error;
    return true;
};

export const createMission = async (mission: Partial<Mission>) => {
  const { data, error } = await supabase.from('missions').insert([mission]).select().single();
  if (error) throw error;
  return data;
};

// --- CORE ANALYTICS ---

export const getSystemStats = async () => {
    const { count: totalStudents } = await supabase.from('students').select('*', { count: 'exact', head: true });
    const { count: totalProfs } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'professor');
    const { count: totalSchools } = await supabase.from('schools').select('*', { count: 'exact', head: true });
    return { totalStudents: totalStudents || 0, totalProfs: totalProfs || 0, totalSchools: totalSchools || 0, totalContent: 0 };
};

export const createNotice = async (notice: Partial<Notice>) => {
    const { data, error } = await supabase
        .from('notices')
        .insert([notice])
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const getStudentsByTeacher = async (professorId: string): Promise<Student[]> => {
  const { data } = await supabase.from('students').select('*').eq('professor_id', professorId);
  return data || [];
};

export const getMusicClasses = async (professorId: string): Promise<MusicClass[]> => {
  const { data } = await supabase.from('music_classes').select('*').eq('professor_id', professorId).order('start_time', { ascending: true });
  return data || [];
};

export const getContentLibrary = async (professorId: string): Promise<ContentLibraryItem[]> => {
  const { data } = await supabase.from('content_library').select('*').eq('professor_id', professorId).order('created_at', { ascending: false });
  return data || [];
};

export const addLibraryItem = async (item: Partial<ContentLibraryItem>) => {
  const { data, error } = await supabase.from('content_library').insert([item]).select().single();
  if (error) throw error;
  return data;
};

export const updateStudent = async (studentId: string, updates: Partial<Student>) => {
    const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', studentId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const linkStudentAccount = async (code: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const { data, error } = await supabase
        .from('students')
        .update({ auth_user_id: user.id })
        .eq('invite_code', code)
        .select()
        .single();

    if (error || !data) return { success: false, message: "Código inválido ou já utilizado." };
    return { success: true };
};

export const linkGuardianAccount = async (code: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const { data, error } = await supabase
        .from('students')
        .update({ guardian_id: user.id })
        .eq('invite_code', code)
        .select()
        .single();

    if (error || !data) return { success: false, message: "Código inválido." };
    return { success: true };
};

export const getStudentMilestones = async (studentId: string) => {
    const { data } = await supabase
        .from('student_milestones')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: true });
    return data || [];
};

export const getPracticeTrends = async (studentId: string) => {
    const { data } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(10);
    return data || [];
};

export const getLatestPracticeStats = async (studentId: string) => {
    const { data } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    return data || null;
};

export const getStudentRepertoire = async (studentId: string) => {
    const { data } = await supabase
        .from('student_songs')
        .select('*, songs(*)')
        .eq('student_id', studentId);
    return data || [];
};

export const savePracticeSession = async (sessionData: any) => {
    const { data, error } = await supabase
        .from('practice_sessions')
        .insert([sessionData])
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const giveHighFive = async (hallId: string) => {
    const { error } = await supabase.rpc('increment_high_five', { performance_id: hallId });
    if (error) throw error;
    return true;
};

export const markAttendance = async (studentId: string, classId: string, status: AttendanceStatus, professorId: string) => {
    const { error } = await supabase.rpc('register_attendance', {
        p_student_id: studentId,
        p_class_id: classId,
        p_status: status,
        p_professor_id: professorId
    });
    if (error) return false;
    return true;
};

export const getTodayAttendanceForClass = async (classId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('class_id', classId)
        .gte('created_at', today);
    
    const map: Record<string, AttendanceStatus> = {};
    data?.forEach(row => { map[row.student_id] = row.status as AttendanceStatus; });
    return map;
};

export const getStudentAttendanceRate = async (studentId: string): Promise<number> => {
    const { data, error } = await supabase.rpc('get_attendance_rate', { p_student_id: studentId });
    if (error) return 0;
    return data || 0;
};

export const getStudentDetailedStats = async (studentId: string) => {
    const [recordings, milestones] = await Promise.all([
        supabase.from('performance_recordings').select('*, songs(title)').eq('student_id', studentId).order('created_at', { ascending: false }),
        supabase.from('student_milestones').select('*').eq('student_id', studentId)
    ]);
    return {
        recordings: recordings.data || [],
        milestones: milestones.data || []
    };
};

export const getNotices = async (userId: string, targetType: string) => {
    let query = supabase.from('notices').select('*');
    if (targetType === 'student') {
        query = query.or('target_audience.eq.all,target_audience.eq.students');
    }
    const { data } = await query.order('created_at', { ascending: false });
    return data || [];
};
