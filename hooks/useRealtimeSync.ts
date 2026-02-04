
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { haptics } from '../lib/haptics.ts';
import { notify } from '../lib/notification.ts';

/**
 * useRealtimeSync: O sistema nervoso reativo do Maestro.
 * Ajustado para prevenir loops infinitos em componentes administrativos.
 */
export function useRealtimeSync<T extends { id: string | number }>(
  tableName: string,
  filter?: string,
  orderByConfig: { column: string; ascending?: boolean } = { column: 'created_at', ascending: false }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoiza as configurações para evitar disparos acidentais no useEffect
  const memoizedOrder = useMemo(() => orderByConfig, [orderByConfig.column, orderByConfig.ascending]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from(tableName).select('*');
      
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
        .order(memoizedOrder.column, { ascending: !!memoizedOrder.ascending });

      if (fetchError) throw fetchError;
      setData(result || []);
      setError(null);
    } catch (err: any) {
      if (err.code === '42P17') {
          setError("Recursão detectada.");
      } else {
          setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [tableName, filter, memoizedOrder]);

  useEffect(() => {
    fetchData();

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
          setData((current) => {
            switch (payload.eventType) {
              case 'INSERT':
                if (current.some(i => i.id === payload.new.id)) return current;
                return [payload.new as T, ...current];
              case 'UPDATE':
                return current.map(item => 
                  item.id === payload.new.id ? { ...item, ...payload.new } : item
                );
              case 'DELETE':
                return current.filter(item => item.id !== payload.old.id);
              default:
                return current;
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, filter, fetchData]);

  return { data, setData, loading, error, refresh: fetchData };
}
