import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Play, Pause, Zap, Sparkles, Monitor } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.ts';
import { notify } from '../lib/notification.ts';
import { haptics } from '../lib/haptics.ts';

export default function ClassroomRemote() {
    const [isPlaying, setIsPlaying] = useState(false);

    // ENGINE DE BROADCAST: Envia sinal para o canal global da sala
    const sendCommand = async (type: string, payload: any = {}) => {
        haptics.medium();
        const channel = supabase.channel('classroom_global');
        
        await channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({
                    type: 'broadcast',
                    event: 'COMMAND',
                    payload: { type, ...payload, timestamp: Date.now() }
                });
            }
        });
        
        notify.info(`Comando ${type} enviado.`);
    };

    return (
        <div className="min-h-screen bg-[#020617] p-8 space-y-10">
            <header className="flex items-center gap-6 bg-slate-900/60 p-10 rounded-[56px] border border-white/5">
                <div className="w-20 h-20 bg-rose-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-rose-900/40">
                    <Monitor size={40} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">Remote <span className="text-rose-500">Core</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Sincronizado com RedHouse Cuiabá</p>
                </div>
            </header>

            <div className="max-w-xl mx-auto space-y-8">
                <Card className="bg-slate-900 border-white/5 rounded-[48px] overflow-hidden shadow-2xl p-10 flex flex-col items-center gap-10">
                    <div className="flex gap-6">
                        <button 
                            onClick={() => { setIsPlaying(true); sendCommand('PLAY'); }}
                            className="w-32 h-32 rounded-[40px] bg-emerald-500 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all active:scale-95"
                        >
                            <Play size={48} fill="currentColor" />
                        </button>
                        <button 
                            onClick={() => { setIsPlaying(false); sendCommand('PAUSE'); }}
                            className="w-32 h-32 rounded-[40px] bg-rose-600 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all active:scale-95"
                        >
                            <Pause size={48} fill="currentColor" />
                        </button>
                    </div>

                    <div className="w-full pt-8 border-t border-white/5">
                        <Button 
                            onClick={() => sendCommand('CELEBRATE', { effect: 'confetti' })}
                            className="w-full py-8 rounded-3xl bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-widest shadow-xl"
                            leftIcon={Sparkles}
                        >
                            Testar TV (Confete)
                        </Button>
                    </div>
                </Card>

                <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/5 flex items-center gap-4">
                    <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400">
                        <Zap size={20} />
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase font-black leading-relaxed">
                        Maestro Remote utiliza WebSockets de baixa latência para sincronia pedagógica instantânea entre o tablet do professor e a TV da sala.
                    </p>
                </div>
            </div>
        </div>
    );
}