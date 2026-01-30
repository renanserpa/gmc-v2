
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { 
    Trophy, Star, Zap, Edit3, Plus, 
    Trash2, Save, BarChart3, Award, Sparkles,
    Settings2, Loader2, TrendingUp, Info
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils.ts';
import { config as appConfig } from '../../config.ts';

const M = motion as any;

export default function GamificationLab() {
    const [levels, setLevels] = useState<number[]>([]);
    const [badges, setBadges] = useState<any[]>([]);
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

            const { data: bData } = await supabase.from('store_items').select('*').eq('metadata->type', 'badge');
            setBadges(bData || []);
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
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <Sparkles className="text-amber-500" /> Progression <span className="text-amber-500">Lab</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">Engenharia de Dopamina e Curva de Aprendizado</p>
                </div>
                <Button 
                    onClick={handleSaveLevels}
                    isLoading={isSaving}
                    variant="primary"
                    className="rounded-2xl px-10 py-6 text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-900/20"
                >
                    Salvar Arquitetura
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-5 bg-slate-900 border-white/5 rounded-[40px] shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 p-8 bg-slate-950/20">
                        <CardTitle className="text-xs uppercase tracking-[0.4em] flex items-center gap-2 text-sky-500">
                            <BarChart3 size={16} /> Curva de Ranks (XP TOTAL)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        {levels.map((xp, i) => (
                            <M.div layout key={i} className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center font-black text-slate-500 border border-white/5 text-[10px]">
                                    {i + 1}
                                </div>
                                <div className="flex-1 relative">
                                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={14} />
                                    <input 
                                        type="number" 
                                        value={xp}
                                        onChange={(e) => {
                                            const next = [...levels];
                                            next[i] = parseInt(e.target.value) || 0;
                                            setLevels(next);
                                        }}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white font-mono text-sm outline-none focus:border-sky-500/50"
                                    />
                                </div>
                                <div className="w-20 text-right opacity-40 text-[9px] font-black uppercase">
                                    {i > 0 ? `+${xp - levels[i-1]} diff` : 'START'}
                                </div>
                            </M.div>
                        ))}
                    </CardContent>
                </Card>

                <div className="lg:col-span-7 space-y-6">
                    <Card className="bg-slate-950 border-white/5 p-8 rounded-[40px] border-l-8 border-l-purple-500 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-24 bg-purple-500/5 blur-[100px] pointer-events-none" />
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-500 rounded-2xl text-white shadow-lg"><Award size={24} /></div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Achievements Digitais</h3>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                Badges vinculadas ao sistema de recompensas. O aluno desbloqueia e o evento é registrado na tabela <code className="text-purple-400 font-mono">xp_events</code>.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {badges.map(b => (
                                    <div key={b.id} className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                                        <span className="text-xs font-black text-white uppercase truncate">{b.name}</span>
                                        <span className="text-[10px] font-black text-amber-500">+{b.price_coins} OC</span>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" className="w-full border-2 border-dashed border-white/5 rounded-2xl py-8 text-slate-600 hover:text-white" leftIcon={Plus}>
                                Forjar Nova Badge
                            </Button>
                        </div>
                    </Card>

                    <div className="bg-slate-900/40 p-10 rounded-[48px] border border-white/5 flex items-start gap-6">
                        <div className="p-4 bg-sky-500/10 rounded-3xl text-sky-400 shadow-inner border border-sky-500/20">
                            <Info size={32} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none">Protocolo de Retenção</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                A curva de XP deve ser logarítmica. Níveis iniciais rápidos para gerar dopamina, seguidos de desafios crescentes que acompanham a evolução técnica do Módulo 3 ao 6 da Apostila.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
