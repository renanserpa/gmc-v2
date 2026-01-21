

import React, { useMemo } from 'react';
// Added AnimatePresence to framer-motion imports to fix 'Cannot find name AnimatePresence'
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface AccuracyMeterProps {
    centsDiff: number; // -100 a 100
    timingDiff: number; // segundos (-0.5 a 0.5)
    precision: 'perfect' | 'great' | 'good' | 'miss';
    isActive: boolean;
}

export const AccuracyMeter: React.FC<AccuracyMeterProps> = ({ centsDiff, timingDiff, precision, isActive }) => {
    const isTuned = Math.abs(centsDiff) < 10;
    const isOnTime = Math.abs(timingDiff) < 0.05;

    const precisionColors = {
        perfect: 'bg-amber-400 shadow-amber-500/50',
        great: 'bg-sky-400 shadow-sky-500/50',
        good: 'bg-emerald-400 shadow-emerald-500/50',
        miss: 'bg-red-500 shadow-red-500/50'
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 p-6 rounded-[32px] w-full max-w-sm shadow-2xl relative overflow-hidden group">
            {/* Pitch Gauge */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pitch Precision</span>
                    <span className={cn("text-[10px] font-mono font-black", isTuned ? "text-emerald-400" : "text-slate-400")}>
                        {centsDiff > 0 ? '+' : ''}{Math.round(centsDiff)}c
                    </span>
                </div>
                <div className="relative h-6 bg-slate-950 rounded-full border border-white/5 flex items-center px-1">
                    <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-emerald-500/20" />
                    <motion.div 
                        animate={{ x: `${(centsDiff / 100) * 100}%` }}
                        className={cn(
                            "w-4 h-4 rounded-full shadow-lg relative z-10",
                            isTuned ? "bg-emerald-400 shadow-emerald-500/40" : "bg-sky-500"
                        )}
                    />
                </div>
            </div>

            {/* Timing Gauge */}
            <div className="space-y-4 mt-8">
                <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Timing Sync</span>
                    <span className={cn("text-[10px] font-mono font-black", isOnTime ? "text-amber-400" : "text-slate-400")}>
                        {Math.round(timingDiff * 1000)}ms
                    </span>
                </div>
                <div className="relative h-6 bg-slate-950 rounded-full border border-white/5 flex items-center px-1">
                    <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-amber-500/20" />
                    <motion.div 
                        animate={{ x: `${(timingDiff / 0.5) * 100}%` }}
                        className={cn(
                            "w-4 h-4 rounded-full shadow-lg relative z-10",
                            isOnTime ? "bg-amber-400 shadow-amber-500/40" : "bg-sky-500"
                        )}
                    />
                </div>
            </div>

            {/* Judgement Badge */}
            <AnimatePresence mode="wait">
                {isActive && (
                    <motion.div 
                        key={precision}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cn(
                            "absolute top-4 right-4 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter text-white",
                            precisionColors[precision]
                        )}
                    >
                        {precision}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-6 flex justify-between gap-4">
                 <div className="flex-1 text-center bg-slate-950/50 p-2 rounded-2xl border border-white/5">
                     <p className="text-[8px] font-black text-slate-600 uppercase">Tuning</p>
                     <p className={cn("text-xs font-black", isTuned ? "text-emerald-400" : "text-white")}>{isTuned ? 'LOCKED' : 'DRIFTING'}</p>
                 </div>
                 <div className="flex-1 text-center bg-slate-950/50 p-2 rounded-2xl border border-white/5">
                     <p className="text-[8px] font-black text-slate-600 uppercase">Rhythm</p>
                     <p className={cn("text-xs font-black", isOnTime ? "text-amber-400" : "text-white")}>{isOnTime ? 'TIGHT' : 'LOOSE'}</p>
                 </div>
            </div>
        </div>
    );
};