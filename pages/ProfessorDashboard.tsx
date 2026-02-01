import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, GraduationCap, Zap, TrendingUp, Sparkles, 
    Plus, Clock, AlertTriangle, ChevronRight,
    Brain, Play, Loader2, Fingerprint, Activity,
    History, Search
} from 'lucide-react';

// Kernels & Hooks
import { useProfessorData } from '../hooks/useProfessorData';
import { useGlobalSettings } from '../hooks/useGlobalSettings';
import { usePageTitle } from '../hooks/usePageTitle';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { UserAvatar } from '../components/ui/UserAvatar';
import { KPICard } from '../components/dashboard/KPICard';

// Utils
import { cn } from '../lib/utils';
import { formatDate } from '../lib/date';

const M = motion as any;

export default function ProfessorDashboard() {
    usePageTitle("Cockpit Mestre");
    
    const { data, isLoading, error } = useProfessorData();
    const { xpMultiplier, activeBroadcast } = useGlobalSettings();
    const [activeTab, setActiveTab] = useState<'sessions' | 'audit'>('sessions');

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center p-12 bg-red-500/5 border border-red-500/20 rounded-[48px] max-w-md shadow-2xl">
                    <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
                    <h2 className="text-xl font-black text-white uppercase italic">Erro de Sincronia</h2>
                    <p className="text-slate-400 mt-2 text-sm font-medium">O Kernel Maestro não conseguiu autenticar o fluxo de dados da sua unidade.</p>
                    <Button onClick={() => window.location.reload()} className="mt-6" variant="danger">Reiniciar Conexão</Button>
                </div>
            </div>
        );
    }

    if (!isLoading && data?.isNewTeacher) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-10 animate-in fade-in duration-1000">
                <div className="w-24 h-24 bg-sky-500/10 rounded-[32px] flex items-center justify-center text-sky-400 mb-8 border border-sky-500/20 animate-pulse">
                    < GraduationCap size={48} />
                </div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Cockpit <span className="text-sky-500">Mestre</span></h1>
                <p className="text-slate-500 max-w-md mt-4 text-lg font-medium">Sua frequência neural ainda não tem alunos vinculados. Vamos provisionar sua primeira turma?</p>
                <Button className="mt-10 px-12 py-8 rounded-[32px] text-lg font-black uppercase tracking-widest shadow-2xl shadow-sky-900/40" leftIcon={Plus}>
                    Configurar Turma
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-24 relative animate-in fade-in duration-700">
            <AnimatePresence>
                {activeBroadcast && (
                    <M.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-red-600 p-4 rounded-2xl flex items-center justify-between shadow-xl sticky top-4 z-50 border-b-4 border-red-800"
                    >
                        <div className="flex items-center gap-3 text-white">
                            <AlertTriangle size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">GLOBAL ALERT: {activeBroadcast}</span>
                        </div>
                    </M.div>
                )}
            </AnimatePresence>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Maestro <span className="text-sky-500">Center</span>
                    </h1>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">Sincronia Estável</span>
                        {xpMultiplier !== 1 && (
                            <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest italic">EVENT x{xpMultiplier}</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    {isLoading && <Loader2 className="animate-spin text-sky-500/40" size={24} />}
                    <Button leftIcon={Plus} className="rounded-2xl px-8 py-6 shadow-xl shadow-sky-900/20">Novo Aluno</Button>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <KPICard title="Alunos Ativos" value={isLoading ? undefined : data?.stats?.totalStudents} icon={Users} color="text-sky-400" border="border-sky-500" />
                <KPICard title="Média Técnica" value={isLoading ? undefined : `${data?.stats?.avgXp} XP`} icon={Activity} color="text-emerald-500" border="border-emerald-500" />
                <KPICard title="Logs Semana" value={isLoading ? undefined : data?.stats?.weeklyEvents} icon={Fingerprint} color="text-purple-400" border="border-purple-500" />
                <KPICard title="Sessões" value={isLoading ? undefined : data?.stats?.activeSessions} icon={Clock} color="text-amber-500" border="border-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <main className="lg:col-span-8 space-y-8">
                    <Card className="bg-slate-900 border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                        <CardHeader className="bg-slate-950/40 p-8 border-b border-white/5 flex flex-row items-center justify-between">
                            <div className="flex gap-6">
                                <button 
                                    onClick={() => setActiveTab('sessions')}
                                    className={cn(
                                        "text-xs font-black uppercase tracking-widest transition-all relative py-1",
                                        activeTab === 'sessions' ? "text-sky-400" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    Minhas Turmas
                                    {activeTab === 'sessions' && <M.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('audit')}
                                    className={cn(
                                        "text-xs font-black uppercase tracking-widest transition-all relative py-1",
                                        activeTab === 'audit' ? "text-purple-400" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    Log de Atividade
                                    {activeTab === 'audit' && <M.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
                                </button>
                            </div>
                            <Search size={16} className="text-slate-700" />
                        </CardHeader>
                        
                        <CardContent className="p-8">
                            <AnimatePresence mode="wait">
                                {activeTab === 'sessions' ? (
                                    <M.div key="sessions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                        {isLoading ? (
                                            [...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-[32px]" />)
                                        ) : data?.classes?.map((c: any) => (
                                            <div key={c.id} className="bg-slate-950/60 p-6 rounded-[32px] border border-white/5 flex items-center justify-between group hover:border-sky-500/30 transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className="p-4 bg-slate-900 rounded-2xl text-slate-500 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-inner">
                                                        <Play size={20} fill="currentColor" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-white uppercase tracking-tight">{c.name}</h4>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{c.start_time} • Sincronia Local</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" rightIcon={ChevronRight} className="text-[10px] uppercase font-black">Controlar Sala</Button>
                                            </div>
                                        ))}
                                        {!isLoading && data?.classes?.length === 0 && (
                                            <div className="py-12 text-center text-slate-700 uppercase font-black tracking-widest text-[10px]">Nenhuma turma agendada para hoje.</div>
                                        )}
                                    </M.div>
                                ) : (
                                    <M.div key="audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                                        {data?.auditLogs?.map((log: any) => (
                                            <div key={log.id} className="flex items-center justify-between p-4 bg-slate-950/40 rounded-2xl border border-white/5 hover:bg-slate-950 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <UserAvatar src={log.students?.avatar_url} name={log.students?.name || 'Músico'} size="sm" />
                                                    <div>
                                                        <p className="text-xs font-black text-white uppercase">
                                                            {log.students?.name || 'Aluno'} <span className="text-slate-600 font-medium">realizou</span> {log.event_type}
                                                        </p>
                                                        <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">{formatDate(log.created_at, 'HH:mm')} • Telemetria Validada</p>
                                                    </div>
                                                </div>
                                                <div className="bg-sky-500/10 px-3 py-1.5 rounded-xl text-sky-400 text-[10px] font-black border border-sky-500/20">+{log.xp_amount} XP</div>
                                            </div>
                                        ))}
                                    </M.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-white/5 rounded-[48px] p-10 relative overflow-hidden shadow-2xl">
                         <div className="flex items-center gap-3 mb-10 relative z-10">
                            <TrendingUp size={24} className="text-purple-400" />
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Telemetria da Turma</h3>
                         </div>
                         <div className="h-64 flex items-end gap-4 relative z-10 px-4">
                            {isLoading ? (
                                [...Array(7)].map((_, i) => <Skeleton key={i} className="flex-1 rounded-xl" height={`${Math.random() * 60 + 20}%`} />)
                            ) : data?.evolution?.map((item: any, i: number) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                    <div className="w-full relative flex flex-col justify-end h-full">
                                        <M.div 
                                            initial={{ height: 0 }} 
                                            animate={{ height: `${Math.min(100, (item.value / 500) * 100)}%` }}
                                            className="w-full bg-purple-600/20 group-hover:bg-purple-500 rounded-xl transition-all border border-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                                        />
                                    </div>
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{item.name}</span>
                                </div>
                            ))}
                         </div>
                    </Card>
                </main>

                <aside className="lg:col-span-4 space-y-8">
                    <Card className="bg-gradient-to-br from-purple-600 to-indigo-900 border-none rounded-[48px] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-24 bg-white/10 blur-[80px] rounded-full group-hover:scale-110 transition-transform" />
                        <div className="relative z-10 space-y-6">
                            <div className="p-3 bg-white/20 rounded-2xl w-fit shadow-xl"><Brain size={32} /></div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Oracle Advice</h3>
                                <p className="text-purple-100 text-xs mt-3 leading-relaxed font-medium italic opacity-80">
                                    "A ressonância rítmica da sua turma subiu 15% na última semana. Recomendo introduzir exercícios de tercinas no próximo módulo."
                                </p>
                            </div>
                            <Button className="w-full bg-white text-purple-700 hover:bg-purple-50 rounded-2xl font-black uppercase text-[10px] py-4 shadow-xl">Ver Relatório IA</Button>
                        </div>
                    </Card>

                    <div className="bg-slate-900/60 p-8 rounded-[40px] border border-white/5 space-y-6 shadow-xl backdrop-blur-md">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <History size={14} /> Feed de Maestria
                        </p>
                        <div className="space-y-4">
                            {isLoading ? (
                                [...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)
                            ) : data?.students?.slice(0, 5).map((s: any, idx: number) => (
                                <M.div 
                                    key={s.id} 
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center gap-4 group"
                                >
                                    <UserAvatar src={s.avatar_url} name={s.name} size="sm" className="group-hover:scale-110 transition-transform" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-slate-400 leading-tight">
                                            <span className="font-black text-white uppercase">{s.name.split(' ')[0]}</span> atingiu Nível <span className="text-sky-400 font-black">{s.current_level}</span>
                                        </p>
                                    </div>
                                    <Zap size={12} className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                                </M.div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}