
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { ChromaticMandala } from './ChromaticMandala';
import { CHORDS, NOTES_CHROMATIC } from '../../lib/theoryEngine';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Sparkles, Brain, Award } from 'lucide-react';
import { haptics } from '../../lib/haptics';
import { uiSounds } from '../../lib/uiSounds';
import { notify } from '../../lib/notification';

export const VisualTheory: React.FC = () => {
    const [gameState, setGameState] = useState<'idle' | 'playing'>('idle');
    const [currentChallenge, setCurrentChallenge] = useState<{ root: number, type: string, notes: number[] } | null>(null);
    const [score, setScore] = useState(0);

    const generateChallenge = () => {
        const types = ['major', 'minor', 'dom7'];
        const type = types[Math.floor(Math.random() * types.length)];
        const root = Math.floor(Math.random() * 12);
        const intervals = CHORDS[type as keyof typeof CHORDS];
        const notes = intervals.map(i => (root + i) % 12);
        
        setCurrentChallenge({ root, type, notes });
        setGameState('playing');
        haptics.medium();
    };

    const handleAnswer = (answer: string) => {
        if (answer === currentChallenge?.type) {
            setScore(s => s + 1);
            uiSounds.playSuccess();
            haptics.success();
            notify.success("Forma geométrica correta!");
            generateChallenge();
        } else {
            haptics.error();
            uiSounds.playError();
            notify.error("Essa geometria pertence a outro acorde.");
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 blur-[120px] pointer-events-none" />
            
            <CardHeader>
                <CardTitle className="text-indigo-400 flex items-center gap-2">
                    <Brain size={20}/> Geometria Harmônica
                </CardTitle>
                <CardDescription>Aprenda a "forma" dos acordes no círculo cromático.</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center gap-8">
                <div className="bg-slate-950/80 p-12 rounded-[48px] border border-white/5 w-full flex flex-col items-center">
                    <AnimatePresence mode="wait">
                        {gameState === 'idle' ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
                                <ChromaticMandala activeNotes={[0, 4, 7]} size={200} className="mx-auto" />
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">O Olho do Maestro</h3>
                                <Button onClick={generateChallenge} leftIcon={Target}>Iniciar Desafio Visual</Button>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
                                <ChromaticMandala activeNotes={currentChallenge!.notes} size={250} className="mx-auto" />
                                
                                <div className="grid grid-cols-3 gap-3">
                                    {['major', 'minor', 'dom7'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => handleAnswer(type)}
                                            className="py-4 rounded-2xl bg-slate-900 border-2 border-slate-800 text-[10px] font-black uppercase text-slate-400 hover:border-indigo-500 hover:text-white transition-all"
                                        >
                                            {type === 'major' ? 'Tríade Maior' : type === 'minor' ? 'Tríade Menor' : 'Sétima Dominante'}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                    <span className="text-[10px] font-black text-slate-500 uppercase">Score: {score}</span>
                                    <button onClick={() => setGameState('idle')} className="text-[10px] font-black text-slate-600 hover:text-white uppercase">Sair</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
};
