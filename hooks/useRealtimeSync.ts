import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { haptics } from '../lib/haptics';
import { notify } from '../lib/notification';

interface SyncOptions {
    tableName: string;
    schoolId: string | null;
    orderBy?: { column: string; ascending?: boolean };
}

/**
 * Motor de Sincronismo Universal Maestro.
 * Transforma tabelas do Postgres em fluxos de dados reativos para a UI.
 */
export function useRealtimeSync<T extends { id: string; school_id?: string | null }>(
    tableName: string,
    schoolId: string | null,
    orderBy: { column: string; ascending?: boolean } = { column: 'created_at', ascending: false }
) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase.from(tableName).select('*');
            
            // Segurança: Aplica filtro de Tenant se fornecido
            if (schoolId) {
                query = query.eq('school_id', schoolId);
            }

            const { data: result, error: fetchError } = await query
                .order(orderBy.column, { ascending: orderBy.ascending });

            if (fetchError) throw fetchError;
            setData((result as T[]) || []);
        } catch (err: any) {
            setError(err.message);
            console.error(`[Realtime Engine] Erro no fetch inicial de ${tableName}:`, err);
        } finally {
            setLoading(false);
        }
    }, [tableName, schoolId, orderBy.column, orderBy.ascending]);

    useEffect(() => {
        fetchData();

        // Configuração do Canal de Sincronia
        const channelName = `sync-${tableName}-${schoolId || 'global'}`;
        const filter = schoolId ? `school_id=eq.${schoolId}` : undefined;

        const channel = supabase.channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: tableName,
                    filter: filter
                },
                (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } = payload;
                    
                    // Tenant Guard: Validação extra em tempo de execução
                    if (schoolId && newRecord && newRecord.school_id !== schoolId) {
                        console.warn("[Security] Payload de tenant cruzado ignorado.");
                        return;
                    }

                    haptics.light();

                    setData((current) => {
                        switch (eventType) {
                            case 'INSERT':
                                // Previne duplicidade em conexões instáveis
                                if (current.some(item => item.id === newRecord.id)) return current;
                                return [newRecord as T, ...current];
                            
                            case 'UPDATE':
                                return current.map((item) => 
                                    item.id === newRecord.id ? { ...item, ...newRecord } : item
                                );

                            case 'DELETE':
                                return current.filter((item) => item.id !== oldRecord.id);

                            default:
                                return current;
                        }
                    });
                }
            )
            .subscribe((status) => {
                if (status === 'CHANNEL_ERROR') {
                    notify.error(`Falha na conexão de tempo real com ${tableName}`);
                }
            });

        return () => {
            console.debug(`[Realtime Engine] Desconectando canal: ${channelName}`);
            supabase.removeChannel(channel);
        };
    }, [tableName, schoolId, fetchData]);

    return { 
        data, 
        loading, 
        error, 
        refresh: fetchData 
    };
}