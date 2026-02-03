
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    Clock, Play, Users, CheckCircle2, 
    XCircle, Calendar, Zap, History, 
    Sparkles, ArrowUpRight, GraduationCap,
    MonitorPlay
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { useMaestro } from '../../../contexts/MaestroContext.tsx';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync.ts';
import { useNavigate } from 'react-router-dom';
import { haptics } from '../../../lib/haptics.ts';
import { notify } from '../../../lib/notification.ts';
import { supabase } from '../../../lib/supabaseClient.ts';
import { cn } from '../../../lib/utils.ts';

const M = motion as any;

export default function TeacherDashboard() {
    const { user, profile, schoolId } = useAuth();
    const { setActiveClassId, setActiveSession } = useMaestro();
    const navigate = useNavigate();

    const { data: classes } = useRealtimeSync<any>('music_classes', `professor_id=eq.${user?.id}`);
    const { data: enrollments } = useRealtimeSync<any>('enrollments');
    const { data: students } = useRealtimeSync<any>('profiles', `role=eq.student,school_id=eq.${schoolId}`);

    // Agenda do Dia: Detecta o dia atual e filtra
    const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
    const currentWeekday = today.charAt(0).toUpperCase() + today.slice(1).split('-')[0];
    
    const todaysAgenda = useMemo(() => {
        return classes.filter(c => c.day_of_week === currentWeekday || c.day_of_week === 'Segunda'); // Fallback demo
    }, [classes, currentWeekday]);

    const handleStartLesson = async (cls: any) => {
        haptics.fever();
        notify.info(`Injetando Sinal rítmico: ${cls.name}...`);

        try {
            // 1. Gravar Início na Tabela class_logs
            const { error: logErr } = await supabase.from('class_logs').insert([{
                class_id: cls.id,
                professor_id: user.id,
                started_at: new Date().toISOString()
            }]);

            if (logErr) throw logErr;

            // 2. Configurar Sessão Ativa no Contexto
            setActiveClassId(cls.id);
            setActiveSession({
                classId: cls.id,
                className: cls.name,
                startTime: Date.now(),
                attendance: {}
            });

            // 3. Redirecionar para Live Tools
            setTimeout(() => {
                navigate('/system/dev/teacher/orchestrator');
            }, 1000);
        } catch (e: any) {
            notify.error("Erro ao sincronizar sala: " + e.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-24 animate-in fade-in duration-700">
            {/* WELCOME BANNER */}
            <header className="bg-[#0a0f1d] p-12 rounded-[64px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-64 bg-sky-500/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
                                <GraduationCap size={16} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Mestre Ativo / RedHouse Cuiabá</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">
                            Olá, Maestro <span className="text-sky-500">{profile?.full_name?.split(' ')[0]}</span>
                        </h1>
                        <p className="text-slate-400 text-lg font-medium italic">"Tocar um instrumento é a arte de mover o ar com o coração."</p>
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={() => navigate('/teacher/classes')} variant="outline" className="h-16 px-10 rounded-[28px] border-white/10 hover:bg-white/5 text-[10px] font-black uppercase">Minhas Turmas</Button>
                        <Button onClick={() => navigate('/teacher/students')} className="h-16 px-10 rounded-[28px] bg-sky-600 shadow-xl shadow-sky-900/20 text-[10px] font-black uppercase">Novo Músico</Button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* AGENDA CENTER */}
                <main className="lg:col-span-8 space-y-8">
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <Calendar size={20} className="text-sky-500" />
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Agenda de Hoje • {currentWeekday}</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {todaysAgenda.length === 0 ? (
                                <div className="py-24 text-center border-2 border-dashed border-slate-800 rounded-[56px] opacity-30">
                                    <p className="text-xs font-black uppercase tracking-[0.4em]">Nenhuma orquestração para hoje</p>
                                </div>
                            ) : todaysAgenda.map((cls, idx) => {
                                const pupilCount = enrollments.filter(e => e.class_id === cls.id).length;
                                return (
                                    <M.div key={cls.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                                        <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-sky-500/40 transition-all shadow-2xl overflow-hidden relative">
                                            <div className="flex items-center gap-10 flex-1">
                                                <div className="text-center bg-slate-950 p-6 rounded-[32px] border border-white/5 min-w-[120px] shadow-inner">
                                                    <p className="text-[9px] font-black text-slate-600 uppercase mb-2">Início</p>
                                                    <p className="text-3xl font-black text-white font-mono">{cls.start_time.slice(0, 5)}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="text-3xl font-black text-white uppercase italic tracking-tight">{cls.name}</h4>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <Users size={14} className="text-slate-700" />
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{pupilCount} Músicos convocados</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button 
                                                onClick={() => handleStartLesson(cls)}
                                                className="px-12 py-10 rounded-[40px] bg-sky-600 hover:bg-sky-500 text-white font-black uppercase text-xs tracking-widest shadow-2xl group-hover:scale-105 transition-all flex flex-col gap-2"
                                            >
                                                <MonitorPlay size={24} />
                                                INICIAR AULA
                                            </Button>
                                            <div className="absolute top-0 right-0 p-24 bg-sky-500/[0.02] blur-[80px] pointer-events-none" />
                                        </Card>
                                    </M.div>
                                );
                            })}
                        </div>
                    </section>
                </main>

                {/* KPI SIDEBAR */}
                <aside className="lg:col-span-4 space-y-8">
                    <Card className="bg-gradient-to-br from-sky-600 to-indigo-900 border-none rounded-[56px] p-12 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-white/10 blur-[80px] rounded-full group-hover:scale-125 transition-transform duration-1000" />
                        <div className="relative z-10 space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="p-4 bg-white/20 rounded-3xl shadow-xl"><Zap size={32} /></div>
                                <ArrowUpRight size={24} className="opacity-40" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-sky-200 uppercase tracking-[0.4em]">Performance Mensal</p>
                                <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">32.5 Horas <br /> Sincronizadas</h3>
                            </div>
                            <p className="text-sky-100/70 text-xs font-medium leading-relaxed">Você atingiu 94% da meta de engajamento da unidade este mês.</p>
                        </div>
                    </Card>

                    <div className="p-10 bg-slate-900/40 border border-white/5 rounded-[48px] shadow-xl backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-8">
                            <History size={16} className="text-slate-600" />
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Event Stream</h4>
                        </div>
                        <div className="space-y-6">
                            {students.slice(0, 3).map(s => (
                                <div key={s.id} className="flex gap-4 border-l border-white/5 pl-6 pb-2">
                                    <div className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shadow-[0_0_10px_#38bdf8]" />
                                    <div>
                                        <p className="text-[11px] font-black text-white uppercase leading-tight">{s.full_name.split(' ')[0]} conquistou XP</p>
                                        <p className="text-[8px] text-slate-600 font-bold uppercase mt-1">Há 12 minutos</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
