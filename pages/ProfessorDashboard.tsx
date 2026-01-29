import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, GraduationCap, Zap, TrendingUp, Sparkles, 
    Plus, Clock, BookOpen, AlertCircle, ChevronRight,
    Brain, MessageSquare, Play
} from 'lucide-react';
import { useProfessorData } from '../hooks/useProfessorData.ts';
import { useGlobalSettings } from '../hooks/useGlobalSettings.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { UserAvatar } from '../components/ui/UserAvatar.tsx';
import { KPICard } from '../components/dashboard/KPICard.tsx';
import { cn } from '../lib/utils.ts';

const M = motion as any;

export default function ProfessorDashboard() {
    const { data, isLoading, error } = useProfessorData();
    const { xpMultiplier, activeBroadcast } = useGlobalSettings();

    if (isLoading) {
        return (
            <div className="space-y-10 p-10 max-w-7xl mx-auto">
                <Skeleton className="h-32 w-full rounded-[40px]" />
                <div className="grid grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-12 gap-8">
                    <Skeleton className="col-span-8 h-96 rounded-[48px]" />
                    <Skeleton className="col-span-4 h-96 rounded-[48px]" />
                </div>
            </div>
        );
    }

    if (data?.isNewTeacher) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-10 animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 bg-sky-500/10 rounded-[32px] flex items-center justify-center text-sky-400 mb-8 border border-sky-500/20">
                    <GraduationCap size={48} />
                </div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Bem-vindo, <span className="text-sky-500">Mestre!</span></h1>
                <p className="text-slate-500 max-w-md mt-4 text-lg font-medium leading-relaxed">
                    Sua jornada no ecossistema Olie Music começa aqui. Vamos criar sua primeira turma para sincronizar seus alunos?
                </p>
                <Button className="mt-10 px-12 py-8 rounded-[32px] text-lg font-black uppercase tracking-widest shadow-2xl shadow-sky-900/40" leftIcon={Plus}>
                    Criar Primeira Turma
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-24">
            {/* Banner de Broadcast Global */}
            <AnimatePresence>
                {activeBroadcast && (
                    <M.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-red-600 p-4 rounded-2xl flex items-center justify-between shadow-xl">
                        <div className="flex items-center gap-3 text-white">
                            <AlertCircle size={20} />
                            <span className="text-xs font-black uppercase tracking-widest">ALERTA ROOT: {activeBroadcast}</span>
                        </div>
                    </M.div>
                )}
            </AnimatePresence>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Maestro <span className="text-sky-500">Dashboard</span>
                    </h1>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">Sincronia Core Ativa</span>
                        {xpMultiplier !== 1 && (
                            <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">XP x{xpMultiplier} ON</span>
                        )}
                    </div>
                </div>
                <Button leftIcon={Plus} className="relative z-10 rounded-2xl px-10 py-6">Nova Aula / Missão</Button>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <KPICard title="Total Alunos" value={data?.stats.totalStudents} icon={Users} color="text-sky-400" border="border-sky-500" />
                <KPICard title="Média XP" value={data?.stats.avgXp} icon={Zap} color="text-amber-500" border="border-amber-500" />
                <KPICard title="Atividades" value={data?.stats.weeklyGrowth} icon={TrendingUp} color="text-purple-400" border="border-purple-500" />
                <KPICard title="Turmas" value={data?.classes.length} icon={GraduationCap} color="text-emerald-400" border="border-emerald-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main: Turmas e Presença */}
                <main className="lg:col-span-8 space-y-8">
                    <Card className="bg-slate-900 border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                        <CardHeader className="bg-slate-950/40 p-8 border-b border-white/5 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl flex items-center gap-3 uppercase italic">
                                <Clock size={20} className="text-sky-400" /> Próximas Sessões
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            {data?.classes.map((c: any) => (
                                <div key={c.id} className="bg-slate-950/60 p-6 rounded-[32px] border border-white/5 flex items-center justify-between hover:border-sky-500/30 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 bg-slate-900 rounded-2xl text-slate-500 group-hover:bg-sky-600 group-hover:text-white transition-all">
                                            <Play size={20} fill="currentColor" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-white uppercase tracking-tight">{c.name}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{c.start_time} • {c.days_of_week?.join(', ')}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" rightIcon={ChevronRight}>Chamada</Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-white/5 rounded-[48px] p-10">
                         <div className="flex items-center gap-3 mb-8">
                            <TrendingUp size={24} className="text-purple-400" />
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Evolution Tracker</h3>
                         </div>
                         <div className="h-64 flex items-end gap-4">
                            {data?.evolution.map((item: any, i: number) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                    <M.div 
                                        initial={{ height: 0 }} animate={{ height: `${(item.value / 1000) * 100}%` }}
                                        className="w-full bg-purple-600/20 group-hover:bg-purple-500 rounded-xl transition-all relative border border-purple-500/10"
                                    />
                                    <span className="text-[9px] font-black text-slate-600 uppercase">{item.name}</span>
                                </div>
                            ))}
                         </div>
                    </Card>
                </main>

                {/* Aside: AI e Alertas */}
                <aside className="lg:col-span-4 space-y-8">
                    <Card className="bg-gradient-to-br from-purple-600 to-indigo-900 border-none rounded-[48px] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-24 bg-white/10 blur-[80px] rounded-full group-hover:scale-110 transition-transform" />
                        <div className="relative z-10 space-y-6">
                            <div className="p-3 bg-white/20 rounded-2xl w-fit shadow-xl"><Brain size={32} /></div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none italic">Oracle Brain</h3>
                                <p className="text-purple-100 text-xs mt-3 leading-relaxed font-medium italic">
                                    "Notei que 3 alunos estão com frequência baixa. Recomendo lançar a missão 'Acorde Fantasma' para re-engajamento rítmico."
                                </p>
                            </div>
                            <Button className="w-full bg-white text-purple-700 hover:bg-purple-50 rounded-2xl font-black uppercase text-[10px] tracking-widest py-4">Sugerir Missão</Button>
                        </div>
                    </Card>

                    <div className="bg-slate-900/60 p-8 rounded-[40px] border border-white/5 space-y-6 shadow-xl backdrop-blur-md">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2"><MessageSquare size={14} /> Feed de Conquistas</p>
                        <div className="space-y-4">
                            {data?.students.slice(0, 3).map((s: any) => (
                                <div key={s.id} className="flex items-center gap-4">
                                    <UserAvatar src={s.avatar_url} name={s.name} size="sm" />
                                    <p className="text-[10px] text-slate-400 leading-tight">
                                        <span className="font-black text-white uppercase">{s.name.split(' ')[0]}</span> atingiu Nível {s.current_level}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}