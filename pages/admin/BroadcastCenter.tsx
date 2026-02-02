
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Megaphone, Send, Zap, AlertTriangle, Users, History, Loader2, Bell } from 'lucide-react';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';
import { supabase } from '../../lib/supabaseClient.ts';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { formatDate } from '../../lib/date.ts';

export default function BroadcastCenter() {
    const [message, setMessage] = useState('');
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState('normal');
    const [sending, setSending] = useState(false);

    const { data: notices, loading: loadingHistory } = useRealtimeSync<any>('notices', undefined, { column: 'created_at', ascending: false });

    const handleBroadcast = async () => {
        if (!message.trim() || !title.trim()) return;
        setSending(true);
        haptics.heavy();
        
        try {
            const { error } = await supabase.from('notices').insert([{
                title,
                message,
                priority,
                target_audience: 'all'
            }]);

            if (error) throw error;
            notify.success("Propagação nuclear concluída!");
            setMessage('');
            setTitle('');
        } catch (e) {
            notify.error("Falha na rede de transmissão.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            <header className="flex items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
                <div className="p-4 bg-red-600 rounded-3xl text-white shadow-xl shadow-red-900/30">
                    <Megaphone size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic">Global <span className="text-red-500">Broadcast</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Transmissão de Baixa Latência via Kernel CDC</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-8">
                    <Card className="bg-slate-900 border-white/5 rounded-[48px] overflow-hidden shadow-2xl p-10">
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Título</label>
                                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Manutenção do Kernel" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Prioridade</label>
                                    <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white">
                                        <option value="normal">Média (In-App)</option>
                                        <option value="high">Alta (Popup)</option>
                                        <option value="critical">Crítica (Modal Travado)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Mensagem</label>
                                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="O que o sistema deve anunciar?" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white" />
                            </div>

                            <Button onClick={handleBroadcast} isLoading={sending} className="w-full py-8 rounded-[32px] bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] shadow-2xl" leftIcon={Send}>
                                Propagar na Rede Neural
                            </Button>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <History size={16} className="text-slate-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Últimos Disparos</h3>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {notices.map((notice: any) => (
                            <div key={notice.id} className="p-6 bg-slate-900 border border-white/5 rounded-[32px] group hover:border-red-500/30 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-slate-950 text-slate-500"><Bell size={16} /></div>
                                        <p className="text-sm font-black text-white uppercase truncate max-w-[150px]">{notice.title}</p>
                                    </div>
                                    <span className="text-[8px] font-black px-2 py-1 rounded bg-black/40 text-slate-500 uppercase">{notice.priority}</span>
                                </div>
                                <p className="text-xs text-slate-400 italic line-clamp-2">"{notice.message}"</p>
                                <p className="text-[8px] font-black text-slate-700 uppercase mt-4">{formatDate(notice.created_at, 'HH:mm • dd MMM')}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
