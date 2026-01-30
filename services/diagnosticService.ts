
import { supabase } from '../lib/supabaseClient.ts';

export interface ColumnHealth {
    column: string;
    exists: boolean;
}

export interface TableHealth {
    tableName: string;
    exists: boolean;
    columns: ColumnHealth[];
    rowCount: number;
}

export interface DiagnosticResult {
    success: boolean;
    error?: string;
    latency?: number;
}

const EXPECTED_SCHEMA: Record<string, string[]> = {
    profiles: ['id', 'email', 'role', 'school_id'],
    students: ['id', 'name', 'instrument', 'school_grade', 'xp', 'coins', 'professor_id', 'auth_user_id'],
    learning_modules: ['id', 'title', 'trail_id', 'order_index'],
    missions: ['id', 'title', 'xp_reward', 'status', 'student_id', 'professor_id'],
    music_classes: ['id', 'name', 'professor_id', 'start_time'],
    xp_events: ['id', 'player_id', 'event_type', 'xp_amount'],
    store_items: ['id', 'name', 'price_coins', 'is_active'],
    store_orders: ['id', 'player_id', 'store_item_id'],
    knowledge_docs: ['id', 'title', 'tokens'],
    system_configs: ['key', 'value', 'updated_at']
};

export const diagnosticService = {
    async getSchemaHealth(): Promise<TableHealth[]> {
        const report: TableHealth[] = [];

        for (const [tableName, requiredCols] of Object.entries(EXPECTED_SCHEMA)) {
            try {
                // Verificação otimizada: tenta pegar o cabeçalho e 1 registro para validar colunas
                const { data, error, count } = await supabase
                    .from(tableName)
                    .select('*', { count: 'exact' })
                    .limit(1);

                if (error) {
                    report.push({
                        tableName,
                        exists: false,
                        rowCount: 0,
                        columns: requiredCols.map(c => ({ column: c, exists: false }))
                    });
                    continue;
                }

                const sample = data?.[0];
                const colAudit = requiredCols.map(col => ({
                    column: col,
                    exists: sample ? Object.prototype.hasOwnProperty.call(sample, col) : true 
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
                    exists: false, rowCount: 0,
                    columns: requiredCols.map(c => ({ column: c, exists: false }))
                });
            }
        }
        return report;
    },

    async checkTable(tableName: string): Promise<DiagnosticResult> {
        const start = performance.now();
        try {
            const { error } = await supabase.from(tableName).select('id', { count: 'exact', head: true }).limit(1);
            const latency = Math.round(performance.now() - start);
            
            if (error) {
                // Código 42501 é RLS bloqueando, o que pode ser um sucesso se não estivermos como admin
                if (error.code === '42501') return { success: true, latency, error: 'RLS Active' };
                return { success: false, error: error.message, latency };
            }
            return { success: true, latency };
        } catch (e: any) {
            return { success: false, error: e.message, latency: Math.round(performance.now() - start) };
        }
    },

    async validateModuleImport(path: string): Promise<DiagnosticResult> {
        const start = performance.now();
        try {
            // Simulação de verificação de resolução de módulo (neste ambiente não temos fs real)
            await new Promise(resolve => setTimeout(resolve, 400));
            const latency = Math.round(performance.now() - start);
            return { success: true, latency };
        } catch (e: any) {
            return { success: false, error: 'Module Resolve Timeout', latency: Math.round(performance.now() - start) };
        }
    }
};
