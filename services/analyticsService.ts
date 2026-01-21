import { supabase } from '../lib/supabaseClient';
import { ProfessorDashboardStats, StudentGuardianOverview } from '../types';

export const getProfessorDashboardStats = async (professorId: string): Promise<ProfessorDashboardStats> => {
    try {
        const [studentsCount, lessonsCount, missionsCount] = await Promise.all([
            supabase.from('students').select('*', { count: 'exact', head: true }).eq('professor_id', professorId),
            supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('professor_id', professorId).eq('status', 'scheduled'),
            supabase.from('missions').select('*', { count: 'exact', head: true }).eq('professor_id', professorId).eq('status', 'pending')
        ]);

        return {
            totalStudents: studentsCount.count || 0,
            upcomingLessonsCount: lessonsCount.count || 0,
            pendingMissionsCount: missionsCount.count || 0,
            recentCompletedMissionsCount: 0 // Implementar agregação real se necessário
        };
    } catch (e) {
        console.error("Analytics error:", e);
        return { totalStudents: 0, upcomingLessonsCount: 0, pendingMissionsCount: 0, recentCompletedMissionsCount: 0 };
    }
};

export const getFirstStudentForGuardian = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('students').select('id').eq('guardian_id', user.id).limit(1).maybeSingle();
    return data?.id || null;
};

export const getStudentOverviewForGuardian = async (studentId: string): Promise<StudentGuardianOverview | null> => {
    const { data: student, error } = await supabase.from('students').select('*').eq('id', studentId).single();
    if (error || !student) return null;

    const { data: missions } = await supabase.from('missions').select('status').eq('student_id', studentId);
    const missionDone = missions?.filter(m => m.status === 'done').length || 0;

    return {
        studentId: student.id,
        studentName: student.name,
        instrument: student.instrument,
        level: student.current_level,
        xp: student.xp,
        streak: student.current_streak_days,
        coins: student.coins,
        attendanceRate: 85, // Mock data para o piloto
        recentLessons: [],
        missionsSummary: {
            total: missions?.length || 0,
            done: missionDone,
            pending: (missions?.length || 0) - missionDone
        },
        upcomingMissions: [],
        recentAchievements: []
    };
};