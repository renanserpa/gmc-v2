import { supabase } from '../lib/supabaseClient.ts';
import { Student, MusicClass, Notice, Mission, AttendanceStatus, Lesson, ContentLibraryItem } from '../types.ts';
import { RENAN_SERPA_TABS } from '../lib/tabsStore.ts';
import { Star, Zap, Trophy, Flag } from 'lucide-react';
import { SessionStats } from '../lib/audioPro.ts';

export const generateAccessCode = () => {
  const digits = Math.floor(100 + Math.random() * 900);
  return `GCM-${digits}`;
};

export const getProfessorAuditLogs = async (professorId: string) => {
    const { data, error } = await supabase
        .from('xp_events')
        .select(`
            *,
            students!inner (
                name,
                professor_id,
                avatar_url
            )
        `)
        .eq('students.professor_id', professorId)
        .order('created_at', { ascending: false })
        .limit(50);
    
    if (error) throw error;
    return data || [];
};

export const savePracticeSession = async (studentId: string, stats: SessionStats) => {
    const { data, error } = await supabase.from('practice_sessions').insert([{
        student_id: studentId,
        duration_seconds: stats.durationSeconds,
        total_score: stats.totalScore,
        avg_precision: stats.averagePrecision,
        avg_stability: stats.avgStability,
        max_combo: stats.maxCombo,
        note_heatmap: stats.noteHeatmap,
        dynamic_range: stats.dynamicRange,
        flow_factor: stats.flowFactor,
        resonance_score: stats.resonanceScore,
        created_at: new Date().toISOString()
    }]).select().single();
    
    if (error) throw error;
    return data;
};

export const getLatestPracticeStats = async (studentId: string): Promise<SessionStats | null> => {
    const { data, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error || !data) return null;
    return {
        totalBeats: 0,
        onTargetBeats: 0,
        durationSeconds: data.duration_seconds,
        averagePrecision: data.avg_precision,
        averageLatency: 0,
        totalScore: data.total_score,
        maxCombo: data.max_combo,
        avgStability: data.avg_stability,
        flowFactor: data.flow_factor || 0,
        dynamicRange: data.dynamic_range || { min: 0, max: 1 },
        noteHeatmap: data.note_heatmap,
        resonanceScore: data.resonance_score || 0
    };
};

export const getPracticeTrends = async (studentId: string, limit = 5): Promise<SessionStats[]> => {
    const { data, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error || !data) return [];
    
    return data.map(d => ({
        totalBeats: 0,
        onTargetBeats: 0,
        durationSeconds: d.duration_seconds,
        averagePrecision: d.avg_precision,
        averageLatency: 0,
        totalScore: d.total_score,
        maxCombo: d.max_combo,
        avgStability: d.avg_stability,
        flowFactor: d.flow_factor || 0,
        dynamicRange: d.dynamic_range || { min: 0, max: 1 },
        noteHeatmap: d.note_heatmap,
        resonanceScore: d.resonance_score || 0
    }));
};

export const getStudentMilestones = async (studentId: string) => {
    const { data } = await supabase
        .from('xp_events')
        .select('*')
        .eq('player_id', studentId)
        .order('created_at', { ascending: true });
    
    if (!data) return [];

    const iconMap: any = {
        'FIRST_SYNC': Star,
        'LEVEL_UP': Trophy,
        'PRACTICE_SESSION': Zap,
        'MISSION_COMPLETE': Flag
    };

    return data
        .filter(e => ['FIRST_SYNC', 'LEVEL_UP', 'MISSION_COMPLETE'].includes(e.event_type))
        .map(e => ({
            id: e.id,
            title: e.event_type.replace('_', ' '),
            date: e.created_at,
            icon: iconMap[e.event_type] || Star,
            xp: e.xp_amount
        }));
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

export const getNotices = async (targetId: string, type: 'all' | 'class' | 'student' = 'all'): Promise<Notice[]> => {
  let query = supabase.from('notices').select('*').order('created_at', { ascending: false });
  if (type === 'class') query = query.eq('target_audience', targetId);
  else if (type === 'student') query = query.or(`target_audience.eq.all,target_audience.eq.${targetId}`);
  const { data } = await query;
  return data || [];
};

export const createNotice = async (notice: Partial<Notice>) => {
  const { data, error } = await supabase.from('notices').insert([notice]).select().single();
  if (error) throw error;
  return data;
};

export const getLessonsByTeacher = async (professorId: string): Promise<Lesson[]> => {
  const { data } = await supabase.from('lessons').select('*').eq('professor_id', professorId).order('date', { ascending: true });
  return data || [];
};

export const markAttendance = async (studentId: string, classId: string, status: AttendanceStatus, professorId: string) => {
    const { data, error } = await supabase.rpc('mark_attendance_and_award_xp', {
        p_student_id: studentId,
        p_class_id: classId,
        p_status: status,
        p_professor_id: professorId
    });
    if (error) throw error;
    return data;
};

export const getTodayAttendanceForClass = async (classId: string): Promise<Record<string, AttendanceStatus>> => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('attendance_logs').select('student_id, status').eq('music_class_id', classId).eq('attendance_date', today);
    const map: Record<string, AttendanceStatus> = {};
    data?.forEach(log => { map[log.student_id] = log.status as AttendanceStatus; });
    return map;
};

export const getMusicClasses = async (professorId: string): Promise<MusicClass[]> => {
  const { data } = await supabase.from('music_classes').select('*').eq('professor_id', professorId).order('start_time', { ascending: true });
  return data || [];
};

export const getStudentsByTeacher = async (professorId: string): Promise<Student[]> => {
  const { data } = await supabase.from('students').select('*').eq('professor_id', professorId);
  return data || [];
};

export const getStudentDetailedStats = async (studentId: string) => {
    const [xpHistory, recordings, repertoire, achievements] = await Promise.all([
        supabase.from('xp_events').select('*').eq('player_id', studentId).order('created_at', { ascending: false }).limit(15),
        supabase.from('performance_recordings').select('*, songs(title)').eq('student_id', studentId).order('created_at', { ascending: false }).limit(5),
        supabase.from('student_songs').select('*, songs(*)').eq('student_id', studentId),
        supabase.from('player_achievements').select('*, achievements(*)').eq('player_id', studentId)
    ]);
    return { xpHistory: xpHistory.data || [], recordings: recordings.data || [], repertoire: repertoire.data || [], achievements: achievements.data || [] };
};

export const createStudent = async (student: Partial<Student>) => {
    const code = generateAccessCode();
    const { data, error } = await supabase.from('students').insert([{ ...student, access_code: code, invite_code: code, xp: 0, coins: 0, current_level: 1, current_streak_days: 0 }]).select().single();
    if (error) throw error;
    return data;
};

export const updateStudent = async (id: string, updates: Partial<Student>) => {
    const { data, error } = await supabase.from('students').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
};

export const getMissionsByTeacher = async (professorId: string): Promise<Mission[]> => {
  const { data } = await supabase.from('missions').select('*').eq('professor_id', professorId).order('created_at', { ascending: false });
  return data || [];
};

export const createMission = async (mission: Partial<Mission>) => {
  const { data, error } = await supabase.from('missions').insert([mission]).select().single();
  if (error) throw error;
  return data;
};

export const getMissionsByStudent = async (studentId: string): Promise<Mission[]> => {
    const { data } = await supabase.from('missions').select('*').eq('student_id', studentId).order('position', { ascending: true });
    return data || [];
};

export const linkStudentAccount = async (code: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Sessão expirada." };
    const { data, error } = await supabase.from('students').update({ auth_user_id: user.id }).eq('invite_code', code).select().maybeSingle();
    if (error || !data) return { success: false, message: "Código não encontrado ou já utilizado." };
    return { success: true };
};

export const getSystemStats = async () => {
    const { count: totalStudents } = await supabase.from('students').select('*', { count: 'exact', head: true });
    return { totalStudents: totalStudents || 0, activeMissions: 0, totalContent: 0 };
};

export const updateLessonStatus = async (lessonId: string, status: string) => {
  const { data, error } = await supabase.from('lessons').update({ status }).eq('id', lessonId).select().single();
  if (error) throw error;
  return data;
};

export const linkGuardianAccount = async (code: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Sessão expirada." };
  const { data, error } = await supabase.from('students').update({ guardian_id: user.id }).eq('access_code', code).select().maybeSingle();
  if (error || !data) return { success: false, message: "Código não encontrado ou já vinculado." };
  return { success: true };
};

export const getStudentAttendanceRate = async (studentId: string): Promise<number> => {
    const { data } = await supabase.from('attendance_logs').select('status').eq('student_id', studentId);
    if (!data || data.length === 0) return 100;
    const presents = data.filter(a => a.status === 'present' || a.status === 'late').length;
    return Math.round((presents / data.length) * 100);
};

export const savePerformanceRecording = async (payload: any) => {
  const { data, error } = await supabase.from('performance_recordings').insert([payload]).select().single();
  if (error) throw error;
  return data;
};

export const getStudentRepertoire = async (studentId: string) => {
    const { data, error } = await supabase
        .from('student_songs')
        .select('*, songs(*)')
        .eq('student_id', studentId);
    
    if (error) throw error;
    return data || [];
};

export const giveHighFive = async (hallId: string) => {
    const { data, error } = await supabase.rpc('increment_concert_hall_high_fives', { 
        p_hall_id: hallId 
    });
    
    if (error) {
        const { data: current } = await supabase.from('concert_hall').select('high_fives_count').eq('id', hallId).single();
        if (current) {
            await supabase.from('concert_hall').update({ high_fives_count: (current.high_fives_count || 0) + 1 }).eq('id', hallId);
        }
        return true;
    }
    return data;
};