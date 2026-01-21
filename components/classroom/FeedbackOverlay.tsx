import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Flame, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { haptics } from '../../lib/haptics';
import confetti from 'canvas-confetti';

interface FeedbackOverlayProps {
    performance: {
        isInTune: boolean;
        isDetected: boolean;
        cents: number;
    };
    timing: 'perfect' | 'late' | 'early' | null;
    comboCount: number;
    className?: string;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ 
    performance, 
    timing, 
    comboCount, 
    className 
}) => {
    const [showRhythmHint, setShowRhythmHint] = useState<string | null>(null);

    // Efeito de Confete em marcos de combo
    useEffect(() => {
        if (comboCount > 0 && comboCount % 10 === 0) {
            haptics.fever();
            confetti({
                particleCount: 40,
                spread: 60,
                colors: ['#38bdf8', '#fbbf24', '#ffffff'],
                origin: { x: 0.9, y: 0.3 }
            });
        }
    }, [comboCount]);

    // Feedback de Ritmo Atrasado/Adiantado
    useEffect(() => {
        if (timing === 'late') {
            setShowRhythmHint('ACELERE! ⏩');
            setTimeout(() => setShowRhythmHint(null), 1000);
        } else if (timing === 'early') {
            setShowRhythmHint('ESPERE... 🛑');
            setTimeout(() => setShowRhythmHint(null), 1000);
        }
    }, [timing]);

    return (
        <div className={cn("pointer-events-none absolute inset-0 z-50", className)}>
            {/* Combo Counter (Canto Direito) */}
            <AnimatePresence>
                {comboCount > 1 && (
                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.5 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        className="absolute top-10 right-10 flex flex-col items-end"
                    >
                        <div className="flex items-baseline gap-2">
                            <span className="text-7xl font-black italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                                {comboCount}
                            </span>
                            <span className="text-xl font-black text-sky-400 uppercase tracking-tighter">Hits</span>
                        </div>
                        <motion.div 
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="bg-sky-500 text-slate-950 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-2"
                        >
                            <Flame size={12} fill="currentColor" /> Multiplicador x{Math.floor(comboCount / 5) + 1}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Rhythm Alert (Centro) */}
            <AnimatePresence>
                {showRhythmHint && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-1/3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-8 py-3 rounded-2xl border-4 border-slate-950 shadow-2xl flex items-center gap-3"
                    >
                        <AlertCircle size={24} />
                        <span className="text-xl font-black uppercase">{showRhythmHint}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bloom de Acerto (Centralizado na ação) */}
            <AnimatePresence>
                {performance.isInTune && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1.5] }}
                        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15)_0%,transparent_70%)]"
                    />
                )}
            </AnimatePresence>

            {/* Indicador de Afinação em Tempo Real (Canto Inferior) */}
            <div className="absolute bottom-10 left-10 flex items-center gap-6 bg-slate-900/80 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 shadow-2xl">
                <div className="relative">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                        performance.isInTune ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-600"
                    )}>
                        {performance.isInTune ? <Sparkles size={24} /> : <Zap size={24} />}
                    </div>
                    {performance.isInTune && (
                        <motion.div 
                            layoutId="tune-glow"
                            className="absolute -inset-2 bg-emerald-500/20 blur-xl rounded-full"
                        />
                    )}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Afinação Real</p>
                    <div className="flex items-center gap-4">
                        <span className="text-3xl font-black text-white">{performance.isDetected ? Math.abs(performance.cents) : '--'}</span>
                        <div className="w-32 h-2 bg-slate-950 rounded-full relative overflow-hidden border border-white/5">
                            <motion.div 
                                animate={{ x: `${(performance.cents / 50) * 100}%` }}
                                className={cn(
                                    "absolute top-0 left-1/2 w-1 h-full",
                                    performance.isInTune ? "bg-emerald-400 shadow-[0_0_10px_#10b981]" : "bg-red-400"
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
