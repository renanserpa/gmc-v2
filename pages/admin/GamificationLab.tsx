
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { 
    Trophy, Star, Zap, Edit3, Plus, 
    Trash2, Save, BarChart3, Award, Sparkles,
    Settings2, Loader2, TrendingUp, Info, Target, Globe
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils.ts';
import { config as appConfig } from '../../config.ts';

const M = motion as any;

export default function GamificationLab() {
    const [levels, setLevels] = useState<number[]>([]);
    const [globalMissions, setGlobalMissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data: configData } = await supabase.from('system_configs').select('value').eq('key', 'xp_levels').maybeSingle();
            setLevels(configData ? configData.value : appConfig.gamification.levels);
            
            // Busca missões globais (professor_id = NULL ou ID do sistema)
            const { data: mData } = await supabase.from('missions').select('*').is('student_id', null).order('xp_reward');
            setGlobalMissions(mData || []);
        } catch (e) {
            notify.error("Falha ao sincronizar laboratório.");
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

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-amber-500/5 blur-[100px] pointer-events-none" />
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <Sparkles className="text-amber-500" /> Progression <span className="text-amber-500">Architecture</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">Engenharia de Dopamina e Balanço Econômico Global</p>
                </div>
                <Button onClick={handleSaveLevels} isLoading={isSaving} variant="primary" className="rounded-2xl px-10 py-6 text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-900/20">
                    Salvar Curva de Ranks
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                                    <input type="number" value={xp} onChange={(e) => { const next = [...levels]; next[i] = parseInt(e.target.value) || 0; setLevels(next); }} className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3 pl-12 text-white font-mono text-xs outline-none" />
                                </div>
                            </M.div>
                        ))}
                    </CardContent>
                </Card>

                <div className="lg:col-span-8 space-y-6">
                    <Card className="bg-slate-950 border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                        <CardHeader className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-3 uppercase italic">
                                    <Globe className="text-purple-500" /> Missões Mestras (Globais)
                                </CardTitle>
                                <p className="text-[9px] font-black text-slate-600 uppercase mt-1">Template de missões replicáveis para todos os professores</p>
                            </div>
                            <Button size="sm" variant="ghost" className="border border-white/5 rounded-xl" leftIcon={Plus}>Nova Global</Button>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {globalMissions.map(m => (
                                    <div key={m.id} className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col gap-4 group hover:border-purple-500/40 transition-all">
                                        <div className="flex justify-between items-start">
                                            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl"><Target size={20} /></div>
                                            <div className="bg-amber-500/10 px-2 py-1 rounded-lg text-[9px] font-black text-amber-500 uppercase">+{m.xp_reward} XP</div>
                                        </div>
                                        <h4 className="text-sm font-black text-white uppercase truncate">{m.title}</h4>
                                        <div className="flex justify-between mt-2">
                                            <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase">Editar</button>
                                            <button className="text-[10px] font-black text-slate-700 hover:text-red-400 uppercase">Deletar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-slate-900/40 p-10 rounded-[48px] border border-white/5 flex items-start gap-6">
                        <div className="p-4 bg-sky-500/10 rounded-3xl text-sky-400 shadow-inner border border-sky-500/20"><Info size={32} /></div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Protocolo de Engenharia Social</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">As Missões Mestras aparecem como sugestão no cockpit do professor ao planejar aulas, garantindo que a metodologia OlieMusic seja aplicada com consistência em todas as unidades franqueadas.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
