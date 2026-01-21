
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MusicalNote } from '../../lib/tabParser';
import { cn } from '../../lib/utils';

interface NoteHighwayProps {
    notes: MusicalNote[];
    currentTime: number;
    isPlaying: boolean;
    bpm: number;
    performanceStatus?: Record<string, 'hit' | 'miss'>;
    micAmplitude?: number; // Para brilho reativo das cordas
}

const STRING_COLORS: Record<number, string> = {
    6: 'bg-red-500 shadow-red-500/50 border-red-400',
    5: 'bg-yellow-500 shadow-yellow-500/50 border-yellow-400',
    4: 'bg-blue-500 shadow-blue-500/50 border-blue-400',
    3: 'bg-orange-500 shadow-orange-500/50 border-orange-400',
    2: 'bg-green-500 shadow-green-500/50 border-green-400',
    1: 'bg-purple-500 shadow-purple-500/50 border-purple-400',
};

const STRING_GLOW: Record<number, string> = {
    6: 'from-red-500/20',
    5: 'from-yellow-500/20',
    4: 'from-blue-500/20',
    3: 'from-orange-500/20',
    2: 'from-green-500/20',
    1: 'from-purple-500/20',
};

export const NoteHighway: React.FC<NoteHighwayProps> = ({ notes, currentTime, isPlaying, bpm, performanceStatus = {}, micAmplitude = 0 }) => {
    const pixelsPerSecond = 200;
    const lookAheadSeconds = 3;
    const hitLineY = 450;

    const visibleNotes = notes.filter(n => 
        n.time >= currentTime - 0.5 && 
        n.time <= currentTime + lookAheadSeconds
    );

    // Extrai tempos únicos de início de compasso para desenhar as linhas
    const measures = Array.from(new Set(notes.map(n => n.measure)));

    return (
        <div className="relative w-full h-[500px] bg-slate-950 rounded-[48px] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-md ring-4 ring-slate-900/50">
            {/* Background Lanes with Reactive Glow */}
            <div className="absolute inset-0 flex justify-around px-4">
                {[6, 5, 4, 3, 2, 1].map(s => (
                    <div key={s} className="relative w-px h-full bg-white/5">
                        <motion.div 
                            animate={{ opacity: isPlaying ? Math.min(0.8, micAmplitude * 2) : 0 }}
                            className={cn("absolute inset-0 bg-gradient-to-t to-transparent w-4 -left-2", STRING_GLOW[s])}
                        />
                    </div>
                ))}
            </div>

            {/* Hit Line (A "Linha da Verdade") */}
            <div className="absolute left-0 w-full h-1 bg-sky-500/40 blur-sm z-10" style={{ top: hitLineY }} />
            
            {/* Posições das Cordas / Impacto */}
            <div className="absolute left-0 w-full flex justify-around px-4" style={{ top: hitLineY - 20 }}>
                {[6, 5, 4, 3, 2, 1].map(s => (
                    <div key={s} className="flex flex-col items-center">
                         <div className={cn(
                             "w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center transition-all duration-75 bg-slate-950",
                             isPlaying && micAmplitude > 0.1 ? "border-white/30 scale-110" : ""
                         )}>
                            <span className="text-[8px] font-black text-slate-700">C{s}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Scrolling Content */}
            <div className="absolute inset-0 px-4">
                {/* Compass markers (Measure lines) */}
                {measures.map(m => {
                    const firstNote = notes.find(n => n.measure === m);
                    if (!firstNote) return null;
                    const timeDiff = firstNote.time - currentTime;
                    const yPos = hitLineY - (timeDiff * pixelsPerSecond);
                    
                    if (yPos < -10 || yPos > hitLineY + 100) return null;

                    return (
                        <div 
                            key={`measure-${m}`}
                            className="absolute left-0 w-full h-px bg-white/10 flex justify-end pr-2"
                            style={{ top: yPos }}
                        >
                            <span className="text-[7px] font-bold text-slate-700 -mt-3 uppercase">M{m}</span>
                        </div>
                    );
                })}

                {visibleNotes.map(note => {
                    const timeDiff = note.time - currentTime;
                    const yPos = hitLineY - (timeDiff * pixelsPerSecond);
                    const status = performanceStatus[note.id];
                    
                    return (
                        <motion.div
                            key={note.id}
                            layoutId={note.id}
                            initial={{ opacity: 0 }}
                            animate={{ 
                                opacity: yPos < 0 ? 0 : 1,
                                y: yPos,
                                scale: status === 'hit' ? [1, 1.3, 0] : 1,
                                rotateX: isPlaying ? [0, 5, 0] : 0
                            }}
                            className={cn(
                                "absolute w-14 h-9 rounded-2xl flex items-center justify-center transition-colors duration-200 border-b-4",
                                status === 'hit' ? "bg-emerald-500 border-emerald-400 shadow-[0_0_30px_#10b981]" :
                                status === 'miss' ? "bg-red-500 opacity-30 border-red-700" :
                                `${STRING_COLORS[note.string]} border-black/20`
                            )}
                            style={{ 
                                left: `${((6 - note.string) * 16.66) + 2}%`,
                                transform: 'translateX(-50%)',
                                zIndex: 20
                            }}
                        >
                            <span className="text-white font-black text-lg drop-shadow-md">{note.fret}</span>
                            
                            {/* Hit Particle on Line */}
                            {!status && Math.abs(timeDiff) < 0.05 && isPlaying && (
                                <motion.div 
                                    animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                                    className="absolute inset-0 bg-white rounded-2xl"
                                />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Stage Light Effect */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sky-500/5 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
        </div>
    );
};
