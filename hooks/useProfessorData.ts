import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabaseClient.ts';

export function useProfessorData() {
    const { user, role } = useAuth();
    const teacherId = user?.id;

    return useQuery({
        queryKey: ['professor-contract-data-v4', teacherId],
        queryFn: async () => {
            if (!teacherId) return null;

            // Busca atômica de Students, Classes e Atividades da Semana
            const [resStudents, resClasses, resEvents] = await Promise.all([
                supabase.from('students').select('*').eq('professor_id', teacherId),
                supabase.from('music_classes').select('*').eq('professor_id', teacherId),
                supabase.from('xp_events').select('xp_amount, created_at').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            ]);

            const students = resStudents.data || [];
            const classes = resClasses.data || [];
            const recentEvents = resEvents.data || [];

            // Cálculos de Métrica
            const totalXp = students.reduce((acc, s) => acc + (s.xp || 0), 0);
            const avgXp = students.length > 0 ? Math.round(totalXp / students.length) : 0;
            
            // Agrupamento de XP por dia para o gráfico
            const chartData = recentEvents.reduce((acc: any, curr) => {
                const day = new Date(curr.created_at).toLocaleDateString('pt-BR', { weekday: 'short' });
                acc[day] = (acc[day] || 0) + curr.xp_amount;
                return acc;
            }, {});

            return {
                students,
                classes,
                isNewTeacher: classes.length === 0,
                stats: {
                    totalStudents: students.length,
                    avgXp,
                    weeklyGrowth: recentEvents.length
                },
                evolution: Object.entries(chartData).map(([name, value]) => ({ name, value }))
            };
        },
        enabled: !!teacherId,
        staleTime: 1000 * 60 * 2 // 2 minutos de cache
    });
}