import { supabase } from '../lib/supabaseClient';

export interface TableStatus {
    tableName: string;
    exists: boolean;
    rowCount: number;
    error: string | null;
}

const TABLES_TO_CHECK = [
    'profiles',
    'classes',
    'students',
    'missions',
    'audit_logs'
];

export const databaseService = {
    /**
     * Realiza uma varredura nas tabelas principais para verificar existência e volume de dados.
     */
    async checkHealth(): Promise<TableStatus[]> {
        const results: TableStatus[] = [];

        for (const tableName of TABLES_TO_CHECK) {
            try {
                // Tenta um select head para verificar existência de forma performática
                const { count, error } = await supabase
                    .from(tableName)
                    .select('*', { count: 'exact', head: true });

                if (error) {
                    // Código 42P01: relation "table" does not exist no Postgres
                    const isMissing = error.code === '42P01';
                    results.push({
                        tableName,
                        exists: !isMissing,
                        rowCount: 0,
                        error: isMissing ? 'Tabela não encontrada no banco.' : error.message
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
                    error: 'Falha crítica na conexão.'
                });
            }
        }

        return results;
    }
};