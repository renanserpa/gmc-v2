import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TablatureView } from './TablatureView';
import { Button } from '../ui/Button';
import { Fretboard } from './Fretboard';
import { Zap, Dumbbell, Play, Pause, TrendingUp, Award, Settings2, Sparkles, Target, Activity } from 'lucide-react';
import { RENAN_SERPA_TABS } from '../../lib/tabsStore';
import { haptics } from '../../lib/haptics';
import { notify } from '../../lib/notification';
import { applyXpEvent } from '../../services/gamificationService';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentStudent } from '../../hooks/useCurrentStudent';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { MaestroLiveTip } from './MaestroLiveTip';

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

export const TechniqueGym: React.FC<{ lessonBpm?: number }> = ({ lessonBpm }) => {
    const { user } = useAuth();
    const { student } = useCurrentStudent();
    const [type, setType] = useState<keyof typeof RENAN_SERPA_TABS>('spider_walk_v1');
    const [isTraining, setIsTraining] = useState(false);
    const [loopCount, setLoopCount] = useState(0);
    const [highlightedNote, setHighlightedNote] = useState<any>(null);
    const [errorStreak, setErrorStreak] = useState(0);
    const [activeTip, setActiveTip] = useState<string | null>(null);

    const apiRef = useRef<any>(null);

    const toggleTraining = () => {
        if (!apiRef.current) return;
        apiRef.current.player.playPause();
        setIsTraining(!isTraining);
        haptics.medium();
    };

    const handleReady = (api: any) => {
        apiRef.current = api;
        
        // Aplica BPM da lição se existir
        if (lessonBpm) {
            api.playbackSpeed = lessonBpm / 100; // AlphaTab usa multiplicador (100bpm = 1.0)
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

        // Monitoramento de Precisão (Telemetria RedHouse)
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
                setActiveTip("Relaxe o polegar atrás do braço do violão! Isso ajuda na subida.");
                haptics.fever();
            }
        });
    };

    const getFingerInfo = (fret: number) => {
        if (type !== 'spider_walk_v1') return null;
        if (fret >= 1 && fret <= 4) return { id: fret, color: FINGER_COLORS[fret] };
        return null;
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-32">
            <MaestroLiveTip message={activeTip} type="warning" />

            <header className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-500">
                        <Dumbbell size={24} />
                        <span className="text-[12px] font-black uppercase tracking-[0.4em]">RedHouse Technical Lab</span>
                    </div>
                    <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-none">Technique Gym</h2>
                </div>
                
                <div className="flex bg-slate-900/60 p-3 rounded-[32px] border border-white/10 backdrop-blur-2xl shadow-2xl">
                    <div className="px-8 py-2 border-r border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase text-center mb-1">Target BPM</p>
                        <p className="text-4xl font-black text-white font-mono text-center">{lessonBpm || 100}</p>
                    </div>
                    <button 
                        onClick={toggleTraining}
                        className={cn(
                            "px-12 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ml-4 flex items-center gap-3 shadow-xl",
                            isTraining ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
                        )}
                    >
                        {isTraining ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                        {isTraining ? "PAUSAR" : "INICIAR"}
                    </button>
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
                    
                    <div className="relative">
                        <Fretboard 
                            rootKey="E" 
                            detectedNoteIdx={highlightedNote?.fret} 
                            className={cn(
                                "opacity-95 transition-all duration-300 border-2",
                                errorStreak >= 3 ? "border-rose-500/50 shadow-rose-500/20" : "border-white/5"
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
                             <div className="w-20 h-20 bg-rose-500/10 rounded-[32px] flex items-center justify-center text-rose-400">
                                <Activity size={40} />
                             </div>
                             <div className="relative z-10">
                                <h4 className="text-lg font-black text-white uppercase tracking-tight italic">Feedback Lucca</h4>
                                <p className="text-sm text-slate-400 leading-relaxed mt-3 italic font-medium">
                                    {errorStreak >= 3 ? "Não aperte muito forte as cordas! Use apenas a pontinha dos dedos." : "Ótimo ritmo! Mantenha a mão em formato de concha."}
                                </p>
                             </div>
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
};