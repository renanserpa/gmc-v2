import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { notify } from '../lib/notification.ts';
import { haptics } from '../lib/haptics.ts';
import { uiSounds } from '../lib/uiSounds.ts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/Dialog.tsx';
import { Button } from './ui/Button.tsx';
import { AlertTriangle, Megaphone, Zap, Bell, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const M = motion as any;

export const RealtimeNoticeListener: React.FC = () => {
    const [criticalNotice, setCriticalNotice] = useState<any>(null);

    useEffect(() => {
        // Escuta novas inserções na tabela de notices
        const channel = supabase.channel('realtime_global_notices')
            .on(
                'postgres_changes' as any,
                { event: 'INSERT', schema: 'public', table: 'notices' },
                (payload: any) => {
                    const notice = payload.new;
                    handleNewNotice(notice);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleNewNotice = (notice: any) => {
        // Prioridade High ou Critical dispara efeitos pesados
        if (notice.priority === 'critical' || notice.priority === 'high') {
            haptics.fever();
            uiSounds.playError();
            setCriticalNotice(notice);
        } else if (notice.priority === 'normal') {
            notify.info(notice.title, { 
                icon: () => <Megaphone className="text-sky-400" />
            });
        }
    };

    return (
        <AnimatePresence>
            {criticalNotice && (
                <Dialog open={!!criticalNotice} onOpenChange={() => setCriticalNotice(null)}>
                    <DialogContent className="bg-red-950 border-red-500/40 rounded-[48px] p-10 shadow-[0_0_100px_rgba(239,68,68,0.3)]">
                        <div className="absolute top-0 right-0 p-32 bg-white/5 blur-[80px] pointer-events-none" />
                        
                        <DialogHeader className="text-center space-y-6">
                            <div className="mx-auto w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center text-white shadow-2xl animate-bounce">
                                <AlertTriangle size={40} />
                            </div>
                            <div>
                                <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter italic">
                                    Comunicado <span className="text-red-400">Master</span>
                                </DialogTitle>
                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full border border-red-500/30">
                                    <Zap size={12} className="text-red-400" fill="currentColor" />
                                    <span className="text-[9px] font-black text-red-300 uppercase tracking-widest">Urgência Nível {criticalNotice.priority.toUpperCase()}</span>
                                </div>
                            </div>
                            <DialogDescription className="text-red-100 text-lg font-medium leading-relaxed italic opacity-90">
                                "{criticalNotice.content}"
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="mt-10">
                            <Button 
                                onClick={() => setCriticalNotice(null)} 
                                className="w-full py-6 rounded-2xl bg-white text-red-900 font-black uppercase tracking-widest hover:bg-red-100 shadow-xl"
                            >
                                Compreendido
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    );
};
