
import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Clock, Play, Users, Calendar, Zap, History, 
    Sparkles, GraduationCap, MonitorPlay, UserPlus, 
    Search, ChevronRight, Music, Star, X, Plus, 
    Building2, Target, Layers, BookOpen, AlertCircle,
    Guitar, Disc, FileText, Loader2, CheckCircle2,
    ListMusic, Settings
} from 'lucide-react';

// UI Core
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/Dialog.tsx';
import { UserAvatar } from '../components/ui/UserAvatar.tsx';
import { AttendanceModal } from '../components/dashboard/AttendanceModal.tsx';
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
import { cn } from '../lib/utils.ts';
import { 
    getStudentsInClass, 
    getStudentsByTeacher, 
    getLessonsByTeacher, 
    getMissionsByTeacher, 
    getProfessorAuditLogs 
} from '../services/dataService.ts';

const M = motion as any;

const VIBES = [
    { id: 'synth', label: 'Electronic', icon: Zap, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
    { id: 'rock', label: 'Rock', icon: Guitar, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    { id: 'classical', label: 'Clássico', icon: Music, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
];

export default function ProfessorDashboard() {
    const { user, profile, schoolId } = useAuth();
    const { setActiveClassId, setActiveSession } = useMaestro();
    const navigate = useNavigate();

    const [activeVibe, setActiveVibe] = useState(() => localStorage.getItem('maestro_active_vibe') || 'synth');
    const [selectedClass, setSelectedClass] = useState<any>(null);
    const [classStudents, setClassStudents] = useState<any[]>([]);
    const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Shared Loading State
    const [isLoading, setIsLoading] = useState(true);
    const [students, setStudents] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);
    const [missions, setMissions] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    const vibeConfig = VIBES.find(v => v.id === activeVibe) || VIBES[0];

    // Manual Data Fetching with shared Loading State
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

    const handleFinishAttendance = () => {
        setIsAttendanceOpen(false);
        setActiveClassId(selectedClass.id);
        setActiveSession({
            classId: selectedClass.id,
            className: selectedClass.name,
            startTime: Date.now(),
            attendance: {} 
        });
        haptics.fever();
        notify.success("Presenças logadas. TV Sincronizada!");
        navigate('/teacher/orchestrator');
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
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", vibeConfig.bg, vibeConfig.color)}>
                                <GraduationCap size={16} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">RedHouse Control v8.1</span>
                        </div>
                        <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none italic">
                            Olá, <span className={vibeConfig.color}>Mestre {profile?.full_name?.split(' ')[0]}</span>
                        </h1>
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

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3 text-slate-400">
                                <Calendar size={20} className={vibeConfig.color} />
                                <h3 className="text-sm font-black uppercase tracking-widest">Sessões de Hoje</h3>
                            </div>
                            <span className="text-[9px] font-black text-slate-600 uppercase bg-slate-900 px-3 py-1 rounded-full border border-white/5">
                                {new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {todaysAgenda.length === 0 ? (
                                <div className="py-24 text-center border-2 border-dashed border-slate-800 rounded-[56px] opacity-30">
                                    <p className="text-xs font-black uppercase tracking-[0.4em]">Nenhum slot rítmico para hoje</p>
                                </div>
                            ) : todaysAgenda.map((cls) => (
                                <Card key={cls.id} className="bg-[#0a0f1d] border-white/5 rounded-[48px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-sky-500/20 transition-all shadow-2xl relative">
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
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="lg:col-span-4">
                    <Card className="bg-slate-900/40 border-white/5 rounded-[48px] p-10 shadow-xl backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-8">
                            <History size={16} className="text-slate-600" />
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Log de Atividade</h4>
                        </div>
                        <div className="space-y-6">
                            {auditLogs.length > 0 ? auditLogs.slice(0, 5).map((log: any) => (
                                <div key={log.id} className="flex gap-4 border-l border-white/5 pl-6 pb-2">
                                    <div className={cn("w-2 h-2 rounded-full mt-1.5", vibeConfig.color.replace('text', 'bg'))} />
                                    <div>
                                        <p className="text-[11px] font-black text-white uppercase leading-tight">{log.action}</p>
                                        <p className="text-[8px] text-slate-600 font-bold uppercase mt-1">Ref: {log.table_name} • {new Date(log.created_at).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            )) : (
                                students.slice(0, 3).map((s: any) => (
                                    <div key={s.id} className="flex gap-4 border-l border-white/5 pl-6 pb-2">
                                        <div className={cn("w-2 h-2 rounded-full mt-1.5", vibeConfig.color.replace('text', 'bg'))} />
                                        <div>
                                            <p className="text-[11px] font-black text-white uppercase leading-tight">{s.full_name} ativo</p>
                                            <p className="text-[8px] text-slate-600 font-bold uppercase mt-1">Sincronia: {new Date().toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </aside>
            </main>

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
        </div>
    );
}
