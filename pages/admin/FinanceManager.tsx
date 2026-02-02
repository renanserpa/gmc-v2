
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { KPICard } from '../../components/dashboard/KPICard.tsx';
import { 
    DollarSign, TrendingUp, AlertTriangle, 
    ArrowUpRight, ShoppingBag, Download, Calendar,
    CreditCard
} from 'lucide-react';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { cn } from '../../lib/utils.ts';

export default function FinanceManager() {
    const { data: schools, loading: loadingSchools } = useRealtimeSync<any>('schools');
    const { data: students, loading: loadingStudents } = useRealtimeSync<any>('students');

    const stats = useMemo(() => {
        if (!schools || !students) return { totalRevenue: 0, lateSchools: [] };
        
        const late = schools.filter((s: any) => s.contract_status !== 'active');
        
        const total = schools.reduce((acc: number, school: any) => {
            const schoolStudents = students.filter((st: any) => st.school_id === school.id).length;
            const fixedFee = Number(school.monthly_fee) || 0;
            const variableFee = (Number(school.fee_per_student) || 0) * schoolStudents;
            return acc + fixedFee + variableFee;
        }, 0);

        return {
            totalRevenue: total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            lateCount: late.length,
            lateSchools: late
        };
    }, [schools, students]);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Financeiro <span className="text-sky-500">Global</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">SaaS Billing & Subscriptions</p>
                </div>
                <button className="bg-slate-900 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black text-slate-400 hover:text-white transition-all flex items-center gap-3">
                    <Download size={14} /> Exportar CSV
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <KPICard title="Faturamento Projetado" value={stats.totalRevenue} icon={TrendingUp} color="text-emerald-400" border="border-emerald-500" />
                <KPICard title="Inadimplência (Escolas)" value={stats.lateCount} icon={AlertTriangle} color="text-red-400" border="border-red-500" />
                <KPICard title="Média por Unidade" value="R$ 1.450,00" icon={CreditCard} color="text-sky-400" border="border-sky-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                    <CardHeader className="bg-slate-950/50 p-8 border-b border-white/5">
                        <CardTitle className="text-xs uppercase tracking-widest text-slate-500 flex items-center gap-3">
                            <ShoppingBag size={18} /> Detalhamento por Escola
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {schools.map((school: any) => {
                                const count = students.filter((st: any) => st.school_id === school.id).length;
                                return (
                                    <div key={school.id} className="p-6 flex items-center justify-between hover:bg-white/[0.01]">
                                        <div>
                                            <p className="text-sm font-black text-white uppercase">{school.name}</p>
                                            <p className="text-[10px] text-slate-600 font-bold uppercase">{count} Alunos ativos</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-emerald-400">R$ {school.monthly_fee || '0,00'}</p>
                                            <p className="text-[9px] text-slate-600 font-bold uppercase">Fee fixo</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-red-950/10 border-red-500/20 rounded-[48px] overflow-hidden shadow-2xl">
                    <CardHeader className="bg-red-950/20 p-8 border-b border-red-500/10">
                        <CardTitle className="text-xs uppercase tracking-widest text-red-400 flex items-center gap-3">
                            <AlertTriangle size={18} /> Escolas em Atraso / Trial
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        {stats.lateSchools.length === 0 ? (
                            <p className="text-center py-10 text-slate-600 text-xs font-black uppercase">Nenhuma inadimplência detectada.</p>
                        ) : stats.lateSchools.map((s: any) => (
                            <div key={s.id} className="bg-black/40 p-4 rounded-2xl border border-red-500/20 flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-black text-white uppercase">{s.name}</p>
                                    <p className="text-[9px] text-red-500 font-bold uppercase">Status: {s.contract_status}</p>
                                </div>
                                <button className="text-[9px] font-black text-sky-400 uppercase hover:underline">Cobrar Agora</button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
