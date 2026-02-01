import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Megaphone, Send, Zap, AlertTriangle, Users, ShieldAlert, History, Loader2, Bell } from 'lucide-react';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';
import { supabase } from '../../lib/supabaseClient.ts';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { formatDate } from '../../lib/date.ts';
import { motion, AnimatePresence } from 'framer-motion';

const M = motion as any;

export default function BroadcastCenter() {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [target, setTarget] = useState('all');

    // MÚCLEO REATIVO: Histórico de Broadcasts do Sistema
    const { data: recentBroadcasts, loading: loadingBroadcasts } = useRealtimeSync<any>(
        'notices', 
        null, 
        { column: 'created_at', ascending: false }
    );

    const handleBroadcast = async () => {
        if (!message.trim() || sending) return;
        setSending(true);
        haptics.heavy();
        
        try {
            // 1. Persiste na tabela de avisos. O trigger de CDC notificará os alunos.
            const { error } = await supabase.from('notices').insert({
                title: 'ALERTA MASTER',
                message: message,
                target_audience: target,
                professor_id: '00000000-0000-0000-0000-000000000000' // ID reservado para Root/Sistema
            }).select().single();

            if (error) throw error;

            // 2. Disparo de canal de broadcast para ação imediata (UI Overlays)
            await supabase.channel('global_broadcast').send({
                type: 'broadcast',
                event: 'urgent_notice',
                payload: { 
                    message, 
                    target,
                    timestamp: new Date().toISOString()
                }
            });

            notify.success("Propagação concluída via Rede Neural!");
            setMessage('');
        } catch (e) {
            notify.error("Falha ao propagar aviso global.");
        } finally {
            setSending(false);
        }
    };

    // Filtra apenas avisos do sistema no histórico
    const systemBroadcasts = (recentBroadcasts || []).filter(b => b.professor_id === '00000000-0000-0000-0000-000000000000');

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
            <header className="flex items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
                <div className="p-4 bg-red-600 rounded-3xl text-white shadow-xl shadow-red-900/30 ring-4 ring-red-500/10">
                    <Megaphone size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic">Global <span className="text-red-500">Broadcast</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                        <Zap size={12} className="text-sky-400" /> Transmissão de Baixa Latência via Kernel CDC
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-8">
                    <Card className="bg-slate-900 border-red-500/20 rounded-[48px] overflow-hidden shadow-2xl">
                        <CardHeader className="bg-slate-950/50 p-8 border-b border-white/5 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-3">
                                <Zap size={20} className="text-sky-400" /> Disparo Master
                            </CardTitle>
                            <div className="flex gap-2">
                                {[
                                    { id: 'all', label: 'Global' },
                                    { id: 'professors', label: 'Mestres' },
                                    { id: 'students', label: 'Alunos' }
                                ].map(t => (
                                    <button 
                                        key={t.id} onClick={() => setTarget(t.id)}
                                        className={cn(
                                            "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                            target === t.id ? "bg-red-600 text-white shadow-lg" : "bg-slate-900 text-slate-500 border border-white/5"
                                        )}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 space-y-8">
                            <textarea 
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                rows={6}
                                placeholder="Digite o comunicado oficial para a rede..."
                                className="w-full bg-slate-950 border border-white/10 rounded-[32px] p-8 text-white text-lg font-medium outline-none focus:ring-4 focus:ring-red-600/20 resize-none shadow-inner"
                            />

                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 bg-red-500/5 border border-red-500/10 p-6 rounded-[32px] space-y-3">
                                    <div className="flex items-center gap-2 text-red-500">
                                        <AlertTriangle size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Protocolo Root</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                        Esta mensagem ignorará filtros de tenant e aparecerá no HUD de todos os usuários da rede. Use apenas para atualizações de infra ou avisos críticos.
                                    </p>
                                </div>
                                <Button 
                                    onClick={handleBroadcast} 
                                    isLoading={sending}
                                    disabled={!message.trim()}
                                    className="px-12 py-8 rounded-[32px] bg-red-600 hover:bg-red-500 text-white text-lg font-black uppercase tracking-[0.2em] shadow-2xl"
                                    leftIcon={Send}
                                >
                                    Propagar Agora
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <History size={16} className="text-slate-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Histórico de Transmissão</h3>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[600px] custom-scrollbar pr-2">
                        <AnimatePresence mode="popLayout">
                            {loadingBroadcasts && systemBroadcasts.length === 0 ? (
                                [...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-900/50 rounded-3xl animate-pulse" />)
                            ) : systemBroadcasts.map(b => (
                                <M.div 
                                    key={b.id} 
                                    layout
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-6 bg-slate-900 border border-white/5 rounded-[32px] group hover:border-red-500/30 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-950 rounded-xl text-red-500">
                                                <Bell size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-white uppercase">SISTEMA MAESTRO</p>
                                                <p className="text-[8px] font-bold text-slate-600 uppercase mt-0.5">{formatDate(b.created_at, 'dd/MM • HH:mm')}</p>
                                            </div>
                                        </div>
                                        <span className="text-[8px] font-black text-slate-700 bg-black/40 px-2 py-0.5 rounded">To: {b.target_audience}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed italic line-clamp-3">"{b.message}"</p>
                                </M.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
