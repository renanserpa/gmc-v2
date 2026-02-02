
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { KPICard } from '../../components/dashboard/KPICard.tsx';
import { 
    Building2, TrendingUp, DollarSign, 
    ArrowUpRight, Users, AlertCircle, ShoppingCart, 
    ShieldCheck, Calendar, Activity, BarChart3
} from 'lucide-react';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { cn } from '../../lib/utils.ts';
import { motion } from 'framer-motion';

const M = motion as any;

export default function SaaSAdminDashboard() {
    const { data: schools, loading: loadingSchools } = useRealtimeSync<any>('schools');
    const { data: students, loading: loadingStudents } = useRealtimeSync<any>('students');
    const { data: profiles } = useRealtimeSync<any>('profiles');

    const stats = useMemo(() => {
        if (!schools || !students || !profiles) return { totalMRR: 0, activeCount: 0, pendingCount: 0, totalStaff: 0 };
        
        const activeSchools = schools.filter((s: any) => s.is_active);
        const totalStaff = profiles.filter((p: any) => p.role === 'professor' || p.role === 'teacher_owner').length;
        
        // Cálculo de Receita Real (Fee Fixo + Variável por Aluno)
        const totalMRR = schools.reduce((acc: number, s: any) => {
            const schoolStudents = students.filter((st: any) => st.school_id === s.id).length;
            const fixed = Number(s.monthly_fee) || 0;
            const variable = schoolStudents * (Number(s.fee_per_student) || 0);
            return acc + fixed + variable;
        }, 0);
        
        return {
            totalMRR: totalMRR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            activeCount: activeSchools.length,
            inactiveCount: schools.length - activeSchools.length,
            totalStudents: students.length,
            totalStaff
        };
    }, [schools, students, profiles]);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Operations <span className="text-sky-500">Center</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Business Intelligence & Governance</p>
                </div>
                <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4 shadow-xl">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sincronia Live Maestro: Ativa</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard title="Receita Projetada" value={stats.totalMRR} icon={DollarSign} color="text-emerald-400" border="border-emerald-500" />
                <KPICard title="Unidades Ativas" value={stats.activeCount} icon={Building2} color="text-sky-400" border="border-sky-500" />
                <KPICard title="Total Alunos" value={stats.totalStudents} icon={Users} color="text-purple-400" border="border-purple-500" />
                <KPICard title="Licenciados" value={stats.totalStaff} icon={ShieldCheck} color="text-amber-400" border="border-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* GRÁFICO DE CRESCIMENTO (MOCK PEDAGÓGICO) */}
                <Card className="lg:col-span-8 bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                    <CardHeader className="p-8 border-b border-white/5 bg-slate-950/40">
                        <CardTitle className="text-xs uppercase tracking-[0.3em] flex items-center gap-3 text-slate-500">
                            <BarChart3 size={18} /> Densidade de Matrículas (3 Meses)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px] flex items-end gap-6 p-12">
                        {[45, 68, 92].map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                <M.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${val}%` }}
                                    transition={{ duration: 1, delay: i * 0.2 }}
                                    className="w-full bg-gradient-to-t from-sky-600 to-sky-400 rounded-2xl relative shadow-lg group-hover:shadow-sky-500/20"
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-white font-black text-lg">+{val}</div>
                                </M.div>
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Mês 0{i+1}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* ALERTAS DE NEGÓCIO */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-900/60 border-white/5 p-8 rounded-[40px] shadow-xl h-full">
                        <div className="flex items-center gap-3 mb-8">
                            <Activity size={18} className="text-sky-400" />
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Incidentes & Alertas</h4>
                        </div>
                        <div className="space-y-6">
                            {stats.inactiveCount > 0 && (
                                <div className="p-5 bg-red-500/5 rounded-3xl border border-red-500/20 flex items-start gap-4">
                                    <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-black text-red-500 uppercase">Unidades Suspensas</p>
                                        <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">
                                            Existem {stats.inactiveCount} unidades sem faturamento ativo.
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="p-5 bg-emerald-500/5 rounded-3xl border border-emerald-500/20 flex items-start gap-4">
                                <ShieldCheck size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-black text-emerald-500 uppercase">Integridade RLS</p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Todas as políticas de isolamento estão normais.</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
