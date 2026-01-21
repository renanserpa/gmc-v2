import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Student } from '../types';
import { getLevelInfo } from '../services/gamificationService';
import { logger } from '../lib/logger';

export function useCurrentStudent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['currentStudent', user?.id],
    queryFn: async (): Promise<Student | null> => {
      if (!user) return null;

      const devUserId = localStorage.getItem('oliemusic_dev_user_id');
      const devRole = localStorage.getItem('oliemusic_dev_role');
      
      // PRIORIDADE: MODO DEV - Retorna mock se estiver em ambiente de teste
      if ((devUserId === user.id && devRole) || user.email?.endsWith('@oliemusic.dev')) {
        const levelInfo = getLevelInfo(1250);
        return {
          id: 'student-mock-uuid',
          auth_user_id: user.id,
          professor_id: 'dev-prof-id',
          name: 'Aluno Pro (Dev Mode)',
          instrument: 'Guitarra',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
          xp: 1250,
          coins: 125,
          current_level: levelInfo.currentLevel,
          current_streak_days: 5,
          xpToNextLevel: levelInfo.xpToNextLevel,
          invite_code: 'DEV123',
          guardian_id: null,
          completed_module_ids: [],
          completed_content_ids: []
        } as Student;
      }

      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (error) {
          if (error.code === '42501') {
              logger.warn("Acesso negado (RLS). Recomendado: Use o ícone de código na tela de login para Modo Dev.");
              return null;
          }
          throw error;
        }

        if (!data) return null;
        const levelInfo = getLevelInfo(data.xp || 0);
        return { ...data, xpToNextLevel: levelInfo.xpToNextLevel } as Student;
      } catch (err: any) {
        logger.error('Erro ao buscar estudante atual:', err);
        return null;
      }
    },
    enabled: !!user,
    staleTime: 1000 * 30,
    retry: 1
  });

  return {
    student: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}
