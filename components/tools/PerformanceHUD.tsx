
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface PerformanceHUDProps {
    lastJudgment: 'perfect' | 'great' | 'good' | 'miss' | null;
    centsDiff?: number;
}

export const PerformanceHUD: React.FC<PerformanceHUDProps> = ({ lastJudgment, centsDiff = 0 }) => {
    const config = {
        perfect: { text: 'PERFECT!', color: 'text-amber-400', shadow: 'shadow-amber-500/50', scale: 1.5 },
        great: { text: 'GREAT', color: 'text-sky-400', shadow: 'shadow-sky-500/50', scale: 1.2 },
        good: { text: 'GOOD', color: 'text-emerald-400', shadow: 'shadow-emerald-500/50', scale: 1.0 },
        miss: { text: 'MISS', color: 'text-red-500', shadow: 'shadow-red-500/50', scale: 0.8 },
    };

    const current = lastJudgment ? config[lastJudgment] : null;

    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none">
            <AnimatePresence mode="wait">
                {current && (
                    <motion.div
                        key={`${lastJudgment}-${Date.now()}`}
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ 
                            opacity: [0, 1, 1, 0], 
                            scale: [0.5, current.scale, current.scale, 0.8],
                            y: [20, 0, 0, -40]
                        }}
                        transition={{ duration: 0.6, times: [0, 0.1, 0.8, 1] }}
                        className={cn(
                            "font-black text-6xl italic tracking-tighter uppercase drop-shadow-2xl",
                            current.color
                        )}
                    >
                        {current.text}
                        
                        {lastJudgment !== 'miss' && Math.abs(centsDiff) > 10 && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xs font-mono not-italic text-slate-400 text-center mt-2"
                            >
                                {centsDiff > 0 ? `+${Math.round(centsDiff)}c SHARP` : `${Math.round(centsDiff)}c FLAT`}
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
