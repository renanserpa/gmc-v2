
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ear, Brain, Zap, Play, CheckCircle2, Headphones, Activity } from 'lucide-react';
import { MaestroAudioPro } from '../../lib/audioPro';
import { usePitchDetector } from '../../hooks/usePitchDetector';
import { Button } from '../ui/Button';
import { haptics } from '../../lib/haptics';
import { uiSounds } from '../../lib/uiSounds';
import { cn } from '../../lib/utils';

type TrainerState = 'idle' | 'listen' | 'think' | 'perform' | 'feedback';

const SEQUENCES = [
  { notes: [64, 62, 64], label: 'Mi - Ré - Mi', level: 1 },
  { notes: [60, 64, 67], label: 'Dó Maior Arpejo', level: 2 },
  { notes: [55, 59, 62, 65], label: 'Acorde de Sol 7', level: 3 }
];

export const AudiationTrainer: React.FC = () => {
    const audioPro = useRef(new MaestroAudioPro());
    const [state, setState] = useState<TrainerState>('idle');
    const [currentSeq, setCurrentSeq] = useState(0);
    const [thinkProgress, setThinkProgress] = useState(0);
    const [feedback, setFeedback] = useState<{ accuracy: number, perfect: boolean } | null>(null);

    const detectedNote = usePitchDetector(audioPro.current, state === 'perform');

    const startListen = async () => {
        setState('listen');
        haptics.medium();
        
        // Simulação da sequência tocando
        for (const noteIdx of SEQUENCES[currentSeq].notes) {
            playReferenceNote(noteIdx);
            await new Promise(r => setTimeout(r, 600));
        }

        // Vai para a fase de Pensar (Audiation)
        startThinking();
    };

    const playReferenceNote = (noteIdx: number) => {
        // Usa engine interna para tocar seno puro de referência
    };

    const startThinking = () => {
        setState('think');
        setThinkProgress(0);
        const duration = 3000;
        const start = Date.now();

        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            setThinkProgress(Math.min((elapsed / duration) * 100, 100));
            if (elapsed >= duration) {
                clearInterval(interval);
                setState('perform');
                haptics.heavy();
            }
        }, 16);
    };

    useEffect(() => {
        if (state === 'perform' && detectedNote !== null) {
            // Lógica simples de match por nota
            const target = SEQUENCES[currentSeq].notes[0]; // Simplificado para 1ª nota no protótipo
            const accuracy = Math.abs(detectedNote - target) <= 1 ? 100 : 0;
            
            setTimeout(() => {
                setFeedback({ accuracy, perfect: accuracy === 100 });
                setState('feedback');
                if (accuracy === 100) uiSounds.playSuccess();
                else uiSounds.playError();
            }, 1000);
        }
    }, [detectedNote, state, currentSeq]);

    return (
        <div className="w-full min-h-[500px] bg-slate-950 rounded-[64px] border-4 border-white/5 p-12 relative overflow-hidden shadow-2xl">
            <header className="text-center space-y-2 mb-12">
                <div className="flex items-center justify-center gap-2 text-purple-400">
                    <Brain size={24} />
                    <span className="text-xs font-black uppercase tracking-[0.4em]">Módulo MLT: Audiation Trainer</span>
                </div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Memória Musical</h2>
            </header>

            <AnimatePresence mode="wait">
                {state === 'idle' && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-8 py-10">
                        <div className="w-24 h-24 bg-slate-900 rounded-[32px] flex items-center justify-center text-slate-700">
                            <Headphones size={48} />
                        </div>
                        <p className="text-slate-400 text-center max-w-xs font-medium">Você vai ouvir uma melodia curta. Ouça, pense nela e depois repita no violão.</p>
                        <Button onClick={startListen} className="px-16 py-6 rounded-2xl text-lg font-black uppercase tracking-widest">Iniciar Módulo</Button>
                    </motion.div>
                )}

                {state === 'listen' && (
                    <motion.div key="listen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-8 py-10">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }} className="w-32 h-32 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-[0_0_50px_rgba(14,165,233,0.3)]">
                            <Ear size={64} />
                        </motion.div>
                        <p className="text-2xl font-black text-white uppercase tracking-widest animate-pulse">OUÇA COM ATENÇÃO...</p>
                    </motion.div>
                )}

                {state === 'think' && (
                    <motion.div key="think" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-10 py-10">
                        <Brain size={64} className="text-purple-400 animate-pulse" />
                        <div className="space-y-4 w-full max-w-sm">
                            <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Ouça na sua cabeça...</p>
                            <div className="h-4 bg-slate-900 rounded-full p-1 border border-white/5">
                                <motion.div className="h-full bg-purple-500 rounded-full" style={{ width: `${thinkProgress}%` }} />
                            </div>
                        </div>
                    </motion.div>
                )}

                {state === 'perform' && (
                    <motion.div key="perform" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-8 py-10">
                         <div className="relative">
                            <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity }} className="absolute -inset-10 bg-emerald-500/20 rounded-full blur-3xl" />
                            <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl relative z-10">
                                <Activity size={56} />
                            </div>
                         </div>
                         <p className="text-2xl font-black text-white uppercase tracking-widest">Sua Vez! Toque Agora</p>
                         <div className="px-4 py-2 bg-slate-900 rounded-full border border-white/10 flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                             <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Microfone Ativo</span>
                         </div>
                    </motion.div>
                )}

                {state === 'feedback' && (
                    <motion.div key="feedback" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6 py-10 text-center">
                        <div className={cn("p-8 rounded-[40px] shadow-2xl", feedback?.perfect ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
                            {feedback?.perfect ? <CheckCircle2 size={64} /> : <Zap size={64} />}
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{feedback?.perfect ? 'Memória de Elefante!' : 'Quase lá!'}</h3>
                            <p className="text-slate-500 font-bold uppercase text-xs mt-2">{feedback?.perfect ? 'Você ouviu e repetiu perfeitamente.' : 'Tente ouvir os intervalos com mais calma.'}</p>
                        </div>
                        <Button onClick={() => setState('idle')} className="mt-6 px-12">Tentar Outra</Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
