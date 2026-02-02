import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Package, Plus, Sparkles, Coins, 
    Zap, Gem, Palette, ShieldCheck,
    Trash2, Edit3, Search, Layers, Music // FIX: Added Music icon import from lucide-react
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

export default function AssetFactory() {
    const { data: assets, loading } = useRealtimeSync<any>('avatar_assets', undefined, { column: 'name', ascending: true });
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState({
        id: '',
        name: '',
        category: 'instrument',
        rarity: 'common',
        price_coins: 100
    });

    const handleCreate = async () => {
        if (!form.id || !form.name) return;
        setIsSaving(true);
        haptics.heavy();
        
        try {
            const { error } = await supabase.from('avatar_assets').insert([form]);
            if (error) throw error;
            notify.success(`Asset ${form.name} forjado no Kernel!`);
            setForm({ id: '', name: '', category: 'instrument', rarity: 'common', price_coins: 100 });
        } catch (e) {
            notify.error("Erro ao forjar ativo digital.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-amber-950/10 p-10 rounded-[56px] border border-amber-500/20 backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-amber-500 rounded-3xl text-slate-950 shadow-xl shadow-amber-900/40">
                        <Package size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Asset <span className="text-amber-500">Factory</span></h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase mt-3 tracking-[0.4em]">Economy & Cosmetics Provisioning</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-4 bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl p-10 h-fit">
                    <div className="space-y-6">
                        <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                             <Sparkles size={16} /> Forjar Novo Ativo
                        </h4>
                        
                        <div className="space-y-4">
                            <input value={form.id} onChange={e => setForm({...form, id: e.target.value})} placeholder="Asset ID (ex: golden_guitar)" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-mono text-sm" />
                            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nome de Exibição" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm" />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-xs">
                                    <option value="instrument">Instrumento</option>
                                    <option value="clothing">Vestuário</option>
                                    <option value="effect">Efeito Visual</option>
                                </select>
                                <select value={form.rarity} onChange={e => setForm({...form, rarity: e.target.value})} className="bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-xs">
                                    <option value="common">Comum</option>
                                    <option value="rare">Raro</option>
                                    <option value="epic">Épico</option>
                                    <option value="legendary">Lendário</option>
                                </select>
                            </div>

                            <div className="relative">
                                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                                <input type="number" value={form.price_coins} onChange={e => setForm({...form, price_coins: Number(e.target.value)})} className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-mono font-bold" />
                            </div>
                        </div>

                        <Button onClick={handleCreate} isLoading={isSaving} className="w-full py-8 rounded-[32px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-widest shadow-2xl" leftIcon={Zap}>
                            Forjar Ativo Digital
                        </Button>
                    </div>
                </Card>

                <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loading ? (
                            [...Array(4)].map((_, i) => <div key={i} className="h-40 bg-slate-900/40 rounded-[40px] animate-pulse" />)
                        ) : assets.map(asset => (
                            <Card key={asset.id} className="bg-slate-950 border-white/5 rounded-[40px] p-8 group hover:border-amber-500/30 transition-all overflow-hidden relative shadow-xl">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={cn(
                                        "p-4 rounded-2xl transition-all shadow-inner",
                                        asset.rarity === 'legendary' ? "bg-amber-500/20 text-amber-500" : "bg-slate-900 text-slate-500"
                                    )}>
                                        {/* FIX: Music icon is now correctly imported and used for instrument categories */}
                                        {asset.category === 'instrument' ? <Music size={24} /> : <Palette size={24} />}
                                    </div>
                                    <span className={cn(
                                        "px-2 py-1 rounded text-[7px] font-black uppercase border",
                                        asset.rarity === 'epic' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-slate-900 text-slate-500 border-white/5"
                                    )}>
                                        {asset.rarity}
                                    </span>
                                </div>
                                <h4 className="text-lg font-black text-white uppercase truncate tracking-tight leading-none">{asset.name}</h4>
                                <div className="flex items-center gap-2 text-amber-500 font-mono font-bold mt-2">
                                    <Coins size={14} fill="currentColor" /> {asset.price_coins}
                                </div>
                                
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}