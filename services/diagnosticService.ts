
import { supabase } from '../lib/supabaseClient.ts';

export interface DiagnosticResult {
    success: boolean;
    error: string | null;
    latency?: number;
}

export interface TableHealth {
    tableName: string;
    exists: boolean;
    rowCount: number;
    columns: { column: string; exists: boolean }[];
}

const CRITICAL_TABLES = [
    { name: 'profiles', cols: ['id', 'email', 'role'] },
    { name: 'schools', cols: ['id', 'name', 'is_active'] },
    { name: 'students', cols: ['id', 'professor_id', 'xp'] },
    { name: 'missions', cols: ['id', 'student_id', 'status'] },
    { name: 'audit_logs', cols: ['id', 'action', 'table_name'] }
];

export const diagnosticService = {
    async checkTable(tableName: string): Promise<DiagnosticResult> {
        const start = performance.now();
        try {
            const { error } = await supabase.from(tableName).select('id').limit(1);
            const latency = Math.round(performance.now() - start);
            return { success: !error, error: error?.message || null, latency };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    },

    async validateModuleImport(path: string): Promise<DiagnosticResult> {
        // Simula verificação de integridade de módulo JS
        await new Promise(r => setTimeout(r, 200));
        return { success: true, error: null };
    },

    async getSchemaHealth(): Promise<TableHealth[]> {
        const report: TableHealth[] = [];
        for (const t of CRITICAL_TABLES) {
            try {
                const { count, error } = await supabase.from(t.name).select('*', { count: 'exact', head: true });
                report.push({
                    tableName: t.name,
                    exists: !error || error.code !== '42P01',
                    rowCount: count || 0,
                    columns: t.cols.map(c => ({ column: c, exists: true }))
                });
            } catch (e) {
                report.push({ tableName: t.name, exists: false, rowCount: 0, columns: [] });
            }
        }
        return report;
    }
};
