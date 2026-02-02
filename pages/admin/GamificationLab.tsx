
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Zap, Plus, Globe, Target, BookOpen, AlertCircle, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { cn } from '../../lib/utils.ts';

export default function GamificationLab() {
    const [isSaving, setIsSaving] = useState(false);
    const [newMaster, setNewMaster] = useState({
        title: '',
        description: '',
        xp_reward: 50
    });

    const { data: globalMissions, loading } = useRealtimeSync<any>('missions', 'is_template=eq.true');

    const handleAddMasterMission = async () => {
        if (!newMaster.title) return;
        setIsSaving(true);
        haptics.heavy();
        try {
            const { error } = await supabase.from('missions').insert({
                title: newMaster.title,
                description: newMaster.description,
                xp_reward: newMaster.xp_reward,
                is_template: true,
                status: 'pending',
                school_id: null
            });

            if (error) throw error;
            notify.success("Blueprint Musical Registrado!");
            setNewMaster({ title: '', description: '', xp_reward: 50 });
        } catch (e: any) {
            notify.error("Erro ao criar template.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3 leading-none">
                        Blueprint <span className="text-sky-500">Factory</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Criação de Missões e Desafios Globais</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-4 bg-slate-900 border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 bg-sky-500/5">
                         <h4 className="text-[10px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-2">
                             <Wand2 size={14} /> Novo Template
                         </h4>
                    </div>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Título do Desafio</label>
                            <input value={newMaster.title} onChange={e => setNewMaster({...newMaster, title: e.target.value})} placeholder="Ex: Spider Walk v1" className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm outline-none focus:ring-2 focus:ring-sky-500/20" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Recompensa (XP)</label>
                            <input type="number" value={newMaster.xp_reward} onChange={e => setNewMaster({...newMaster, xp_reward: Number(e.target.value)})} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Descrição</label>
                            <textarea value={newMaster.description} onChange={e => setNewMaster({...newMaster, description: e.target.value})} rows={4} placeholder="O que o aluno deve fazer?" className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm resize-none" />
                        </div>
                        <Button onClick={handleAddMasterMission} isLoading={isSaving} className="w-full py-8 rounded-3xl bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-widest shadow-xl">
                            Injetar no Banco
                        </Button>
                    </CardContent>
                </Card>

                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Blueprints Ativos no Kernel</h4>
                         <span className="text-[10px] font-black text-sky-500">{globalMissions.length} Missões</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loading ? (
                            [...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-900/40 rounded-[32px] animate-pulse" />)
                        ) : globalMissions.map(m => (
                            <Card key={m.id} className="bg-[#0a0f1d] border-white/5 p-6 rounded-[32px] hover:border-sky-500/30 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-900 rounded-xl text-sky-400 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-inner">
                                        <Target size={20} />
                                    </div>
                                    <span className="text-[10px] font-black text-amber-500">+{m.xp_reward} XP</span>
                                </div>
                                <h4 className="text-sm font-black text-white uppercase truncate">{m.title}</h4>
                                <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 leading-relaxed italic">{m.description || "Nenhuma nota pedagógica."}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
