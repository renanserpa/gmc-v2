import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { 
    Megaphone, Send, Zap, AlertTriangle, Users, 
    History, Loader2, Bell, Clock, Info, ShieldCheck, Star
} from 'lucide-react';
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
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'critical'>('normal');
    const [target, setTarget] = useState('all');
    const [sending, setSending] = useState(false);

    // MÚCLEO REATIVO: Histórico de Transmissão
    const { data: notices, loading: loadingHistory } = useRealtimeSync<any>(
        'notices', 
        null, 
        { column: 'created_at', ascending: false }
    );

    const handleBroadcast = async () => {
        if (!message.trim() || !title.trim() || sending) return;
        setSending(true);
        haptics.heavy();
        
        try {
            // 1. Persistência na tabela (Aciona o CDC do useRealtimeSync em todos os clientes)
            const { error } = await supabase.from('notices').insert({
                title,
                content: message,
                message: message, // Compatibilidade v1
                priority,
                target_audience: target,
                expires_at: new Date(Date.now() + 86400000).toISOString() // Expira em 24h
            });

            if (error) throw error;

            // 2. Broadcast de canal para efeitos de tela imediata (Overlays)
            await supabase.channel('maestro_global_control').send({
                type: 'broadcast',
                event: 'global_alert',
                payload: { title, message, priority, target }
            });

            notify.success("Propagação nuclear concluída!");
            setMessage('');
            setTitle('');
            setPriority('normal');
        } catch (e) {
            notify.error("Falha na rede de transmissão.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
            <header className="flex items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
                <div className="p-4 bg-red-600 rounded-3xl text-white shadow-xl shadow-red-900/30">
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
                    <Card className="bg-slate-900 border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                        <CardHeader className="p-8 border-b border-white/5 bg-slate-950/20">
                            <CardTitle className="text-xs uppercase tracking-widest flex items-center gap-3 text-sky-400 font-black">
                                <Zap size={18} /> Novo Disparo Master
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 space-y-8">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Título</label>
                                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Manutenção do Kernel" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:ring-2 focus:ring-sky-500/20" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Alvo</label>
                                        <select value={target} onChange={e => setTarget(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm appearance-none outline-none">
                                            <option value="all">Global (Todos)</option>
                                            <option value="professors">Apenas Mestres</option>
                                            <option value="students">Apenas Alunos</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Protocolo de Entrega (Prioridade)</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { id: 'low', label: 'Low', desc: 'Badge no sino', color: 'border-slate-800 text-slate-500' },
                                            { id: 'normal', label: 'Normal', desc: 'Toast sutil', color: 'border-sky-500/30 text-sky-400' },
                                            { id: 'high', label: 'High', desc: 'Toast persistente', color: 'border-amber-500/30 text-amber-500' },
                                            { id: 'critical', label: 'Critical', desc: 'Modal Overlay', color: 'border-red-500/30 text-red-500' }
                                        ].map(p => (
                                            <button 
                                                key={p.id} onClick={() => setPriority(p.id as any)}
                                                className={cn(
                                                    "p-3 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-1",
                                                    priority === p.id ? "bg-white/5 border-white text-white shadow-lg" : `bg-slate-950 ${p.color}`
                                                )}
                                            >
                                                <span className="text-[10px] font-black uppercase">{p.label}</span>
                                                <span className="text-[7px] font-bold opacity-50 uppercase tracking-tighter">{p.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Mensagem</label>
                                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="O que o sistema deve anunciar?" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:ring-2 focus:ring-sky-500/20 resize-none" />
                                </div>
                            </div>

                            <Button onClick={handleBroadcast} isLoading={sending} disabled={!message.trim() || !title.trim()} className="w-full py-8 rounded-[32px] bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] shadow-2xl" leftIcon={Send}>
                                Propagar na Rede Neural
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <History size={16} className="text-slate-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Ativos Atuais</h3>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                        <AnimatePresence mode="popLayout">
                            {notices.map((notice, idx) => (
                                <M.div key={notice.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 bg-slate-900 border border-white/5 rounded-[32px] group hover:border-red-500/30 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-xl",
                                                notice.priority === 'critical' ? "bg-red-500 text-white shadow-lg" : "bg-slate-950 text-slate-500"
                                            )}>
                                                <Bell size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white uppercase tracking-tight leading-none">{notice.title}</p>
                                                <p className="text-[8px] font-bold text-slate-600 uppercase mt-1.5 flex items-center gap-1">
                                                    <Clock size={8} /> {formatDate(notice.created_at, 'HH:mm')}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[8px] font-black px-2 py-1 rounded bg-black/40 text-slate-500 uppercase tracking-widest">{notice.priority}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed italic line-clamp-2">"{notice.content}"</p>
                                </M.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
