
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface PianoKeysProps {
    activeNotes: number[];
    className?: string;
}

export const PianoKeys: React.FC<PianoKeysProps> = ({ activeNotes, className }) => {
    // Renderiza 2 oitavas (C3 a C5)
    const keys = Array.from({ length: 24 }).map((_, i) => i + 48);

    const isBlackKey = (note: number) => {
        const mod = note % 12;
        return [1, 3, 6, 8, 10].includes(mod);
    };

    return (
        <div className={cn("flex justify-center bg-slate-950 p-8 rounded-[40px] border border-white/5 shadow-2xl overflow-x-auto", className)}>
            <div className="flex relative h-64 min-w-max">
                {keys.map((note) => {
                    const black = isBlackKey(note);
                    const active = activeNotes.includes(note);

                    return (
                        <motion.div
                            key={note}
                            animate={{ 
                                backgroundColor: active ? '#38bdf8' : (black ? '#0f172a' : '#fff'),
                                y: active ? 4 : 0
                            }}
                            className={cn(
                                "border border-slate-300 transition-all",
                                black 
                                    ? "w-8 h-40 -mx-4 z-10 rounded-b-lg border-slate-800" 
                                    : "w-12 h-64 rounded-b-xl shadow-sm"
                            )}
                        >
                            {active && (
                                <motion.div 
                                    layoutId="piano-glow"
                                    className="absolute inset-0 bg-sky-400/20 blur-xl rounded-full"
                                />
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
