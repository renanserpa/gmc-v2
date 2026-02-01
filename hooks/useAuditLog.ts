import { supabase } from '../lib/supabaseClient.ts';
import { useAdmin } from '../contexts/AdminContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { logger } from '../lib/logger.ts';

export function useAuditLog() {
    const { isBypassActive } = useAdmin();
    const { user } = useAuth();

    /**
     * Registra uma alteração crítica feita em modo de Bypass ou Administrativo.
     * Captura snapshots 'before' e 'after' conforme requisito v4.3.
     */
    const logAlteration = async (tableName: string, recordId: string, before: any, after: any) => {
        // Apenas loga se Bypass estiver ON ou se for uma ação explicitamente administrativa
        if (!isBypassActive && user?.email !== 'serparenan@gmail.com') return;

        try {
            const { error } = await supabase.from('audit_logs').insert([{
                professor_id: user?.id,
                event_type: `GODMODE_ALTERATION_${tableName.toUpperCase()}`,
                description: JSON.stringify({
                    table: tableName,
                    record_id: recordId,
                    snapshot: { 
                        before, 
                        after 
                    },
                    bypass_active: isBypassActive,
                    timestamp: new Date().toISOString()
                }),
                created_at: new Date().toISOString()
            }]);

            if (error) throw error;
        } catch (err) {
            logger.error("[AuditLog] Falha crítica ao registrar log de auditoria", err);
        }
    };

    return { logAlteration };
}
