
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { uiSounds } from '../lib/uiSounds';

export function useMissionsRealtime(studentId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!studentId) return;

    // Canal para atualizações de missões
    const channel = supabase
      .channel(`public:missions:student_id=eq.${studentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'missions',
          filter: `student_id=eq.${studentId}`,
        },
        (payload) => {
          console.log('[Realtime] Mission change detected:', payload);
          
          // Feedback sonoro baseado no evento
          if (payload.eventType === 'INSERT') {
            uiSounds.playClick();
          } else if (payload.eventType === 'UPDATE' && payload.new.status === 'done') {
            uiSounds.playSuccess();
          }

          // Invalida as queries para forçar o refetch dos dados
          queryClient.invalidateQueries({ queryKey: ['currentStudent'] });
          queryClient.invalidateQueries({ queryKey: ['missions', studentId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId, queryClient]);
}
