
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Radio, Zap, Play, Square, Wand2, 
    Sparkles, Timer as TimerIcon, Users, ShieldCheck, 
    Trophy, Heart, Music, Send, Loader2,
    Monitor, MessageSquare, LayoutTemplate, Brain,
    LogOut, CheckCircle2, Eraser, Save, Star,
    Piano as PianoIcon, Guitar as GuitarIcon,
    FileText, Volume2, Pause, RotateCcw, X, Eye, 
    ChevronDown, BookMarked, History, Plus, 
    PlayCircle, Check, AlertCircle, Printer, BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { UserAvatar } from '../../../components/ui/UserAvatar.tsx';
import { useMaestro } from '../../../contexts/MaestroContext.tsx';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { 
    getStudentsInClass, 
    getLibraryItems, 
    saveLivePreset, 
    getLivePresets,
    saveFamilyReport,
    logClassSession 
} from '../../../services/dataService.ts';
import { classroomService } from '../../../services/classroomService.ts';
import { haptics } from '../../../lib/haptics.ts';
import { cn } from '../../../lib/utils.ts';
import { getNoteName } from '../../../lib/theoryEngine.ts';
import { PianoBoard } from '../../../components/instruments/PianoBoard.tsx';
import { notify } from '../../../lib/notification.ts';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;

const M = motion as any;

const STRINGS_TUNING = [4, 11, 7, 2, 9, 4];
const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'];

// Estrutura Pedagógica Olie
const CURRICULUM = [
    {
        id: 'mod1',
        title: 'Módulo 1: Fundamentos',
        lessons: [
            { id: 'l1', title: 'Aula 1: O Toque da Aranha', page: '5', video: 'https://vimeo.com/123456', activity: 'fretboard', notes: ['0-0', '1-0', '2-0'] },
            { id: 'l2', title: 'Aula 2: Ritmo do Elefante', page: '12', video: 'https://vimeo.com/789012', activity: 'piano', notes: ['C3', 'E3', 'G3'] },
            { id: 'l3', title: 'Aula 3: Acordes Amigos', page: '18', video: 'https://vimeo.com/345678', activity: 'fretboard', notes: ['3-1', '2-2', '0-3'] },
        ]
    },
    {
        id: 'mod2',
        title: 'Módulo 2: O Despertar',
        lessons: [
            { id: 'l4', title: 'Aula 4: Escala de Luz', page: '24', video: 'https://vimeo.com/901234', activity: 'piano', notes: ['C4', 'D4', 'E4', 'F4'] },
        ]
    }
];

const LUCCA_QUOTES = [
    "Mandou bem na palhetada! 🎸",
    "Essa nota soou limpa, mestre! ✨",
    "Estou ouvindo o progresso daqui! 🎧",
    "Ritmo de elefante nota 10! 🐘",
    "Você é um rockstar nato! 🤘",
    "Maestria total nessa escala! 🌟"
];

export default function Orchestrator() {
    const { metronome, activeSession } = useMaestro();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Core States
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInstrument, setSelectedInstrument] = useState<'guitar' | 'piano'>('guitar');
    const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
    
    // UI States
    const [expandedModule, setExpandedModule] = useState<string | null>('mod1');
    const [activeLesson, setActiveLesson] = useState<any>(null);
    const [quizMode, setQuizMode] = useState(false);
    
    // Pedagogical Log
    const [lessonObservation, setLessonObservation] = useState('');
    const [timerValue, setTimerValue] = useState(0);

    useEffect(() => {
        if (activeSession.classId && user?.id) {
            getStudentsInClass(activeSession.classId).then(res => {
                setStudents(res);
                setLoading(false);
            });
        }
    }, [activeSession.classId, user?.id]);

    const handleLessonSelect = (lesson: any) => {
        setActiveLesson(lesson);
        setSelectedInstrument(lesson.activity);
        setSelectedNotes(new Set(lesson.notes));
        haptics.medium();
        
        // Sincroniza a TV com o novo material
        if (activeSession.classId) {
            classroomService.sendCommand(activeSession.classId, {
                type: lesson.activity === 'guitar' ? 'FRETBOARD_UPDATE' : 'PIANO_UPDATE',
                payload: { notes: lesson.notes }
            });
        }
        notify.info(`Iniciando ${lesson.title}. Apostila: Pág ${lesson.page}`);
    };

    const toggleNote = (key: string) => {
        haptics.light();
        const next = new Set(selectedNotes);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        setSelectedNotes(next);

        // Broadcast Live
        if (activeSession.classId) {
            classroomService.sendCommand(activeSession.classId, {
                type: selectedInstrument === 'guitar' ? 'FRETBOARD_UPDATE' : 'PIANO_UPDATE',
                payload: { notes: Array.from(next) }
            });
        }
    };

    const handleGiveExtraXp = (student: any) => {
        haptics.success();
        const quote = LUCCA_QUOTES[Math.floor(Math.random() * LUCCA_QUOTES.length)];
        
        // Dispara Shoutout na TV
        if (activeSession.classId) {
            classroomService.sendCommand(activeSession.classId, {
                type: 'STUDENT_SHOUTOUT',
                payload: { 
                    name: student.name.split(' ')[0], 
                    message: quote,
                    avatar: student.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=Lucca`
                }
            });
        }
        notify.success(`${student.name.split(' ')[0]} ganhou XP! Lucca está no telão.`);
    };

    const sendQuizResult = (success: boolean) => {
        haptics.heavy();
        if (activeSession.classId) {
            classroomService.sendCommand(activeSession.classId, {
                type: 'QUIZ_FEEDBACK',
                payload: { success }
            });
        }
        if (success) notify.success("Resposta Correta enviada para TV! 🎉");
        else notify.error("Ops! Tente novamente na TV. ❌");
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-64 animate-in fade-in duration-700">
            {/* Header Control */}
            <header className="flex justify-between items-center bg-[#0a0f1d] p-8 rounded-[48px] border border-white/5 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-6">
                    <div className="p-5 bg-sky-600 rounded-[32px] text-white shadow-xl">
                        <Radio size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                            {activeSession.className || 'Maestro Pro'}
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sessão Sincronizada</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-white/5 flex flex-col items-end">
                        <span className="text-[8px] font-black text-slate-600 uppercase">Tempo de Aula</span>
                        <span className="text-xl font-black text-white font-mono">00:42:15</span>
                    </div>
                    <Button onClick={() => notify.info("Aula Finalizada.")} className="rounded-2xl h-16 px-10 bg-rose-600 font-black uppercase text-xs" leftIcon={CheckCircle2}>ENCERRAR AULA</Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Lateral: Curriculum Navigator */}
                <aside className="lg:col-span-3 space-y-6">
                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                        <div className="p-6 bg-slate-950/50 border-b border-white/5 flex items-center gap-3">
                            <BookOpen size={18} className="text-sky-400" />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Olie Curriculum</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            {CURRICULUM.map(mod => (
                                <div key={mod.id} className="space-y-2">
                                    <button 
                                        onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-white/5 text-[10px] font-black text-slate-400 uppercase hover:text-white transition-all"
                                    >
                                        {mod.title}
                                        <ChevronDown size={14} className={cn("transition-transform", expandedModule === mod.id && "rotate-180")} />
                                    </button>
                                    <AnimatePresence>
                                        {expandedModule === mod.id && (
                                            <M.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-1 pl-2">
                                                {mod.lessons.map(lesson => (
                                                    <button 
                                                        key={lesson.id}
                                                        onClick={() => handleLessonSelect(lesson)}
                                                        className={cn(
                                                            "w-full text-left p-3 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-between group",
                                                            activeLesson?.id === lesson.id ? "bg-sky-600 text-white" : "text-slate-500 hover:bg-white/5"
                                                        )}
                                                    >
                                                        {lesson.title}
                                                        <span className="opacity-0 group-hover:opacity-100 text-[8px] bg-white/10 px-1.5 py-0.5 rounded">Pág {lesson.page}</span>
                                                    </button>
                                                ))}
                                            </M.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6 px-2">
                            <Users className="text-purple-500" size={18} />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Squad Online</h3>
                        </div>
                        <div className="space-y-3">
                            {students.map(s => (
                                <div key={s.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar src={s.avatar_url} name={s.name} size="sm" />
                                        <span className="text-[10px] font-black text-white uppercase truncate max-w-[80px]">{s.name.split(' ')[0]}</span>
                                    </div>
                                    <button onClick={() => handleGiveExtraXp(s)} className="p-2 text-slate-700 hover:text-amber-500 transition-colors"><Star size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </aside>

                {/* Main: Interactive Board & Quiz */}
                <main className="lg:col-span-9 space-y-8">
                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[56px] p-10 shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3 rounded-2xl", quizMode ? "bg-amber-600 animate-pulse" : "bg-sky-600")}>
                                    {quizMode ? <Sparkles size={24} className="text-white" /> : <LayoutTemplate size={24} className="text-white" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Lousa de Apoio Olie</h3>
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">
                                        {quizMode ? 'MODO QUIZ ATIVO: AVALIAÇÃO LIVE' : 'DEMONSTRAÇÃO TÉCNICA'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setQuizMode(!quizMode)}
                                    className={cn("rounded-xl text-[9px] font-black uppercase", quizMode ? "text-amber-500" : "text-slate-600")}
                                    leftIcon={Sparkles}
                                >
                                    {quizMode ? 'SAIR DO QUIZ' : 'MODO QUIZ'}
                                </Button>
                                <Button variant="ghost" className="rounded-xl text-[9px] font-black uppercase text-slate-600" leftIcon={Printer}>Handout PDF</Button>
                            </div>
                        </div>

                        <div className="min-h-[300px] flex items-center justify-center">
                            {selectedInstrument === 'guitar' ? (
                                <div className="flex flex-col gap-0 w-full">
                                    {STRINGS_TUNING.map((rootNote, sIdx) => (
                                        <div key={sIdx} className="h-12 flex items-center relative border-b border-slate-800/30 last:border-0 group">
                                            <div className="w-10 flex items-center justify-center font-black text-slate-700 text-[10px] border-r border-slate-800 bg-slate-900/30">{STRING_LABELS[sIdx]}</div>
                                            {Array.from({ length: 13 }).map((_, fIdx) => (
                                                <button key={fIdx} onClick={() => toggleNote(`${sIdx}-${fIdx}`)} className={cn("flex-1 h-full border-r border-slate-800/50 flex items-center justify-center relative", fIdx === 0 && "border-r-8 border-slate-700 bg-slate-900/20")}>
                                                    <div className="absolute w-full h-[1px] bg-slate-800" />
                                                    {selectedNotes.has(`${sIdx}-${fIdx}`) && (
                                                        <M.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-8 h-8 rounded-full bg-sky-500 border-2 border-white shadow-lg flex items-center justify-center z-10">
                                                            <span className="text-[9px] font-black text-white">{getNoteName((rootNote + fIdx) % 12)}</span>
                                                        </M.div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="w-full">
                                    <PianoBoard activeNotes={Array.from(selectedNotes)} onNoteToggle={(note) => toggleNote(note)} className="bg-transparent border-none p-0" />
                                </div>
                            )}
                        </div>

                        {quizMode && (
                            <div className="mt-10 pt-10 border-t border-white/5 flex justify-center gap-6 animate-in slide-in-from-bottom-4 duration-500">
                                <Button onClick={() => sendQuizResult(false)} className="bg-rose-600/20 text-rose-500 border border-rose-500/20 px-10 py-6 rounded-2xl font-black uppercase text-xs" leftIcon={X}>REFAZER</Button>
                                <Button onClick={() => sendQuizResult(true)} className="bg-emerald-600 text-white px-16 py-6 rounded-2xl font-black uppercase text-xs shadow-xl shadow-emerald-900/20" leftIcon={Check}>ACERTOU!</Button>
                            </div>
                        )}
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] p-8 shadow-2xl flex items-center gap-8">
                            <div className="p-6 bg-slate-950 rounded-3xl text-emerald-500 shadow-inner"><Volume2 size={32} /></div>
                            <div className="flex-1">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Backing Track</p>
                                <div className="flex items-center gap-4">
                                    <button className="p-3 bg-emerald-600 rounded-xl text-white hover:bg-emerald-500 transition-all"><Play size={18} fill="currentColor" /></button>
                                    <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden"><div className="h-full w-1/3 bg-emerald-500" /></div>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] p-8 shadow-2xl flex items-center gap-8">
                            <div className="p-6 bg-slate-950 rounded-3xl text-purple-500 shadow-inner"><MessageSquare size={32} /></div>
                            <textarea 
                                value={lessonObservation}
                                onChange={e => setLessonObservation(e.target.value)}
                                placeholder="Dever de casa / Log pedagógico..."
                                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-400 font-medium italic resize-none"
                            />
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
