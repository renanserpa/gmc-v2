import React, { useState, Suspense, lazy, useMemo, useEffect } from 'react';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;
import { 
  Users, Clock, GraduationCap, ChevronRight, ClipboardCheck, 
  MonitorPlay, Brain, Sparkles, MessageSquare, Loader2, ShieldCheck, Terminal, AlertTriangle, RefreshCw, BookMarked
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { UserAvatar } from '../components/ui/UserAvatar.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { KPICard } from '../components/dashboard/KPICard.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/Tooltip.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useProfessorData } from '../hooks/useProfessorData.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils.ts';
import { haptics } from '../lib/haptics.ts';

// Lazy loading corrigido para exportações nomeadas com extensões
const AttendanceModal = lazy(() => 
  import('../components/dashboard/AttendanceModal.tsx').then(m => ({ default: m.AttendanceModal }))
);
const StudentDetailModal = lazy(() => 
  import('../components/dashboard/StudentDetailModal.tsx').then(m => ({ default: m.StudentDetailModal }))
);
const LessonAssistant = lazy(() => 
  import('../components/dashboard/LessonAssistant.tsx').then(m => ({ default: m.LessonAssistant }))
);

const DAYS_MAP = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function ProfessorDashboard() {
    const { user, role, loading: authLoading } = useAuth();
    const { stats, students, classes, auditLogs, isLoading, error } = useProfessorData();
    const navigate = useNavigate();
    
    // Validação de acesso do Professor
    useEffect(() => {
        if (!authLoading && role !== 'professor') {
            navigate('/login', { replace: true });
        }
    }, [role, authLoading, navigate]);

    const [activeView, setActiveView] = useState('agenda');
    const [selectedClassForAttendance, setSelectedClassForAttendance] = useState<any>(null);
    const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<any>(null);
    
    const todayName = DAYS_MAP[new Date().getDay()];

    const studentsByClass = useMemo(() => {
        const map: Record<string, any[]> = {};
        if (classes && students) {
            classes.forEach(c => {
                map[c.id] = students.filter((s: any) => s.class_id === c.id);
            });
        }
        return map;
    }, [students, classes]);

    // Lookup for class names by ID to avoid showing raw UUIDs
    const classNamesById = useMemo(() => {
        const map: Record<string, string> = {};
        if (classes) {
            classes.forEach((c: any) => {
                map[c.id] = c.name;
            });
        }
        return map;
    }, [classes]);

    const isClassActive = (startTime: string) => {
        if (!startTime || !startTime.includes(':')) return false;
        try {
            const [hours, minutes] = startTime.split(':').map(Number);
            const classDate = new Date();
            classDate.setHours(hours, minutes, 0, 0);
            const now = new Date();
            const diff = (now.getTime() - classDate.getTime()) / 1000 / 60;
            return diff >= 0 && diff <= 60; 
        } catch (e) { return false; }
    };

    // Bloqueia renderização se não for professor ou ainda estiver carregando auth
    if (authLoading || role !== 'professor') {
        return null;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6">
                <div className="bg-red-500/10 p-6 rounded-full border border-red-500/20">
                    <AlertTriangle size={48} className="text-red-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Erro de Kernel</h2>
                    <p className="text-slate-500 text-sm mt-2">Falha crítica ao sincronizar o cockpit do professor.</p>
                </div>
                <Button onClick={() => window.location.reload()} leftIcon={RefreshCw}>Reiniciar Cockpit</Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500 pb-24 px-4">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic flex items-center gap-3">
                        Maestro <span className="text-sky-500">Cockpit</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <AlertTriangle className="text-amber-500 animate-pulse cursor-help shrink-0" size={24} />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[250px] text-center p-4 bg-slate-950/95 border-amber-500/30">
                                <p className="font-black uppercase text-[10px] text-amber-400 mb-1">Aviso de Sincronia</p>
                                <p className="text-xs text-slate-300 font-medium leading-relaxed">Sincronização neural do cockpit completa.</p>
                            </TooltipContent>
                        </Tooltip>
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight mt-2 flex items-center gap-2 text-xs">
                        <span className={cn("w-2 h-2 rounded-full", (isLoading || authLoading) ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} /> 
                        {isLoading ? "Sincronizando Rede Neural..." : "Cockpit Operacional • v3.0 Otimizado"}
                    </p>
                </div>
                <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                    {['agenda', 'students', 'audit'].map((view) => (
                        <button 
                            key={view}
                            onClick={() => { setActiveView(view); haptics.light(); }} 
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", 
                                activeView === view 
                                    ? (view === 'agenda' ? "bg-sky-600 shadow-sky-900/20" : view === 'students' ? "bg-purple-600 shadow-purple-900/20" : "bg-orange-600 shadow-orange-900/20") + " text-white shadow-lg" 
                                    : "text-slate-500 hover:text-white"
                            )}
                        >
                            {view === 'agenda' ? 'Agenda' : view === 'students' ? 'Alunos' : 'Auditoria'}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
                <KPICard title="Total Alunos" value={isLoading ? undefined : stats.totalStudents} icon={Users} color="text-sky-400" border="border-sky-500" />
                <KPICard title="Turmas Ativas" value={isLoading ? undefined : (classes?.length || 0)} icon={GraduationCap} color="text-purple-400" border="border-purple-500" />
                <KPICard title="Aulas Hoje" value={isLoading ? undefined : (classes?.filter((c: any) => c.days_of_week?.includes(todayName)).length || 0)} icon={Clock} color="text-amber-400" border="border-amber-500" />
                <KPICard title="Integridade" value={isLoading ? undefined : "100%"} icon={ShieldCheck} color="text-emerald-400" border="border-emerald-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <main className="lg:col-span-9">
                    <AnimatePresence mode="wait">
                        {activeView === 'agenda' && (
                            <motion.div key="agenda" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {isLoading ? (
                                    [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-[40px] bg-slate-900/50" />)
                                ) : (
                                    classes.map((c: any) => {
                                        const isToday = c.days_of_week?.includes(todayName);
                                        const active = isToday && isClassActive(c.start_time);
                                        const classStudents = studentsByClass[c.id] || [];
                                        return (
                                            <Card key={c.id} className={cn("group relative rounded-[40px] overflow-hidden border-2", active ? "border-emerald-500/40 bg-emerald-500/5 shadow-2xl" : "border-white/5 bg-slate-900")}>
                                                <div className="p-8 space-y-6">
                                                    <div className="flex justify-between items-start">
                                                        <div className={cn("p-4 rounded-2xl", active ? "bg-emerald-500 text-white" : "bg-slate-950 text-slate-700")}>
                                                            <Clock size={24} />
                                                        </div>
                                                        {active && <span className="bg-emerald-500 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest animate-pulse">ATIVA</span>}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{c.name}</h3>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className="text-[10px] font-black text-sky-500 bg-sky-500/10 px-3 py-1 rounded-lg border border-sky-500/20">{c.start_time}</span>
                                                            <span className="text-[10px] text-slate-500 font-bold uppercase">{c.days_of_week?.join(' • ')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex -space-x-3">
                                                        {classStudents.map((student: any) => (
                                                            <button key={student.id} onClick={() => setSelectedStudentForDetail(student)} className="ring-4 ring-slate-900 rounded-full overflow-hidden w-10 h-10 border-2 border-white/10 hover:scale-110 hover:z-10 transition-all">
                                                                <UserAvatar name={student.name} src={student.avatar_url} size="sm" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="p-6 bg-slate-950/50 border-t border-white/5 flex gap-3">
                                                    {active && <Button onClick={() => navigate(`/classroom-mode?classId=${c.id}`)} className="flex-1" leftIcon={MonitorPlay}>Painel TV</Button>}
                                                    <Button variant="secondary" onClick={() => setSelectedClassForAttendance(c)} className="flex-1" leftIcon={ClipboardCheck}>Chamada</Button>
                                                </div>
                                            </Card>
                                        );
                                    })
                                )}
                            </motion.div>
                        )}
                        
                        {activeView === 'students' && (
                            <motion.div key="students" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {isLoading ? (
                                    [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 rounded-[32px] bg-slate-900/50" />)
                                ) : (
                                    students.map((student: any) => (
                                        <Card key={student.id} className="bg-slate-900 border-white/5 hover:border-purple-500/40 transition-all rounded-[32px] p-6 shadow-lg">
                                            <div className="flex items-center gap-5 mb-6">
                                                <UserAvatar src={student.avatar_url} name={student.name} size="lg" />
                                                <div className="min-w-0">
                                                    <h4 className="font-black text-white uppercase truncate">{student.name}</h4>
                                                    <div className="space-y-1.5 mt-1">
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{student.instrument}</p>
                                                        <div className="flex items-center gap-2 px-2 py-0.5 bg-sky-500/5 border border-sky-500/10 rounded-lg w-fit max-w-full">
                                                            <BookMarked size={10} className="text-sky-500 shrink-0" />
                                                            <span className="text-[9px] font-black text-sky-500 uppercase tracking-tighter truncate">
                                                                {classNamesById[student.class_id] || 'Individual'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button onClick={() => setSelectedStudentForDetail(student)} className="w-full" leftIcon={ChevronRight} variant="secondary">Explorar Dossiê</Button>
                                        </Card>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
                
                <aside className="lg:col-span-3 space-y-8">
                    <Card className="bg-gradient-to-br from-sky-600 to-indigo-800 border-none rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10 space-y-6">
                            <div className="p-3 bg-white/20 rounded-2xl w-fit shadow-xl"><Brain size={32} /></div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none italic">Oracle Insight</h3>
                                <p className="text-sky-100 text-xs mt-3 leading-relaxed font-medium italic">
                                    "Cockpit centralizado. Todas as turmas e dados de alunos estão agora sob uma única rede neural otimizada."
                                </p>
                            </div>
                        </div>
                    </Card>
                    <div className="bg-slate-900/60 p-6 rounded-[32px] border border-white/5 space-y-5 shadow-xl backdrop-blur-md">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2"><MessageSquare size={12} /> Neural Feed</p>
                        <div className="space-y-4">
                            {isLoading ? (
                                [1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-2xl bg-slate-950/40" />)
                            ) : (
                                auditLogs?.slice(0, 5).map((log: any) => (
                                    <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-950/40 rounded-2xl border border-white/5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_10px_#38bdf8]" />
                                        <p className="text-[9px] text-slate-400 font-bold truncate">
                                            <span className="font-black text-slate-200 uppercase">{log.students?.name?.split(' ')[0]}</span> {log.event_type.toLowerCase().replace(/_/g, ' ')}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </aside>
            </div>

            <Suspense fallback={null}>
                <LessonAssistant />
            </Suspense>

            <AnimatePresence>
                {selectedClassForAttendance && (
                    <Suspense fallback={<div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[100] flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>}>
                        <AttendanceModal 
                            isOpen={!!selectedClassForAttendance}
                            onClose={() => setSelectedClassForAttendance(null)}
                            musicClass={selectedClassForAttendance}
                            students={studentsByClass[selectedClassForAttendance.id] || []}
                            professorId={user?.id || ''}
                            onSuccess={() => {}}
                        />
                    </Suspense>
                )}
                {selectedStudentForDetail && (
                    <Suspense fallback={null}>
                        <StudentDetailModal 
                            student={selectedStudentForDetail}
                            onClose={() => setSelectedStudentForDetail(null)}
                        />
                    </Suspense>
                )}
            </AnimatePresence>
        </div>
    );
}