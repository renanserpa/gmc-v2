import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { getFirstStudentForGuardian, getStudentOverviewForGuardian } from '../services/analyticsService';

export function useGuardianData() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['guardianOverview', user?.id],
        queryFn: async () => {
            if (!user) return null;
            const firstStudentId = await getFirstStudentForGuardian();
            if (firstStudentId) {
                return await getStudentOverviewForGuardian(firstStudentId);
            }
            return null;
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
}