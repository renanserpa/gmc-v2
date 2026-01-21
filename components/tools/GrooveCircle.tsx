
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { getKonnakkolForBeat } from '../../lib/rhythmEngine';

interface GrooveCircleProps {
    bpm: number;
    currentTime: number;
    isPlaying: boolean;
    className?: string;
    mode?: 'default' | 'percussion' | 'konnakkol';
    externalPulse?: number; 
}

export const GrooveCircle: React.FC<GrooveCircleProps> = ({ 
    bpm, 
    currentTime, 
    isPlaying, 
    className, 
    mode = 'konnakkol',
    externalPulse
}) => {
    const [localBeat, setLocalBeat] = useState(0);

    useEffect(() => {
        if (externalPulse !== undefined) {
            setLocalBeat(externalPulse);
        }
    }, [externalPulse]);

    const konnakkolSyllable = getKonnakkolForBeat(localBeat, 4);

    return (
        <div className={cn("relative flex items-center justify-center w-32 h-32", className)}>
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="45" className="stroke-slate-900 fill-none" strokeWidth="12" />
                
                {isPlaying && (
                    <motion.circle
                        cx="50" cy="50" r="45"
                        className={cn(
                            "fill-none transition-colors", 
                            localBeat === 0 ? "stroke-sky-400 shadow-[0_0_20px_#38bdf8]" : "stroke-slate-800"
                        )}
                        strokeWidth="12"
                        strokeDasharray="282.7"
                        animate={{ strokeDashoffset: [282.7, 0] }}
                        transition={{ duration: 60 / bpm, ease: "linear", repeat: Infinity }}
                    />
                )}

                {[0, 1, 2, 3].map(i => {
                    const angle = (i * 90) * (Math.PI / 180);
                    const cx = 50 + 45 * Math.cos(angle);
                    const cy = 50 + 45 * Math.sin(angle);
                    const isActive = localBeat === i && isPlaying;

                    return (
                        <circle
                            key={i}
                            cx={cx} cy={cy}
                            r={isActive ? 8 : 4}
                            className={cn("transition-all", isActive ? "fill-sky-400" : "fill-slate-800")}
                        />
                    );
                })}
            </svg>
            
            <div className="absolute flex flex-col items-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={konnakkolSyllable}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-center"
                    >
                        <span className={cn(
                            "text-2xl font-black transition-all uppercase italic",
                            isPlaying ? "text-white" : "text-slate-800"
                        )}>
                            {konnakkolSyllable}
                        </span>
                        {mode === 'konnakkol' && (
                            <p className="text-[7px] font-black text-sky-500 uppercase tracking-widest mt-1">Konnakkol</p>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
