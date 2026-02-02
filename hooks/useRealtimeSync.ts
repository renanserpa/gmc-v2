import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { haptics } from '../lib/haptics';
import { notify } from '../lib/notification';

/**
 * useRealtimeSync: O sistema nervoso reativo do Maestro.
 * Transforma qualquer tabela do Postgres em um stream de dados síncrono na UI.
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
      setError(null);
    } catch (err: any) {
      // DIAGNÓSTICO DE RECURSÃO INFINITA (Error 42P17)
      if (err.code === '42P17') {
          const msg = `ERRO CRÍTICO RLS: Loop infinito detectado em "${tableName}". Execute o patch de segurança no SQL Editor.`;
          setError(msg);
          console.error(`%c[Maestro Security] ${msg}`, 'color: #ff4444; font-weight: bold;');
      } else {
          setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [tableName, filter, orderBy.column, orderBy.ascending]);

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
          haptics.light();

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

  return { data, loading, error, refresh: fetchData };
}