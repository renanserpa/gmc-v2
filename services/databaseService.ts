
import { supabase } from '../lib/supabaseClient';

export interface TableStatus {
    tableName: string;
    exists: boolean;
    rowCount: number;
    error: string | null;
}

const TABLES_TO_CHECK = [
    'profiles', 'schools', 'music_classes', 'enrollments', 
    'class_logs', 'students', 'missions', 'xp_events', 
    'store_items', 'content_library', 'knowledge_docs', 
    'system_configs', 'audit_logs', 'notices',
    // Stub Tables v7.6
    'external_contracts', 'live_tool_presets', 'family_reports'
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
                // FIX: tableName must be a string, using the loop variable instead of a boolean constant
                results.push({ tableName: tableName, exists: false, rowCount: 0, error: 'Falha serial.' });
            }
        }
        return results;
    },

    async runQuery(tableName: string, queryParams: any = {}): Promise<any> {
        let query = supabase.from(tableName).select(queryParams.select || '*');
        
        if (queryParams.limit) query = query.limit(queryParams.limit);
        if (queryParams.order) query = query.order(queryParams.order.column, { ascending: queryParams.order.ascending });
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    subscribeToTable(tableName: string, filter: string, callback: (payload: any) => void): any {
        const channel = supabase.channel(`db-sync-${tableName}-${filter}`)
            .on('postgres_changes' as any, { event: '*', schema: 'public', table: tableName, filter: filter }, (payload: any) => callback(payload))
            .subscribe();
        return channel;
    }
};
