
import { supabase } from '../lib/supabaseClient';

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
    'audit_logs'
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
    }
};
