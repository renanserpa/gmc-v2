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

    if (!isActive) {
        await supabase.channel('maestro_global_control').send({
            type: 'broadcast',
            event: 'tenant_suspended',
            payload: { school_id: schoolId }
        });
    }

    return data;
};

export const createAdminSchool = async (schoolData: Partial<School> & { slug: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
        .from('schools')
        .insert([{
            name: schoolData.name,
            slug: schoolData.slug,
            is_active: true,
            owner_id: user?.id,
            branding: schoolData.branding || { primaryColor: '#38bdf8', secondaryColor: '#a78bfa', borderRadius: '24px', logoUrl: null },
            settings: schoolData.settings || { max_students: 50 }
        }])
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const createAdminProfessor = async (profData: { email: string, full_name: string, school_id?: string }) => {
    // Nota: O usuário deve ser criado via Auth antes ou manualmente no dashboard do Supabase.
    // Este serviço apenas provisiona o perfil na tabela profiles.
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

export const logSecurityAudit = async (action: string, metadata: any = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('audit_logs').insert([{
        user_id: user.id,
        action: action,
        table_name: 'SECURITY_CORE',
        record_id: 'GLOBAL',
        new_data: metadata,
        created_at: new Date().toISOString()
    }]);
};

export const updateSystemConfig = async (key: string, value: any) => {
    const { data, error } = await supabase
        .from('system_configs')
        .upsert({ 
            key, 
            value,
            updated_at: new Date().toISOString()
        }, { onConflict: 'key' })
        .select()
        .single();
    
    if (error) throw error;
    return data;
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

export const createMission = async (mission: Partial<Mission>) => {
  const { data, error } = await supabase.from('missions').insert([mission]).select().single();
  if (error) throw error;
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

// --- EXTRA SERVICES ---

export const getSystemStats = async () => {
    const [resStudents, resProfs] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'professor')
    ]);

    return {
        totalStudents: resStudents.count || 0,
        totalProfs: resProfs.count || 0,
        totalContent: 0
    };
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
    if (!user) throw new Error("Não autenticado");

    const { data, error } = await supabase
        .from('students')
        .update({ auth_user_id: user.id })
        .eq('invite_code', code.toUpperCase())
        .is('auth_user_id', null)
        .select()
        .single();

    if (error) return { success: false, message: "Código inválido ou já utilizado." };
    return { success: true, data };
};

export const getMusicClasses = async (professorId: string): Promise<MusicClass[]> => {
    const { data, error } = await supabase
        .from('music_classes')
        .select('*')
        .eq('professor_id', professorId);
    if (error) throw error;
    return data || [];
};

export const getStudentsByTeacher = async (professorId: string): Promise<Student[]> => {
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('professor_id', professorId);
    if (error) throw error;
    return data || [];
};

export const addLibraryItem = async (item: Partial<ContentLibraryItem>) => {
    const { data, error } = await supabase
        .from('content_library')
        .insert([item])
        .select()
        .single();
    if (error) throw error;
    return data;
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

// --- ATTENDANCE SERVICES ---

export const markAttendance = async (studentId: string, classId: string, status: AttendanceStatus, professorId: string): Promise<boolean> => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', studentId)
        .eq('class_id', classId)
        .gte('created_at', today)
        .maybeSingle();

    if (existing) return false;

    const { error } = await supabase.from('attendance').insert({
        student_id: studentId,
        class_id: classId,
        professor_id: professorId,
        status: status,
        created_at: new Date().toISOString()
    });

    if (error) throw error;

    if (status !== 'absent') {
        const xp = status === 'present' ? 20 : 10;
        const { data: student } = await supabase.from('students').select('school_id').eq('id', studentId).single();
        await applyXpEvent({
            studentId,
            eventType: 'ATTENDANCE_XP',
            xpAmount: xp,
            contextType: 'attendance',
            schoolId: student?.school_id || ""
        });
    }

    return true;
};

export const getTodayAttendanceForClass = async (classId: string): Promise<Record<string, AttendanceStatus>> => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('class_id', classId)
        .gte('created_at', today);
    
    if (error) return {};
    
    const map: Record<string, AttendanceStatus> = {};
    data?.forEach(row => {
        map[row.student_id] = row.status as AttendanceStatus;
    });
    return map;
};

export const getStudentAttendanceRate = async (studentId: string): Promise<number> => {
    const { data, error } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', studentId);
    
    if (error || !data || data.length === 0) return 100;
    
    const presentCount = data.filter(a => a.status === 'present' || a.status === 'late').length;
    return Math.round((presentCount / data.length) * 100);
};

export const getNotices = async (userId: string, targetType: string): Promise<Notice[]> => {
    let query = supabase.from('notices').select('*');
    
    if (targetType === 'student') {
        query = query.or(`target_audience.eq.all,target_audience.eq.students`);
    } else if (targetType === 'professor') {
        query = query.or(`target_audience.eq.all,target_audience.eq.professors`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const getStudentMilestones = async (studentId: string): Promise<any[]> => {
    return [
        { id: '1', title: 'Primeira Nota', date: new Date().toISOString(), icon: Star, xp: 50 },
        { id: '2', title: 'Nível 5 Atingido', date: new Date().toISOString(), icon: Trophy, xp: 100, isUpcoming: true },
    ];
};

export const getPracticeTrends = async (studentId: string): Promise<any[]> => {
    const { data } = await supabase
        .from('xp_events')
        .select('*')
        .eq('player_id', studentId)
        .eq('event_type', 'PRACTICE_SESSION')
        .order('created_at', { ascending: false })
        .limit(10);
    return data || [];
};

export const getLatestPracticeStats = async (studentId: string): Promise<any | null> => {
    const { data } = await supabase
        .from('xp_events')
        .select('*')
        .eq('player_id', studentId)
        .eq('event_type', 'PRACTICE_SESSION')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    return data;
};

export const savePracticeSession = async (studentId: string, stats: any) => {
    const { data: student } = await supabase.from('students').select('school_id').eq('id', studentId).single();
    
    await applyXpEvent({
        studentId,
        eventType: 'PRACTICE_SESSION',
        xpAmount: 50,
        contextType: 'practice',
        schoolId: student?.school_id || ""
    });
    
    return { success: true };
};

export const getStudentRepertoire = async (studentId: string) => {
    const { data, error } = await supabase
        .from('student_songs')
        .select('*, songs(*)')
        .eq('student_id', studentId);
    if (error) throw error;
    return data || [];
};

export const getStudentDetailedStats = async (studentId: string) => {
    const recordings = await supabase.from('performance_recordings').select('*').eq('student_id', studentId).order('created_at', { ascending: false });
    return {
        recordings: recordings.data || [],
        sessions: []
    };
};

export const giveHighFive = async (hallId: string) => {
    const { data: current } = await supabase.from('concert_hall').select('high_fives_count').eq('id', hallId).single();
    const { data, error } = await supabase
        .from('concert_hall')
        .update({ high_fives_count: (current?.high_fives_count || 0) + 1 })
        .eq('id', hallId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const linkGuardianAccount = async (code: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");

    const { data, error } = await supabase
        .from('students')
        .update({ guardian_id: user.id })
        .eq('invite_code', code.toUpperCase())
        .select()
        .single();

    if (error) return { success: false, message: "Código inválido." };
    return { success: true, data };
};