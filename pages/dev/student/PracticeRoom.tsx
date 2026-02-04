
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Timer, Play, Square, Music, 
    Zap, Headphones, Save, ArrowLeft,
    Clock, Guitar, Piano, LayoutTemplate
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { useMaestro } from '../../../contexts/MaestroContext.tsx';
import { useCurrentStudent } from '../../../hooks/useCurrentStudent.ts';
import { savePracticeTime } from '../../../services/dataService.ts';
import { haptics } from '../../../lib/haptics.ts';
import { cn } from '../../../lib/utils.ts';
import { notify } from '../../../lib/notification.ts';
import { PianoBoard } from '../../../components/instruments/PianoBoard.tsx';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;

const M = motion as any;

export default function PracticeRoom() {
    const { metronome } = useMaestro();
    const { student } = useCurrentStudent();
    const navigate = useNavigate();
    
    const [seconds, setSeconds] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
    
    const timerRef = useRef<any>(null);

    useEffect(() => {
        timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    const handleSaveSession = async () => {
        if (seconds < 60) {
            notify.warning("Pratique pelo menos 1 minuto para registrar.");
            return;
        }
        setIsSaving(true);
        haptics.success();
        try {
            await savePracticeTime(student!.id, seconds, student!.instrument);
            notify.success(`Sessão de ${Math.floor(seconds/60)}m salva! XP bônus concedido.`);
            navigate('/student/dashboard');
        } catch (e) {
            notify.error("Falha ao sincronizar sessão.");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleNote = (note: string) => {
        haptics.light();
        setSelectedNotes(prev => prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note]);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-32">
            {/* Control Bar */}
            <header className="flex justify-between items-center bg-[#0a0f1d] p-8 rounded-[48px] border border-white/5 shadow-2xl">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/student/dashboard')} className="p-4 bg-slate-900 rounded-2xl text-slate-500 hover:text-white"><ArrowLeft size={24} /></button>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Sala de <span className="text-sky-500">Prática</span></h1>
                        <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-2">Solo Training Mode</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[8px] font-black text-slate-600 uppercase">Tempo de Voo</p>
                        <p className="text-3xl font-mono font-black text-sky-400">
                            {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
                        </p>
                    </div>
                    <Button 
                        onClick={handleSaveSession} 
                        isLoading={isSaving}
                        className="rounded-2xl h-16 px-10 bg-emerald-600 font-black uppercase text-xs" 
                        leftIcon={Save}
                    >
                        ENCERRAR & SALVAR
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Metrônomo */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-950 border-white/5 rounded-[48px] p-10 flex flex-col items-center gap-8 shadow-2xl">
                        <div className="flex items-center gap-3 text-sky-500">
                            <Timer size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Ritmo Master</span>
                        </div>
                        
                        <div className="w-48 h-48 rounded-full border-[12px] border-slate-900 bg-slate-950 flex flex-col items-center justify-center relative group">
                            <div className="absolute inset-0 bg-sky-500/5 blur-3xl rounded-full group-hover:bg-sky-500/10 transition-all" />
                            <span className="text-6xl font-black text-white font-mono z-10">{metronome.bpm}</span>
                            <span className="text-[9px] font-black text-slate-600 uppercase z-10">BPM</span>
                        </div>

                        <div className="w-full space-y-6">
                            <input 
                                type="range" min="40" max="220" value={metronome.bpm} 
                                onChange={(e) => metronome.setBpm(Number(e.target.value))}
                                className="w-full accent-sky-500 h-2 bg-slate-900 rounded-full appearance-none cursor-pointer"
                            />
                            <Button 
                                onClick={metronome.toggle}
                                className={cn(
                                    "w-full py-8 rounded-[32px] font-black uppercase tracking-[0.2em] shadow-xl",
                                    metronome.isPlaying ? "bg-rose-600" : "bg-sky-600"
                                )}
                            >
                                {metronome.isPlaying ? "PARAR PULSO" : "INICIAR PULSO"}
                            </Button>
                        </div>
                    </Card>

                    <div className="bg-sky-500/5 p-6 rounded-[32px] border border-sky-500/10 flex items-start gap-4">
                        <Headphones className="text-sky-400 shrink-0" size={20} />
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic">
                            O treino solo é onde a maestria acontece. Mantenha o ritmo do elefante e ganhe XP extra por minuto.
                        </p>
                    </div>
                </div>

                {/* Lousa de Apoio */}
                <div className="lg:col-span-8">
                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[56px] p-10 shadow-2xl relative overflow-hidden min-h-full">
                         <div className="flex justify-between items-center mb-12">
                            <div className="flex items-center gap-3">
                                <LayoutTemplate className="text-purple-400" size={24} />
                                <h3 className="text-xl font-black text-white uppercase italic">Memory Mirror</h3>
                            </div>
                            <Button variant="ghost" onClick={() => setSelectedNotes([])} className="text-[9px] font-black uppercase text-slate-500 hover:text-white">LIMPAR</Button>
                         </div>

                         <div className="flex flex-col items-center justify-center py-10">
                            <PianoBoard activeNotes={selectedNotes} onNoteToggle={toggleNote} className="bg-transparent border-none p-0" />
                            <div className="mt-12 text-center space-y-2">
                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">Notas Ativas</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {selectedNotes.map(n => (
                                        <span key={n} className="px-3 py-1 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20 font-black text-[10px] uppercase tracking-widest">{n}</span>
                                    ))}
                                    {selectedNotes.length === 0 && <span className="text-slate-800 font-black text-[10px] uppercase">Toque nas teclas para marcar</span>}
                                </div>
                            </div>
                         </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
