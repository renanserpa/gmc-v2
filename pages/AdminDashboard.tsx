
import React from 'react';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;
import { KPICard } from '../components/dashboard/KPICard.tsx';
import { Card } from '../components/ui/Card.tsx';
import { 
    Users, ShieldAlert, Cpu, RefreshCw, 
    Coins, CheckCircle2, Globe, Building2, CalendarDays, ArrowLeftCircle, Clock, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button.tsx';
import { haptics } from '../lib/haptics.ts';
import { useRealtimeSync } from '../hooks/useRealtimeSync.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

const M = motion as any;

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { schoolId, setSchoolOverride } = useAuth();
    
    // ENGINE REALTIME: Telemetria baseada no contexto
    const { data: allTenants, loading: loadingSchools } = useRealtimeSync<any>('schools', undefined, { column: 'name', ascending: true });
    const { data: allMembers } = useRealtimeSync<any>('profiles', schoolId ? `school_id=eq.${schoolId}` : undefined);
    const { data: allClasses } = useRealtimeSync<any>('music_classes', schoolId ? `school_id=eq.${schoolId}` : undefined);

    const stats = React.useMemo(() => {
        const selectedSchool = schoolId ? allTenants.find(t => t.id === schoolId) : null;
        
        // Cálculo de Horas Semanais: Soma de slots de turmas ativos
        const weeklyHours = schoolId ? allClasses.length : 0; 
        
        // Faturamento Previsto (Lógica simplificada para o sprint)
        const revenue = selectedSchool ? (weeklyHours * Number(selectedSchool.hourly_rate || 0) * 4) : 0;

        return {
            selectedSchool,
            membersCount: allMembers.length,
            classesCount: allClasses.length,
            weeklyHours,
            revenue
        };
    }, [allTenants, allMembers, allClasses, schoolId]);

    return (
        <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div 
                    className="absolute top-0 right-0 p-32 blur-[120px] pointer-events-none opacity-20" 
                    style={{ backgroundColor: stats.selectedSchool?.branding?.primaryColor || '#38bdf8' }}
                />
                
                <div className="relative z-10 flex items-center gap-8">
                    <div className="w-20 h-20 bg-slate-950 rounded-[28px] border border-white/10 flex items-center justify-center shadow-inner overflow-hidden p-3">
                        {stats.selectedSchool?.branding?.logoUrl ? (
                            <img src={stats.selectedSchool.branding.logoUrl} className="w-full h-full object-contain" alt="Logo" />
                        ) : (
                            <Cpu size={32} className="text-sky-500" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                            {schoolId ? stats.selectedSchool?.name : <>God <span className="text-sky-500">Mode</span></>}
                        </h1>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-3">
                            {schoolId ? `Gestão Comercial: ${stats.selectedSchool?.billing_model === 'hourly' ? 'Horista' : 'Mensalista'}` : 'Monitoramento Global Maestro v7.0'}
                        </p>
                    </div>
                </div>
                
                {schoolId && (
                    <Button variant="ghost" onClick={() => setSchoolOverride(null)} leftIcon={ArrowLeftCircle} className="rounded-2xl text-[10px] uppercase font-black px-6 h-14 text-slate-500 hover:text-white relative z-10">
                        Visão Global
                    </Button>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard title="Horas na Semana" value={loadingSchools ? undefined : `${stats.weeklyHours}h`} icon={CalendarDays} color="text-sky-400" border="border-sky-500" />
                <KPICard title="Membros Time" value={loadingSchools ? undefined : stats.membersCount} icon={Users} color="text-purple-400" border="border-purple-500" />
                <KPICard title="Receita Prevista" value={loadingSchools ? undefined : `R$ ${stats.revenue.toLocaleString('pt-BR')}`} icon={Coins} color="text-amber-400" border="border-amber-500" />
                <KPICard title="Status Unidade" value={loadingSchools ? undefined : (stats.selectedSchool?.contract_status || 'ROOT')} icon={ShieldAlert} color="text-emerald-400" border="border-emerald-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[40px] p-8 hover:border-sky-500/30 transition-all cursor-pointer group" onClick={() => navigate('/admin/users')}>
                        <div className="p-3 bg-slate-900 rounded-xl w-fit mb-6 text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
                             <Users size={24} />
                        </div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Time & RH</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Gestores e Professores</p>
                    </Card>
                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[40px] p-8 hover:border-purple-500/30 transition-all cursor-pointer group" onClick={() => navigate('/admin/classes')}>
                        <div className="p-3 bg-slate-900 rounded-xl w-fit mb-6 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                             <Clock size={24} />
                        </div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Grade de Horários</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Sincronizar Turmas Ativas</p>
                    </Card>
                </div>

                <aside className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-900/60 border-white/5 p-8 rounded-[40px] shadow-xl backdrop-blur-md">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 mb-6">
                            <TrendingUp size={14} /> Faturamento Unitário
                        </p>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Hora/Aula:</span>
                                <span className="text-sm font-black text-white">R$ {stats.selectedSchool?.hourly_rate || '0,00'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Mensalidade:</span>
                                <span className="text-sm font-black text-white">R$ {stats.selectedSchool?.monthly_fee || '0,00'}</span>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-[9px] text-slate-500 leading-relaxed italic">
                                    Cálculo baseado no modelo de cobrança configurado para este tenant.
                                </p>
                            </div>
                        </div>
                    </Card>
                </aside>
            </div>
        </div>
    );
}
