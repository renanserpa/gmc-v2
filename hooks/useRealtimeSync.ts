import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { haptics } from '../lib/haptics';
import { notify } from '../lib/notification';

/**
 * useRealtimeSync: O sistema nervoso reativo do Maestro.
 * Transforma qualquer tabela em um stream de dados síncrono.
 */
export function useRealtimeSync<T extends { id: string | number; school_id?: string | null }>(
  tableName: string,
  schoolId: string | null = null,
  orderBy: { column: string; ascending?: boolean } = { column: 'created_at', ascending: false }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from(tableName).select('*');
      
      // Multi-tenancy filter
      if (schoolId) {
        query = query.eq('school_id', schoolId);
      } else if (tableName === 'missions') {
        // Se for a tabela de missões e sem school_id, assumimos busca por templates globais
        // Templates globais não possuem student_id vinculado
        query = query.is('student_id', null);
      }

      const { data: result, error: fetchError } = await query
        .order(orderBy.column, { ascending: !!orderBy.ascending });

      if (fetchError) throw fetchError;
      setData(result || []);
    } catch (err: any) {
      setError(err.message);
      console.error(`[Realtime Sync Error] ${tableName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [tableName, schoolId, orderBy.column, orderBy.ascending]);

  useEffect(() => {
    fetchData();

    // Configura o Canal de Sincronia via WebSocket
    const channelName = `realtime-${tableName}-${schoolId || 'global'}`;
    const filter = schoolId ? `school_id=eq.${schoolId}` : undefined;

    const channel = supabase.channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: filter
        },
        (payload: any) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          haptics.light();

          setData((current) => {
            switch (eventType) {
              case 'INSERT':
                if (current.some(i => i.id === newRecord.id)) return current;
                // Validação extra para garantir que apenas missões globais entrem na lista global
                if (tableName === 'missions' && !schoolId && newRecord.student_id !== null) return current;
                return [newRecord as T, ...current];
              
              case 'UPDATE':
                return current.map(item => 
                  item.id === newRecord.id ? { ...item, ...newRecord } : item
                );

              case 'DELETE':
                return current.filter(item => item.id !== oldRecord.id);

              default:
                return current;
            }
          });
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          notify.error(`Cluster desconectado: ${tableName}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, schoolId, fetchData]);

  return { data, loading, error, refresh: fetchData };
}
