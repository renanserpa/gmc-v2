
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Headphones, Play, Pause, SkipForward, SkipBack, Zap, Sparkles, Clock, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { haptics } from '../../lib/haptics';
import { notify } from '../../lib/notification';

interface PassiveListeningProps {
    studentName: string;
    onBuffEarned?: () => void;
}

export const PassiveListening: React.FC<PassiveListeningProps> = ({ studentName, onBuffEarned }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [minutesListened, setMinutesListened] = useState(0);
    const [currentTrack, setCurrentTrack] = useState(0);
    const timerRef = useRef<number | null>(null);

    const GOAL_MINUTES = 20;

    const tracks = [
        { title: "Caminhada da Aranha (Acompanhamento)", duration: "03:45" },
        { title: "Seven Nation Army - Loop", duration: "05:12" },
        { title: "Ode to Joy (Suzuki Theme)", duration: "02:30" }
    ];

    useEffect(() => {
        if (isPlaying) {
            timerRef.current = window.setInterval(() => {
                setProgress(p => {
                    if (p >= 100) return 0;
                    return p + 0.1;
                });
                // Incrementa minutos simulados a cada 10s de UX
                setMinutesListened(m => {
                    const next = m + 0.1;
                    if (Math.floor(next) > Math.floor(m) && Math.floor(next) === GOAL_MINUTES) {
                        handleGoalReached();
                    }
                    return next;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isPlaying]);

    const handleGoalReached = () => {
        haptics.success();
        notify.success("BUFF ATIVADO: Ouvido Atento! Próxima aula terá +50% XP.");
        onBuffEarned?.();
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
        haptics.medium();
    };

    return (
        <Card className="bg-slate-900 border-sky-500/20 rounded-[48px] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[120px] pointer-events-none" />
            
            <CardHeader className="bg-slate-950/40 p-8 border-b border-white/5">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400">
                            <Headphones size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Suzuki Listening Hub</CardTitle>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ambiente Musical para {studentName}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-3">
                         <Clock size={16} className="text-slate-500" />
                         <span className="text-lg font-black text-white font-mono">{Math.floor(minutesListened)}m</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-10 space-y-10">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                         <motion.div 
                            animate={isPlaying ? { rotate: 360 } : {}}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="w-48 h-48 rounded-full border-8 border-slate-950 flex items-center justify-center bg-slate-800 shadow-inner overflow-hidden"
                         >
                             <Music size={80} className="text-slate-700 opacity-20" />
                             <motion.div 
                                className="absolute inset-0 border-8 border-sky-500/50" 
                                style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
                             />
                         </motion.div>
                         <button 
                            onClick={togglePlay}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-sky-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-10"
                         >
                            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                         </button>
                    </div>

                    <div className="text-center space-y-1">
                        <h4 className="text-xl font-black text-white uppercase tracking-tighter">{tracks[currentTrack].title}</h4>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Aguardando Sincronia...</p>
                    </div>

                    <div className="flex items-center gap-8 text-slate-500">
                        <SkipBack size={24} className="hover:text-white cursor-pointer" />
                        <SkipForward size={24} className="hover:text-white cursor-pointer" />
                    </div>
                </div>

                <div className="bg-slate-950/80 p-6 rounded-[32px] border border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                        <span>Progresso Diário Suzuki</span>
                        <span className="text-sky-400">{Math.round((minutesListened / GOAL_MINUTES) * 100)}%</span>
                    </div>
                    <div className="h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full" 
                            animate={{ width: `${Math.min((minutesListened / GOAL_MINUTES) * 100, 100)}%` }}
                        />
                    </div>
                    <div className="flex items-start gap-3 bg-sky-500/5 p-4 rounded-2xl border border-sky-500/10">
                        <Sparkles size={14} className="text-sky-400 shrink-0 mt-0.5" />
                        <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
                            <strong className="text-white uppercase">Dica Pedagógica:</strong> Deixe esta rádio tocando baixinho durante as atividades da criança. A familiaridade com as melodias acelera o aprendizado prático em 2x.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
