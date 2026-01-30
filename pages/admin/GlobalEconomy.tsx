
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { 
    Coins, Zap, ShoppingBag, TrendingUp, Edit3, 
    Trash2, Plus, BarChart3, Save, Loader2, 
    Sparkles, ArrowRight, ShieldCheck, History
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.ts';
import { haptics } from '../../lib/haptics.ts';
import { notify } from '../../lib/notification.ts';
import { cn } from '../../lib/utils.ts';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalEconomy() {
    const [multiplier, setMultiplier] = useState(1.0);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [mRes, iRes] = await Promise.all([
                supabase.from('system_configs').select('value').eq('key', 'global_xp_multiplier').maybeSingle(),
                supabase.from('store_items').select('*').order('price_coins')
            ]);
            if (mRes.data) setMultiplier(parseFloat(mRes.data.value));
            setItems(iRes.data || []);
        } catch (e) {
            notify.error("Erro na sincronia econômica.");
        } finally {
            setLoading(false);
        }
    };

    const saveMultiplier = async () => {
        setSaving(true);
        haptics.heavy();
        try {
            await supabase.from('system_configs').upsert({
                key: 'global_xp_multiplier',
                value: multiplier.toString()
            });
            notify.success("Política de Multiplicador Aplicada!");
        } catch (e) {
            notify.error("Falha ao gravar política.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3 leading-none">
                        Economy <span className="text-amber-500">Monitor</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Gestão de OlieCoins e Alavancagem Pedagógica</p>
                </div>
                <Button leftIcon={Plus} className="bg-amber-600 hover:bg-amber-500 px-8 py-6 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">
                    Forjar Novo Ativo
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-8 bg-slate-900 border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                    <CardHeader className="bg-slate-950/50 p-8 border-b border-white/5 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm uppercase tracking-[0.4em] flex items-center gap-3 text-amber-500">
                            <ShoppingBag size={18} /> Catálogo do Marketplace
                        </CardTitle>
                        <div className="flex gap-2">
                           <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-900 px-3 py-1 rounded-full border border-white/5">Global Pool</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-950 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-10 py-6">Item / Ativo</th>
                                        <th className="px-10 py-6">Custo (OC)</th>
                                        <th className="px-10 py-6">Status</th>
                                        <th className="px-10 py-6 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {items.map(item => (
                                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center text-amber-500 shadow-inner group-hover:scale-110 transition-transform">
                                                        <Sparkles size={20} fill="currentColor" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-white uppercase tracking-tight">{item.name}</p>
                                                        <p className="text-[10px] text-slate-500 italic mt-1">{item.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-2 text-xl font-black text-amber-500 font-mono italic">
                                                    <Coins size={16} /> {item.price_coins}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded border border-emerald-500/20 uppercase">Disponível</span>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <button className="p-3 bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-all"><Edit3 size={16}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-gradient-to-br from-amber-600/10 to-transparent border-amber-600/20 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-16 bg-amber-500/5 blur-3xl rounded-full" />
                        <div className="relative z-10 space-y-8">
                            <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">XP Event Boost</h4>
                                <span className="text-4xl font-black text-amber-500 font-mono italic">x{multiplier.toFixed(1)}</span>
                            </div>
                            <input 
                                type="range" min="0.5" max="4.0" step="0.1" value={multiplier}
                                onChange={(e) => { setMultiplier(parseFloat(e.target.value)); haptics.light(); }}
                                className="w-full h-3 bg-slate-950 rounded-full appearance-none accent-amber-500 cursor-pointer"
                            />
                            <Button 
                                onClick={saveMultiplier}
                                isLoading={saving}
                                className="w-full py-6 rounded-2xl bg-amber-600 text-slate-950 font-black uppercase italic tracking-widest"
                                leftIcon={Save}
                            >
                                Deploy Política
                            </Button>
                        </div>
                    </Card>

                    <div className="bg-slate-900 border border-white/5 p-8 rounded-[40px] space-y-4">
                        <div className="flex items-center gap-2 text-sky-400">
                            <TrendingUp size={20} />
                            <h4 className="text-xs font-black uppercase tracking-widest">Saúde da Moeda</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                                <span>Volume Circulante</span>
                                <span className="text-white">142.8k OC</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                                <span>Liquidez Semanal</span>
                                <span className="text-emerald-400">+12%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
