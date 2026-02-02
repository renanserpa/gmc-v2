
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { 
    Coins, Zap, History, Search, RefreshCw, Sparkles, 
    AlertCircle, Activity, ArrowUpRight, TrendingUp,
    Settings2, Save, Database, ShieldAlert
} from 'lucide-react';
import { haptics } from '../../lib/haptics.ts';
import { notify } from '../../lib/notification.ts';
import { cn } from '../../lib/utils.ts';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient.ts';

export default function GlobalEconomy() {
    const [configs, setConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<string | null>(null);

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        setLoading(true);
        const { data } = await supabase.from('system_configs').select('*').order('key');
        setConfigs(data || []);
        setLoading(false);
    };

    const handleUpdate = async (key: string, value: any) => {
        setIsSaving(key);
        haptics.medium();
        try {
            const { error } = await supabase.from('system_configs').upsert({ key, value, updated_at: new Date().toISOString() });
            if (error) throw error;
            notify.success(`Config [${key}] atualizada no Kernel!`);
        } catch (e) {
            notify.error("Falha ao propagar configuração.");
        } finally {
            setIsSaving(null);
        }
    };

    const updateLocalValue = (key: string, value: string) => {
        setConfigs(prev => prev.map(c => c.key === key ? { ...c, value } : c));
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <header className="flex items-center gap-6 bg-slate-900/40 p-10 rounded-[56px] border border-white/5 backdrop-blur-xl">
                <div className="p-4 bg-amber-500 rounded-3xl text-slate-950 shadow-xl shadow-amber-900/30">
                    <Settings2 size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Mundo <span className="text-amber-500">Settings</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Ecossistema Global Configs & Rules</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <Database size={16} className="text-slate-500" />
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active System Keys</h4>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            [...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-900/40 rounded-[32px] animate-pulse" />)
                        ) : configs.map(config => (
                            <Card key={config.key} className="bg-[#0a0f1d] border-white/5 p-8 rounded-[40px] shadow-2xl group hover:border-amber-500/20 transition-all">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="space-y-1 text-center md:text-left">
                                        <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest">{config.key}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold">{config.description || "Sem descrição disponível."}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            value={config.value} 
                                            onChange={(e) => updateLocalValue(config.key, e.target.value)}
                                            className="bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-center w-32 font-mono font-black"
                                        />
                                        <button 
                                            onClick={() => handleUpdate(config.key, config.value)}
                                            disabled={isSaving === config.key}
                                            className="p-4 bg-amber-500 text-slate-950 rounded-2xl hover:bg-amber-400 transition-all shadow-xl disabled:opacity-50"
                                        >
                                            {isSaving === config.key ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <Card className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-[40px] shadow-xl">
                        <div className="flex items-start gap-4">
                            <ShieldAlert className="text-amber-500 shrink-0" size={24} />
                            <div>
                                <h5 className="text-[11px] font-black text-white uppercase tracking-widest">Atenção Crítica</h5>
                                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed font-medium">
                                    Alterar o <code className="text-amber-500">XP_MULTIPLIER</code> afeta instantaneamente a progressão de todos os estudantes no estúdio. Use com sabedoria para eventos especiais.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="p-8 bg-slate-900/60 border border-white/5 rounded-[40px] space-y-6">
                         <div className="flex items-center gap-3">
                             <History className="text-slate-600" size={16} />
                             <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Última Propagação</h4>
                         </div>
                         <p className="text-[10px] text-slate-600 font-bold uppercase">Sincronizado com Cluster Principal v6.2</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
