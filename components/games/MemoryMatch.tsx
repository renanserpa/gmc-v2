
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Smile, Frown, Sparkles, Trophy, Music, RotateCcw } from 'lucide-react';
import { audioManager } from '../../lib/audioManager';
import { haptics } from '../../lib/haptics';
import { uiSounds } from '../../lib/uiSounds';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface Card {
    id: number;
    type: 'major' | 'minor';
    isFlipped: boolean;
    isMatched: boolean;
}

const CHORD_FREQS = {
    major: [261.63, 329.63, 392.00], // C Major
    minor: [261.63, 311.13, 392.00]  // C Minor
};

export const MemoryMatch: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const [cards, setCards] = useState<Card[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matches, setMatches] = useState(0);
    const [moves, setMoves] = useState(0);
    const [gameState, setGameState] = useState<'playing' | 'won'>('playing');

    const initializeGame = () => {
        const initial: Card[] = [];
        // 4 pares de cada
        ['major', 'minor'].forEach(type => {
            for (let i = 0; i < 4; i++) {
                initial.push({ id: initial.length, type: type as any, isFlipped: false, isMatched: false });
                initial.push({ id: initial.length, type: type as any, isFlipped: false, isMatched: false });
            }
        });
        setCards(initial.sort(() => Math.random() - 0.5));
        setFlipped([]);
        setMatches(0);
        setMoves(0);
        setGameState('playing');
        
        // Garante que o audio context esteja pronto
        audioManager.requestAccess('MemoryMatch');
    };

    useEffect(() => {
        initializeGame();
        return () => audioManager.release('MemoryMatch');
    }, []);

    const playChord = async (type: 'major' | 'minor') => {
        const ctx = await audioManager.getContext();
        const freqs = CHORD_FREQS[type];
        
        freqs.forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 1);
        });
    };

    const handleFlip = (id: number) => {
        if (flipped.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

        haptics.light();
        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);
        
        const card = cards[id];
        playChord(card.type);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const [id1, id2] = newFlipped;
            if (cards[id1].type === cards[id2].type) {
                // Match
                setTimeout(() => {
                    setCards(prev => prev.map(c => (c.id === id1 || c.id === id2) ? { ...c, isMatched: true } : c));
                    setFlipped([]);
                    setMatches(m => m + 1);
                    uiSounds.playSuccess();
                    haptics.success();
                }, 600);
            } else {
                // Fail
                setTimeout(() => {
                    setFlipped([]);
                    haptics.medium();
                }, 1200);
            }
        }
    };

    useEffect(() => {
        if (matches === 8) setGameState('won');
    }, [matches]);

    return (
        <div className="w-full min-h-[600px] bg-slate-950 rounded-[64px] border-4 border-white/5 p-10 relative overflow-hidden shadow-2xl">
            <header className="flex justify-between items-center mb-10">
                <div className="flex gap-6">
                    <div className="bg-slate-900 px-5 py-2 rounded-2xl border border-white/5">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Movimentos</p>
                        <p className="text-xl font-black text-white font-mono">{moves}</p>
                    </div>
                    <div className="bg-slate-900 px-5 py-2 rounded-2xl border border-white/5">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Pares</p>
                        <p className="text-xl font-black text-sky-400 font-mono">{matches}/8</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Objetivo</p>
                        <p className="text-xs font-black text-white">Combinar Sonoridades</p>
                    </div>
                    <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-xl">
                        <Brain size={24} />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                {cards.map((card) => {
                    const isFlipped = flipped.includes(card.id) || card.isMatched;
                    return (
                        <button
                            key={card.id}
                            onClick={() => handleFlip(card.id)}
                            className="aspect-square relative perspective-1000"
                        >
                            <motion.div
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
                                className="w-full h-full relative preserve-3d"
                            >
                                {/* Front (Hidden) */}
                                <div className="absolute inset-0 bg-slate-900 rounded-[28px] border-2 border-white/5 flex items-center justify-center backface-hidden shadow-xl">
                                    <Music size={24} className="text-slate-700" />
                                </div>
                                {/* Back (Revealed) */}
                                <div className={cn(
                                    "absolute inset-0 rounded-[28px] border-2 flex flex-col items-center justify-center rotate-y-180 backface-hidden shadow-2xl",
                                    card.type === 'major' ? "bg-sky-500/10 border-sky-500 text-sky-400" : "bg-purple-500/10 border-purple-500 text-purple-400"
                                )}>
                                    {card.type === 'major' ? <Smile size={32} /> : <Frown size={32} />}
                                    <span className="text-[8px] font-black uppercase mt-2 tracking-widest">
                                        {card.type === 'major' ? 'Acorde Feliz' : 'Acorde Triste'}
                                    </span>
                                </div>
                            </motion.div>
                        </button>
                    );
                })}
            </div>

            <AnimatePresence>
                {gameState === 'won' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center z-[110] p-10 text-center">
                        <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="w-24 h-24 bg-amber-500 rounded-[32px] flex items-center justify-center text-white mb-6 shadow-[0_0_50px_rgba(245,158,11,0.4)]"
                        >
                            <Trophy size={48} />
                        </motion.div>
                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Ouvido Biônico!</h2>
                        <p className="text-slate-400 font-medium my-6">Você dominou a percepção harmônica básica.</p>
                        <div className="bg-slate-900 border border-white/5 p-8 rounded-[40px] mb-10 min-w-[300px]">
                            <div className="flex items-center justify-center gap-3 text-sky-400 font-black uppercase text-sm tracking-[0.2em]">
                                <Sparkles size={20} fill="currentColor" /> +100 XP CONCEDIDO
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Button onClick={initializeGame} variant="primary" leftIcon={RotateCcw} className="px-10 py-5 rounded-2xl">Jogar Novamente</Button>
                            <Button onClick={onExit} variant="ghost" className="px-10 py-5 rounded-2xl text-slate-500">Sair</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
