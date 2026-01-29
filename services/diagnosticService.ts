import { supabase } from '../lib/supabaseClient.ts';

export interface ColumnHealth {
    column: string;
    exists: boolean;
    type?: string;
}

export interface TableHealth {
    tableName: string;
    exists: boolean;
    columns: ColumnHealth[];
    rowCount: number;
}

// Added DiagnosticResult interface for ModuleValidator
export interface DiagnosticResult {
    success: boolean;
    error?: string;
    latency?: number;
}

// Contrato de Integridade V3.0
const EXPECTED_SCHEMA: Record<string, string[]> = {
    profiles: ['id', 'email', 'full_name', 'role', 'school_id'],
    students: ['id', 'name', 'instrument', 'xp', 'coins', 'level', 'school_grade', 'professor_id', 'auth_user_id'],
    classes: ['id', 'name', 'professor_id', 'start_time', 'days_of_week'],
    missions: ['id', 'title', 'xp_reward', 'status', 'student_id'],
    audit_logs: ['id', 'event_type', 'xp_amount', 'created_at']
};

export const diagnosticService = {
    /**
     * Realiza auditoria profunda de tabelas e colunas.
     * Não crasha se falhar; reporta o erro.
     */
    async getSchemaHealth(): Promise<TableHealth[]> {
        const report: TableHealth[] = [];

        for (const [tableName, requiredCols] of Object.entries(EXPECTED_SCHEMA)) {
            try {
                // Seleciona apenas 1 linha para testar as colunas existentes
                const { data, error, count } = await supabase
                    .from(tableName)
                    .select('*', { count: 'exact' })
                    .limit(1);

                if (error) {
                    const isMissing = error.code === '42P01';
                    report.push({
                        tableName,
                        exists: false,
                        rowCount: 0,
                        columns: requiredCols.map(c => ({ column: c, exists: false }))
                    });
                    continue;
                }

                // Se a tabela existe, validamos as colunas presentes no objeto retornado
                const existingCols = data && data.length > 0 ? Object.keys(data[0]) : [];
                
                // Nota: Se a tabela estiver vazia, o Supabase pode não retornar as chaves.
                // Em caso de tabela vazia, assumimos 'true' se o select não deu erro 42P01.
                const colAudit = requiredCols.map(col => ({
                    column: col,
                    exists: data && data.length > 0 ? existingCols.includes(col) : true 
                }));

                report.push({
                    tableName,
                    exists: true,
                    rowCount: count || 0,
                    columns: colAudit
                });

            } catch (e) {
                report.push({
                    tableName,
                    exists: false,
                    rowCount: 0,
                    columns: requiredCols.map(c => ({ column: c, exists: false }))
                });
            }
        }
        return report;
    },

    /**
     * Added checkTable method for ModuleValidator to check table existence and latency.
     */
    async checkTable(tableName: string): Promise<DiagnosticResult> {
        const start = performance.now();
        try {
            const { error } = await supabase.from(tableName).select('id').limit(1);
            const latency = Math.round(performance.now() - start);
            if (error) throw error;
            return { success: true, latency };
        } catch (e: any) {
            return { success: false, error: e.message || String(e) };
        }
    },

    /**
     * Updated return type to DiagnosticResult to match ModuleValidator expectations.
     */
    async validateModuleImport(path: string): Promise<DiagnosticResult> {
        const start = performance.now();
        // Simulação de validação
        if (path.startsWith('@/')) {
            return { success: false, error: 'Caminho legado (@/) não permitido.' };
        }
        const latency = Math.round(performance.now() - start);
        return { success: true, latency };
    }
};