
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Radio, Zap, Play, Square, Wand2, 
    Sparkles, Timer, Users, ShieldCheck, 
    Trophy, Heart, Music, Send, Loader2,
    Monitor, MessageSquare, LayoutTemplate, Brain,
    LogOut, CheckCircle2, Eraser, Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { UserAvatar } from '../../../components/ui/UserAvatar.tsx';
import { useMaestro } from '../../../contexts/MaestroContext.tsx';
import { getStudentsInClass } from '../../../services/dataService.ts';
import { haptics } from '../../../lib/haptics.ts';
import { cn } from '../../../lib/utils.ts';
import { getNoteName } from '../../../lib/theoryEngine.ts';

const M = motion as any;

const STRINGS_TUNING = [4, 11, 7, 2, 9, 4];
const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'];

export default function Orchestrator() {
    const { metronome, activeSession } = useMaestro();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (activeSession.classId) {
            getStudentsInClass(activeSession.classId).then(res => {
                setStudents(res);
                setLoading(false);
            });
        }
    }, [activeSession.classId]);

    const toggleNote = (sIdx: number, fIdx: number) => {
        haptics.light();
        const key = `${sIdx}-${fIdx}`;
        const next = new Set(selectedNotes);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        setSelectedNotes(next);
    };

    const toggleProgressive = () => {
        haptics.medium();
        metronome.setProgression({
            ...metronome.progression,
            active: !metronome.progression.active
        });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-48 animate-in fade-in duration-700">
            {/* Header Control - HDMI Mode */}
            <header className="flex justify-between items-center bg-slate-900/60 p-10 rounded-[56px] border border-white/5 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-8">
                    <div className="p-5 bg-rose-600 rounded-[32px] text-white shadow-xl animate-pulse">
                        <Radio size={36} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Sessão ao Vivo</span>
                        </div>
                        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                            {activeSession.className || 'Sessão Ativa'}
                        </h1>
                    </div>
                </div>
                
                <div className="flex gap-4">
                    <Button variant="ghost" className="rounded-2xl h-16 border border-white/10 text-slate-500 hover:text-white text-[10px] font-black uppercase">Sair da Sessão</Button>
                    <Button className="rounded-2xl h-16 px-10 bg-rose-600 hover:bg-rose-500 font-black uppercase text-xs shadow-xl" leftIcon={LogOut}>FINALIZAR AULA</Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Lateral: Chamada e Presença */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <Users className="text-sky-500" size={20} />
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Alunos em Aula</h3>
                        </div>
                        
                        <div className="space-y-4">
                            {loading ? (
                                [...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-950 rounded-2xl animate-pulse" />)
                            ) : students.map(s => (
                                <div key={s.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar src={s.avatar_url} name={s.name} size="md" />
                                        <span className="text-[11px] font-black text-white uppercase truncate max-w-[100px]">{s.name.split(' ')[0]}</span>
                                    </div>
                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Centro: Orquestração Principal */}
                <div className="lg:col-span-9 space-y-8">
                    {/* METRÔNOMO HDMI GIGANTE */}
                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[56px] p-12 shadow-2xl overflow-hidden relative border-t-4 border-t-sky-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            {/* Visual Display */}
                            <div className="flex flex-col items-center justify-center space-y-6">
                                <div className="text-center">
                                    <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Pulso Maestro</p>
                                    <div className="w-64 h-64 rounded-full border-[16px] border-slate-900 bg-slate-950 flex flex-col items-center justify-center relative shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
                                        <motion.div 
                                            animate={metronome.isPlaying ? { scale: [1, 1.1, 1], borderColor: metronome.currentBeat === 0 ? '#38bdf8' : '#1e293b' } : {}}
                                            transition={{ duration: 0.1 }}
                                            className="absolute inset-0 rounded-full border-4 border-transparent opacity-40"
                                        />
                                        <span className="text-9xl font-black text-white font-mono tracking-tighter leading-none">{metronome.bpm}</span>
                                        <span className="text-xs font-black text-sky-500 uppercase tracking-widest mt-2">BPM</span>
                                    </div>
                                </div>
                                <div className="flex gap-4 w-full">
                                    <Button 
                                        onClick={metronome.toggle}
                                        className={cn(
                                            "flex-1 py-10 rounded-[32px] text-xl font-black uppercase tracking-widest",
                                            metronome.isPlaying ? "bg-rose-600 hover:bg-rose-500" : "bg-emerald-600 hover:bg-emerald-500"
                                        )}
                                        leftIcon={metronome.isPlaying ? Square : Play}
                                    >
                                        {metronome.isPlaying ? "PARAR" : "INICIAR"}
                                    </Button>
                                </div>
                            </div>

                            {/* Automation Panel */}
                            <div className="bg-slate-950/50 p-10 rounded-[48px] border border-white/5 space-y-8">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                                        <Zap className="text-amber-500" size={18} /> Treino Progressivo
                                    </h3>
                                    <button 
                                        onClick={toggleProgressive}
                                        className={cn("w-14 h-7 rounded-full transition-all relative", metronome.progression.active ? "bg-emerald-500" : "bg-slate-800")}
                                    >
                                        <div className={cn("absolute top-1 w-5 h-5 bg-white rounded-full transition-all", metronome.progression.active ? "right-1" : "left-1")} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase ml-1">BPM Alvo</label>
                                        <input 
                                            type="number" value={metronome.progression.targetBpm} 
                                            onChange={e => metronome.setProgression({...metronome.progression, targetBpm: Number(e.target.value)})}
                                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-mono font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Salto (BPM)</label>
                                        <input 
                                            type="number" value={metronome.progression.stepBpm} 
                                            onChange={e => metronome.setProgression({...metronome.progression, stepBpm: Number(e.target.value)})}
                                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-mono font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Intervalo (Compassos)</label>
                                        <input 
                                            type="number" value={metronome.progression.measuresInterval} 
                                            onChange={e => metronome.setProgression({...metronome.progression, measuresInterval: Number(e.target.value)})}
                                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-mono font-bold"
                                        />
                                    </div>
                                    <div className="bg-slate-900 rounded-2xl border border-white/10 p-4 flex flex-col items-center justify-center">
                                        <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Compasso Atual</p>
                                        <span className="text-3xl font-black text-white font-mono leading-none">{metronome.currentMeasure}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* LOUSA HDMI */}
                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[56px] p-12 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-10">
                            <LayoutTemplate className="text-sky-400" size={24} />
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Lousa de Acordes Mirror</h3>
                        </div>
                        
                        <div className="flex flex-col gap-0 min-w-[800px]">
                            {STRINGS_TUNING.map((rootNote, sIdx) => (
                                <div key={sIdx} className="h-14 flex items-center relative border-b border-slate-800/30 last:border-0 group">
                                    <div className="w-12 flex items-center justify-center font-black text-slate-700 text-[10px] border-r border-slate-800 bg-slate-900/30">{STRING_LABELS[sIdx]}</div>
                                    {Array.from({ length: 13 }).map((_, fIdx) => {
                                        const isSelected = selectedNotes.has(`${sIdx}-${fIdx}`);
                                        return (
                                            <button key={fIdx} onClick={() => toggleNote(sIdx, fIdx)} className={cn("flex-1 h-full border-r border-slate-800/50 flex items-center justify-center relative transition-all", fIdx === 0 && "border-r-8 border-slate-700 bg-slate-900/20")}>
                                                <div className="absolute w-full h-[2px] bg-slate-800 z-0" />
                                                {isSelected && (
                                                    <M.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-10 h-10 rounded-full bg-sky-500 border-2 border-white shadow-lg flex items-center justify-center z-10">
                                                        <span className="text-[10px] font-black text-white">{getNoteName((rootNote + fIdx) % 12)}</span>
                                                    </M.div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
