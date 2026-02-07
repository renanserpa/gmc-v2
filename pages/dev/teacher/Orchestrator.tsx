
import React, { useState, useEffect, useRef } from 'react';
import { 
    Zap, Eraser, Piano as PianoIcon, Guitar as GuitarIcon,
    Ear, FastForward, Check, RotateCcw, Monitor,
    Sparkles, Gauge, Target, Users, Play, Square,
    ThumbsUp, ChevronLeft, ChevronRight, Music,
    Flame, AlertCircle, Info, Trophy, Heart, BookOpen,
    Save, LogOut, Crosshair
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card.tsx';
import { UserAvatar } from '../../../components/ui/UserAvatar.tsx';
import { useMaestro } from '../../../contexts/MaestroContext.tsx';
import { classroomService } from '../../../services/classroomService.ts';
import { applyXpEvent } from '../../../services/gamificationService.ts';
import { haptics } from '../../../lib/haptics.ts';
import { cn } from '../../../lib/utils.ts';
import { getNoteName, getScaleNotes, NOTES_CHROMATIC } from '../../../lib/theoryEngine.ts';
import { PianoBoard } from '../../../components/instruments/PianoBoard.tsx';
import { GuitarBoard } from '../../../components/instruments/GuitarBoard.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { notify } from '../../../lib/notification.ts';
import { getStudentsInClass } from '../../../services/dataService.ts';
import { LessonSummaryModal } from '../../../components/dashboard/LessonSummaryModal.tsx';

const MOCK_SCALES = [
    { id: 'major', label: 'Maior' },
    { id: 'minor', label: 'Menor' },
    { id: 'pentatonic_major', label: 'Penta Maior' },
    { id: 'pentatonic_minor', label: 'Penta Menor' }
];

export default function Orchestrator() {
    const { 
        metronome, activeSession, lessonScript, 
        currentStepIdx, nextStep, prevStep, sendTVCommand 
    } = useMaestro();
    
    const [selectedInstrument, setSelectedInstrument] = useState<'guitar' | 'piano'>('guitar');
    const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
    const [students, setStudents] = useState<any[]>([]);
    const [showSummary, setShowSummary] = useState(false);
    
    // Book Marker Logic
    const touchpadRef = useRef<HTMLDivElement>(null);
    const [isBookMode, setIsBookMode] = useState(false);
    // FIX: Defined 'markerPos' state to resolve "Cannot find name 'markerPos'" error
    const [markerPos, setMarkerPos] = useState({ x: 50, y: 50 });

    useEffect(() => {
        if (activeSession.classId) {
            getStudentsInClass(activeSession.classId).then(setStudents);
        }
    }, [activeSession.classId]);

    const handleTouchpadMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!touchpadRef.current) return;
        const rect = touchpadRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        
        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;

        // FIX: Update local 'markerPos' state for visual feedback in Orchestrator
        setMarkerPos({ x, y });
        sendTVCommand({
            type: 'BOOK_MARKER_MOVE',
            payload: { x, y }
        });
    };

    const toggleBookMode = () => {
        const next = !isBookMode;
        setIsBookMode(next);
        haptics.medium();
        
        const currentStep = lessonScript[currentStepIdx];
        if (next && currentStep.config?.bookImageUrl) {
            sendTVCommand({
                type: 'BOOK_PAGE_VIEW',
                payload: { url: currentStep.config.bookImageUrl, page: currentStep.config.bookPage }
            });
        } else {
            sendTVCommand({ type: 'EXIT_VIDEO' });
        }
    };

    const triggerSticker = (type: string, label: string) => {
        haptics.fever();
        sendTVCommand({
            type: 'COMMAND_STICKER',
            payload: { type, label }
        });
    };

    const handleQuickEval = async (student: any, rating: 'mastered' | 'progressing') => {
        haptics.success();
        const xp = rating === 'mastered' ? 50 : 20;
        const msg = rating === 'mastered' ? 'DOMINOU!' : 'MUITO BEM!';
        
        await applyXpEvent({
            studentId: student.id,
            eventType: 'LIVE_EVALUATION',
            xpAmount: xp,
            schoolId: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
        });

        sendTVCommand({
            type: 'STUDENT_SHOUTOUT',
            payload: { name: student.name, avatar: student.avatar_url, message: msg }
        });
    };

    return (
        <div className="max-w-full mx-auto space-y-6 pb-40 animate-in fade-in duration-700 font-sans h-screen flex flex-col">
            
            <header className="flex justify-between items-center bg-slate-900 p-6 rounded-3xl border border-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-sky-600 rounded-2xl text-white"><Monitor size={20} /></div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase italic">{activeSession.className || 'Sessão Offline'}</h2>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Orquestrador Maestro v8.5</p>
                    </div>
                </div>
                <Button 
                    onClick={() => setShowSummary(true)} 
                    variant="danger" 
                    className="rounded-2xl px-8 h-14 bg-red-600 font-black uppercase text-xs"
                    leftIcon={LogOut}
                >
                    Finalizar Aula
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                
                {/* COLUNA 1: METRÔNOMO & WORKBOOK */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="bg-slate-900 border-white/5 p-8 rounded-[48px] h-full flex flex-col justify-between">
                        <div className="space-y-8">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">BPM Master</p>
                                <p className="text-7xl font-black text-white font-mono">{metronome.bpm}</p>
                                <input 
                                    type="range" min="40" max="220" value={metronome.bpm} 
                                    onChange={(e) => metronome.setBpm(Number(e.target.value))}
                                    className="w-full mt-6 h-2 accent-sky-500 bg-slate-800 rounded-full appearance-none cursor-pointer"
                                />
                            </div>

                            <Button 
                                onClick={metronome.toggle}
                                className={cn("w-full h-20 rounded-3xl text-white font-black", metronome.isPlaying ? "bg-rose-600 animate-pulse" : "bg-emerald-600")}
                            >
                                {metronome.isPlaying ? <Square size={32} fill="white"/> : <Play size={32} fill="white"/>}
                            </Button>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <button 
                                onClick={toggleBookMode}
                                className={cn(
                                    "w-full py-6 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all shadow-xl",
                                    isBookMode ? "bg-purple-600 border-white text-white" : "bg-slate-950 border-white/5 text-slate-500"
                                )}
                            >
                                <BookOpen size={24} />
                                <span className="text-[10px] font-black uppercase tracking-widest">📖 Ver Apostila na TV</span>
                            </button>
                        </div>
                    </Card>
                </div>

                {/* COLUNA 2: TOUCHPAD & INSTRUMENTO */}
                <div className="lg:col-span-6">
                    <Card className="h-full bg-[#050810] border border-white/5 rounded-[64px] p-8 flex flex-col">
                        {isBookMode ? (
                            <div className="flex-1 flex flex-col">
                                <div className="flex items-center gap-3 mb-6">
                                    <Crosshair size={20} className="text-sky-400" />
                                    <h3 className="text-lg font-black text-white uppercase italic">Touchpad de Foco (HDMI)</h3>
                                </div>
                                <div 
                                    ref={touchpadRef}
                                    onMouseMove={handleTouchpadMove}
                                    onTouchMove={handleTouchpadMove}
                                    className="flex-1 bg-slate-900/50 rounded-[48px] border-4 border-dashed border-sky-500/20 relative cursor-crosshair overflow-hidden group"
                                >
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                         <BookOpen size={120} className="text-white" />
                                    </div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Arraste para mover o marcador neon na TV</p>
                                    </div>
                                    {/* Guia visual do cursor no tablet */}
                                    <div 
                                        className="absolute w-12 h-12 rounded-full border-2 border-sky-400 bg-sky-400/20 pointer-events-none"
                                        style={{ left: `${markerPos.x}%`, top: `${markerPos.y}%`, marginLeft: '-24px', marginTop: '-24px' }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center scale-110">
                                <GuitarBoard 
                                    selectedNotes={selectedNotes} 
                                    onNoteToggle={(s, f) => {
                                        const key = `${s}-${f}`;
                                        const next = new Set(selectedNotes);
                                        if (next.has(key)) next.delete(key);
                                        else next.add(key);
                                        setSelectedNotes(next);
                                        sendTVCommand({ type: 'FRETBOARD_UPDATE', payload: { notes: Array.from(next) } });
                                    }} 
                                />
                            </div>
                        )}
                    </Card>
                </div>

                {/* COLUNA 3: STICKERS & SCRIPT */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="bg-slate-900 border-white/5 p-6 rounded-[48px] shadow-2xl">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 px-2">Comandos HDMI</p>
                         <div className="grid grid-cols-2 gap-3">
                             {[
                                 { id: 'attention', label: 'Escutar', color: 'bg-rose-600' },
                                 { id: 'energy', label: 'Energia', color: 'bg-amber-500' },
                                 { id: 'celebrate', label: 'Celebrar', color: 'bg-emerald-500' },
                                 { id: 'focus', label: 'Foco', color: 'bg-sky-500' }
                             ].map(s => (
                                 <button 
                                    key={s.id}
                                    onClick={() => triggerSticker(s.id, s.label)}
                                    className={cn("aspect-square rounded-3xl flex flex-col items-center justify-center gap-2 text-white font-black text-[10px] uppercase transition-all hover:scale-105 active:scale-95 shadow-xl", s.color)}
                                 >
                                    <Zap size={20} fill="white" />
                                    {s.label}
                                 </button>
                             ))}
                         </div>
                    </Card>

                    <Card className="flex-1 bg-slate-950 border border-white/5 rounded-[48px] p-6 overflow-y-auto custom-scrollbar">
                         <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 px-2">Músicos na Aula</p>
                         <div className="space-y-3">
                             {students.map(s => (
                                 <div key={s.id} className="bg-slate-900 p-4 rounded-[28px] border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar src={s.avatar_url} name={s.name} size="sm" />
                                        <span className="text-[10px] font-black text-white uppercase">{s.name.split(' ')[0]}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleQuickEval(s, 'mastered')} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"><Check size={14}/></button>
                                        <button onClick={() => handleQuickEval(s, 'progressing')} className="p-2 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white transition-all"><Zap size={14}/></button>
                                    </div>
                                 </div>
                             ))}
                         </div>
                    </Card>
                </div>
            </div>

            {/* WORKBOOK NAVIGATOR */}
            <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-7xl px-6 z-[100]">
                <div className="bg-slate-900/90 backdrop-blur-3xl border-4 border-white/10 p-4 rounded-[40px] shadow-2xl flex items-center justify-between">
                    <div className="flex items-center gap-6 pl-4">
                        <div className="bg-sky-600 p-3 rounded-2xl text-white shadow-lg"><BookOpen size={24} /></div>
                        <div>
                            <span className="text-[10px] font-black text-sky-400 uppercase tracking-[0.4em] block">Workbook Navigator</span>
                            <h4 className="text-xl font-black text-white uppercase italic tracking-tight">{lessonScript[currentStepIdx].title}</h4>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pr-2">
                        <Button variant="ghost" disabled={currentStepIdx === 0} onClick={prevStep} className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/5"><ChevronLeft/></Button>
                        <div className="flex gap-2">
                            {lessonScript.map((_, i) => (
                                <div key={i} className={cn("h-1.5 rounded-full transition-all", i === currentStepIdx ? "w-8 bg-sky-500 shadow-[0_0_10px_#0ea5e9]" : "w-1.5 bg-slate-700")} />
                            ))}
                        </div>
                        <Button disabled={currentStepIdx === lessonScript.length - 1} onClick={nextStep} className="h-16 px-10 rounded-2xl bg-sky-600 font-black uppercase text-xs">PRÓXIMO PASSO</Button>
                    </div>
                </div>
            </footer>

            <LessonSummaryModal 
                isOpen={showSummary} 
                onClose={() => setShowSummary(false)} 
                session={activeSession}
                students={students}
            />
        </div>
    );
}
