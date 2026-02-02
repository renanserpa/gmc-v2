
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { KPICard } from '../../components/dashboard/KPICard.tsx';
import { 
    DollarSign, TrendingUp, AlertTriangle, 
    ArrowUpRight, ShoppingBag, Download, Calendar,
    CreditCard, BadgeAlert
} from 'lucide-react';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { cn } from '../../lib/utils.ts';

export default function FinanceManager() {
    const { data: schools, loading: loadingSchools } = useRealtimeSync<any>('schools');
    const { data: students, loading: loadingStudents } = useRealtimeSync<any>('students');

    const financeReport = useMemo(() => {
        if (!schools || !students) return { totalRevenue: 0, units: [] };
        
        const units = schools.map((school: any) => {
            const studentCount = students.filter((s: any) => s.school_id === school.id).length;
            const fixedFee = Number(school.monthly_fee) || 0;
            const perStudentFee = (Number(school.fee_per_student) || 0) * studentCount;
            const total = fixedFee + perStudentFee;

            return {
                ...school,
                studentCount,
                totalRevenue: total,
                isLate: school.contract_status !== 'active'
            };
        });

        const totalRevenue = units.reduce((acc: number, curr: any) => acc + curr.totalRevenue, 0);

        return {
            totalRevenue,
            units,
            lateCount: units.filter((u: any) => u.isLate).length
        };
    }, [schools, students]);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Gestão <span className="text-sky-500">Financeira</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Consolidado de Contratos SaaS</p>
                </div>
                <button className="bg-slate-900 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black text-slate-400 hover:text-white transition-all flex items-center gap-3">
                    <Download size={14} /> Baixar Relatório
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <KPICard title="Receita Projetada (Mensal)" value={financeReport.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={TrendingUp} color="text-emerald-400" border="border-emerald-500" />
                <KPICard title="Unidades Pendentes" value={financeReport.lateCount} icon={AlertTriangle} color="text-red-400" border="border-red-500" />
                <KPICard title="Ticket Médio por Escola" value={(financeReport.totalRevenue / (schools?.length || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={CreditCard} color="text-sky-400" border="border-sky-500" />
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                    <CardHeader className="bg-slate-950/50 p-8 border-b border-white/5 flex justify-between items-center">
                        <CardTitle className="text-xs uppercase tracking-widest text-slate-500 flex items-center gap-3">
                            <ShoppingBag size={18} /> Performance por Unidade
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/20 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-8 py-6">Unidade</th>
                                    <th className="px-8 py-6">Alunos</th>
                                    <th className="px-8 py-6">Fee Fixo</th>
                                    <th className="px-8 py-6">Variavel Alunos</th>
                                    <th className="px-8 py-6">Total Mês</th>
                                    <th className="px-8 py-6">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {financeReport.units.map((unit: any) => (
                                    <tr key={unit.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-8 py-6 font-black text-white uppercase text-xs">{unit.name}</td>
                                        <td className="px-8 py-6 text-xs text-slate-400 font-mono">{unit.studentCount}</td>
                                        <td className="px-8 py-6 text-xs text-slate-400">R$ {unit.monthly_fee}</td>
                                        <td className="px-8 py-6 text-xs text-slate-400">R$ {(unit.fee_per_student * unit.studentCount).toFixed(2)}</td>
                                        <td className="px-8 py-6 font-black text-emerald-400">R$ {unit.totalRevenue.toFixed(2)}</td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[8px] font-black uppercase border",
                                                unit.isLate ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            )}>
                                                {unit.contract_status}
                                            </span>
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
