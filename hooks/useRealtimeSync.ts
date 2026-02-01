import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { haptics } from '../lib/haptics';
import { notify } from '../lib/notification';

/**
 * useRealtimeSync: O sistema nervoso reativo do Maestro.
 * Transforma qualquer tabela do Postgres em um stream de dados síncrono na UI.
 * Suporta filtros manuais no padrão Supabase (ex: 'school_id=eq.uuid')
 */
export function useRealtimeSync<T extends { id: string | number }>(
  tableName: string,
  filter?: string,
  orderBy: { column: string; ascending?: boolean } = { column: 'created_at', ascending: false }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from(tableName).select('*');
      
      // Aplica filtro CDC manual se fornecido
      if (filter) {
          const parts = filter.split('=');
          if (parts.length === 2) {
            const col = parts[0];
            const opVal = parts[1];
            const [op, val] = opVal.split('.');
            if (op === 'eq') query = query.eq(col, val);
            else if (op === 'is') query = query.is(col, val === 'null' ? null : val);
          }
      }

      const { data: result, error: fetchError } = await query
        .order(orderBy.column, { ascending: !!orderBy.ascending });

      if (fetchError) throw fetchError;
      setData(result || []);
    } catch (err: any) {
      setError(err.message);
      console.error(`[Realtime Sync Engine] Falha no fetch: ${tableName}`, err);
    } finally {
      setLoading(false);
    }
  }, [tableName, filter, orderBy.column, orderBy.ascending]);

  useEffect(() => {
    fetchData();

    // Configura o Canal de Sincronia via WebSocket (CDC - Change Data Capture)
    const channelName = `db-pulse-${tableName}-${filter || 'global'}`;
    
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
          
          // Feedback tátil para cada pulso de dados recebido (Phygital Feel)
          haptics.light();

          setData((current) => {
            switch (eventType) {
              case 'INSERT':
                if (current.some(i => i.id === newRecord.id)) return current;
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
          notify.error(`Cluster de sincronia offline: ${tableName}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, filter, fetchData]);

  return { data, loading, error, refresh: fetchData };
}
