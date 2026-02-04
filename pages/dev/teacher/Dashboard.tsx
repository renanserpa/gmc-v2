
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Calendar, ArrowRight, Radio } from 'lucide-react';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { useMaestro } from '../../../contexts/MaestroContext.tsx';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync.ts';
import { cn } from '../../../lib/utils.ts';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;

const PILOT_SCHOOL_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0851';

export default function TeacherDashboard() {
    const { profile } = useAuth();
    const { setActiveSession } = useMaestro();
    const navigate = useNavigate();

    const { data: classes, loading } = useRealtimeSync<any>(
        'music_classes', 
        `school_id=eq.${PILOT_SCHOOL_ID}`,
        { column: 'start_time', ascending: true }
    );

    const handleOpenClass = (cls: any) => {
        setActiveSession({
            classId: cls.id,
            className: cls.name,
            startTime: Date.now(),
            attendance: {}
        });
        navigate('/teacher/orchestrator');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-24 animate-in fade-in duration-700">
            <header className="p-12 rounded-[64px] border border-white/5 bg-[#0a0f1d] backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-64 bg-sky-500/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                            <GraduationCap size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Kernel Maestro v8.2</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none italic">
                        Olá, <span className="text-sky-400">Mestre {profile?.full_name?.split(' ')[0] || 'Renan'}</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-lg italic">Selecione uma turma para iniciar a orquestração pedagógica.</p>
                </div>
            </header>

            <section className="space-y-6">
                <div className="flex items-center gap-3 text-slate-400 px-2">
                    <Calendar size={20} className="text-sky-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Turmas Registradas</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                        [...Array(2)].map((_, i) => <div key={i} className="h-48 bg-slate-900/40 rounded-[48px] animate-pulse" />)
                    ) : classes.length === 0 ? (
                        <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-800 rounded-[56px] opacity-30 text-white font-black uppercase tracking-widest">
                            Nenhuma turma cadastrada
                        </div>
                    ) : classes.map((cls) => (
                        <Card key={cls.id} className="bg-[#0a0f1d] border-white/5 rounded-[48px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-sky-500/20 transition-all shadow-2xl">
                            <div className="flex items-center gap-8 flex-1">
                                <div className="text-center p-6 rounded-[32px] border border-white/5 bg-slate-950 text-slate-600 min-w-[120px] group-hover:text-sky-400 transition-all">
                                    <p className="text-3xl font-black font-mono">{cls.start_time.slice(0, 5)}</p>
                                    <p className="text-[8px] font-black uppercase mt-1">{cls.day_of_week}</p>
                                </div>
                                <div>
                                    <h4 className="text-3xl font-black text-white uppercase italic tracking-tight">{cls.name}</h4>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                                        <Users size={12} /> {cls.capacity} Vagas • RedHouse Pilot
                                    </p>
                                </div>
                            </div>
                            <Button 
                                onClick={() => handleOpenClass(cls)}
                                className="px-10 py-8 rounded-[32px] bg-sky-600 hover:bg-sky-500 text-white font-black uppercase text-xs tracking-widest shadow-xl transition-all"
                                rightIcon={ArrowRight}
                            >
                                INICIAR AULA
                            </Button>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
