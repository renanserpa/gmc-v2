
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { 
    Megaphone, Send, Zap, AlertTriangle, 
    Users, History, Loader2, Bell, GraduationCap,
    Filter, Target
} from 'lucide-react';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';
import { supabase } from '../../lib/supabaseClient.ts';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { formatDate } from '../../lib/date.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';

export default function BroadcastCenter() {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [target, setTarget] = useState('all');
    const [isSending, setIsSending] = useState(false);

    // ENGINE REALTIME: Monitorando a tabela announcements do CSV
    const { data: history, loading: loadingHistory } = useRealtimeSync<any>('announcements', undefined, { column: 'created_at', ascending: false });

    const handleBroadcast = async () => {
        if (!title.trim() || !content.trim()) return;
        setIsSending(true);
        haptics.heavy();
        
        try {
            const { error } = await supabase.from('announcements').insert([{
                title,
                content,
                type: target, // Usando a coluna type como audience filter
                professor_id: user.id
            }]);

            if (error) throw error;
            notify.success("Mensagem propagada na rede Maestro!");
            setTitle('');
            setContent('');
        } catch (e) {
            notify.error("Falha ao emitir comunicado.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            <header className="flex items-center gap-6 bg-slate-900/40 p-10 rounded-[56px] border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none" />
                 <div className="p-4 bg-red-600 rounded-3xl text-white shadow-xl shadow-red-900/40 relative z-10">
                    <Megaphone size={32} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic">Olie <span className="text-red-500">Broadcast</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Comunicação Unificada via Kernel Maestro</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-8">
                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl p-12">
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Título do Comunicado</label>
                                    <input 
                                        value={title} 
                                        onChange={e => setTitle(e.target.value)} 
                                        placeholder="Ex: Atualização do Kernel 1.2" 
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-4 focus:ring-red-500/10" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Público Alvo</label>
                                    <div className="flex bg-slate-950 p-1 rounded-2xl border border-white/10">
                                        {[
                                            { id: 'all', icon: Target },
                                            { id: 'professor', icon: GraduationCap },
                                            { id: 'student', icon: Users }
                                        ].map(opt => (
                                            <button 
                                                key={opt.id}
                                                onClick={() => { setTarget(opt.id); haptics.light(); }}
                                                className={cn(
                                                    "flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 text-[8px] font-black uppercase transition-all",
                                                    target === opt.id ? "bg-red-600 text-white shadow-lg" : "text-slate-600 hover:text-slate-300"
                                                )}
                                            >
                                                <opt.icon size={14} /> {opt.id}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Conteúdo da Mensagem</label>
                                <textarea 
                                    value={content} 
                                    onChange={e => setContent(e.target.value)} 
                                    rows={6} 
                                    placeholder="Escreva o comunicado detalhado aqui..." 
                                    className="w-full bg-slate-950 border border-white/10 rounded-[32px] p-8 text-white outline-none focus:ring-4 focus:ring-red-500/10 resize-none font-medium leading-relaxed" 
                                />
                            </div>

                            <Button 
                                onClick={handleBroadcast} 
                                isLoading={isSending} 
                                className="w-full py-10 rounded-[40px] bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.3em] shadow-2xl" 
                                leftIcon={Send}
                            >
                                Disparar na Rede Neural
                            </Button>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <History size={16} className="text-slate-600" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Últimas Transmissões</h3>
                    </div>

                    <div className="space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
                        {loadingHistory ? (
                            [...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-900/40 rounded-[32px] animate-pulse" />)
                        ) : history.map((item: any) => (
                            <div key={item.id} className="p-6 bg-[#0a0f1d] border border-white/5 rounded-[32px] group hover:border-red-500/20 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-slate-900 text-slate-600 group-hover:bg-red-500 group-hover:text-white transition-all"><Bell size={16} /></div>
                                        <div>
                                            <p className="text-sm font-black text-white uppercase truncate max-w-[180px]">{item.title}</p>
                                            <p className="text-[8px] font-bold text-slate-700 uppercase">{formatDate(item.created_at, 'HH:mm • dd MMM')}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 bg-black/40 rounded text-[7px] font-black text-slate-600 uppercase border border-white/5">{item.type}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed italic">"{item.content}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
