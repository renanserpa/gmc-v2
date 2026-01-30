
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabaseClient.ts';

export function useProfessorData() {
    const { user } = useAuth();
    const teacherId = user?.id;

    return useQuery({
        queryKey: ['professor-dashboard-composite', teacherId],
        queryFn: async () => {
            if (!teacherId) return null;

            // Busca paralela para otimização de banda e latência
            const [resStudents, resClasses, resAudit] = await Promise.all([
                // 1. Alunos vinculados
                supabase.from('students')
                    .select('*')
                    .eq('professor_id', teacherId)
                    .order('xp', { ascending: false }),

                // 2. Turmas agendadas
                supabase.from('music_classes')
                    .select('*')
                    .eq('professor_id', teacherId)
                    .order('start_time', { ascending: true }),

                // 3. Logs de Atividade (XP Events) via Join Relacional
                supabase.from('xp_events')
                    .select('*, students!inner(name, avatar_url, professor_id)')
                    .eq('students.professor_id', teacherId)
                    .order('created_at', { ascending: false })
                    .limit(20)
            ]);

            const students = resStudents.data || [];
            const classes = resClasses.data || [];
            const auditLogs = resAudit.data || [];

            // Agregação de KPIs
            const totalXp = students.reduce((acc, s) => acc + (s.xp || 0), 0);
            const avgXp = students.length > 0 ? Math.round(totalXp / students.length) : 0;
            
            // Mapeamento de Evolução Rítmica/Técnica (Últimos 7 dias)
            const daysMap: Record<string, number> = {};
            auditLogs.forEach(log => {
                const day = new Date(log.created_at).toLocaleDateString('pt-BR', { weekday: 'short' });
                daysMap[day] = (daysMap[day] || 0) + log.xp_amount;
            });

            const evolution = Object.entries(daysMap).map(([name, value]) => ({ 
                name: name.toUpperCase(), 
                value 
            }));

            return {
                students,
                classes,
                auditLogs,
                isNewTeacher: classes.length === 0 && students.length === 0,
                stats: {
                    totalStudents: students.length,
                    avgXp,
                    weeklyEvents: auditLogs.length,
                    activeSessions: classes.length
                },
                evolution
            };
        },
        enabled: !!teacherId,
        staleTime: 1000 * 60 * 2 // Cache de 2 minutos para evitar overfetching
    });
}
