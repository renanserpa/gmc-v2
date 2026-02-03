
import { supabase } from '../lib/supabaseClient';
import { ClassroomCommand } from '../types';

export const classroomService = {
  /**
   * Envia comandos de orquestração para uma sala.
   * Usado para sincronizar metrônomo, trocar slides ou disparar celebrações.
   */
  async sendCommand(classId: string, command: ClassroomCommand) {
    const { data: { user } } = await (supabase.auth as any).getUser();
    
    // Log de Auditoria do Comando
    await supabase.from('audit_logs').insert([{
      user_id: user?.id,
      action: 'CLASSROOM_ORCHESTRATION_CMD',
      table_name: 'orchestration',
      record_id: classId,
      new_data: command
    }]);

    // Update real-time state table
    if (command.type === 'PLAY') {
        await supabase.from('classroom_orchestration').upsert({
            class_id: classId,
            bpm: command.payload?.bpm || 120,
            is_locked: true,
            updated_at: new Date().toISOString()
        });
    }

    // Broadcast via canais se necessário para latência ultra-baixa
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
