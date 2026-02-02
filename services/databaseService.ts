import { supabase } from '../lib/supabaseClient';
// FIX: Removed missing RealtimeChannel export and replaced with any in function signatures

export interface TableStatus {
    tableName: string;
    exists: boolean;
    rowCount: number;
    error: string | null;
}

const TABLES_TO_CHECK = [
    'profiles',
    'schools',
    'professor_schools',
    'music_classes',
    'students',
    'missions',
    'xp_events',
    'store_items',
    'content_library',
    'knowledge_docs',
    'system_configs',
    'audit_logs',
    'notices'
];

export const databaseService = {
    async checkHealth(): Promise<TableStatus[]> {
        const results: TableStatus[] = [];

        for (const tableName of TABLES_TO_CHECK) {
            try {
                const { count, error } = await supabase
                    .from(tableName)
                    .select('*', { count: 'exact', head: true });

                if (error) {
                    const isMissing = error.code === '42P01';
                    results.push({
                        tableName,
                        exists: !isMissing,
                        rowCount: 0,
                        error: isMissing ? 'Tabela inexistente (42P01).' : error.message
                    });
                } else {
                    results.push({
                        tableName,
                        exists: true,
                        rowCount: count || 0,
                        error: null
                    });
                }
            } catch (err: any) {
                results.push({
                    tableName,
                    exists: false,
                    rowCount: 0,
                    error: 'Falha de conexão serial.'
                });
            }
        }
        return results;
    },

    /**
     * Subscreve a mudanças em uma tabela específica com suporte a filtros CDC.
     */
    subscribeToTable(
        tableName: string, 
        filter: string, 
        callback: (payload: any) => void
    ): any { // FIX: Using any instead of missing RealtimeChannel export
        const channel = supabase.channel(`db-sync-${tableName}-${filter}`)
            .on(
                'postgres_changes' as any,
                {
                    event: '*',
                    schema: 'public',
                    table: tableName,
                    filter: filter
                },
                (payload: any) => {
                    console.debug(`[Realtime] Evento detectado em ${tableName}:`, payload.eventType);
                    callback(payload);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.debug(`[Realtime] Sintonizado na tabela ${tableName} com filtro: ${filter}`);
                }
            });

        return channel;
    }
};