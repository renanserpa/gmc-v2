
import React from 'react';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;
import { KPICard } from '../components/dashboard/KPICard.tsx';
import { 
    Users, ShieldAlert, Loader2, 
    Activity, Cpu, RefreshCw, 
    Coins, Construction, CheckCircle2, Clock, 
    Globe, ChevronRight, AlertCircle, Gavel,
    Building2, ArrowLeftCircle, LayoutGrid, CalendarDays
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils.ts';
import { Button } from '../components/ui/Button.tsx';
import { haptics } from '../lib/haptics.ts';
import { useRealtimeSync } from '../hooks/useRealtimeSync.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

const M = motion as any;

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { schoolId, setSchoolOverride } = useAuth();
    
    // ENGINE REALTIME: Monitorando a infraestrutura global
    const { data: allTenants, loading: loadingSchools, refresh: refreshSchools } = useRealtimeSync<any>('schools', undefined, { column: 'name', ascending: true });
    const { data: allStudents, loading: loadingStudents, refresh: refreshStudents } = useRealtimeSync<any>('students', undefined, { column: 'created_at', ascending: false });
    const { data: allClasses } = useRealtimeSync<any>('music_classes');

    // CÁLCULOS DINÂMICOS BASEADOS NO CONTEXTO
    const stats = React.useMemo(() => {
        const filteredSchools = schoolId ? allTenants.filter(t => t.id === schoolId) : allTenants;
        const filteredStudents = schoolId ? allStudents.filter(s => s.school_id === schoolId) : allStudents;
        const filteredClasses = schoolId ? allClasses.filter(c => c.school_id === schoolId) : allClasses;
        
        const totalSchools = allTenants.length;
        const activeSchools = allTenants.filter(t => t.contract_status === 'active').length;
        
        const monthlyRevenue = filteredSchools.reduce((acc, t) => acc + Number(t.fee_per_student || 0), 0);
        const weeklyHours = filteredClasses.length; // Assumindo 1h por slot de turma
        const selectedSchool = schoolId ? allTenants.find(t => t.id === schoolId) : null;

        return { 
            totalSchools, 
            activeSchools, 
            studentsCount: filteredStudents.length,
            revenue: monthlyRevenue,
            weeklyHours,
            selectedSchool,
            trialsList: allTenants.filter(t => t.contract_status === 'trial').slice(0, 3)
        };
    }, [allTenants, allStudents, allClasses, schoolId]);

    const handleResetContext = () => {
        haptics.medium();
        setSchoolOverride(null);
    };

    const isLoading = loadingSchools || loadingStudents;
    const primaryColor = stats.selectedSchool?.branding?.primaryColor || '#38bdf8';

    return (
        <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-32 blur-[120px] pointer-events-none opacity-20" style={{ backgroundColor: primaryColor }} />
                
                <div className="relative z-10 flex items-center gap-8">
                    <AnimatePresence mode="wait">
                        <M.div key={stats.selectedSchool?.id || 'global'} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 bg-slate-950 rounded-[32px] border border-white/10 flex items-center justify-center p-4 shadow-inner overflow-hidden">
                            {stats.selectedSchool?.branding?.logoUrl ? <img src={stats.selectedSchool.branding.logoUrl} className="w-full h-full object-contain" alt="Logo" /> : <Cpu size={40} className="text-sky-500" />}
                        </M.div>
                    </AnimatePresence>
                    <div>
                        <h1 className="text-4xl font-black text-white flex items-center gap-4 italic uppercase tracking-tighter">
                            {schoolId ? stats.selectedSchool?.name : <>God <span className="text-sky-500">Mode</span></>}
                        </h1>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
                            <Activity size={12} style={{ color: primaryColor }} /> 
                            {schoolId ? 'Métricas desta Unidade' : 'Monitoramento Global Maestro v7.0'}
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-4 relative z-10">
                    {schoolId && <Button variant="ghost" onClick={handleResetContext} leftIcon={ArrowLeftCircle} className="rounded-2xl text-[10px] uppercase font-black px-6 h-14 text-slate-500 hover:text-white">Visão Global</Button>}
                    <Button onClick={() => { refreshSchools(); refreshStudents(); }} isLoading={isLoading} variant="primary" className="rounded-2xl px-6 text-[10px] uppercase font-black h-14" leftIcon={RefreshCw}>Sync Core</Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard title={schoolId ? "Horas na Semana" : "Total Unidades"} value={isLoading ? undefined : (schoolId ? `${stats.weeklyHours}h / Sem` : stats.totalSchools)} icon={CalendarDays} color="text-sky-400" border="border-sky-500" />
                <KPICard title="Alunos Ativos" value={isLoading ? undefined : stats.studentsCount} icon={Users} color="text-purple-400" border="border-purple-500" />
                <KPICard title={schoolId ? "Royalty / Mês" : "Receita Prevista"} value={isLoading ? undefined : `R$ ${stats.revenue.toLocaleString('pt-BR')}`} icon={Coins} color="text-amber-400" border="border-amber-500" />
                <KPICard title="Saúde da Rede" value={isLoading ? undefined : `${Math.round((stats.activeSchools / (stats.totalSchools || 1)) * 100)}%`} icon={CheckCircle2} color="text-emerald-400" border="border-emerald-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    {!schoolId && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { id: 'tenants', label: 'Unidades', icon: Globe, color: 'text-sky-400', path: '/admin/tenants', desc: 'Provisionar Escolas' },
                                { id: 'users', label: 'Identity', icon: Users, color: 'text-purple-400', path: '/admin/users', desc: 'Gerenciar Mestres' },
                                { id: 'economy', label: 'Revenue', icon: Coins, color: 'text-amber-400', path: '/admin/economy', desc: 'Regras Financeiras' },
                            ].map(tool => (
                                <Card key={tool.id} className="bg-[#0a0f1d] border-white/5 rounded-[40px] p-8 hover:border-sky-500/30 transition-all cursor-pointer group" onClick={() => { haptics.medium(); navigate(tool.path); }}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn("p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform", tool.color)}>
                                            <tool.icon size={24} />
                                        </div>
                                        <ChevronRight size={20} className="text-slate-700" />
                                    </div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-tight">{tool.label}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{tool.desc}</p>
                                </Card>
                            ))}
                        </div>
                    )}

                    <Card className="bg-slate-900 border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                        <CardHeader className="p-8 border-b border-white/5 bg-slate-950/20 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                                <Clock size={18} className="text-amber-500" /> 
                                {schoolId ? `Horários de ${stats.selectedSchool?.name}` : 'Alertas de Expiração (Trial)'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-white/5">
                                {stats.trialsList.length === 0 ? (
                                    <div className="p-10 text-center opacity-30">
                                        <p className="text-[10px] font-black uppercase">Nenhum alerta crítico no momento.</p>
                                    </div>
                                ) : stats.trialsList.map(item => (
                                    <div key={item.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-500"><AlertCircle size={20} /></div>
                                            <div>
                                                <p className="text-sm font-black text-white uppercase tracking-tight">{item.name}</p>
                                                <p className="text-[10px] text-slate-500 font-medium">Responsável: {item.contact_manager || 'Não definido'}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="text-[9px] uppercase font-black h-10 px-4" onClick={() => { setSchoolOverride(item.id); haptics.medium(); }}>Inspecionar</Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <aside className="lg:col-span-4 space-y-6">
                    <Card className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-16 blur-3xl rounded-full opacity-20" style={{ backgroundColor: primaryColor }} />
                        <div className="relative z-10">
                            <div className="p-3 bg-white/10 rounded-2xl w-fit mb-4"><Gavel size={24} style={{ color: primaryColor }} /></div>
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">{schoolId ? 'Controle de Unidade' : 'Controle Master'}</h4>
                            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed italic">
                                {schoolId ? `Você está visualizando o kernel isolado de ${stats.selectedSchool?.name}.` : 'Você está operando como Root Authority global.'}
                            </p>
                        </div>
                    </Card>
                </aside>
            </div>
        </div>
    );
}
