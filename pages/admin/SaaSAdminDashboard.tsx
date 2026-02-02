
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { KPICard } from '../../components/dashboard/KPICard.tsx';
import { 
    Building2, TrendingUp, DollarSign, 
    ArrowUpRight, Users, AlertCircle, ShoppingCart, 
    ShieldCheck, Calendar, Activity
} from 'lucide-react';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { cn } from '../../lib/utils.ts';

export default function SaaSAdminDashboard() {
    const { data: schools, loading } = useRealtimeSync<any>('schools');

    const stats = useMemo(() => {
        if (!schools) return { totalMRR: 0, activeCount: 0, pendingCount: 0 };
        
        const active = schools.filter((s: any) => s.contract_status === 'active');
        const totalMRR = schools.reduce((acc: number, s: any) => acc + (Number(s.monthly_fee) || 0), 0);
        
        return {
            totalMRR: totalMRR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            activeCount: active.length,
            pendingCount: schools.length - active.length
        };
    }, [schools]);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Business <span className="text-sky-500">Analytics</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">SaaS Governance Core</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4">
                        <Calendar size={18} className="text-slate-600" />
                        <div>
                            <p className="text-[8px] font-black text-slate-500 uppercase">Ciclo Atual</p>
                            <p className="text-sm font-black text-white">FEVEREIRO 2026</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <KPICard title="MRR (Receita Mensal)" value={stats.totalMRR} icon={DollarSign} color="text-emerald-400" border="border-emerald-500" />
                <KPICard title="Unidades Ativas" value={stats.activeCount} icon={Building2} color="text-sky-400" border="border-sky-500" />
                <KPICard title="Conversão / Churn" value="+12.4%" icon={TrendingUp} color="text-purple-400" border="border-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LISTA DE CONTRATOS (TABELA SCHOOLS) */}
                <Card className="lg:col-span-8 bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl flex flex-col h-[600px]">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/40">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                            <ShoppingCart size={18} /> Performance de Unidades
                        </h4>
                    </div>
                    <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                        <div className="divide-y divide-white/5">
                            {loading ? (
                                <div className="p-20 text-center animate-pulse text-slate-600 uppercase font-black tracking-widest text-xs">Acessando registro de contratos...</div>
                            ) : schools.map((school: any) => (
                                <div key={school.id} className="p-6 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                                            <Building2 size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white uppercase">{school.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">CNPJ: {school.cnpj || 'PESSOA FÍSICA'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden md:block">
                                            <p className="text-[9px] font-black text-slate-600 uppercase">Faturamento</p>
                                            <p className="text-sm font-black text-emerald-400">R$ {school.monthly_fee || '0,00'}</p>
                                        </div>
                                        <div className={cn(
                                            "px-4 py-1.5 rounded-full text-[8px] font-black uppercase border",
                                            school.contract_status === 'active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                                            school.contract_status === 'trial' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                            "bg-red-500/10 text-red-400 border-red-500/20"
                                        )}>
                                            {school.contract_status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* INSIGHTS DE NEGÓCIOS */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-900/60 border-white/5 p-8 rounded-[40px] shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity size={18} className="text-sky-400" />
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SaaS Alerts</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10 flex items-start gap-3">
                                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    <strong className="text-red-400">Churn Risk:</strong> 3 unidades em São Paulo não realizaram logs de aula nas últimas 48h.
                                </p>
                            </div>
                            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-start gap-3">
                                <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    <strong className="text-emerald-400">Expansion:</strong> Cuiabá apresenta o maior crescimento de matrículas do trimestre.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-sky-500/5 border border-sky-500/20 p-8 rounded-[40px] shadow-xl text-center space-y-4">
                        <h5 className="text-[10px] font-black text-sky-400 uppercase tracking-[0.4em]">Próximo Payout</h5>
                        <p className="text-3xl font-black text-white tracking-tighter">05 MAR</p>
                        <button className="w-full py-4 bg-sky-600 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest shadow-xl">Abrir Relatório Detalhado</button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
