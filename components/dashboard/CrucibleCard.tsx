
import React from 'react';
import { motion } from 'framer-motion';
import { Sword, Target, Zap, ShieldAlert, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface CrucibleChallenge {
    bossName: string;
    task: string;
    targetNotes: number[];
    winCondition: string;
    xpReward: number;
    maestroWarning: string;
}

interface CrucibleCardProps {
    challenge: CrucibleChallenge | null;
    onStart: () => void;
    className?: string;
}

export const CrucibleCard: React.FC<CrucibleCardProps> = ({ challenge, onStart, className }) => {
    if (!challenge) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("w-full", className)}
        >
            <Card className="bg-slate-950 border-2 border-red-500/40 overflow-hidden relative group shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                {/* Background Animado Estilo Boss Battle */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.05)_0%,_transparent_70%)] animate-pulse" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                
                <CardContent className="p-8 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-10 items-center">
                        <div className="relative">
                            <div className="w-24 h-24 bg-red-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-red-900/40 relative z-10 group-hover:scale-110 transition-transform">
                                <Sword size={48} />
                            </div>
                            <motion.div 
                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-red-500 rounded-full blur-2xl"
                            />
                        </div>

                        <div className="flex-1 space-y-4 text-center lg:text-left">
                            <div className="flex items-center gap-2 justify-center lg:justify-start">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">O Crisol do Maestro</span>
                                <div className="h-1 w-12 bg-red-500/20 rounded-full" />
                            </div>
                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic">
                                {challenge.bossName}
                            </h3>
                            <p className="text-slate-400 text-base font-medium max-w-xl">
                                "{challenge.task}"
                            </p>
                            
                            <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-2">
                                <div className="bg-slate-900 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-2">
                                    <ShieldAlert size={14} className="text-red-400" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{challenge.winCondition}</span>
                                </div>
                                <div className="bg-slate-900 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-2">
                                    <Target size={14} className="text-sky-400" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Notas: {challenge.targetNotes.join(', ')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-6 w-full lg:w-64 bg-slate-900/80 p-8 rounded-[40px] border border-white/5 shadow-inner">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Recompensa Épica</p>
                                <p className="text-4xl font-black text-amber-500 flex items-center gap-2">
                                    +{challenge.xpReward} <span className="text-xs text-slate-600 uppercase">XP</span>
                                </p>
                            </div>
                            <Button 
                                onClick={onStart}
                                className="w-full py-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-red-900/20"
                            >
                                Enfrentar Desafio
                            </Button>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <p className="text-[11px] text-red-400/60 font-black uppercase text-center italic tracking-widest">
                            {challenge.maestroWarning}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
