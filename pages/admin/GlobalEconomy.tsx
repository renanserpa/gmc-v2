import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { 
    Coins, Zap, History, Search, RefreshCw, Sparkles, 
    AlertCircle, Activity, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { haptics } from '../../lib/haptics.ts';
import { notify } from '../../lib/notification.ts';
import { cn } from '../../lib/utils.ts';
import { motion } from 'framer-motion';
import { formatDate } from '../../lib/date.ts';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { updateSystemConfig, logSecurityAudit } from '../../services/dataService.ts';

const M = motion as any;

export default function GlobalEconomy() {
    const [search, setSearch] = useState('');
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    // ENGINE REALTIME: Fonte da Verdade Reativa
    const { data: configs } = useRealtimeSync<any>('system_configs');
    const { data: transactions, loading: loadingLedger } = useRealtimeSync<any>('xp_events');

    // Estados Locais (Optimistic UI)
    const [xpVal, setXpVal] = useState(1.0);
    const [dropVal, setDropVal] = useState(0.1);

    // Sincroniza estado local quando houver mudança externa (Outro Admin)
    useEffect(() => {
        const xp = configs?.find(f => f.key === 'global_xp_multiplier');
        const drop = configs?.find(f => f.key === 'global_coin_drop_rate');
        if (xp) setXpVal(parseFloat(xp.value));
        if (drop) setDropVal(parseFloat(drop.value));
    }, [configs]);

    // Função de persistência debounced
    const persistChange = useCallback(async (key: string, value: string) => {
        setIsUpdating(key);
        try {
            await updateSystemConfig(key, value);
            await logSecurityAudit('ECONOMY_POLICY_CHANGE', { key, value });
            haptics.heavy();
        } catch (e) {
            notify.error("Falha ao propagar política econômica.");
        } finally {
            setIsUpdating(null);
        }
    }, []);

    // Debounce manual para evitar dependências externas pesadas (lodash) neste contexto
    useEffect(() => {
        const timer = setTimeout(() => {
            const current = configs?.find(f => f.key === 'global_xp_multiplier')?.value;
            if (current && parseFloat(current) !== xpVal) persistChange('global_xp_multiplier', xpVal.toString());
        }, 500);
        return () => clearTimeout(timer);
    }, [xpVal, configs, persistChange]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const current = configs?.find(f => f.key === 'global_coin_drop_rate')?.value;
            if (current && parseFloat(current) !== dropVal) persistChange('global_coin_drop_rate', dropVal.toString());
        }, 500);
        return () => clearTimeout(timer);
    }, [dropVal, configs, persistChange]);

    const filteredTransactions = (transactions || []).filter(t => 
        t.player_id?.toLowerCase().includes(search.toLowerCase()) ||
        t.event_type?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-amber-500/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3 leading-none">
                        Economy <span className="text-amber-500">Monitor</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
                        <Sparkles size={12} className="text-amber-500" /> Sincronia Financeira via CDC Maestro
                    </p>
                </div>
                {isUpdating && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full animate-pulse">
                    <RefreshCw size={14} className="animate-spin text-amber-500" />
                    <span className="text-[10px] font-black text-amber-500 uppercase">Updating Core...</span>
                  </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-gradient-to-br from-amber-600/10 to-transparent border-amber-600/20 p-8 rounded-[40px] shadow-2xl group">
                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">XP Event Multiplier</h4>
                                <span className="text-4xl font-black text-amber-500 font-mono italic">x{xpVal.toFixed(1)}</span>
                            </div>
                            <input 
                                type="range" min="1.0" max="5.0" step="0.5" value={xpVal}
                                onChange={(e) => { setXpVal(parseFloat(e.target.value)); haptics.light(); }}
                                className="w-full h-3 bg-slate-950 rounded-full appearance-none accent-amber-500 cursor-pointer"
                            />
                            <div className="flex justify-between text-[8px] font-black text-slate-700 uppercase">
                                <span>Padrão 1x</span>
                                <span>Frenzy 5x</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-sky-600/10 to-transparent border-sky-600/20 p-8 rounded-[40px] shadow-2xl group">
                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Coin Drop Rate</h4>
                                <span className="text-4xl font-black text-sky-400 font-mono italic">{(dropVal * 100).toFixed(0)}%</span>
                            </div>
                            <input 
                                type="range" min="0.05" max="0.5" step="0.05" value={dropVal}
                                onChange={(e) => { setDropVal(parseFloat(e.target.value)); haptics.light(); }}
                                className="w-full h-3 bg-slate-950 rounded-full appearance-none accent-sky-500 cursor-pointer"
                            />
                            <div className="flex justify-between text-[8px] font-black text-slate-700 uppercase">
                                <span>Econômico 5%</span>
                                <span>Generoso 50%</span>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-slate-900/60 border border-white/5 p-6 rounded-3xl flex items-start gap-4">
                        <AlertCircle className="text-amber-500 shrink-0" size={20} />
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                            Mudanças globais afetam instantaneamente o cálculo de XP de todos os alunos conectados.
                        </p>
                    </div>
                </div>

                <Card className="lg:col-span-8 bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl flex flex-col h-[700px]">
                    <CardHeader className="bg-slate-950/50 p-8 border-b border-white/5 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs uppercase tracking-[0.4em] flex items-center gap-3 text-amber-500">
                            <History size={18} /> OlieCoin Live Ledger
                        </CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                            <input 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Filtrar ledger..."
                                className="w-full bg-slate-950 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                        <table className="w-full text-left font-mono">
                            <thead className="bg-slate-950 text-[9px] font-black text-slate-600 uppercase tracking-widest sticky top-0 z-10 border-b border-white/5">
                                <tr>
                                    <th className="px-10 py-6">Timestamp</th>
                                    <th className="px-10 py-6">Entidade</th>
                                    <th className="px-10 py-6">Evento</th>
                                    <th className="px-10 py-6 text-right">Crédito</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loadingLedger ? (
                                    [...Array(6)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={4} className="px-10 py-8 bg-white/[0.01]" /></tr>)
                                ) : filteredTransactions.map(t => (
                                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-10 py-6 text-[10px] text-slate-500">{formatDate(t.created_at, 'HH:mm:ss')}</td>
                                        <td className="px-10 py-6">
                                            <span className="text-xs font-black text-white uppercase truncate block max-w-[150px]">{t.player_id}</span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="px-2 py-0.5 bg-slate-950 border border-white/5 text-[9px] font-black uppercase text-slate-400 rounded">
                                                {t.event_type}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 text-amber-500 font-black">
                                                +{t.coins_amount} <Coins size={12} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
