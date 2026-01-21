
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ComboCounterProps {
    combo: number;
    multiplier: number;
}

export const ComboCounter: React.FC<ComboCounterProps> = ({ combo, multiplier }) => {
    if (combo < 2) return null;

    const multiplierColors = {
        1: 'text-sky-400',
        2: 'text-purple-400',
        3: 'text-amber-500',
        4: 'text-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.5)]'
    };

    const color = (multiplierColors as any)[multiplier] || multiplierColors[1];

    return (
        <div className="fixed top-1/3 right-20 z-50 pointer-events-none flex flex-col items-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={combo}
                    initial={{ scale: 0.8, opacity: 0, x: 20 }}
                    animate={{ scale: 1, opacity: 1, x: 0 }}
                    exit={{ scale: 1.2, opacity: 0 }}
                    className="flex flex-col items-center"
                >
                    <div className="flex items-baseline gap-1">
                        <span className={cn("text-7xl font-black italic tracking-tighter leading-none", color)}>
                            {combo}
                        </span>
                        <span className="text-xl font-black text-slate-500 uppercase italic">Combo</span>
                    </div>
                    
                    {multiplier > 1 && (
                        <motion.div 
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={cn(
                                "mt-2 px-4 py-1 rounded-full border-2 font-black text-sm uppercase tracking-widest flex items-center gap-2",
                                multiplier === 4 ? "bg-orange-600 border-white text-white animate-pulse" : "bg-slate-900 border-current"
                            )}
                            style={{ color: multiplier === 4 ? '#fff' : 'inherit' }}
                        >
                            {multiplier === 4 ? <Flame size={16} fill="currentColor" /> : <Zap size={14} />}
                            {multiplier}X MULTIPLIER
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
