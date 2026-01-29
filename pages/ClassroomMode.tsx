import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as RRD from 'react-router-dom';
const { useSearchParams } = RRD as any;
import { MaestroAudioPro } from '../lib/audioPro.ts';
import { Fretboard } from '../components/tools/Fretboard.tsx';
import { CAGEDLayer } from '../components/tools/CAGEDLayer.tsx';
import { GrooveCircle } from '../components/tools/GrooveCircle.tsx';
import { FeedbackOverlay } from '../components/classroom/FeedbackOverlay.tsx';
import { useScreenMode } from '../hooks/useScreenMode.ts';
import { useAudioAnalyst } from '../hooks/useAudioAnalyst.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { classroomService } from '../services/classroomService.ts';
import { LessonStep } from '../types.ts';
import { Monitor, Zap, Sparkles } from 'lucide-react';
import { haptics } from '../lib/haptics.ts';
import { cn } from '../lib/utils.ts';
import { motion, AnimatePresence } from 'framer-motion';

// Componente interno para partículas de sucesso
// FIX: Added React.FC to SuccessBurst props to handle internal key property correctly
const SuccessBurst: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <motion.div
    initial={{ opacity: 1 }}
    animate={{ opacity: 0 }}
    exit={{ opacity: 0 }}
    className="absolute pointer-events-none z-[100]"
    style={{ left: x, top: y }}
  >
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ x: 0, y: 0, scale: 1 }}
        animate={{ 
          x: Math.cos(i * 45 * (Math.PI / 180)) * 60,
          y: Math.sin(i * 45 * (Math.PI / 180)) * 60,
          scale: 0
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute w-2 h-2 bg-sky-400 rounded-full shadow-[0_0_10px_#38bdf8]"
      />
    ))}
  </motion.div>
);

export default function ClassroomMode() {
    const [searchParams] = useSearchParams();
    const classId = searchParams.get('classId') || 'demo-class';
    const { isTvMode } = useScreenMode();
    
    const audioPro = useRef(new MaestroAudioPro());
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentBeat, setCurrentBeat] = useState(0);
    const [currentShape, setCurrentShape] = useState('E');
    const [combo, setCombo] = useState(0);
    const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);

    // Define a nota alvo baseada no Tom e Shape (Ex: C Major = nota 60)
    // Para o protótipo, usaremos a tônica de C (nota MIDI 60)
    const targetNoteIdx = 60; 

    // Analista de áudio avançado
    const performance = useAudioAnalyst(isPlaying, targetNoteIdx, 'beginner');

    // Efeito: Gatilho de Feedback Visual
    useEffect(() => {
        if (performance.isDetected && performance.isInTune) {
            haptics.success();
            setCombo(prev => prev + 1);
            
            // Adiciona explosão (posição central simulada no fretboard para este exemplo)
            const newBurst = { 
                id: Date.now(), 
                x: window.innerWidth / 2 + (Math.random() * 100 - 50), 
                y: window.innerHeight / 2 + (Math.random() * 100 - 50)
            };
            setBursts(prev => [...prev, newBurst]);
            
            // Auto-limpeza das partículas
            setTimeout(() => {
                setBursts(prev => prev.filter(b => b.id !== newBurst.id));
            }, 700);
        } else if (performance.isDetected && !performance.isInTune) {
            // Se errou a afinação ou a nota, reseta o combo
            setCombo(0);
        }
    }, [performance.isInTune, performance.isDetected]);

    useEffect(() => {
        audioPro.current.onBeat = (beat) => setCurrentBeat(beat);
        const unsubscribe = classroomService.subscribeToCommands(classId, (cmd) => {
            if (cmd.type === 'PLAY') setIsPlaying(true);
            if (cmd.type === 'PAUSE') setIsPlaying(false);
        });
        return () => {
            unsubscribe();
            audioPro.current.dispose();
        };
    }, [classId]);

    return (
        <div className={cn("min-h-screen transition-all duration-700 relative overflow-hidden", isTvMode ? "bg-slate-950 p-12" : "bg-slate-950 p-6")}>
            {/* Camada de Feedback Visual (Partículas) */}
            <AnimatePresence>
                {bursts.map(b => (
                    <SuccessBurst key={b.id} x={b.x} y={b.y} />
                ))}
            </AnimatePresence>

            {/* Overlay de Performance Maestro */}
            <FeedbackOverlay 
                performance={performance}
                comboCount={combo}
                timing={null} // Implementação futura de timing rítmico
            />

            <header className="rounded-[48px] border border-white/5 bg-slate-900/60 backdrop-blur-3xl shadow-2xl p-8 flex justify-between items-center relative z-10 mb-10">
                <div className="flex items-center gap-8">
                    <div className="bg-sky-500 w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg">
                        <Monitor size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Módulo CAGED: {currentShape}</h1>
                        <p className="text-[10px] font-black text-sky-500 tracking-widest uppercase mt-2 flex items-center gap-2">
                           <Sparkles size={12} /> Alvo Neural: Nota {targetNoteIdx % 12 === 0 ? 'Dó' : 'Afinando...'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase">Status do Aluno</p>
                        <p className={cn("text-xs font-black uppercase transition-colors", performance.isDetected ? "text-emerald-400" : "text-slate-600")}>
                            {performance.isDetected ? (performance.isInTune ? 'Sincronizado!' : 'Desafinado') : 'Aguardando Som...'}
                        </p>
                    </div>
                    <GrooveCircle bpm={120} currentTime={0} isPlaying={isPlaying} externalPulse={currentBeat} mode="konnakkol" />
                </div>
            </header>

            <main className="relative z-10">
                <div className="relative group perspective-1000">
                    {/* Brilho ambiental quando detectado */}
                    <AnimatePresence>
                        {performance.isInTune && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.15 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-sky-400 blur-[120px] rounded-full pointer-events-none"
                            />
                        )}
                    </AnimatePresence>

                    <Fretboard 
                        rootKey="C" 
                        detectedNoteIdx={performance.noteIdx} 
                        upcomingNoteIdx={targetNoteIdx % 12}
                        className={cn("opacity-95 transition-all duration-300", performance.isInTune && "border-emerald-500/50")} 
                    />
                    <CAGEDLayer 
                        rootNote="C" 
                        currentShape={currentShape} 
                        onShapeChange={setCurrentShape} 
                    />
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/5 flex items-center gap-4">
                        <div className={cn("p-3 rounded-2xl", performance.isInTune ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-950 text-slate-700")}>
                            <Zap size={20} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Precisão Atual</p>
                            <p className="text-xl font-black text-white">{performance.isDetected ? `${100 - Math.abs(performance.cents)}%` : '--'}</p>
                        </div>
                    </div>
                    {/* Espaço para outros widgets do dashboard de sala de aula */}
                </div>
            </main>
        </div>
    );
}
