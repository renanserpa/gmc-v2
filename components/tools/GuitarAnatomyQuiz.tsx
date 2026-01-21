
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Target, CheckCircle2, XCircle, Guitar, Search, Sparkles } from 'lucide-react';
import { notify } from '../../lib/notification';
import { haptics } from '../../lib/haptics';
import { uiSounds } from '../../lib/uiSounds';
import { cn } from '../../lib/utils';

// Coordenadas simuladas para o diagrama de anatomia (Apostila p. 6)
const ANATOMY_PARTS = [
    { id: 'cavalete', label: 'Cavalete / Ponte', top: '80%', left: '48%', size: '60px' },
    { id: 'tarraxas', label: 'Tarraxas', top: '5%', left: '42%', size: '80px' },
    { id: 'boca', label: 'Boca', top: '60%', left: '48%', size: '50px' },
    { id: 'trastes', label: 'Trastes', top: '35%', left: '48%', size: '40px' },
];

export const GuitarAnatomyQuiz: React.FC = () => {
    const [step, setStep] = useState(0);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');

    const currentPart = ANATOMY_PARTS[step];

    const startQuiz = () => {
        setStep(0);
        setScore(0);
        setGameState('playing');
        haptics.medium();
    };

    const handlePartClick = (partId: string) => {
        if (gameState !== 'playing') return;

        if (partId === currentPart.id) {
            setScore(s => s + 1);
            uiSounds.playSuccess();
            haptics.success();
            notify.success("Correto!");
            
            if (step < ANATOMY_PARTS.length - 1) {
                setStep(s => s + 1);
            } else {
                setGameState('finished');
            }
        } else {
            uiSounds.playError();
            haptics.error();
            notify.error("Tente novamente!");
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden relative min-h-[500px]">
            <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none" />
            
            <CardHeader>
                <CardTitle className="text-sky-400 flex items-center gap-2 uppercase tracking-tighter">
                    <Guitar size={20}/> Anatomia do Violão (Nível 1)
                </CardTitle>
                <CardDescription>Identifique as partes fundamentais conforme a Apostila.</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center">
                <AnimatePresence mode="wait">
                    {gameState === 'idle' && (
                        <motion.div 
                            key="idle"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-center space-y-6 py-12"
                        >
                            <div className="bg-slate-950 p-8 rounded-full border border-white/5 inline-block">
                                <Search size={64} className="text-slate-700" />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-widest">Onde está o Cavalete?</h3>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto">Um teste de observação para novos músicos. Identifique cada parte no diagrama.</p>
                            <Button onClick={startQuiz} className="px-10 py-5 rounded-2xl text-lg font-black" leftIcon={Target}>
                                Iniciar Quiz
                            </Button>
                        </motion.div>
                    )}

                    {gameState === 'playing' && (
                        <motion.div 
                            key="playing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full space-y-8 flex flex-col items-center"
                        >
                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-sky-500/30 text-center w-full">
                                <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-1">Missão Atual:</p>
                                <p className="text-xl font-black text-white uppercase tracking-tighter">Clique no(a): <span className="text-amber-400">{currentPart.label}</span></p>
                            </div>

                            {/* Diagrama Interativo do Violão (SVG/Placeholder p. 6) */}
                            <div className="relative w-full max-w-[300px] h-[400px] bg-slate-950/40 border border-white/5 rounded-[40px] flex items-center justify-center overflow-hidden">
                                {/* Silhueta do Violão */}
                                <Guitar size={240} className="text-slate-800 opacity-20 rotate-12" />
                                
                                {/* Hotspots invisíveis para o quiz */}
                                {ANATOMY_PARTS.map(part => (
                                    <button
                                        key={part.id}
                                        onClick={() => handlePartClick(part.id)}
                                        className="absolute group"
                                        style={{ top: part.top, left: part.left, width: part.size, height: part.size }}
                                    >
                                        <div className="w-full h-full rounded-full bg-sky-500/0 hover:bg-sky-500/10 border border-transparent hover:border-sky-500/40 transition-all flex items-center justify-center">
                                            <div className="w-2 h-2 bg-sky-500/0 group-hover:bg-sky-500 rounded-full" />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                {ANATOMY_PARTS.map((_, i) => (
                                    <div key={i} className={cn("w-2 h-2 rounded-full transition-colors", i < step ? "bg-emerald-500" : i === step ? "bg-sky-500" : "bg-slate-800")} />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {gameState === 'finished' && (
                        <motion.div 
                            key="finished"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-6 py-12"
                        >
                            <div className="bg-emerald-500/10 p-8 rounded-full border border-emerald-500/20 inline-block relative">
                                <CheckCircle2 size={64} className="text-emerald-400" />
                                <Sparkles className="absolute -top-2 -right-2 text-amber-400 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Anatomia Dominada!</h3>
                                <p className="text-slate-500 text-sm mt-2">Você identificou todas as partes corretamente.</p>
                            </div>
                            <div className="bg-slate-950 p-6 rounded-[32px] border border-white/5 flex items-center justify-between gap-10">
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-600 uppercase">Recompensa</p>
                                    <p className="text-lg font-black text-sky-400">+50 XP</p>
                                </div>
                                <Button onClick={() => setGameState('idle')} variant="ghost">Reiniciar</Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};
