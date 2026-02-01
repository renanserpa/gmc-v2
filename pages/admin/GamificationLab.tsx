import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { 
    Zap, Edit3, Plus, Trash2, BarChart3, Sparkles, Loader2, Globe, Target, Shield
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils.ts';
import { config as appConfig } from '../../config.ts';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { createMasterMission, deleteMission } from '../../services/dataService.ts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog.tsx';

const M = motion as any;

export default function GamificationLab() {
    const [levels, setLevels] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAddMasterOpen, setIsAddMasterOpen] = useState(false);
    
    const [newMaster, setNewMaster] = useState({
        title: '',
        description: '',
        xp_reward: 50
    });

    // ENGINE REALTIME: Missões Mestras (Filtro: is_template=eq.true)
    const { data: globalMissions, loading: loadingMissions } = useRealtimeSync<any>(
        'missions', 
        'is_template=eq.true'
    );

    useEffect(() => {
        loadLevels();
    }, []);

    const loadLevels = async () => {
        setLoading(true);
        try {
            const { data: configData } = await supabase.from('system_configs').select('value').eq('key', 'xp_levels').maybeSingle();
            setLevels(configData ? configData.value : appConfig.gamification.levels);
        } catch (e) {
            notify.error("Falha ao sincronizar curva de níveis.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLevels = async () => {
        setIsSaving(true);
        haptics.heavy();
        try {
            await supabase.from('system_configs').upsert({
                key: 'xp_levels',
                value: levels,
                description: 'Tabela de progressão de níveis Maestro'
            });
            notify.success("Curva de Progressão Atualizada!");
        } catch (e) {
            notify.error("Erro ao persistir curva de XP.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddMasterMission = async () => {
        if (!newMaster.title) {
            notify.warning("O título do template é obrigatório.");
            return;
        }
        setIsSaving(true);
        haptics.heavy();
        try {
            await createMasterMission({
                ...newMaster,
                week_start: new Date().toISOString(),
                coins_reward: Math.floor(newMaster.xp_reward / 10)
            } as any);
            notify.success("Template Global Lançado!");
            setNewMaster({ title: '', description: '', xp_reward: 50 });
            setIsAddMasterOpen(false);
        } catch (e) {
            notify.error("Erro ao criar template.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("ATENÇÃO: Deletar este template removerá a opção para novos professores, mas manterá as instâncias já atribuídas aos alunos. Confirmar?")) return;
        try {
            await deleteMission(id);
            notify.info("Template removido do Kernel.");
        } catch (e) {
            notify.error("Erro ao deletar.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-amber-500/5 blur-[100px] pointer-events-none" />
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3 leading-none">
                        Progression <span className="text-amber-500">Architecture</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">Engenharia de Dopamina e Balanço Econômico Global</p>
                </div>
                <Button onClick={handleSaveLevels} isLoading={isSaving} variant="primary" className="rounded-2xl px-10 py-6 text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-900/20 border-white/10">
                    Salvar Curva de Ranks
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Lado Esquerdo: Curva de Níveis */}
                <Card className="lg:col-span-4 bg-slate-900 border-white/5 rounded-[40px] shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 p-8 bg-slate-950/20">
                        <CardTitle className="text-xs uppercase tracking-[0.4em] flex items-center gap-2 text-sky-500">
                            <BarChart3 size={16} /> Progressão de Níveis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        {levels.map((xp, i) => (
                            <M.div layout key={i} className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center font-black text-slate-500 border border-white/5 text-[10px]">{i + 1}</div>
                                <div className="flex-1 relative">
                                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={14} />
                                    <input type="number" value={xp} onChange={(e) => { const next = [...levels]; next[i] = parseInt(e.target.value) || 0; setLevels(next); }} className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3 pl-12 text-white font-mono text-xs outline-none focus:border-amber-500/50 transition-all" />
                                </div>
                            </M.div>
                        ))}
                    </CardContent>
                </Card>

                {/* Lado Direito: Missões Mestras */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="bg-slate-950 border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                        <CardHeader className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-3 uppercase italic text-white leading-none">
                                    <Globe className="text-purple-500" /> Missões Mestras (Templates)
                                </CardTitle>
                                <p className="text-[9px] font-black text-slate-600 uppercase mt-2">Modelos pedagógicos replicáveis em todas as instâncias</p>
                            </div>
                            <Button 
                                onClick={() => setIsAddMasterOpen(true)}
                                size="sm" 
                                variant="ghost" 
                                className="border border-white/5 rounded-xl hover:bg-purple-600/10 text-[10px] font-black uppercase tracking-widest" 
                                leftIcon={Plus}
                            >
                                Nova Mestra
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <AnimatePresence mode="popLayout">
                                    {loadingMissions ? (
                                        [...Array(4)].map((_, i) => <div key={i} className="h-40 bg-slate-900 animate-pulse rounded-3xl" />)
                                    ) : (globalMissions || []).map((m, idx) => (
                                        <M.div 
                                            key={m.id} 
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-4 group hover:border-purple-500/40 transition-all shadow-lg"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl shadow-inner"><Target size={20} /></div>
                                                <div className="bg-amber-500/10 px-2 py-1 rounded-lg text-[9px] font-black text-amber-500 uppercase border border-amber-500/20">+{m.xp_reward} XP</div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white uppercase truncate">{m.title}</h4>
                                                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 italic leading-relaxed">"{m.description || 'Sem diretrizes adicionais.'}"</p>
                                            </div>
                                            <div className="flex justify-between mt-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest flex items-center gap-1"><Edit3 size={10} /> Editar</button>
                                                <button 
                                                    onClick={() => handleDelete(m.id)}
                                                    className="text-[9px] font-black text-slate-700 hover:text-red-400 uppercase tracking-widest flex items-center gap-1"
                                                >
                                                    <Trash2 size={10} /> Deletar
                                                </button>
                                            </div>
                                        </M.div>
                                    ))}
                                </AnimatePresence>
                                {!loadingMissions && (!globalMissions || globalMissions.length === 0) && (
                                    <div className="col-span-full py-20 text-center opacity-30 italic text-slate-500 text-xs">
                                        Nenhum template global localizado na frequência.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-slate-900/40 p-10 rounded-[48px] border border-white/5 flex items-start gap-6 shadow-xl">
                        <div className="p-4 bg-sky-500/10 rounded-3xl text-sky-400 shadow-inner border border-sky-500/20">
                            <Sparkles size={32} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Protocolo de Engenharia Social</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                As Missões Mestras são injetadas em todas as instâncias do Maestro. Elas permitem que novos professores acessem a trilha pedagógica oficial Olie Music instantaneamente através do seletor de "Templates" no Task Manager.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Nova Missão Mestra */}
            <Dialog open={isAddMasterOpen} onOpenChange={setIsAddMasterOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 rounded-[40px] max-w-lg p-10 shadow-2xl">
                    <DialogHeader className="space-y-4">
                        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-900/40">
                            <Plus size={32} />
                        </div>
                        <DialogTitle className="text-2xl font-black text-white uppercase italic tracking-tighter">Template Global</DialogTitle>
                        <DialogDescription className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Provisionamento de modelo pedagógico replicável no Kernel.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-8">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Título do Template</label>
                            <input value={newMaster.title} onChange={e => setNewMaster({...newMaster, title: e.target.value})} placeholder="Ex: Primeiro Acorde (Suzuki)" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:ring-4 focus:ring-purple-600/20 transition-all" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Recompensa Base (XP)</label>
                                <input type="number" value={newMaster.xp_reward} onChange={e => setNewMaster({...newMaster, xp_reward: Number(e.target.value)})} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm" />
                            </div>
                            <div className="space-y-1.5 flex flex-col justify-end">
                                <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 flex items-center gap-2">
                                    <Shield size={14} className="text-sky-400" />
                                    <span className="text-[8px] font-black text-slate-500 uppercase">Escopo: GLOBAL</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Descrição Pedagógica</label>
                            <textarea value={newMaster.description} onChange={e => setNewMaster({...newMaster, description: e.target.value})} rows={3} placeholder="Instruções para o aluno..." className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm resize-none" />
                        </div>
                    </div>

                    <DialogFooter className="gap-3 border-t border-white/5 pt-8">
                        <Button variant="ghost" onClick={() => setIsAddMasterOpen(false)} className="text-[10px] font-black uppercase tracking-widest">Cancelar</Button>
                        <Button onClick={handleAddMasterMission} isLoading={isSaving} className="bg-purple-600 px-10 py-6 font-black uppercase text-[10px] tracking-widest shadow-xl">Lançar Template</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
