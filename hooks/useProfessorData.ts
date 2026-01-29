import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext.tsx';
import { 
    getStudentsByTeacher, 
    getProfessorAuditLogs,
    getMusicClasses,
    getLessonsByTeacher,
    getMissionsByTeacher
} from '../services/dataService.ts';
import { getProfessorDashboardStats } from '../services/analyticsService.ts';

// Higienizador de Dados: Previne quebras por campos nulos ou schema desalinhado
const sanitizeStudent = (s: any) => ({
    ...s,
    name: s.name || "Aluno sem Nome",
    xp: s.xp || 0,
    level: s.level || 1,
    school_grade: s.school_grade || "Não Informado",
    instrument: s.instrument || "Nenhum",
    current_streak_days: s.current_streak_days || 0
});

/**
 * Hook de Dados do Professor com Proteção de Kernel
 */
export function useProfessorData() {
    const { user, role } = useAuth();
    const teacherId = user?.id;
    
    const isProfessor = role === 'professor' || role === 'admin';

    const { data, isLoading, error } = useQuery({
        queryKey: ['professor-cockpit-data', teacherId],
        queryFn: async () => {
            if (!teacherId || !isProfessor) return null;

            try {
                // Carregamento Atômico
                const [stats, rawStudents, classes, auditLogs, lessons, missions] = await Promise.all([
                    getProfessorDashboardStats(teacherId),
                    getStudentsByTeacher(teacherId),
                    getMusicClasses(teacherId),
                    getProfessorAuditLogs(teacherId),
                    getLessonsByTeacher(teacherId),
                    getMissionsByTeacher(teacherId)
                ]);

                // Validação de Integridade na Camada de Hook
                const students = (rawStudents || []).map(sanitizeStudent);

                return { 
                    stats, 
                    students, 
                    classes: classes || [], 
                    auditLogs: auditLogs || [], 
                    lessons: lessons || [], 
                    missions: missions || [] 
                };
            } catch (e) {
                console.error("[Kernel Data Error]:", e);
                throw new Error("Falha na sincronização do kernel de dados.");
            }
        },
        enabled: !!teacherId && isProfessor,
        staleTime: 1000 * 60 * 5,
        retry: 1
    });

    return {
        stats: data?.stats || { totalStudents: 0, upcomingLessonsCount: 0, pendingMissionsCount: 0, recentCompletedMissionsCount: 0 },
        students: data?.students || [],
        classes: data?.classes || [],
        lessons: data?.lessons || [],
        missions: data?.missions || [],
        auditLogs: data?.auditLogs || [],
        isLoading,
        error: error ? "Erro de integridade de dados detectado." : null
    };
}