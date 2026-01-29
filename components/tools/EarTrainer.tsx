
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { BrainCircuit, RotateCcw, Headphones, Sparkles, Award } from 'lucide-react';
import { EarTrainerEngine, IntervalType } from '../../lib/earTrainerEngine';
import { Button } from '../ui/Button';
import { haptics } from '../../lib/haptics';
import { cn } from '../../lib/utils';
import { uiSounds } from '../../lib/uiSounds';
import { applyXpEvent } from '../../services/gamificationService';
import { useAuth } from '../../contexts/AuthContext';
import { notify } from '../../lib/notification';
import { motion, AnimatePresence } from 'framer-motion';

// FIX: Casting motion components to any to bypass property errors
const M = motion as any;

const OPTIONS: { label: string, type: IntervalType }[] = [
    { label: '4ª Justa (P4)', type: 'P4' },
    { label: '5ª Justa (P5)', type: 'P5' }
];

export const EarTrainer: React.FC = () => {
    const { user } = useAuth();
    const engine = useRef(new EarTrainerEngine());
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'answered'>('idle');
    const [target, setTarget] = useState<IntervalType | null>(null);
    const [streak, setStreak] = useState(0);

    const startChallenge = () => {
        const type = Math.random() > 0.5 ? 'P4' : 'P5';
        setTarget(type);
        setGameState('playing');
        engine.current.playInterval(type);
    };

    const handleAnswer = async (selected: IntervalType) => {
        const isCorrect = selected === target;
        setGameState('answered');

        if (isCorrect) {
            uiSounds.playSuccess();
            haptics.success();
            const newStreak = streak + 1;
            setStreak(newStreak);
            
            if (newStreak === 5) {
                haptics.heavy();
                notify.success("MAESTRIA AUDITIVA! +50 XP");
                await applyXpEvent({
                    studentId: user.id,
                    eventType: 'EAR_TRAINING_MASTERY',
                    xpAmount: 50,
                    contextType: 'tools'
                });
                setStreak(0);
            }
        } else {
            uiSounds.playError();
            haptics.error();
            setStreak(0);
            notify.error("A nota desafinou! Ouça com atenção.");
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 blur-[100px] pointer-events-none" />
            
            <CardHeader>
                <CardTitle className="text-emerald-400 flex items-center gap-2">
                    <BrainCircuit size={20}/> Treinador Auditivo
                </CardTitle>
                <CardDescription>Módulo P4/P5: Afie sua audição técnica com intervalos puros.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
                <div className="bg-slate-950/80 p-8 md:p-12 rounded-[48px] border border-white/5 flex flex-col items-center text-center shadow-inner">
                    <div className="flex gap-2 mb-10">
                        {[...Array(5)].map((_, i) => (
                            <M.div 
                                key={i}
                                animate={streak > i ? { scale: [1, 1.3, 1], backgroundColor: '#10b981' } as any : {}}
                                className={cn(
                                    "w-3 h-3 rounded-full transition-all duration-500",
                                    streak > i ? "shadow-[0_0_15px_#10b981]" : "bg-slate-800"
                                )}
                            />
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {gameState === 'idle' ? (
                            <M.div initial={{ opacity: 0 } as any} animate={{ opacity: 1 } as any} className="space-y-6">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20">
                                    <Headphones size={32} className="text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Ouvido Biônico</h3>
                                <Button onClick={startChallenge} className="px-10 py-5 rounded-2xl text-lg font-black">
                                    Começar Treino
                                </Button>
                            </M.div>
                        ) : (
                            <M.div initial={{ opacity: 0 } as any} animate={{ opacity: 