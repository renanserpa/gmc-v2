
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { haptics } from '../lib/haptics';

export interface ClassroomState {
  active_exercise_id: string | null;
  current_measure: number;
  bpm: number;
  is_playing: boolean;
}

export function useClassroomSync(classId: string) {
  const { user, role } = useAuth();
  const [state, setState] = useState<ClassroomState>({
    active_exercise_id: null,
    current_measure: 0,
    bpm: 120,
    is_playing: false
  });
  const [activeStudents, setActiveStudents] = useState<any[]>([]);

  useEffect(() => {
    if (!classId) return;

    const channel = supabase.channel(`room_${classId}`, {
      config: { presence: { key: user?.id } }
    });

    // Escuta comandos do professor (broadcast)
    channel
      .on('broadcast', { event: 'sync_state' }, ({ payload }) => {
        if (role === 'student') {
          setState(payload);
          haptics.light();
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const students = Object.values(newState).flat();
        setActiveStudents(students);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: user?.id,
            name: user?.user_metadata?.full_name || 'Músico',
            role: role,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId, role, user]);

  const updateRemoteState = useCallback((newState: Partial<ClassroomState>) => {
    if (role !== 'professor') return;
    
    const fullState = { ...state, ...newState };
    setState(fullState);

    supabase.channel(`room_${classId}`).send({
      type: 'broadcast',
      event: 'sync_state',
      payload: fullState
    });
  }, [classId, role, state]);

  return { state, updateRemoteState, activeStudents };
}
