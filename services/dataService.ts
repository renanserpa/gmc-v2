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

export const updateSchoolStatus = async (schoolId: string, isActive: boolean) => {
    const { data, error } = await supabase
        .from('schools')
        .update({ is_active: isActive })
        .eq('id', schoolId)
        .select()
        .single();
    
    if (error) throw error;

    // Broadcast Kill Switch via Realtime
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

export const getProfessors = async (): Promise<Profile[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'professor')
        .order('full_name', { ascending: true });
    if (error) throw error;
    return data || [];
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

export const getMusicClasses = async (professorId: string): Promise<MusicClass[]> => {
  const { data } = await supabase.from('music_classes').select('*').eq('professor_id', professorId).order('start_time', { ascending: true });
  return data || [];
};

export const getStudentsByTeacher = async (professorId: string): Promise<Student[]> => {
  const { data } = await supabase.from('students').select('*').eq('professor_id', professorId);
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

// --- STUDENT & JOURNEY SERVICES ---

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
    if (!user) return { success: false, message: "Usuário não autenticado" };

    const { data: student, error } = await supabase
        .from('students')
        .update({ auth_user_id: user.id })
        .eq('invite_code', code)
        .is('auth_user_id', null)
        .select()
        .single();

    if (error || !student) return { success: false, message: "Código inválido ou já utilizado." };
    return { success: true, student };
};

export const linkGuardianAccount = async (code: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Usuário não autenticado" };

    const { data: student, error } = await supabase
        .from('students')
        .update({ guardian_id: user.id })
        .eq('access_code', code)
        .select()
        .single();

    if (error || !student) return { success: false, message: "Código de aluno não localizado." };
    return { success: true, student };
};

export const getStudentMilestones = async (studentId: string) => {
    const { data } = await supabase
        .from('xp_events')
        .select('*')
        .eq('player_id', studentId)
        .order('created_at', { ascending: false });
    
    return (data || []).map(event => ({
        id: event.id,
        title: event.event_type.replace(/_/g, ' '),
        date: event.created_at,
        icon: Star,
        xp: event.xp_amount
    }));
};

export const getPracticeTrends = async (studentId: string) => {
    const { data } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
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

export const savePracticeSession = async (studentId: string, stats: any) => {
    const { data, error } = await supabase
        .from('practice_sessions')
        .insert([{ student_id: studentId, ...stats }])
        .select()
        .single();
    if (error) throw error;
    return data;
};

// --- SOCIAL & FEEDBACK ---

export const giveHighFive = async (hallId: string) => {
    const { data, error } = await supabase.rpc('increment_high_fives', { hall_id: hallId });
    if (error) {
        const { data: current } = await supabase.from('concert_hall').select('high_fives_count').eq('id', hallId).single();
        await supabase.from('concert_hall').update({ high_fives_count: (current?.high_fives_count || 0) + 1 }).eq('id', hallId);
        return true;
    }
    return data;
};

// --- ATTENDANCE & REPORTING ---

export const markAttendance = async (studentId: string, classId: string, status: AttendanceStatus, professorId: string) => {
    const { data, error } = await supabase
        .from('attendance_logs')
        .insert([{
            student_id: studentId,
            music_class_id: classId,
            status: status,
            attendance_date: new Date().toISOString()
        }]);
    
    if (error) return false;

    if (status === 'present' || status === 'late') {
        const xpAmount = status === 'present' ? 20 : 10;
        const { data: student } = await supabase.from('students').select('school_id').eq('id', studentId).single();
        await applyXpEvent({
            studentId,
            eventType: 'CLASS_ATTENDANCE',
            xpAmount,
            contextType: 'attendance',
            contextId: classId,
            schoolId: student?.school_id || ""
        });
    }

    return true;
};

export const getTodayAttendanceForClass = async (classId: string): Promise<Record<string, AttendanceStatus>> => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
        .from('attendance_logs')
        .select('student_id, status')
        .eq('music_class_id', classId)
        .gte('attendance_date', today);
    
    const result: Record<string, AttendanceStatus> = {};
    data?.forEach(log => {
        result[log.student_id] = log.status as AttendanceStatus;
    });
    return result;
};

export const getStudentAttendanceRate = async (studentId: string): Promise<number> => {
    const { count: total } = await supabase.from('attendance_logs').select('*', { count: 'exact', head: true }).eq('student_id', studentId);
    const { count: present } = await supabase.from('attendance_logs').select('*', { count: 'exact', head: true }).eq('student_id', studentId).eq('status', 'present');
    
    if (!total || total === 0) return 100;
    return Math.round(((present || 0) / total) * 100);
};

export const getStudentDetailedStats = async (studentId: string) => {
    const { data: recordings } = await supabase
        .from('performance_recordings')
        .select('*, songs(title)')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
    
    return { recordings: recordings || [] };
};

// --- NOTICE BOARD ---

export const getNotices = async (userId: string, targetAudience: string): Promise<Notice[]> => {
    let query = supabase.from('notices').select('*').order('created_at', { ascending: false });
    
    if (targetAudience !== 'all' && targetAudience !== 'professor') {
        query = query.eq('target_audience', targetAudience);
    }
    
    const { data } = await query;
    return data || [];
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
