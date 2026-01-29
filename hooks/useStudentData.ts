import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabaseClient.ts';
import { 
    getMissionsByStudent, 
    getStudentMilestones, 
    getLatestPracticeStats 
} from '../services/dataService.ts';

const sanitizeProfile = (p: any) => ({
    ...p,
    full_name: p.full_name || "Músico Maestro",
    role: p.role || "student",
    xp: p.xp || 0
});

export function useStudentData() {
    const { user, profile: authProfile } = useAuth();
    const studentId = user?.id;

    return useQuery({
        queryKey: ['student-journey-data', studentId],
        queryFn: async () => {
            if (!studentId) return null;

            const [rawMissions, milestones, practice] = await Promise.all([
                getMissionsByStudent(studentId),
                getStudentMilestones(studentId),
                getLatestPracticeStats(studentId)
            ]);

            return {
                profile: sanitizeProfile(authProfile),
                missions: rawMissions || [],
                milestones: milestones || [],
                latestPractice: practice
            };
        },
        enabled: !!user,
        staleTime: 1000 * 30
    });
}