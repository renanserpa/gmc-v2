
import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Gamepad2, Rocket, Brain, Trophy, Star, ArrowRight, Play, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageTitle } from '../hooks/usePageTitle';
import { cn } from '../lib/utils';
import { haptics } from '../lib/haptics';
import { NoteInvaders } from '../components/games/NoteInvaders';
import { MemoryMatch } from '../components/games/MemoryMatch';

const GAMES = [
    { 
        id: 'note-invaders', 
        title: 'Note Invaders', 
        description: 'Defenda a galáxia usando as cordas soltas do seu violão como laser!',
        icon: Rocket,
        color: 'bg-red-600',
        category: 'Percepção',
        xp: 150,
        level: 1
    },
    { 
        id: 'memory-match', 
        title: 'Memory Match', 
        description: 'Combine os sentimentos dos acordes (Feliz vs Triste) neste jogo de memória.',
        icon: Brain,
        color: 'bg-purple-600',
        category: 'Treino Auditivo',
        xp: 100,
        level: 2
    }
];

export default function ArcadePage() {
    usePageTitle("Maestro Arcade");
    const [selectedGame, setSelectedGame] = useState<string | null>(null);

    const handleSelectGame = (id: string) => {
        haptics.heavy();
        setSelectedGame(id);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-500">
                        <Gamepad2 size={24} />
                        <span className="text-xs font-black uppercase tracking-[0.4em]">Entertainment & Training</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">Maestro Arcade</h1>
                </div>
                <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-slate-500 uppercase">Gaming XP</span>
                        <span className="text-lg font-black text-amber-400">1.250</span>
                    </div>
                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                        <Trophy size={20} />
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {!selectedGame ? (
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        {GAMES.map((game, idx) => (
                            <button
                                key={game.id}
                                onClick={() => handleSelectGame(game.id)}
                                className="text-left group"
                            >
                                <Card className="bg-slate-900 border-white/5 rounded-[48px] overflow-hidden hover:border-amber-500/40 transition-all shadow-2xl relative">
                                    <div className="absolute top-0 right-0 p-32 bg-white/5 blur-[100px] pointer-events-none group-hover:bg-amber-500/5 transition-colors" />
                                    <CardContent className="p-10 space-y-8 relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div className={cn("p-5 rounded-[28px] text-white shadow-xl", game.color)}>
                                                <game.icon size={32} />
                                            </div>
                                            <div className="px-4 py-1.5 bg-slate-950 rounded-full border border-white/5 flex items-center gap-2">
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{game.category}</span>
                                                <div className="w-1 h-1 rounded-full bg-slate-700" />
                                                <div className="flex items-center gap-1">
                                                    <Star size={10} className="text-amber-500" fill="currentColor" />
                                                    <span className="text-[9px] font-black text-white">{game.xp} XP</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-3xl font-black text-white uppercase tracking-tight">{game.title}</h3>
                                            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">{game.description}</p>
                                        </div>

                                        <div className="flex justify-between items-center pt-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Acesso Disponível</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sky-400 font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                                Iniciar Partida <ArrowRight size={16} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </button>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="game-view"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative"
                    >
                        <button 
                            onClick={() => setSelectedGame(null)}
                            className="absolute -top-16 left-0 text-slate-500 hover:text-white flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors"
                        >
                            <ArrowRight size={16} className="rotate-180" /> Voltar ao Arcade
                        </button>
                        
                        {selectedGame === 'note-invaders' && <NoteInvaders onExit={() => setSelectedGame(null)} />}
                        {selectedGame === 'memory-match' && <MemoryMatch onExit={() => setSelectedGame(null)} />}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
