
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card.tsx';
import { TablatureView } from '../../../components/tools/TablatureView.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Fretboard } from '../../../components/tools/Fretboard.tsx';
import { Zap, Dumbbell, Play, Pause, TrendingUp, Award, Settings2, Sparkles, Target, Activity, ShieldCheck, Gauge } from 'lucide-react';
import { RENAN_SERPA_TABS } from '../../../lib/tabsStore.ts';
import { haptics } from '../../../lib/haptics.ts';
import { notify } from '../../../lib/notification.ts';
import { applyXpEvent } from '../../../services/gamificationService.ts';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { useCurrentStudent } from '../../../hooks/useCurrentStudent.ts';
import { useAudioAnalyst, DifficultyLevel } from '../../../hooks/useAudioAnalyst.ts';
import { cn } from '../../../lib/utils.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { MaestroLiveTip } from '../../../components/tools/MaestroLiveTip.tsx';

const M = motion as any;

const FINGER_COLORS: Record<number, string> = {
    1: 'text-emerald-400', 
    2: 'text-yellow-400',  
    3: 'text-orange-500',  
    4: 'text-red-500'      
};

const EXERCISES = [
    { id: 'spider_walk_v1', label: 'Caminhada da Aranha', icon: '🕷️', desc: 'Metodologia Renan Serpa: Nível 1' },
    { id: 'thumb_jump', label: 'Salto do Polegar', icon: '👍', desc: 'Foco no Dedo P (Mão Direita)' },
    { id: 'seven_nation_army', label: 'Riff: Seven Nation', icon: '🎸', desc: 'Seu primeiro Riff de Rock!' }
];

const DIFFICULTY_CONFIG = [
    { id: 'beginner', label: 'Iniciante', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { id: 'intermediate', label: 'Intermediário', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { id: 'pro', label: 'Avançado', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' }
];

export default function TechniqueGym({ lessonBpm = 100 }) {
    const { student } = useCurrentStudent();
    const [type, setType] = useState<keyof typeof RENAN_SERPA_TABS>('spider_walk_v1');
    const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
    const [isTraining, setIsTraining] = useState(false);
    const [loopCount, setLoopCount] = useState(0);
    const [highlightedNote, setHighlightedNote] = useState<any>(null);
    const [errorStreak, setErrorStreak] = useState(0);
    const [activeTip, setActiveTip] = useState<string | null>(null);

    const apiRef = useRef<any>(null);

    // ANALISTA MAESTRO: Detecta se o aluno está afinado e no tempo com a precisão do nível selecionado
    const analyst = useAudioAnalyst(isTraining, highlightedNote?.fret, difficulty);

    useEffect(() => {
        // Biofeedback reativo à detecção
        if (isTraining && analyst.isDetected) {
            if (!analyst.isInTune) {
                haptics.tick();
                if (difficulty === 'pro') haptics.error();
            } else {
                setErrorStreak(0);
            }
        }
    }, [analyst.isInTune, analyst.isDetected, isTraining, difficulty]);

    const toggleTraining = () => {
        if (!apiRef.current) return;
        apiRef.current.player.playPause();
        setIsTraining(!isTraining);
        haptics.medium();
    };

    const handleDifficultyChange = (level: DifficultyLevel) => {
        setDifficulty(level);
        haptics.heavy();
        notify.info(`Dificuldade alterada para: ${level.toUpperCase()}`);
    };

    const handleReady = (api: any) => {
        apiRef.current = api;
        
        if (lessonBpm) {
            api.playbackSpeed = lessonBpm / 100;
        }

        api.playerFinished.on(() => {
            setLoopCount(c => c + 1);
            haptics.success();
            if (isTraining) api.player.play();
            
            if (loopCount === 4 && student) {
                 notify.success("BADGE DESBLOQUEADA: O Domador de Aranhas! 🕷️✨");
                 applyXpEvent({
                    studentId: student.id,
                    eventType: 'MISSION_COMPLETE',
                    xpAmount: 100,
                    contextType: 'tools',
                    schoolId: student.school_id || ""
                 });
            }
        });

        api.noteHit.on((note: any) => {
            setErrorStreak(0);
            setActiveTip(null);
            setHighlightedNote(note);
        });

        api.noteMiss.on(() => {
            const newStreak = errorStreak + 1;
            setErrorStreak(newStreak);
            haptics.error();

            if (newStreak >= 3) {
                const msg = difficulty === 'pro' 
                    ? "Foco total! No modo Avançado não permitimos instabilidade." 
                    : "Relaxe o polegar atrás do braço do violão! Isso ajuda na subida.";
                setActiveTip(msg);
            }
        });
    };

    const getFingerInfo = (fret: number) => {
        if (type !== 'spider_walk_v1') return null;
        if (fret >= 1 && fret <= 4) return { id: fret, color: FINGER_COLORS[fret] };
        return null;
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-32 animate-in fade-in duration-700">
            <MaestroLiveTip message={activeTip} type={difficulty === 'pro' ? 'warning' : 'info'} />

            <header className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-500">
                        <Dumbbell size={24} />
                        <span className="text-[12px] font-black uppercase tracking-[0.4em]">RedHouse Technical Lab</span>
                    </div>
                    <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-none italic">Technique Gym</h2>
                </div>
                
                {/* DUAL SELECTOR: BPM + DIFFICULTY */}
                <div className="flex gap-4 items-center">
                    <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
                        {DIFFICULTY_CONFIG.map(lvl => (
                            <button
                                key={lvl.id}
                                onClick={() => handleDifficultyChange(lvl.id as DifficultyLevel)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                    difficulty === lvl.id ? cn(lvl.bg, lvl.color, "shadow-lg border border-white/10") : "text-slate-600 hover:text-slate-400"
                                )}
                            >
                                {lvl.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex bg-slate-900/60 p-2 rounded-[28px] border border-white/10 backdrop-blur-2xl shadow-2xl">
                        <div className="px-6 py-1 border-r border-white/5 flex flex-col items-center">
                            <p className="text-[8px] font-black text-slate-500 uppercase">Target BPM</p>
                            <p className="text-2xl font-black text-white font-mono leading-none">{lessonBpm}</p>
                        </div>
                        <button 
                            onClick={toggleTraining}
                            className={cn(
                                "px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ml-3 flex items-center gap-2 shadow-xl",
                                isTraining ? "bg-rose-600 text-white animate-pulse" : "bg-emerald-600 text-white"
                            )}
                        >
                            {isTraining ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                            {isTraining ? "PAUSAR" : "INICIAR"}
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <main className="lg:col-span-9 space-y-8">
                    <TablatureView 
                        alphaTex={RENAN_SERPA_TABS[type]} 
                        isTvMode={true}
                        onReady={handleReady}
                        onNoteHighlight={setHighlightedNote}
                    />
                    
                    <div className="relative group">
                        {/* Indicador de Precisão Live (Sobreposto ao Fretboard) */}
                        <div className="absolute -top-10 right-4 flex items-center gap-3 z-50">
                            <div className={cn(
                                "px-4 py-1.5 rounded-full border-2 text-[9px] font-black uppercase flex items-center gap-2 transition-all duration-300",
                                analyst.isDetected 
                                    ? (analyst.isInTune ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-red-500/20 border-red-500 text-red-400")
                                    : "bg-slate-900 border-white/5 text-slate-600"
                            )}>
                                <Activity size={12} className={cn(analyst.isDetected && "animate-pulse")} />
                                {analyst.isDetected ? (analyst.isInTune ? 'PITCH MATCH' : 'PITCH ERROR') : 'OUVINDO...'}
                            </div>
                        </div>

                        <Fretboard 
                            rootKey="E" 
                            detectedNoteIdx={analyst.isDetected ? analyst.noteIdx : null} 
                            className={cn(
                                "opacity-95 transition-all duration-500 border-2",
                                analyst.isDetected && !analyst.isInTune ? "border-red-500/40 shadow-red-500/20" : "border-white/5",
                                difficulty === 'pro' && "ring-4 ring-purple-500/10"
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="bg-slate-950 border-slate-800 p-10 rounded-[48px] shadow-2xl flex flex-col items-center text-center group">
                            <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] mb-6">Mapa de Dedos</p>
                            <div className={cn(
                                "text-7xl font-black transition-all duration-500 drop-shadow-xl",
                                highlightedNote ? (getFingerInfo(highlightedNote.fret)?.color || "text-slate-800") : "text-slate-800"
                            )}>
                                {highlightedNote && getFingerInfo(highlightedNote.fret) ? `DEDO ${highlightedNote.fret}` : "--"}
                            </div>
                        </Card>

                        <Card className="bg-slate-950 border-slate-800 p-10 rounded-[48px] shadow-2xl flex flex-col items-center text-center justify-center gap-6 relative overflow-hidden">
                             <div className={cn("w-20 h-20 rounded-[32px] flex items-center justify-center transition-colors", analyst.isInTune ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400")}>
                                <Gauge size={40} />
                             </div>
                             <div className="relative z-10">
                                <h4 className="text-lg font-black text-white uppercase tracking-tight italic">
                                    {analyst.isInTune ? "Sincronia Mestra" : "Ajuste Necessário"}
                                </h4>
                                <p className="text-sm text-slate-400 leading-relaxed mt-3 italic font-medium">
                                    {analyst.isDetected 
                                        ? (analyst.isInTune ? "Precisão impecável! Continue no fluxo." : `Nota levemente ${analyst.cents > 0 ? 'alta' : 'baixa'}. Relaxe os ombros.`) 
                                        : "O Maestro está ouvindo sua execução... Digite seu melhor som."}
                                </p>
                             </div>
                             {difficulty === 'pro' && (
                                <div className="absolute top-4 right-4 animate-pulse">
                                    <ShieldCheck size={20} className="text-purple-500" />
                                </div>
                             )}
                        </Card>
                    </div>
                </main>

                <aside className="lg:col-span-3 space-y-6">
                    <Card className="bg-slate-900 border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
                        <CardHeader className="bg-slate-950/60 p-8 border-b border-white/5">
                            <CardTitle className="text-[11px] uppercase tracking-[0.4em] text-slate-500">Módulos Sugeridos</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {EXERCISES.map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => { setType(g.id as any); setLoopCount(0); setErrorStreak(0); haptics.light(); }}
                                    className={cn(
                                        "w-full p-6 rounded-3xl border-2 transition-all text-left",
                                        type === g.id 
                                            ? "bg-rose-500/10 border-rose-500 text-rose-400 shadow-xl" 
                                            : "bg-slate-950 border-transparent text-slate-500 hover:bg-slate-900"
                                    )}
                                >
                                    <span className="text-sm font-black uppercase tracking-tight block">{g.icon} {g.label}</span>
                                    <p className="text-[9px] opacity-60 font-bold uppercase tracking-widest mt-1">{g.desc}</p>
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}
