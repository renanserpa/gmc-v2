import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { notify } from '../lib/notification';
import { haptics } from '../lib/haptics';
import { uiSounds } from '../lib/uiSounds';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/Dialog';
import { Button } from './ui/Button';
import { AlertTriangle, Zap, Bell, Megaphone, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const M = motion as any;

export const RealtimeNotificationHandler: React.FC = () => {
  const [activeAlert, setActiveAlert] = useState<any>(null);

  useEffect(() => {
    // Escuta a camada de notices em tempo real
    const channel = supabase.channel('maestro_notification_bus')
      .on(
        'postgres_changes' as any,
        { event: 'INSERT', schema: 'public', table: 'notices' },
        (payload: any) => {
          const notice = payload.new;
          processNotice(notice);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const processNotice = (notice: any) => {
    const priority = notice.priority || 'normal';

    switch (priority) {
      case 'critical':
      case 'high':
        haptics.fever();
        uiSounds.playError();
        setActiveAlert(notice);
        break;
      
      case 'normal':
        haptics.medium();
        notify.info(notice.title, { 
          icon: () => <Megaphone className="text-sky-400" />
        });
        break;

      case 'low':
      default:
        haptics.light();
        // Apenas Toast sutil
        notify.info(notice.title, { 
          autoClose: 2000,
          icon: () => <Bell className="text-slate-500" />
        });
        break;
    }
  };

  return (
    <AnimatePresence>
      {activeAlert && (
        <Dialog open={!!activeAlert} onOpenChange={() => setActiveAlert(null)}>
          <DialogContent className="bg-slate-900 border-2 border-red-500/40 rounded-[48px] p-10 shadow-[0_0_100px_rgba(239,68,68,0.2)]">
            <div className="absolute top-0 right-0 p-32 bg-red-500/5 blur-[80px] pointer-events-none" />
            
            <DialogHeader className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center text-white shadow-2xl animate-bounce">
                <AlertTriangle size={40} />
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter italic">
                  ALERTA <span className="text-red-500">MASTER</span>
                </DialogTitle>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                  <Zap size={12} className="text-red-400" fill="currentColor" />
                  <span className="text-[9px] font-black text-red-300 uppercase tracking-widest">Protocolo de Emergência</span>
                </div>
              </div>
              <DialogDescription className="text-slate-300 text-lg font-medium leading-relaxed italic">
                "{activeAlert.content || activeAlert.message}"
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-10 border-none">
              <Button 
                onClick={() => setActiveAlert(null)} 
                className="w-full py-8 rounded-3xl bg-red-600 text-white font-black uppercase tracking-widest hover:bg-red-500 shadow-2xl"
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
