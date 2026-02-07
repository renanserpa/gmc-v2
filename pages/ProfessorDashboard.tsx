
import React, { useMemo, useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, Play, Users, Calendar, Zap, History, 
    Sparkles, GraduationCap, MonitorPlay, UserPlus, 
    Search, ChevronRight, Music, Star, X, Plus, 
    Building2, Target, Layers, BookOpen, AlertCircle,
    Guitar, Disc, FileText, Loader2, CheckCircle2,
    ListMusic, Settings, Wifi, WifiOff, Radio, UserCheck,
    ChevronDown, XCircle
} from 'lucide-react';

// UI Core
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/Dialog.tsx';
import { UserAvatar } from '../components/ui/UserAvatar.tsx';
import { DashboardSkeleton } from '../components/ui/Skeleton.tsx';

// Contexts & Hooks
import { useAuth } from '../contexts/AuthContext.tsx';
import { useMaestro } from '../contexts/MaestroContext.tsx';
import { useRealtimeSync } from '../hooks/useRealtimeSync.ts';

// Navigation
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;

// Libs & Utils
import { haptics } from '../lib/haptics.ts';
import { notify } from '../lib/notification.ts';
import { cn, motionVariants } from '../lib/utils.ts';
import { supabase } from '../lib/supabaseClient.ts';
import { 
    getStudentsInClass, 
    getStudentsByTeacher, 
    getLessonsByTeacher, 
    getMissionsByTeacher, 
    getProfessorAuditLogs,
    markAttendance,
    getTodayAttendanceForClass
} from '../services/dataService.ts';
import { AttendanceStatus } from '../types.ts';

// Componentes Lazy
const AttendanceModal = lazy(() => import('../components/dashboard/AttendanceModal.tsx').then(module => ({ default: module.AttendanceModal })));

const M = motion as any;

const VIBES = [
    { id: 'synth', label: 'Electronic', icon: Zap, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
    { id: 'rock', label: 'Rock', icon: Guitar, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    { id: 'classical', label: 'Clássico', icon: Music, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
];

export default function ProfessorDashboard() {
    const { user, profile } = useAuth();
    const { setActiveClassId, setActiveSession } = useMaestro();
    const navigate = useNavigate();

    const [activeVibe, setActiveVibe] = useState(() => localStorage.getItem('maestro_active_vibe') || 'synth');
    const [selectedClass, setSelectedClass] = useState<any>(null);
    const [classStudents, setClassStudents] = useState<any[]>([]);
    const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    
    // Status de Presença para Controle Inline
    const [markedAttendance, setMarkedAttendance] = useState<Record<string, AttendanceStatus>>({});

    // Status de Conexão Supabase
    const [kernelStatus, setKernelStatus] = useState<'online' | 'checking' | 'offline'>('checking');

    // Shared Loading State
    const [isLoading, setIsLoading] = useState(true);
    const [students, setStudents] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);
    const [missions, setMissions] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    const vibeConfig = VIBES.find(v => v.id === activeVibe) || VIBES[0];

    // Heartbeat de Conexão
    useEffect(() => {
        const checkKernel = async () => {
            try {
                const { error } = await supabase.from('profiles').select('id').limit(1);
                if (error) throw error;
                setKernelStatus('online');
            } catch (e) {
                console.warn("[Maestro Kernel] Sincronia interrompida.");
                setKernelStatus('offline');
            }
        };
        
        checkKernel();
        const interval = setInterval(checkKernel, 30000);
        return () => clearInterval(interval);
    }, []);

    // Manual Data Fetching
    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user?.id) return;
            setIsLoading(true);
            try {
                const [studentsData, lessonsData, missionsData, auditData] = await Promise.all([
                    getStudentsByTeacher(user.id),
                    getLessonsByTeacher(user.id),
                    getMissionsByTeacher(user.id),
                    getProfessorAuditLogs(user.id)
                ]);
                setStudents(studentsData);
                setLessons(lessonsData);
                setMissions(missionsData);
                setAuditLogs(auditData);

                // Auto-selecionar a próxima aula para o painel de controle
                if (lessonsData.length > 0) {
                    const next = lessonsData[0]; // Simplificado: pega a primeira do dia
                    setSelectedClass(next);
                    const studentsList = await getStudentsInClass(next.id);
                    setClassStudents(studentsList);
                    const attendanceMap = await getTodayAttendanceForClass(next.id);
                    setMarkedAttendance(attendanceMap);
                }
            } catch (e) {
                console.error("[Dashboard] Fetch error:", e);
                notify.error("Falha ao sincronizar dados do Dashboard.");
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, [user?.id]);

    const todaysAgenda = useMemo(() => {
        const daysMap: Record<number, string> = {
            0: 'Domingo', 1: 'Segunda', 2: 'Terça', 3: 'Quarta', 4: 'Quinta', 5: 'Sexta', 6: 'Sábado'
        };
        const todayName = daysMap[new Date().getDay()];
        return lessons.filter(c => c.day_of_week === todayName || c.day_of_week === 'Segunda');
    }, [lessons]);

    const handleMarkAttendance = async (studentId: string, status: AttendanceStatus) => {
        if (!selectedClass) return;
        haptics.light();
        try {
            await markAttendance(studentId, selectedClass.id, status, user!.id);
            setMarkedAttendance(prev => ({ ...prev, [studentId]: status }));
        } catch (e) {
            notify.error("Erro ao registrar presença.");
        }
    };

    const handleOpenGateway = async (cls: any) => {
        haptics.medium();
        setLoadingStudents(true);
        setSelectedClass(cls);
        try {
            const studentsList = await getStudentsInClass(cls.id);
            setClassStudents(studentsList);
            setIsAttendanceOpen(true);
        } catch (e) {
            notify.error("Falha ao sincronizar lista de alunos.");
        } finally {
            setLoadingStudents(false);
        }
    };

    const startOrchestrator = () => {
        if (!selectedClass) {
            notify.warning("Selecione uma turma para iniciar.");
            return;
        }
        haptics.heavy();
        setActiveClassId(selectedClass.id);
        setActiveSession({
            classId: selectedClass.id,
            className: selectedClass.name,
            startTime: Date.now(),
            attendance: markedAttendance
        });
        navigate('/teacher/orchestrator');
    };

    const handleFinishAttendance = () => {
        setIsAttendanceOpen(false);
        startOrchestrator();
    };

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-24 animate-in fade-in duration-700">
            <header className={cn(
                "p-12 rounded-[64px] border backdrop-blur-xl relative overflow-hidden shadow-2xl transition-all duration-1000",
                activeVibe === 'rock' ? "bg-rose-950/20 border-rose-500/20" : 
                activeVibe === 'classical' ? "bg-amber-950/20 border-amber-500/20" : 
                "bg-[#0a0f1d] border-white/5"
            )}>
                <div className={cn("absolute top-0 right-0 p-64 blur-[120px] pointer-events-none transition-colors duration-1000", vibeConfig.bg)} />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg", vibeConfig.bg, vibeConfig.color)}>
                                    <GraduationCap size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">RedHouse Control v8.1</span>
                            </div>
                            
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-full border border-white/5 shadow-inner">
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full animate-pulse",
                                    kernelStatus === 'online' ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" :
                                    kernelStatus === 'checking' ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]" :
                                    "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                                )} />
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                    {kernelStatus === 'online' ? 'Kernel Online' : kernelStatus === 'checking' ? 'Sincronizando...' : 'Kernel Offline'}
                                </span>
                            </div>
                        </div>

                        <M.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-6xl font-black text-white tracking-tighter uppercase leading-none italic"
                        >
                            Olá, <span className={vibeConfig.color}>Mestre {profile?.full_name?.split(' ')[0]}</span>
                        </M.h1>
                        <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 w-fit">
                            {VIBES.map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => { setActiveVibe(v.id); haptics.light(); }}
                                    className={cn(
                                        "px-5 py-2 rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all",
                                        activeVibe === v.id ? cn(v.bg, v.color, "shadow-lg") : "text-slate-600 hover:text-slate-300"
                                    )}
                                >
                                    <v.icon size={14} /> {v.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* SEÇÃO: CONTROLE DA AULA */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 text-slate-400 px-2">
                    <Radio size={20} className="text-sky-400 animate-pulse" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Controle da Aula</h3>
                </div>

                <Card className="bg-[#050810] border-2 border-sky-500/20 rounded-[48px] overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none" />
                    
                    <div className="p-10 flex flex-col lg:flex-row gap-12 items-start">
                        {/* Info da Aula Ativa */}
                        <div className="lg:col-span-4 space-y-6 min-w-[300px]">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-sky-400 uppercase tracking-[0.4em]">Sessão Sincronizada</span>
                                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                                    {selectedClass?.name || 'Selecione uma Turma'}
                                </h2>
                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 mt-2">
                                    <Clock size={12} /> Próximo Slot: {selectedClass?.start_time?.slice(0, 5) || '--:--'}
                                </p>
                            </div>

                            <Button 
                                onClick={startOrchestrator}
                                className="w-full py-10 rounded-3xl bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(14,165,233,0.3)] transition-all group"
                                leftIcon={Radio}
                            >
                                <span className="group-hover:translate-x-1 transition-transform">REDIRECIONAR PARA ORCHESTRATOR LIVE</span>
                            </Button>
                        </div>

                        {/* Gerenciamento de Presença Inline */}
                        <div className="flex-1 w-full space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <UserCheck size={16} className="text-emerald-400" />
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chamada Rápida</h4>
                                </div>
                                <span className="text-[9px] font-black text-slate-600 uppercase bg-slate-900 px-3 py-1 rounded-full border border-white/5">
                                    {classStudents.length} Alunos na Grade
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {classStudents.length > 0 ? classStudents.map((student) => (
                                    <div key={student.id} className="bg-slate-900/60 p-4 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar src={student.avatar_url} name={student.name} size="md" />
                                            <span className="text-xs font-black text-white uppercase truncate max-w-[80px]">{student.name.split(' ')[0]}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => handleMarkAttendance(student.id, 'present')}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                                    markedAttendance[student.id] === 'present' ? "bg-emerald-500 text-white" : "bg-slate-950 text-slate-700 hover:text-emerald-500"
                                                )}
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleMarkAttendance(student.id, 'absent')}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                                    markedAttendance[student.id] === 'absent' ? "bg-rose-500 text-white" : "bg-slate-950 text-slate-700 hover:text-rose-500"
                                                )}
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-10 text-center opacity-30 italic text-slate-500 text-xs">Aguardando dados da unidade...</div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    <section className="space-y-6">
                        <M.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between px-2"
                        >
                            <div className="flex items-center gap-3 text-slate-400">
                                <Calendar size={20} className={vibeConfig.color} />
                                <h3 className="text-sm font-black uppercase tracking-widest">Sessões de Hoje</h3>
                            </div>
                            <span className="text-[9px] font-black text-slate-600 uppercase bg-slate-900 px-3 py-1 rounded-full border border-white/5">
                                {new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}
                            </span>
                        </M.div>

                        <M.div 
                            variants={motionVariants.container as any}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 gap-4"
                        >
                            {todaysAgenda.length === 0 ? (
                                <div className="py-24 text-center border-2 border-dashed border-slate-800 rounded-[56px] opacity-30">
                                    <p className="text-xs font-black uppercase tracking-[0.4em]">Nenhum slot rítmico para hoje</p>
                                </div>
                            ) : todaysAgenda.map((cls, idx) => (
                                <M.div key={cls.id} variants={motionVariants.slideUp as any}>
                                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-sky-500/20 transition-all shadow-2xl relative">
                                        <div className="flex items-center gap-8 flex-1">
                                            <div className="text-center p-6 rounded-[32px] border border-white/5 bg-slate-950 text-slate-600 min-w-[120px] group-hover:text-sky-400 transition-all">
                                                <p className="text-3xl font-black font-mono">{cls.start_time.slice(0, 5)}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black text-white uppercase italic tracking-tight">{cls.name}</h4>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Sala Sincronizada • RedHouse Pilot</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button 
                                                variant="ghost" 
                                                onClick={() => navigate('/teacher/library')}
                                                className="px-6 rounded-2xl border border-white/5 text-[9px] font-black uppercase tracking-widest h-14"
                                                leftIcon={ListMusic}
                                            >
                                                PLANEJAR AULA
                                            </Button>
                                            <Button 
                                                onClick={() => handleOpenGateway(cls)}
                                                isLoading={loadingStudents && selectedClass?.id === cls.id}
                                                className={cn("px-10 py-8 rounded-[32px] text-white font-black uppercase text-xs tracking-widest shadow-xl transition-all", vibeConfig.id === 'rock' ? "bg-rose-600" : vibeConfig.id === 'classical' ? "bg-amber-600" : "bg-sky-600")}
                                            >
                                                ABRIR COMANDO MAESTRO
                                            </Button>
                                        </div>
                                    </Card>
                                </M.div>
                            ))}
                        </M.div>
                    </section>
                </div>

                <aside className="lg:col-span-4">
                    <M.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <Card className="bg-slate-900/40 border-white/5 rounded-[48px] p-10 shadow-xl backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-8">
                                <History size={16} className="text-slate-600" />
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Log de Atividade</h4>
                            </div>
                            <M.div 
                                variants={motionVariants.container as any}
                                initial="hidden"
                                animate="show"
                                className="space-y-6"
                            >
                                {auditLogs.length > 0 ? auditLogs.slice(0, 5).map((log: any) => (
                                    <M.div key={log.id} variants={motionVariants.fadeIn as any} className="flex gap-4 border-l border-white/5 pl-6 pb-2">
                                        <div className={cn("w-2 h-2 rounded-full mt-1.5", vibeConfig.color.replace('text', 'bg'))} />
                                        <div>
                                            <p className="text-[11px] font-black text-white uppercase leading-tight">{log.action}</p>
                                            <p className="text-[8px] text-slate-600 font-bold uppercase mt-1">Ref: {log.table_name} • {new Date(log.created_at).toLocaleTimeString()}</p>
                                        </div>
                                    </M.div>
                                )) : (
                                    students.slice(0, 3).map((s: any) => (
                                        <M.div key={s.id} variants={motionVariants.fadeIn as any} className="flex gap-4 border-l border-white/5 pl-6 pb-2">
                                            <div className={cn("w-2 h-2 rounded-full mt-1.5", vibeConfig.color.replace('text', 'bg'))} />
                                            <div>
                                                <p className="text-[11px] font-black text-white uppercase leading-tight">{s.full_name} ativo</p>
                                                <p className="text-[8px] text-slate-600 font-bold uppercase mt-1">Sincronia: {new Date().toLocaleTimeString()}</p>
                                            </div>
                                        </M.div>
                                    ))
                                )}
                            </M.div>
                        </Card>
                    </M.div>
                </aside>
            </main>

            <Suspense fallback={null}>
                {selectedClass && (
                    <AttendanceModal 
                        isOpen={isAttendanceOpen}
                        onClose={() => setIsAttendanceOpen(false)}
                        musicClass={selectedClass}
                        students={classStudents}
                        professorId={user!.id}
                        onSuccess={handleFinishAttendance}
                    />
                )}
            </Suspense>
        </div>
    );
}
