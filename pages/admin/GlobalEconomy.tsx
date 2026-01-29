import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Coins, Zap, ShoppingBag, TrendingUp, Sliders, Edit3, Trash2, Plus, BarChart3, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.ts';
import { haptics } from '../../lib/haptics.ts';
import { notify } from '../../lib/notification.ts';
import { getSystemConfig, updateSystemConfig } from '../../services/dataService.ts';

export default function GlobalEconomy() {
    const [multiplier, setMultiplier] = useState(1.0);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingMultiplier, setSavingMultiplier] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [mValue, storeData] = await Promise.all([
                getSystemConfig('global_xp_multiplier'),
                supabase.from('store_items').select('*').order('price_coins')
            ]);
            
            if (mValue) setMultiplier(parseFloat(mValue));
            setItems(storeData.data || []);
        } catch (e) {
            notify.error("Erro na sincronia econômica.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMultiplier = async () => {
        setSavingMultiplier(true);
        haptics.heavy();
        try {
            await updateSystemConfig('global_xp_multiplier', multiplier.toString());
            notify.success(`Economia Estabilizada em x${multiplier}`);
        } catch (e) {
            notify.error("Falha ao gravar política econômica.");
        } finally {
            setSavingMultiplier(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Market <span className="text-amber-500">Analytics</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Soberania Econômica e Gestão de OlieCoins</p>
                </div>
                <Button leftIcon={Plus} className="bg-amber-600 hover:bg-amber-500 px-8 py-6 rounded-2xl shadow-xl shadow-amber-900/20 text-xs font-black uppercase tracking-widest">
                    Novo Item Global
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-2 bg-slate-900 border-l-8 border-l-sky-500 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-16 bg-sky-500/5 blur-3xl rounded-full" />
                    <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Multiplicador Global de XP</p>
                            <span className="text-3xl font-black text-sky-400">x{multiplier.toFixed(1)}</span>
                        </div>
                        <input 
                            type="range" min="0.5" max="3.0" step="0.1" value={multiplier}
                            onChange={(e) => { setMultiplier(parseFloat(e.target.value)); haptics.light(); }}
                            className="w-full accent-sky-500 bg-slate-950 h-2 rounded-full appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between items-center">
                            <p className="text-[9px] text-slate-600 font-bold uppercase">Afeta todos os eventos de XP em tempo real</p>
                            <Button 
                                size="sm" 
                                isLoading={savingMultiplier}
                                onClick={handleSaveMultiplier}
                                className="rounded-xl px-6 bg-sky-600 text-[10px] font-black uppercase"
                                leftIcon={Save}
                            >
                                Persistir Config
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card className="bg-slate-900 border-l-8 border-l-amber-500 p-8 rounded-[40px] shadow-2xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Câmbio OC/XP</p>
                    <h3 className="text-3xl font-black text-white mt-2">10 XP <span className="text-slate-700 text-sm">/ 1 OC</span></h3>
                    <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase mt-4">
                        <TrendingUp size={12} /> Mercado Estável
                    </div>
                </Card>

                <Card className="bg-slate-900 border-l-8 border-l-purple-500 p-8 rounded-[40px] shadow-2xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Volume Circulante</p>
                    <h3 className="text-3xl font-black text-white mt-2">12.4k <span className="text-slate-700 text-sm">OC</span></h3>
                    <div className="flex items-center gap-2 text-purple-500 text-[10px] font-black uppercase mt-4">
                        <BarChart3 size={12} /> Alta Liquidez
                    </div>
                </Card>
            </div>

            <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                <CardHeader className="bg-slate-900/80 p-8 border-b border-white/5 flex flex-row items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-3 uppercase italic text-white">
                        <ShoppingBag size={24} className="text-amber-500" /> Inventário Maestro Global
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-amber-500" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-950 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5">
                                    <tr>
                                        <th className="px-10 py-6">Item</th>
                                        <th className="px-10 py-6">Tipo</th>
                                        <th className="px-10 py-6">Preço</th>
                                        <th className="px-10 py-6 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {items.map(item => (
                                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-10 py-8">
                                                <p className="font-black text-white uppercase tracking-tight">{item.name}</p>
                                                <p className="text-[10px] text-slate-500 italic mt-1">{item.description}</p>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className="bg-slate-900 border border-white/5 px-3 py-1 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    {item.metadata?.type || 'Cosmético'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-2 text-amber-500 font-black text-lg">
                                                    <Coins size={18} /> {item.price_coins}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-3 bg-slate-900 rounded-2xl text-slate-500 hover:text-sky-400 transition-all shadow-sm"><Edit3 size={18}/></button>
                                                    <button className="p-3 bg-slate-900 rounded-2xl text-slate-500 hover:text-red-500 transition-all shadow-sm"><Trash2 size={18}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}