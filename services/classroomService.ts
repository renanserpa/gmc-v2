
import { supabase } from '../lib/supabaseClient.ts';
import { ClassroomCommand } from '../types.ts';

export const classroomService = {
  /**
   * Envia comandos de orquestração para uma sala específica.
   */
  async sendCommand(classId: string, command: ClassroomCommand) {
    const { data: { user } } = await (supabase.auth as any).getUser();
    
    // Log de Auditoria do Comando (Opcional, mas bom para histórico)
    try {
        await supabase.from('audit_logs').insert([{
            user_id: user?.id,
            action: 'CLASSROOM_ORCHESTRATION_CMD',
            table_name: 'orchestration',
            record_id: classId,
            new_data: command
        }]);
    } catch (e) {
        console.warn("Audit log failed, proceeding with broadcast.");
    }

    // Broadcast via canais PubSub para latência ultra-baixa
    return supabase.channel(`classroom_${classId}`).send({
      type: 'broadcast',
      event: 'command',
      payload: { ...command, timestamp: Date.now() }
    });
  },

  /**
   * Escuta comandos globais da sala.
   */
  subscribeToCommands(classId: string, onCommand: (cmd: ClassroomCommand) => void) {
    const channel = supabase.channel(`classroom_${classId}`)
      .on('broadcast', { event: 'command' }, ({ payload }) => {
        onCommand(payload as ClassroomCommand);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
};
