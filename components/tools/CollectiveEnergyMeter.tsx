
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, Star, Trophy, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CollectiveEnergyMeterProps {
    hits: number;
    goal: number;
    isTvMode?: boolean;
}

export const CollectiveEnergyMeter: React.FC<CollectiveEnergyMeterProps> = ({ hits, goal, isTvMode }) => {
    const percentage = useMemo(() => Math.min((hits / goal) * 100, 100), [hits, goal]);
    const isFull = percentage >= 100;
    const isSuperSonic = percentage > 80;
    const isGrooving = percentage > 40;

    const tierColor = useMemo(() => {
        if (isFull) return 'text-amber-400';
        if (isSuperSonic) return 'text-purple-400';
        if (isGrooving) return 'text-sky-400';
        return 'text-slate-500';
    }, [isFull, isSuperSonic, isGrooving]);

    return (
        <div className={cn(
            "relative bg-slate-950/80 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl transition-all duration-700",
            isTvMode ? "p-10 w-full" : "p-6 w-80",
            isSuperSonic && "border-purple-500/30 shadow-purple-500/10"
        )}>
            {/* Background Glow dinâmico por Tier */}
            <motion.div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                animate={{ 
                    backgroundColor: isFull ? '#f59e0b' : isSuperSonic ? '#a855f7' : '#0ea5e9',
                    opacity: isSuperSonic ? [0.1, 0.4, 0.1] : [0.1, 0.2, 0.1]
                }}
                transition={{ duration: isSuperSonic ? 1 : 2, repeat: Infinity }}
            />

            <div className="flex justify-between items-end mb-4 relative z-10">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                        {isFull ? 'Limite Ultrapassado' : isSuperSonic ? 'Modo Super-Sonic' : 'Energia da Sinfonia'}
                    </p>
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={isSuperSonic ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                        >
                            <Flame className={cn("transition-colors", tierColor)} size={isTvMode ? 36 : 24} fill="currentColor" />
                        </motion.div>
                        <span className={cn("font-black tracking-tighter leading-none transition-all duration-500", isTvMode ? "text-6xl" : "text-4xl", tierColor)}>
                            {hits} <span className="text-slate-700 text-lg">/ {goal}</span>
                        </span>
                    </div>
                </div>
                
                <AnimatePresence>
                    {isSuperSonic && (
                        <motion.div 
                            initial={{ scale: 0, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className={cn(
                                "px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg",
                                isFull ? "bg-amber-500 text-white" : "bg-purple-600 text-white"
                            )}
                        >
                            <Sparkles size={14} fill="currentColor" /> {isFull ? 'FESTA NO ESTÚDIO!' : 'TURBO'}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="h-8 bg-slate-900 rounded-full p-1.5 border border-white/5 relative overflow-hidden shadow-inner">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={cn(
                        "h-full rounded-full relative transition-colors duration-1000",
                        isFull ? "bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]" : 
                        isSuperSonic ? "bg-gradient-to-r from-purple-600 to-sky-400" :
                        "bg-gradient-to-r from-sky-600 to-sky-400"
                    )}
                >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] -translate-x-full animate-[shimmer_1.5s_infinite]" />
                    
                    {isSuperSonic && (
                        <motion.div 
                            animate={{ x: ['0%', '100%'], opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 left-0 w-20 h-full bg-white/20 blur-md"
                        />
                    )}
                </motion.div>
            </div>

            {isTvMode && (
                <div className="mt-6 flex justify-between px-2 items-center">
                    <div className="flex items-center gap-3">
                         <div className={cn("w-2.5 h-2.5 rounded-full", isSuperSonic ? "bg-purple-500 animate-ping" : "bg-slate-500")} />
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                             {percentage < 50 ? 'Sincronia Iniciando...' : 'Groove Coletivo Ativo'}
                         </span>
                    </div>
                    {percentage > 70 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-emerald-400">
                             <Trophy size={14} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Bônus de XP x1.5 Ativo</span>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};
