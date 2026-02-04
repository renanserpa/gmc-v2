
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Monitor, Zap, Sparkles, Trophy, 
    Heart, Music, Timer, Triangle, 
    CheckCircle2, AlertTriangle, Radio,
    Star, ThumbsUp, Piano, Layers, PlayCircle, FileText,
    Guitar, Activity, ChevronRight, Gauge
} from 'lucide-react';
import { classroomService } from '../services/classroomService.ts';
import { cn } from '../lib/utils.ts'; 
import { haptics } from '../lib/haptics.ts';
import { getNoteName } from '../lib/theoryEngine.ts';
import { PianoBoard } from '../components/instruments/PianoBoard.tsx';
import confetti from 'canvas-confetti';
import * as RRD from 'react-router-dom';
const { useSearchParams } = RRD as any;

const M = motion as any;

const STRINGS_TUNING = [4, 11, 7, 2, 9, 4];
const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'];

export default function ClassroomMode() {
    const [searchParams] = useSearchParams();
    const classId = useMemo(() => searchParams.get('classId'), [searchParams]);
    
    const [bpm, setBpm] = useState(120);
    const [measure, setMeasure] = useState(0);
    const [isProgressive, setIsProgressive] = useState(false);
    const [targetBpm, setTargetBpm] = useState(160);
    const [launchedContent, setLaunchedContent] = useState<any | null>(null);
    const [shoutout, setShoutout] = useState<any | null>(null);
    const [isPulseActive, setIsPulseActive] = useState(false);
    const [selectedGuitarNotes, setSelectedGuitarNotes] = useState<string[]>([]);
    const [selectedPianoNotes, setSelectedPianoNotes] = useState<string[]>([]);
    const [activeInstrument, setActiveInstrument] = useState<'guitar' | 'piano'>('guitar');
    const [currentBeat, setCurrentBeat] = useState(1);

    const beatIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (!classId) return;

        const unsubscribe = classroomService.subscribeToCommands(classId, (cmd) => {
            switch (cmd.type) {
                case 'PLAY':
                    setBpm(cmd.payload?.bpm || 120);
                    setMeasure(cmd.payload?.measure || 0);
                    setIsProgressive(cmd.payload?.progressive || false);
                    setTargetBpm(cmd.payload?.targetBpm || 160);
                    setIsPulseActive(true);
                    startLocalBeatSync(cmd.payload?.bpm || 120);
                    break;
                case 'PAUSE':
                    setIsPulseActive(false);
                    stopLocalBeatSync();
                    break;
                case 'FRETBOARD_UPDATE':
                    setActiveInstrument('guitar');
                    setSelectedGuitarNotes(cmd.payload?.notes || []);
                    break;
                case 'PIANO_UPDATE':
                    setActiveInstrument('piano');
                    setSelectedPianoNotes(cmd.payload?.notes || []);
                    break;
                case 'CONTENT_LAUNCH':
                    setLaunchedContent(cmd.payload);
                    break;
                case 'STUDENT_SHOUTOUT':
                    triggerShoutout(cmd.payload);
                    break;
                case 'END_SESSION':
                    window.location.reload();
                    break;
            }
        });

        return () => {
            unsubscribe();
            stopLocalBeatSync();
        };
    }, [classId]);

    const startLocalBeatSync = (newBpm: number) => {
        stopLocalBeatSync();
        const msPerBeat = 60000 / newBpm;
        beatIntervalRef.current = window.setInterval(() => {
            setCurrentBeat(prev => (prev % 4) + 1);
        }, msPerBeat);
    };

    const stopLocalBeatSync = () => {
        if (beatIntervalRef.current) clearInterval(beatIntervalRef.current);
        setCurrentBeat(1);
    };

    const triggerShoutout = (data: any) => {
        setShoutout(data);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.8 } });
        setTimeout(() => setShoutout(null), 8000);
    };

    const gaugePercentage = useMemo(() => {
        const min = 40;
        const max = 220;
        return ((bpm - min) / (max - min)) * 100;
    }, [bpm]);

    if (!classId) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-20 text-center"><AlertTriangle size={80} className="text-red-500 mb-8" /><h1 className="text-4xl font-black text-white uppercase italic">Sincronia Exigida</h1></div>;

    return (
        <div className={cn(
            "min-h-screen bg-[#02040a] flex flex-col items-center justify-center p-16 overflow-hidden relative transition-all duration-500",
            isPulseActive && currentBeat === 1 ? "shadow-[inset_0_0_150px_rgba(56,189,248,0.25)]" : ""
        )}>
            {/* Header HUD - Velocímetro de BPM */}
            <header className="absolute top-12 left-16 right-16 flex justify-between items-end z-[100]">
                 <div className="flex items-center gap-10">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-8 border-slate-900 flex items-center justify-center bg-slate-950 relative overflow-hidden">
                             <M.div 
                                className="absolute bottom-0 left-0 w-full bg-sky-500/20" 
                                animate={{ height: `${gaugePercentage}%` }}
                             />
                             <p className="text-4xl font-black text-white font-mono z-10">{bpm}</p>
                        </div>
                        <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest text-center mt-2">VELOCITY (BPM)</p>
                    </div>
                    <div>
                        <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Live <span className="text-sky-400">Class</span></h2>
                        <div className="flex items-center gap-3 mt-3">
                             <div className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", isProgressive ? "bg-amber-500 text-slate-950 animate-pulse" : "bg-slate-900 text-slate-500")}>
                                {isProgressive ? 'TREINO PROGRESSIVO ATIVO' : 'RITMO ESTÁVEL'}
                             </div>
                             {isProgressive && <p className="text-[10px] font-black text-slate-500 uppercase">TARGET: {targetBpm}</p>}
                        </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-16">
                    <div className="text-center">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Compassos</p>
                        <p className="text-8xl font-black text-white font-mono">{measure}</p>
                    </div>
                    <M.div 
                        animate={isPulseActive ? { scale: [1, 1.2, 1], borderColor: currentBeat === 1 ? '#38bdf8' : '#1e293b' } : {}}
                        className={cn("w-32 h-32 rounded-full border-[12px] flex items-center justify-center transition-all bg-slate-900/60 backdrop-blur-md", isPulseActive ? "shadow-[0_0_80px_rgba(56,189,248,0.2)]" : "opacity-20")}
                    >
                        <span className="text-4xl font-black text-white">{currentBeat}</span>
                    </M.div>
                 </div>
            </header>

            {/* Layout Principal da TV */}
            <main className="w-full max-w-8xl grid grid-cols-12 gap-16 relative z-10 pt-48">
                <div className="col-span-12 flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                        {launchedContent ? (
                            <M.div key="content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full bg-[#0a0f1d] border-4 border-white/5 rounded-[80px] p-20 shadow-2xl text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-purple-500" />
                                <div className="p-8 bg-purple-600 rounded-[40px] text-white w-fit mx-auto mb-10 shadow-2xl shadow-purple-900/40">
                                    {launchedContent.type === 'video' ? <PlayCircle size={80} /> : <FileText size={80} />}
                                </div>
                                <h3 className="text-7xl font-black text-white uppercase italic tracking-tighter leading-none">{launchedContent.title}</h3>
                                <p className="text-2xl text-slate-500 font-bold uppercase tracking-[0.3em] mt-6">Material Pedagógico Sincronizado</p>
                            </M.div>
                        ) : (
                            <M.div key="instruments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                                {activeInstrument === 'guitar' ? (
                                    <div className="w-full bg-[#0a0f1d]/80 backdrop-blur-xl border-4 border-white/5 rounded-[80px] p-16 shadow-2xl relative overflow-hidden">
                                        {/* Grid da Guitarra... */}
                                        <div className="flex flex-col gap-0 min-w-[1000px]">
                                            {STRINGS_TUNING.map((rootNote, sIdx) => (
                                                <div key={sIdx} className="h-24 flex items-center relative border-b-2 border-slate-800/50 last:border-0">
                                                    <div className="w-24 flex items-center justify-center font-black text-slate-700 text-2xl border-r-2 border-slate-800 bg-slate-900/30">{STRING_LABELS[sIdx]}</div>
                                                    {Array.from({ length: 13 }).map((_, fIdx) => {
                                                        const isSelected = selectedGuitarNotes.includes(`${sIdx}-${fIdx}`);
                                                        return (
                                                            <div key={fIdx} className={cn("flex-1 h-full border-r border-slate-800/30 flex items-center justify-center relative", fIdx === 0 && "border-r-8 border-slate-700")}>
                                                                <div className="absolute w-full h-[4px] bg-slate-800 z-0" />
                                                                <AnimatePresence>
                                                                    {isSelected && (
                                                                        <M.div initial={{ scale: 0 }} animate={{ scale: 1.2 }} exit={{ scale: 0 }} className="w-16 h-16 rounded-full bg-sky-500 border-4 border-white shadow-[0_0_30px_#38bdf8] flex items-center justify-center z-10">
                                                                            <span className="text-2xl font-black text-white">{getNoteName((rootNote + fIdx) % 12)}</span>
                                                                        </M.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full transform scale-125 origin-center">
                                        <PianoBoard activeNotes={selectedPianoNotes} interactive={false} />
                                    </div>
                                )}
                            </M.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Sticker de Alertas e Shoutouts */}
            <AnimatePresence>
                {shoutout && (
                    <M.div 
                        initial={{ x: -400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -400, opacity: 0 }}
                        className="absolute bottom-20 left-20 z-[200] flex items-center gap-6 bg-sky-600 p-8 rounded-[48px] shadow-[0_0_80px_rgba(56,189,248,0.4)] border-4 border-white"
                    >
                        <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-2xl overflow-hidden">
                            <img src={shoutout.avatar} className="w-full h-full rounded-2xl" />
                        </div>
                        <div className="text-white">
                            <h2 className="text-4xl font-black uppercase italic tracking-tighter">{shoutout.name}</h2>
                            <p className="text-xl font-bold uppercase opacity-90">{shoutout.message}</p>
                        </div>
                    </M.div>
                )}
            </AnimatePresence>

            <footer className="absolute bottom-12 left-16 right-16 flex justify-between items-center z-[100]">
                 <div className="flex items-center gap-4 bg-black/60 px-8 py-4 rounded-full border border-white/10 backdrop-blur-xl">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">MAESTRO KERNEL v8.3 • SINCRONIA DE BAIXA LATÊNCIA ATIVA</span>
                 </div>
                 <div className="flex items-center gap-12">
                     <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Protocolo</span>
                        <span className="text-xs font-black text-white uppercase italic">Sovereign-Realtime</span>
                     </div>
                 </div>
            </footer>
        </div>
    );
}
