import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { 
    Coins, Zap, ShoppingBag, TrendingUp, Edit3, 
    Trash2, Plus, BarChart3, Save, Loader2, 
    Sparkles, ArrowRight, ShieldCheck, History,
    Search, Filter, Gavel, UserCheck, AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.ts';
import { haptics } from '../../lib/haptics.ts';
import { notify } from '../../lib/notification.ts';
import { cn } from '../../lib/utils.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../../lib/date.ts';
import { useAdmin } from '../../contexts/AdminContext.tsx';

const M = motion as any;

export default function GlobalEconomy() {
    const { isVerifiablyAdmin } = useAdmin();
    const [multiplier, setMultiplier] = useState(1.0);
    const [items, setItems] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [mRes, iRes, tRes] = await Promise.all([
                supabase.from('system_configs').select('value').eq('key', 'global_xp_multiplier').maybeSingle(),
                supabase.from('store_items').select('*').order('price_coins'),
                supabase.from('xp_events').select('*, students(name, school_id)').order('created_at', { ascending: false }).limit(20)
            ]);
            
            if (mRes.data) setMultiplier(parseFloat(mRes.data.value));
            setItems(iRes.data || []);
            setTransactions(tRes.data || []);
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
            
            // Log de Auditoria Obrigatório
            await supabase.from('audit_logs').insert([{
                event_type: 'ECONOMY_MULTIPLIER_CHANGE',
                description: `Multiplicador global alterado para x${multiplier}`,
                created_at: new Date().toISOString()
            }]);

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
                <div className="flex gap-3">
                    <Button leftIcon={Plus} className="bg-amber-600 hover:bg-amber-500 px-8 py-6 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">
                        Forjar Novo Ativo
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Ledger de Transações */}
                <Card className="lg:col-span-8 bg-slate-900 border-white/5 rounded-[48px] overflow-hidden shadow-2xl flex flex-col h-[700px]">
                    <CardHeader className="bg-slate-950/50 p-8 border-b border-white/5 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm uppercase tracking-[0.4em] flex items-center gap-3 text-amber-500">
                                <History size={18} /> OlieCoin Ledger
                            </CardTitle>
                            <p className="text-[9px] font-black text-slate-600 uppercase mt-1">Livro razão de fluxo de riqueza gamificada</p>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                            <input 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Filtrar por aluno..."
                                className="w-full bg-slate-950 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-amber-500/50"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950 text-[9px] font-black text-slate-600 uppercase tracking-widest sticky top-0 z-10">
                                <tr>
                                    <th className="px-10 py-6">Timestamp</th>
                                    <th className="px-10 py-6">Aluno</th>
                                    <th className="px-10 py-6">Evento</th>
                                    <th className="px-10 py-6 text-right">Montante</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transactions.filter(t => t.students?.name.toLowerCase().includes(search.toLowerCase())).map(t => (
                                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-10 py-6 text-[10px] font-mono text-slate-500">{formatDate(t.created_at, 'HH:mm:ss')}</td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-white uppercase">{t.students?.name}</span>
                                                <span className="text-[8px] text-slate-600 font-mono">ID: {t.player_id.substring(0,8)}</span>
                                            </div>
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

                <div className="lg:col-span-4 space-y-6">
                    {/* Multiplicador Global */}
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
                                Aplicar Alteração
                            </Button>
                        </div>
                    </Card>

                    {/* Ajuste Manual Segurado */}
                    <Card className="bg-slate-900 border-white/5 p-8 rounded-[40px] space-y-6 shadow-2xl">
                        <div className="flex items-center gap-3 text-sky-400">
                            <Gavel size={20} />
                            <h4 className="text-xs font-black uppercase tracking-widest">Intervenção Manual</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                            Ajustes diretos de saldo geram riqueza sem prática e exigem justificativa pedagógica para auditoria.
                        </p>
                        <div className="space-y-4">
                            <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <UserCheck size={14} className="text-slate-600" />
                                    <input placeholder="UUID do Aluno" className="bg-transparent border-none outline-none text-[10px] text-white w-full uppercase font-mono" />
                                </div>
                                <div className="flex gap-2">
                                    <input type="number" placeholder="+ Moedas" className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white" />
                                    <input type="number" placeholder="+ XP" className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white" />
                                </div>
                                <textarea placeholder="Justificativa..." className="bg-slate-900 border border-white/5 rounded-xl p-3 text-[10px] text-white resize-none h-16" />
                                <Button size="sm" variant="outline" className="w-full text-[9px] font-black uppercase border-sky-500/20 text-sky-400">Processar Ajuste</Button>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-[32px] flex items-start gap-4">
                        <AlertCircle className="text-amber-500 shrink-0" size={20} />
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                            <strong className="text-amber-500 uppercase">Atenção:</strong> O isolamento de tenants impede que administradores de escola vejam o ledger global. Somente <span className="text-white">SuperAdmins</span> verificados via metadados possuem esta visão.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}