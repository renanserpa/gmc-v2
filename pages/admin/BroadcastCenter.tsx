import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Megaphone, Send, Zap, AlertTriangle, Users, ShieldAlert, History } from 'lucide-react';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';
import { supabase } from '../../lib/supabaseClient.ts';

export default function BroadcastCenter() {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [target, setTarget] = useState('all');

    const handleBroadcast = async () => {
        if (!message.trim()) return;
        setSending(true);
        haptics.heavy();
        
        try {
            // Persiste na tabela de avisos
            const { error } = await supabase.from('notices').insert({
                title: 'COMUNICADO MASTER ROOT',
                message: message,
                target_audience: target,
                professor_id: '00000000-0000-0000-0000-000000000000' // ID reservado Sistema
            });

            if (error) throw error;

            notify.success("Broadcast enviado para todos os dashboards!");
            setMessage('');
        } catch (e) {
            notify.error("Falha ao propagar aviso global.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
            <header className="flex items-center gap-6">
                <div className="p-4 bg-red-600 rounded-3xl text-white shadow-xl shadow-red-900/30 ring-4 ring-red-500/10">
                    <Megaphone size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Global <span className="text-red-500">Broadcast</span></h1>
                    <p className="text-slate-500 font-medium mt-2">Transmissão prioritária para todos os usuários ativos da rede.</p>
                </div>
            </header>

            <Card className="bg-slate-900 border-red-500/20 rounded-[48px] overflow-hidden shadow-2xl">
                <CardHeader className="bg-slate-950/50 p-8 border-b border-white/5 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-3">
                        <Zap size={20} className="text-sky-400" /> Novo Alerta de Kernel
                    </CardTitle>
                    <div className="flex gap-2">
                        {['all', 'professors', 'students'].map(t => (
                            <button 
                                key={t} onClick={() => setTarget(t)}
                                className={cn(
                                    "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                    target === t ? "bg-red-600 text-white shadow-lg" : "bg-slate-900 text-slate-500 border border-white/5"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                    <textarea 
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        rows={6}
                        placeholder="Digite o comunicado oficial aqui..."
                        className="w-full bg-slate-950 border border-white/10 rounded-[32px] p-8 text-white text-lg font-medium outline-none focus:ring-4 focus:ring-red-600/20 resize-none shadow-inner"
                    />

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 bg-red-500/5 border border-red-500/10 p-6 rounded-[32px] space-y-3">
                            <div className="flex items-center gap-2 text-red-500">
                                <AlertTriangle size={18} />
                                <span className="text-xs font-black uppercase tracking-widest">Protocolo Crítico</span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                Esta mensagem ignorará filtros e aparecerá no topo do HUD de todos os usuários selecionados. Use para manutenções ou avisos pedagógicos urgentes.
                            </p>
                        </div>
                        <Button 
                            onClick={handleBroadcast} 
                            isLoading={sending}
                            disabled={!message.trim()}
                            className="px-12 py-8 rounded-[32px] bg-red-600 hover:bg-red-500 text-white text-lg font-black uppercase tracking-[0.2em] shadow-2xl"
                            leftIcon={Send}
                        >
                            Propagar Aviso
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}