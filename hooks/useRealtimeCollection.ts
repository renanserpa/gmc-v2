import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { databaseService } from '../services/databaseService';

interface RealtimeCollectionOptions {
    tableName: string;
    schoolId: string;
    orderBy?: { column: string; ascending?: boolean };
}

/**
 * Hook Maestro para Gerenciamento de Coleções em Tempo Real.
 * Automatiza o ciclo de vida de Subscribe/Unsubscribe e mantém o estado local síncrono.
 */
export function useRealtimeCollection<T extends { id: string }>(options: RealtimeCollectionOptions) {
    const { tableName, schoolId, orderBy } = options;
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            let query = supabase
                .from(tableName)
                .select('*')
                .eq('school_id', schoolId);

            if (orderBy) {
                query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
            }

            const { data: result, error: fetchError } = await query;

            if (fetchError) throw fetchError;
            setData((result as T[]) || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [tableName, schoolId, orderBy]);

    useEffect(() => {
        fetchData();

        if (!schoolId) return;

        // Ativa o motor de sincronização em tempo real
        const filter = `school_id=eq.${schoolId}`;
        const channel = databaseService.subscribeToTable(tableName, filter, (payload) => {
            const { eventType, new: newRecord, old: oldRecord } = payload;

            setData((currentData) => {
                switch (eventType) {
                    case 'INSERT':
                        return [newRecord as T, ...currentData];
                    
                    case 'UPDATE':
                        return currentData.map((item) => 
                            item.id === newRecord.id ? { ...item, ...newRecord } : item
                        );

                    case 'DELETE':
                        return currentData.filter((item) => item.id !== oldRecord.id);

                    default:
                        return currentData;
                }
            });
        });

        return () => {
            console.debug(`[Realtime] Encerrando escuta para ${tableName}`);
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