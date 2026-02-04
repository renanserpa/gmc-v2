
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Monitor, Zap, Sparkles, Trophy, 
    Heart, Music, Timer, Triangle, 
    CheckCircle2, AlertTriangle, Radio,
    Star, ThumbsUp, Piano, Layers, PlayCircle, FileText,
    Guitar, Activity, ChevronRight, Gauge, X, Check
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
    const [isPulseActive, setIsPulseActive] = useState(false);
    const [selectedGuitarNotes, setSelectedGuitarNotes] = useState<string[]>([]);
    const [selectedPianoNotes, setSelectedPianoNotes] = useState<string[]>([]);
    const [activeInstrument, setActiveInstrument] = useState<'guitar' | 'piano'>('guitar');
    const [currentBeat, setCurrentBeat] = useState(1);
    
    // Narrativa & Feedback
    const [shoutout, setShoutout] = useState<any | null>(null);
    const [quizResult, setQuizResult] = useState<'success' | 'fail' | null>(null);

    const beatIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (!classId) return;

        const unsubscribe = classroomService.subscribeToCommands(classId, (cmd) => {
            switch (cmd.type) {
                case 'PLAY':
                    setBpm(cmd.payload?.bpm || 120);
                    setIsPulseActive(true);
                    break;
                case 'PAUSE':
                    setIsPulseActive(false);
                    break;
                case 'FRETBOARD_UPDATE':
                    setActiveInstrument('guitar');
                    setSelectedGuitarNotes(cmd.payload?.notes || []);
                    break;
                case 'PIANO_UPDATE':
                    setActiveInstrument('piano');
                    setSelectedPianoNotes(cmd.payload?.notes || []);
                    break;
                case 'STUDENT_SHOUTOUT':
                    triggerShoutout(cmd.payload);
                    break;
                case 'QUIZ_FEEDBACK':
                    triggerQuizFeedback(cmd.payload.success);
                    break;
            }
        });

        return () => unsubscribe();
    }, [classId]);

    const triggerShoutout = (data: any) => {
        setShoutout(data);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.8 }, colors: ['#38bdf8', '#a78bfa'] });
        setTimeout(() => setShoutout(null), 8000);
    };

    const triggerQuizFeedback = (success: boolean) => {
        setQuizResult(success ? 'success' : 'fail');
        if (success) {
            confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 }, colors: ['#10b981', '#ffffff'] });
        }
        setTimeout(() => setQuizResult(null), 3000);
    };

    if (!classId) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-20 text-center"><AlertTriangle size={80} className="text-red-500 mb-8" /><h1 className="text-4xl font-black text-white uppercase italic">Sincronia Exigida</h1></div>;

    return (
        <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center p-16 overflow-hidden relative">
            
            {/* Background Narrative Ambient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03),transparent)]" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />

            {/* Quiz Feedback Overlay */}
            <AnimatePresence>
                {quizResult && (
                    <M.div 
                        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }}
                        className={cn(
                            "absolute inset-0 z-[300] flex flex-col items-center justify-center backdrop-blur-xl",
                            quizResult === 'success' ? "bg-emerald-500/10" : "bg-rose-500/10"
                        )}
                    >
                        <div className={cn(
                            "w-80 h-80 rounded-[80px] flex items-center justify-center shadow-2xl border-8",
                            quizResult === 'success' ? "bg-emerald-500 border-white" : "bg-rose-600 border-white"
                        )}>
                            {quizResult === 'success' ? <Check size={160} strokeWidth={4} className="text-white" /> : <X size={160} strokeWidth={4} className="text-white" />}
                        </div>
                        <h2 className="text-8xl font-black text-white uppercase italic tracking-tighter mt-12 drop-shadow-2xl">
                            {quizResult === 'success' ? 'PERFEITO!' : 'QUASE LÁ!'}
                        </h2>
                    </M.div>
                )}
            </AnimatePresence>

            {/* Instrument View */}
            <main className="w-full max-w-8xl relative z-10">
                {activeInstrument === 'guitar' ? (
                    <div className="w-full bg-[#0a0f1d]/80 backdrop-blur-xl border-4 border-white/5 rounded-[80px] p-20 shadow-2xl relative overflow-hidden">
                        <div className="flex flex-col gap-0 min-w-[1000px]">
                            {STRINGS_TUNING.map((rootNote, sIdx) => (
                                <div key={sIdx} className="h-24 flex items-center relative border-b-2 border-slate-800/50 last:border-0">
                                    <div className="w-24 flex items-center justify-center font-black text-slate-700 text-3xl border-r-2 border-slate-800 bg-slate-900/30">{STRING_LABELS[sIdx]}</div>
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
                    <div className="w-full transform scale-150 origin-center py-20">
                        <PianoBoard activeNotes={selectedPianoNotes} interactive={false} />
                    </div>
                )}
            </main>

            {/* Sticker de Alertas e Shoutouts (NPC LUCCA) */}
            <AnimatePresence>
                {shoutout && (
                    <M.div 
                        initial={{ x: -600, opacity: 0, rotate: -10 }} animate={{ x: 0, opacity: 1, rotate: 0 }} exit={{ x: -600, opacity: 0, rotate: 10 }}
                        className="absolute bottom-20 left-20 z-[200] flex items-center gap-10 bg-[#0a0f1d] p-10 rounded-[64px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-4 border-sky-500/50 backdrop-blur-3xl"
                    >
                        <div className="relative">
                            <div className="w-40 h-40 rounded-[48px] bg-sky-600 p-1 shadow-2xl overflow-hidden relative z-10">
                                <img src={shoutout.avatar} className="w-full h-full rounded-[40px] bg-slate-800" />
                            </div>
                            <div className="absolute -top-4 -right-4 bg-amber-500 text-white p-3 rounded-2xl shadow-xl z-20 animate-bounce">
                                <Star size={24} fill="currentColor" />
                            </div>
                        </div>
                        <div className="max-w-md">
                            <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-2">{shoutout.name}!</h2>
                            <p className="text-3xl font-bold text-sky-400 uppercase leading-tight italic">"{shoutout.message}"</p>
                        </div>
                    </M.div>
                )}
            </AnimatePresence>

            <footer className="absolute bottom-12 left-16 right-16 flex justify-between items-center z-[100]">
                 <div className="flex items-center gap-4 bg-black/60 px-8 py-4 rounded-full border border-white/10 backdrop-blur-xl">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">MAESTRO KERNEL v8.4 • NARRATIVA LUCCA ATIVA</span>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Apostila RedHouse Cuiabá</p>
                    <p className="text-sm font-black text-white uppercase italic">Sincronia Pedagógica Total</p>
                 </div>
            </footer>
        </div>
    );
}
