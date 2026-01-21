import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { 
    getStudentsByTeacher, 
    getLessonsByTeacher, 
    getMissionsByTeacher,
    getProfessorAuditLogs,
    getMusicClasses
} from '../services/dataService.ts';
import { getProfessorDashboardStats } from '../services/analyticsService.ts';
import { Student } from '../types.ts';
import { supabase } from '../lib/supabaseClient.ts';

// Mock data for dev environment
const MOCK_STUDENTS: Student[] = [
    // FIX: Added 'coins' property to satisfy the Student type.
    { id: 'dev-student-1', name: 'Lucas "Riff" Oliveira', instrument: 'Guitarra', xp: 1250, coins: 125, current_level: 5, current_streak_days: 8, professor_id: 'dev-prof-id', auth_user_id: null, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas', xpToNextLevel: 1350, invite_code: null, guardian_id: null, completed_module_ids: [] },
    // FIX: Added 'coins' property to satisfy the Student type.
    { id: 'dev-student-2', name: 'Beatriz "Melody" Costa', instrument: 'Violão', xp: 800, coins: 80, current_level: 4, current_streak_days: 3, professor_id: 'dev-prof-id', auth_user_id: null, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Beatriz', xpToNextLevel: 1000, invite_code: null, guardian_id: null, completed_module_ids: [] },
    // FIX: Added 'coins' property to satisfy the Student type.
    { id: 'dev-student-3', name: 'Enzo "Groove" Silva', instrument: 'Baixo', xp: 450, coins: 45, current_level: 3, current_streak_days: 12, professor_id: 'dev-prof-id', auth_user_id: null, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Enzo', xpToNextLevel: 700, invite_code: null, guardian_id: null, completed_module_ids: [] }
];

const MOCK_CLASSES = [
    { id: 'class-1', name: 'Iniciantes GCM', start_time: '18:00', days_of_week: ['Segunda', 'Quarta'], age_group: '7-10 anos', professor_id: 'dev-prof-id' },
    { id: 'class-2', name: 'Intermediário Rock', start_time: '19:00', days_of_week: ['Terça', 'Quinta'], age_group: '11-14 anos', professor_id: 'dev-prof-id' }
];

const MOCK_STATS = { totalStudents: MOCK_STUDENTS.length };
const MOCK_AUDIT = MOCK_STUDENTS.map(s => ({ id: s.id, students: s, event_type: 'PRACTICE_SESSION', xp_amount: 30, created_at: new Date().toISOString() }));


export function useProfessorData() {
    const { user } = useAuth();
    const { activeSchool } = useTheme();
    const queryClient = useQueryClient();
    const teacherId = user?.id;
    
    // Dev mode check to prevent real API calls with mock users
    const isDevMode = user?.email?.endsWith('@oliemusic.dev') || localStorage.getItem('oliemusic_dev_user_id');

    const studentsQuery = useQuery({
        queryKey: ['professorStudents', teacherId, activeSchool?.id],
        queryFn: async () => {
            if (isDevMode) return MOCK_STUDENTS;
            if (!teacherId) return [];
            try {
                const { data } = await supabase.rpc('get_students_by_context', {
                    p_school_id: activeSchool?.id || null
                });
                return (data || []) as Student[];
            } catch (e) {
                return await getStudentsByTeacher(teacherId);
            }
        },
        enabled: !!teacherId
    });

    const classesQuery = useQuery({
        queryKey: ['professorClasses', teacherId],
        queryFn: () => {
            if (isDevMode) return Promise.resolve(MOCK_CLASSES);
            return teacherId ? getMusicClasses(teacherId) : Promise.resolve([]);
        },
        enabled: !!teacherId
    });

    const statsQuery = useQuery({
        queryKey: ['professorStats', teacherId, activeSchool?.id],
        queryFn: async () => {
            if (isDevMode) return MOCK_STATS;
            if (!teacherId) return { totalStudents: 0 };
            const data = await getProfessorDashboardStats(teacherId);
            return data || { totalStudents: 0 };
        },
        enabled: !!teacherId
    });

    const auditQuery = useQuery({
        queryKey: ['professorAuditLogs', teacherId],
        queryFn: async () => {
            if (isDevMode) return MOCK_AUDIT;
            if (!teacherId) return [];
            return await getProfessorAuditLogs(teacherId);
        },
        enabled: !!teacherId
    });

    return {
        stats: statsQuery.data || { totalStudents: 0 },
        students: studentsQuery.data || [],
        classes: classesQuery.data || [],
        auditLogs: auditQuery.data || [],
        isLoading: statsQuery.isLoading || studentsQuery.isLoading || auditQuery.isLoading || classesQuery.isLoading,
        error: statsQuery.error || studentsQuery.error || auditQuery.error || classesQuery.error
    };
}