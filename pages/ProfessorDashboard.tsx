import React, { useState, Suspense, lazy, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Clock, GraduationCap, ChevronRight, ClipboardCheck, 
  MonitorPlay, Brain, Sparkles, MessageSquare, Loader2, ShieldCheck, Terminal, AlertTriangle, RefreshCw
} from 'lucide-react';

// Imports relativos estritos com extensões
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { UserAvatar } from '../components/ui/UserAvatar.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { KPICard } from '../components/dashboard/KPICard.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useProfessorData } from '../hooks/useProfessorData.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils.ts';
import { haptics } from '../lib/haptics.ts';
import { formatDate } from '../lib/date.ts';
import { MusicClass, Student } from '../types.ts';

// Carregamento dinâmico explícito e seguro
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
    const { user } = useAuth();
    const { stats, students, classes, auditLogs, isLoading, error } = useProfessorData();
    const navigate = useNavigate();
    
    const [activeView, setActiveView] = useState<'agenda' | 'students' | 'audit'>('agenda');
    const [selectedClassForAttendance, setSelectedClassForAttendance] = useState<MusicClass | null>(null);
    const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
    
    const todayName = DAYS_MAP[new Date().getDay()];

    const studentsByClass = useMemo(() => {
        const map: Record<string, Student[]> = {};
        if (classes) {
            classes.forEach(c => {
                map[c.id] = students.filter(s => (s as any).class_id === c.id);
            });
        }
        return map;
    }, [students, classes]);

    const isClassActive = (startTime: string) => {
        if (!startTime || !startTime.includes(':')) return false;
        try {
            const [hours, minutes] = startTime.split(':').map(Number);
            const classDate = new Date();
            classDate.setHours(hours, minutes, 0, 0);
            const now = new Date();
            const diff = (now.getTime() - classDate.getTime()) / 1000 / 60;
            return diff >= 0 && diff <= 60;
        } catch (e) {
            return false;
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6">
                <div className="bg-red-500/10 p-6 rounded-full border border-red-500/20">
                    <AlertTriangle size={48} className="text-red-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">O Kernel Desafinou</h2>
                    <p className="text-slate-500 text-sm mt-2">Não conseguimos sincronizar os dados do cockpit.</p>
                </div>
                <Button onClick={() => window.location.reload()} leftIcon={RefreshCw}>Tentar Nova Sincronia</Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500 pb-24 px-4">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic">Maestro <span className="text-sky-500">Cockpit</span></h1>
                    <p className="text-slate-500 font-medium tracking-tight mt-2 flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full", isLoading ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} /> 
                        {isLoading ? "Sincronizando Rede Neural..." : "Professor Autenticado • Central de Comando"}
                    </p>
                </div>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-white/5"
                >
                    {(['agenda', 'students', 'audit'] as const).map((view) => (
                        <button 
                            key={view}
                            onClick={() => { setActiveView(view); haptics.light(); }} 
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", 
                                activeView === view 
                                    ? (view === 'agenda' ? "bg-sky-600 shadow-sky-900/20" : view === 'students' ? "bg-purple-600 shadow-purple-900/20" : "bg-amber-600 shadow-amber-900/20") + " text-white shadow-lg" 
                                    : "text-slate-500 hover:text-white"
                            )}
                        >
                            {view === 'agenda' ? 'Agenda' : view === 'students' ? 'Alunos' : 'Auditoria'}
                        </button>
                    ))}
                </motion.div>
            </header>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-12"
            >
                <KPICard 
                    title="Total Alunos" 
                    value={isLoading ? undefined : stats.totalStudents} 
                    icon={Users} 
                    color="text-sky-400" 
                    border="border-sky-500" 
                />
                <KPICard 
                    title="Turmas" 
                    value={isLoading ? undefined : (classes?.length || 0)} 
                    icon={GraduationCap} 
                    color="text-purple-400" 
                    border="border-purple-500" 
                />
                <KPICard 
                    title="Sessões Hoje" 
                    value={isLoading ? undefined : (classes?.filter(c => c.days_of_week?.includes(todayName)).length || 0)} 
                    icon={Clock} 
                    color="text-amber-400" 
                    border="border-amber-500" 
                />
                <KPICard 
                    title="Logs Recentes" 
                    value={isLoading ? undefined : (auditLogs?.length || 0)} 
                    icon={ShieldCheck} 
                    color="text-emerald-400" 
                    border="border-emerald-500" 
                />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <main className="lg:col-span-9">
                    <AnimatePresence mode="wait">
                        {activeView === 'agenda' && (
                            <motion.div 
                                key="agenda" 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: -10 }} 
                                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                            >
                                {isLoading ? (
                                    [1, 2, 3, 4].map(i => (
                                        <Card key={i} className="bg-slate-900 border-white/5 rounded-[40px] p-8 h-[340px] space-y-6">
                                            <CardHeader className="border-none p-0 flex flex-row justify-between">
                                                <Skeleton variant="rectangular" className="w-14 h-14 rounded-2xl" />
                                                <Skeleton variant="text" width={100} height={24} className="rounded-full" />
                                            </CardHeader>
                                            <CardContent className="p-0 space-y-3">
                                                <Skeleton variant="text" width="80%" height={32} />
                                                <Skeleton variant="text" width="40%" height={16} />
                                            </CardContent>
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(j => <Skeleton key={j} variant="circular" width={36} height={36} className="border-4 border-slate-900" />)}
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <>
                                        {classes.map((c) => {
                                            const isToday = c.days_of_week?.includes(todayName);
                                            const active = isToday && isClassActive(c.start_time);
                                            const classStudents = studentsByClass[c.id] || [];

                                            return (
                                                <Card key={c.id} className={cn(
                                                    "group relative transition-all rounded-[40px] overflow-hidden border-2",
                                                    active ? "border-emerald-500/40 bg-emerald-500/5 shadow-2xl shadow-emerald-950/20" : "border-white/5 bg-slate-900"
                                                )}>
                                                    <div className="p-8 space-y-6">
                                                        <div className="flex justify-between items-start">
                                                            <div className={cn("p-4 rounded-2xl", active ? "bg-emerald-500 text-white" : "bg-slate-950 text-slate-700")}>
                                                                <Clock size={24} />
                                                            </div>
                                                            {active && (
                                                                <span className="bg-emerald-500 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest animate-pulse">
                                                                    AO VIVO AGORA
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{c.name}</h3>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <span className="text-[10px] font-black text-sky-500 bg-sky-500/10 px-3 py-1 rounded-lg border border-sky-500/20 uppercase tracking-widest">{c.start_time}</span>
                                                                <span className="text-[10px] text-slate-500 font-bold uppercase">{c.days_of_week?.join(' & ')}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex -space-x-2">
                                                            {classStudents.map(student => (
                                                                <button key={student.id} onClick={() => setSelectedStudentForDetail(student)} className="ring-4 ring-slate-900 rounded-full overflow-hidden w-10 h-10 border-2 border-white/10 hover:scale-110 transition-transform">
                                                                    <UserAvatar name={student.name} src={student.avatar_url} size="sm" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="p-6 bg-slate-950/50 border-t border-white/5 flex gap-3">
                                                        {active && (
                                                            <Button 
                                                                onClick={() => navigate(`/classroom-mode?classId=${c.id}`)} 
                                                                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest"
                                                                leftIcon={MonitorPlay}
                                                            >
                                                                Entrar
                                                            </Button>
                                                        )}
                                                        <Button 
                                                            variant="secondary"
                                                            onClick={() => setSelectedClassForAttendance(c)}
                                                            className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest"
                                                            leftIcon={ClipboardCheck}
                                                        >
                                                            Chamada
                                                        </Button>
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </>
                                )}
                            </motion.div>
                        )}

                        {activeView === 'students' && (
                            <motion.div key="students" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {isLoading ? (
                                    [1, 2, 3, 4, 5, 6].map(i => (
                                        <Card key={i} className="bg-slate-900 border-white/5 rounded-[32px] p-6 space-y-4">
                                            <Skeleton variant="circular" width={48} height={48} />
                                            <Skeleton variant="text" width="70%" />
                                            <Skeleton variant="rectangular" className="w-full h-10 rounded-xl" />
                                        </Card>
                                    ))
                                ) : (
                                    students.map(student => (
                                        <Card key={student.id} className="bg-slate-900 border-white/5 hover:border-purple-500/40 transition-all rounded-[32px] group overflow-hidden shadow-lg">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-5 mb-6">
                                                    <UserAvatar src={student.avatar_url} name={student.name} size="lg" className="shadow-lg border-2 border-white/5" />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-black text-white uppercase truncate tracking-tight">{student.name}</h4>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{student.instrument}</p>
                                                    </div>
                                                </div>
                                                <Button onClick={() => setSelectedStudentForDetail(student)} className="w-full text-[10px] uppercase font-black tracking-widest" leftIcon={ChevronRight} variant="secondary">
                                                    Ver Perfil Completo
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </motion.div>
                        )}

                        {activeView === 'audit' && (
                            <motion.div key="audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="space-y-6">
                                <Card className="bg-slate-900 border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                                    <CardHeader className="bg-slate-950/40 p-8 border-b border-white/5">
                                        <CardTitle className="text-xl flex items-center gap-3 tracking-tighter italic uppercase"><Terminal size={20} className="text-amber-500" /> Histórico de Atividade Neural</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-950/80 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                                                    <tr>
                                                        <th className="px-8 py-5">Estudante</th>
                                                        <th className="px-8 py-5">Evento</th>
                                                        <th className="px-8 py-5 text-right">Impacto</th>
                                                        <th className="px-8 py-5 text-right">Captura</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {isLoading ? (
                                                        [1, 2, 3, 4, 5].map(i => (
                                                            <tr key={i}>
                                                                <td className="px-8 py-5"><Skeleton variant="text" width={100} /></td>
                                                                <td className="px-8 py-5"><Skeleton variant="text" width={120} /></td>
                                                                <td className="px-8 py-5 text-right"><Skeleton variant="text" width={60} className="ml-auto" /></td>
                                                                <td className="px-8 py-5 text-right"><Skeleton variant="text" width={80} className="ml-auto" /></td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        auditLogs.map((log: any, idx: number) => (
                                                            <motion.tr 
                                                                key={log.id} 
                                                                initial={{ opacity: 0 }} 
                                                                animate={{ opacity: 1 }} 
                                                                transition={{ delay: idx * 0.02 }}
                                                                className="hover:bg-white/5 transition-colors group"
                                                            >
                                                                <td className="px-8 py-5">
                                                                    <div className="flex items-center gap-3">
                                                                        <UserAvatar src={log.students?.avatar_url} name={log.students?.name || 'N/A'} size="sm" />
                                                                        <span className="text-sm font-black text-slate-200 group-hover:text-white transition-colors">{log.students?.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5">
                                                                    <span className={cn(
                                                                        "text-[9px] font-black uppercase px-2 py-0.5 rounded border",
                                                                        log.event_type.includes('PRACTICE') ? "bg-sky-500/10 text-sky-400 border-sky-500/20" :
                                                                        "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                                                    )}>
                                                                        {log.event_type.replace(/_/g, ' ')}
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-5 text-right">
                                                                    <div className="inline-flex items-center gap-1 text-amber-500 font-mono font-black text-sm">
                                                                        +{log.xp_amount} <span className="text-[9px] opacity-40">XP</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5 text-right">
                                                                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{formatDate(log.created_at, 'dd/MM HH:mm')}</span>
                                                                </td>
                                                            </motion.tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                <aside className="lg:col-span-3 space-y-8">
                    <Card className="bg-gradient-to-br from-purple-600 to-indigo-800 border-none rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-16 bg-white/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 space-y-6">
                            <div className="p-3 bg-white/20 rounded-2xl w-fit"><Brain size={32} /></div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Maestro Oracle</h3>
                                <p className="text-sky-100 text-xs mt-3 leading-relaxed font-medium">
                                    "Com base no desempenho de hoje, recomendo focar em precisão rítmica com a turma de iniciantes."
                                </p>
                            </div>
                            <Button variant="ghost" className="w-full bg-white/10 hover:bg-white/20 text-white text-[10px] uppercase font-black tracking-widest">
                                Aceitar Sugestão <Sparkles size={14} className="ml-2" />
                            </Button>
                        </div>
                    </Card>

                    <div className="bg-slate-900/60 p-6 rounded-[32px] border border-white/5 space-y-4 shadow-xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                            <MessageSquare size={12} /> Feed de Atividade
                        </p>
                        <div className="space-y-3">
                            {auditLogs?.slice(0, 4).map((log: any) => (
                                <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-950/40 rounded-2xl border border-white/5 group hover:border-sky-500/30 transition-all">
                                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500 group-hover:scale-150 transition-transform" />
                                    <p className="text-[10px] text-slate-400 font-medium truncate max-w-[180px]">
                                        <span className="font-bold text-slate-200">{log.students?.name?.split(' ')[0]}</span> {log.event_type.toLowerCase()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            <Suspense fallback={<div className="fixed bottom-10 left-10 p-4 bg-slate-900/80 rounded-full border border-white/10 animate-pulse"><Loader2 size={24} className="animate-spin text-sky-500" /></div>}>
                <LessonAssistant />
            </Suspense>

            <AnimatePresence>
                {selectedClassForAttendance && (
                    <Suspense fallback={<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm"><Loader2 className="animate-spin text-sky-500" size={48} /></div>}>
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
                    <Suspense fallback={<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm"><Loader2 className="animate-spin text-purple-500" size={48} /></div>}>
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