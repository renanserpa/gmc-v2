
import { supabase } from '../lib/supabaseClient';
import { ClassroomCommand } from '../types';

export type { ClassroomCommand };

export const classroomService = {
    sendCommand(classId: string, command: ClassroomCommand) {
        return supabase.channel(`classroom_${classId}`).send({
            type: 'broadcast',
            event: 'command',
            payload: { ...command, timestamp: Date.now() }
        });
    },

    subscribeToCommands(classId: string, onCommand: (cmd: ClassroomCommand) => void) {
        const channel = supabase.channel(`classroom_${classId}`)
            .on('broadcast', { event: 'command' }, ({ payload }) => {
                onCommand(payload as ClassroomCommand);
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    },

    trackPresence(classId: string, studentData: { id: string, name: string, avatar_url?: string }) {
        const channel = supabase.channel(`presence_${classId}`, {
            config: { presence: { key: studentData.id } }
        });

        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.track({
                    ...studentData,
                    online_at: new Date().toISOString(),
                });
            }
        });

        return channel;
    },

    onPresenceSync(classId: string, onSync: (presenceState: any) => void) {
        const channel = supabase.channel(`presence_${classId}`);
        channel
            .on('presence', { event: 'sync' }, () => {
                onSync(channel.presenceState());
            })
            .subscribe();
        
        return () => supabase.removeChannel(channel);
    },

    async finalizeSession(classId: string, data: { lessonTitle: string, totalHits: number, participantIds: string[] }) {
        const { data: result, error } = await supabase.rpc('finalize_classroom_session', {
            p_lesson_title: data.lessonTitle,
            p_total_hits: data.totalHits,
            p_participants: data.participantIds,
            p_xp_per_student: Math.floor(data.totalHits / (data.participantIds.length || 1)) + 50
        });

        if (error) throw error;
        
        await this.sendCommand(classId, { 
            type: 'END_SESSION', 
            summary: { totalHits: data.totalHits, lessonTitle: data.lessonTitle } 
        });

        return result;
    }
};
