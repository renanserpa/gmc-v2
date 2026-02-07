
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Sparkles, Trophy, 
    Music, Timer, Triangle, 
    CheckCircle2, AlertTriangle, Radio,
    Ear, Ghost, Clock, FastForward,
    Star, ThumbsUp, Piano as PianoIcon, PlayCircle,
    Guitar as GuitarIcon, Target, Headphones, Square,
    BookOpen
} from 'lucide-react';
import ReactPlayer from 'react-player';
import { classroomService } from '../services/classroomService.ts';
import { cn } from '../lib/utils.ts'; 
import { getNoteName } from '../lib/theoryEngine.ts';
import { PianoBoard } from '../components/instruments/PianoBoard.tsx';
import confetti from 'canvas-confetti';
import * as RRD from 'react-router-dom';
const { useSearchParams } = RRD as any;

const M = motion as any;

const STICKER_ICONS: Record<string, any> = {
    attention: Ear,
    energy: Zap,
    rock: Music,
    focus: Target,
    celebrate: Sparkles,
    stop: Square
};

export default function ClassroomMode() {
    const [searchParams] = useSearchParams();
    const classId = useMemo(() => searchParams.get('classId'), [searchParams]);
    
    const [bpm, setBpm] = useState(120);
    const [isPulseActive, setIsPulseActive] = useState(false);
    const [measure, setMeasure] = useState(0);
    const [beatPulse, setBeatPulse] = useState(false);
    const [selectedGuitarNotes, setSelectedGuitarNotes] = useState<string[]>([]);
    const [selectedPianoNotes, setSelectedPianoNotes] = useState<string[]>([]);
    const [activeInstrument, setActiveInstrument] = useState<'guitar' | 'piano'>('guitar');
    
    // Estados de Conteúdo
    const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
    const [bookView, setBookView] = useState<{ url: string, page: number } | null>(null);
    const [markerPos, setMarkerPos] = useState({ x: 50, y: 50 });
    const [sticker, setSticker] = useState<any | null>(null);
    const [shoutout, setShoutout] = useState<any | null>(null);

    useEffect(() => {
        if (!classId) return;

        const unsubscribe = classroomService.subscribeToCommands(classId, (cmd) => {
            switch (cmd.type) {
                case 'MEASURE_TICK':
                    setMeasure(cmd.payload.measure);
                    setBeatPulse(true);
                    setTimeout(() => setBeatPulse(false), 200);
                    break;
                case 'SET_BPM':
                    setBpm(cmd.payload.bpm);
                    break;
                case 'COMMAND_STICKER':
                    setSticker(cmd.payload);
                    if (cmd.payload.type === 'celebrate') {
                        confetti({ particleCount: 200, spread: 80, origin: { y: 0.5 } });
                    }
                    setTimeout(() => setSticker(null), 3000);
                    break;
                case 'STUDENT_SHOUTOUT':
                    setShoutout(cmd.payload);
                    confetti({ particleCount: 150, spread: 70, origin: { y: 0.8 } });
                    setTimeout(() => setShoutout(null), 6000);
                    break;
                case 'VIDEO_FOCUS':
                    setActiveVideoUrl(cmd.payload.url);
                    setBookView(null);
                    break;
                case 'BOOK_PAGE_VIEW':
                    setBookView(cmd.payload);
                    setActiveVideoUrl(null);
                    break;
                case 'BOOK_MARKER_MOVE':
                    setMarkerPos(cmd.payload);
                    break;
                case 'EXIT_VIDEO':
                    setActiveVideoUrl(null);
                    setBookView(null);
                    break;
                case 'FRETBOARD_UPDATE':
                    setActiveInstrument('guitar');
                    setSelectedGuitarNotes(cmd.payload?.notes || []);
                    break;
                case 'PIANO_UPDATE':
                    setActiveInstrument('piano');
                    setSelectedPianoNotes(cmd.payload?.notes || []);
                    break;
                case 'PLAY':
                    setIsPulseActive(true);
                    break;
                case 'PAUSE':
                    setIsPulseActive(false);
                    break;
            }
        });

        return () => unsubscribe();
    }, [classId]);

    if (!classId) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-20 text-center">
            <AlertTriangle size={80} className="text-red-500 mb-8" />
            <h1 className="text-4xl font-black text-white uppercase italic">Sincronia HDMI Exigida</h1>
            <p className="text-slate-500 mt-4 uppercase font-black text-xs">Aguardando ID da Turma...</p>
        </div>
    );

    const isCinemaMode = !!activeVideoUrl || !!bookView;

    return (
        <div className={cn(
            "min-h-screen bg-[#02040a] flex flex-col items-center justify-center p-16 overflow-hidden relative transition-all duration-1000",
            beatPulse && "ring-[20px] ring-sky-500/20"
        )}>
            {/* FULLSCREEN VIDEO PLAYER (CINEMA MODE) */}
            <AnimatePresence>
                {activeVideoUrl && (
                    <M.div 
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-[1000] bg-black"
                    >
                        <ReactPlayer url={activeVideoUrl} width="100%" height="100%" playing controls />
                    </M.div>
                )}
            </AnimatePresence>

            {/* APOSTILA MODE (BOOK VIEW) */}
            <AnimatePresence>
                {bookView && (
                    <M.div 
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -100 }}
                        className="fixed inset-0 z-[900] bg-[#111] flex items-center justify-center p-20"
                    >
                        <div className="relative w-full h-full max-w-6xl bg-white rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden border-8 border-slate-800">
                            <img src={bookView.url} className="w-full h-full object-contain" alt="Book Page" />
                            
                            {/* Marcador Neon Draggable do Professor */}
                            <M.div 
                                animate={{ left: `${markerPos.x}%`, top: `${markerPos.y}%` }}
                                className="absolute w-24 h-24 -ml-12 -mt-12 rounded-full border-8 border-sky-500 shadow-[0_0_50px_#0ea5e9] flex items-center justify-center mix-blend-difference pointer-events-none"
                            >
                                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                            </M.div>

                            <div className="absolute bottom-8 left-8 bg-slate-900/80 px-6 py-2 rounded-full border border-white/20 text-white font-black uppercase text-xs">
                                Página 0{bookView.page}
                            </div>
                        </div>
                    </M.div>
                )}
            </AnimatePresence>

            {/* MEASURE COUNTER GIGANTE (Hides in Cinema) */}
            {!isCinemaMode && (
                <div className="absolute top-20 right-24 text-right">
                    <span className="text-4xl font-black text-slate-700 uppercase tracking-[0.5em] block mb-2">Compasso</span>
                    <span className="text-[15rem] font-black text-white leading-none font-mono tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        {measure + 1}
                    </span>
                </div>
            )}

            {/* INSTRUMENTO ESPELHADO */}
            <M.main 
                animate={{ 
                    scale: isCinemaMode ? 0.8 : 1, 
                    opacity: isCinemaMode ? 0.3 : 1,
                    y: isCinemaMode ? 500 : 0
                }}
                className="w-full max-w-7xl relative z-10 transition-all duration-1000"
            >
                <div className="flex items-center gap-12 mb-16">
                    <div className="p-8 bg-slate-900 border-4 border-sky-500 rounded-[40px] text-sky-400">
                        <Timer size={100} className={cn(isPulseActive && "animate-spin-slow")} />
                    </div>
                    <div>
                        <span className="text-4xl font-black text-slate-500 uppercase tracking-widest block">Ritmo Mestre</span>
                        <span className="text-[12rem] font-black text-white font-mono leading-none tracking-tighter">{bpm}</span>
                    </div>
                </div>

                {activeInstrument === 'guitar' ? (
                    <div className="w-full bg-[#0a0f1d]/90 backdrop-blur-xl border-4 border-white/5 rounded-[100px] p-24 shadow-2xl relative">
                         <div className="h-96 flex flex-col justify-between relative">
                            {[1,2,3,4,5,6].map(s => <div key={s} className="h-1 bg-slate-800 w-full" />)}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <GuitarIcon size={200} className="text-white/5" />
                            </div>
                            {selectedGuitarNotes.map((n, i) => (
                                <M.div 
                                    key={i} 
                                    initial={{ scale: 0 }} animate={{ scale: 1.5 }}
                                    className="absolute w-20 h-20 bg-sky-500 rounded-full border-4 border-white shadow-[0_0_50px_#38bdf8] flex items-center justify-center text-white text-3xl font-black"
                                    style={{ left: `${(i+1)*15}%`, top: `${(i%6)*15}%` }}
                                >
                                    {n}
                                </M.div>
                            ))}
                         </div>
                    </div>
                ) : (
                    <div className="w-full transform scale-[1.8] origin-center py-40">
                        <PianoBoard activeNotes={selectedPianoNotes} interactive={false} />
                    </div>
                )}
            </M.main>

            {/* OVERLAYS CONSTANTES (Stickers & Shoutouts) */}
            <AnimatePresence>
                {sticker && (
                    <M.div 
                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }} 
                        animate={{ opacity: 1, scale: 1, rotate: 0 }} 
                        exit={{ opacity: 0, scale: 1.5, rotate: 10 }}
                        className="fixed inset-0 z-[2000] flex flex-col items-center justify-center backdrop-blur-3xl bg-black/40"
                    >
                        <div className={cn(
                            "w-[600px] h-[600px] rounded-[120px] flex flex-col items-center justify-center shadow-2xl border-[16px] border-white ring-[40px] ring-black/20",
                            sticker.type === 'attention' ? "bg-rose-600" : 
                            sticker.type === 'energy' ? "bg-amber-500" : 
                            sticker.type === 'rock' ? "bg-purple-600" :
                            "bg-sky-600"
                        )}>
                            {React.createElement(STICKER_ICONS[sticker.type] || Zap, { size: 300, className: "text-white" })}
                            <h2 className="text-9xl font-black text-white uppercase italic tracking-tighter mt-10 drop-shadow-2xl">{sticker.label}!</h2>
                        </div>
                    </M.div>
                )}
            </AnimatePresence>

            {/* NPC Lucca Shoutouts */}
            <AnimatePresence>
                {shoutout && (
                    <M.div 
                        initial={{ x: -1000, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -1000, opacity: 0 }}
                        className="absolute bottom-24 left-24 z-[1500] flex items-center gap-10 bg-[#0a0f1d] p-12 rounded-[80px] border-8 border-sky-500 shadow-2xl backdrop-blur-3xl"
                    >
                        <img src={shoutout.avatar} className="w-48 h-48 rounded-[64px] border-4 border-white shadow-2xl" />
                        <div className="max-w-xl">
                            <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter mb-4">{shoutout.name}!</h2>
                            <p className="text-5xl font-bold text-sky-400 uppercase leading-tight italic">"{shoutout.message}"</p>
                        </div>
                    </M.div>
                )}
            </AnimatePresence>

            <footer className="absolute bottom-16 left-20 right-20 flex justify-between items-center z-[100]">
                 <div className="flex items-center gap-6 bg-black/80 px-12 py-8 rounded-full border-4 border-white/10 backdrop-blur-xl shadow-2xl">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_30px_#10b981]" />
                    <span className="text-xl font-black text-slate-400 uppercase tracking-[0.6em]">SINC-HUD v8.5 • HDMI MASTERED</span>
                 </div>
            </footer>
        </div>
    );
}
