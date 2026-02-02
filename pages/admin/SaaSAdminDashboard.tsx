

import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { KPICard } from '../../components/dashboard/KPICard.tsx';
import { 
    Building2, DollarSign, Users, ShieldCheck, Activity, 
    BarChart3, CheckCircle2, TrendingUp, UserPlus, 
    ShoppingBag, BadgeAlert, Wallet, Zap
} from 'lucide-react';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { cn } from '../../lib/utils.ts';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button.tsx';
import { ProvisioningWizard } from '../../components/admin/ProvisioningWizard.tsx';

const M = motion as any;

export default function SaaSAdminDashboard() {
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    
    const { data: schools, refresh: refreshSchools } = useRealtimeSync<any>('schools');
    const { data: students } = useRealtimeSync<any>('students');
    const { data: profiles } = useRealtimeSync<any>('profiles');

    const stats = useMemo(() => {
        if (!schools || !students || !profiles) return { mrr: 0, units: 0, teachers: 0, pupils: 0, lateUnits: 0 };
        
        const activeSchools = schools.filter((s: any) => s.is_active);
        
        // MRR Real: Fixo + Royalties (Fee per Student * Students in that school)
        const revenue = activeSchools.reduce((acc: number, s: any) => {
            const schoolStudents = students.filter((st: any) => st.school_id === s.id).length;
            const fixed = Number(s.monthly_fee || 0);
            const variable = (Number(s.fee_per_student || 0)) * schoolStudents;
            return acc + fixed + variable;
        }, 0);

        return {
            mrr: revenue,
            units: schools.length,
            teachers: profiles.filter((p: any) => p.role === 'teacher_owner' || p.role === 'professor').length,
            pupils: students.length,
            lateUnits: schools.filter((s: any) => s.contract_status === 'suspended').length
        };
    }, [schools, students, profiles]);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Operações <span className="text-sky-500">BI</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">SaaS Governance & Financial Telemetry</p>
                </div>
                <Button 
                    onClick={() => setIsWizardOpen(true)}
                    className="rounded-[32px] h-16 px-10 bg-sky-600 hover:bg-sky-500 font-black uppercase text-xs shadow-[0_20px_50px_rgba(14,165,233,0.3)] border-none"
                    leftIcon={UserPlus}
                >
                    Novo Contrato
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard 
                    title="Faturamento Projetado" 
                    value={stats.mrr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                    icon={Wallet} 
                    color="text-emerald-400" 
                    border="border-emerald-500" 
                />
                <KPICard title="Unidades Ativas" value={stats.units} icon={Building2} color="text-sky-400" border="border-sky-500" />
                <KPICard title="Total de Alunos" value={stats.pupils} icon={Users} color="text-purple-400" border="border-purple-500" />
                <KPICard 
                    title="Unidades Inadimplentes" 
                    value={stats.lateUnits} 
                    icon={BadgeAlert} 
                    color={stats.lateUnits > 0 ? "text-red-500" : "text-slate-500"} 
                    border={stats.lateUnits > 0 ? "border-red-500" : "border-white/5"} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-8 bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl p-12">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                             <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2">Market Share por Unidade</h3>
                             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Distribuição de alunos e penetração de rede</p>
                        </div>
                        <TrendingUp className="text-sky-500" size={32} />
                    </div>
                    <div className="h-64 flex items-end gap-6 pt-10">
                        {schools?.slice(0, 12).map((s: any) => {
                            const count = students?.filter((st: any) => st.school_id === s.id).length || 0;
                            const h = Math.min(100, (count / 20) * 100);
                            return (
                                <div key={s.id} className="flex-1 flex flex-col items-center gap-4 group">
                                    <M.div initial={{ height: 0 }} animate={{ height: `${h}%` }} className={cn("w-full rounded-2xl transition-all border shadow-lg group-hover:scale-110", s.is_active ? "bg-sky-500/20 border-sky-500/40" : "bg-red-950/20 border-red-500/20")} />
                                    <span className="text-[8px] font-black text-slate-700 uppercase vertical-text group-hover:text-white transition-colors">{s.name.split(' ')[0]}</span>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-900 border-white/5 rounded-[40px] p-8 shadow-xl">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Activity size={14} className="text-emerald-500" /> Logs de Provisionamento
                        </h4>
                        <div className="space-y-4">
                            {schools?.slice(0, 4).map((s: any) => (
                                <div key={s.id} className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-white uppercase truncate max-w-[120px]">{s.name}</span>
                                        <span className="text-[7px] text-slate-600 font-bold uppercase">{s.contract_status}</span>
                                    </div>
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                </div>
                            ))}
                        </div>
                    </Card>
                    <div className="p-8 bg-sky-500/5 border border-sky-500/10 rounded-[40px] flex items-start gap-4">
                         <Zap className="text-sky-500 shrink-0" size={20} />
                         <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                            O provisionamento automático garante que o Professor já encontre sua escola configurada no primeiro login.
                         </p>
                    </div>
                </div>
            </div>

            <ProvisioningWizard 
                isOpen={isWizardOpen} 
                onClose={() => setIsWizardOpen(false)}
                onSuccess={refreshSchools}
            />
        </div>
    );
}
