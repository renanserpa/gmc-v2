
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getScaleNotes, getChordTones, getNoteName, getNoteTemperatureColor, NOTES_CHROMATIC } from '../../lib/theoryEngine';
import { useTuning } from '../../contexts/TuningContext';
import { cn } from '../../lib/utils';
import { Settings2, Anchor } from 'lucide-react';

interface FretboardProps {
    rootKey: string;
    scaleType?: string;
    activeChord?: string;
    detectedNoteIdx?: number | null;
    upcomingNoteIdx?: number | null; // Novo: Nota que está por vir
    upcomingString?: number | null;
    capoFret?: number;
    className?: string;
}

export const Fretboard: React.FC<FretboardProps> = ({ 
    rootKey, scaleType = 'major', activeChord, detectedNoteIdx = null, upcomingNoteIdx = null, upcomingString = null, capoFret = 0, className 
}) => {
    const { activeTuning } = useTuning();
    const frets = 15;
    const strings = activeTuning.notes;
    
    const rootIdx = useMemo(() => {
        const match = rootKey.match(/^([A-G][#b]?)/);
        return match ? NOTES_CHROMATIC.indexOf(match[1].replace('b', '#')) : 0;
    }, [rootKey]);

    const scaleNotes = useMemo(() => getScaleNotes(rootIdx, scaleType), [rootIdx, scaleType]);
    const chordNotes = useMemo(() => activeChord ? getChordTones(activeChord) : [], [activeChord]);

    return (
        <div className={cn("w-full overflow-x-auto custom-scrollbar bg-slate-900/90 rounded-[48px] p-10 border border-white/5 shadow-2xl relative", className)}>
            <div className="flex justify-between items-center mb-8 px-2">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
                            <Settings2 size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{activeTuning.label}</span>
                    </div>
                    {capoFret > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500">
                            <Anchor size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Capo: Casa {capoFret}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="min-w-[1000px] relative">
                <svg viewBox={`0 0 1000 ${strings.length * 40 + 40}`} className="w-full">
                    <rect x="40" y="20" width="920" height={strings.length * 40 - 40} fill="#020617" rx="4" />
                    
                    {[3, 5, 7, 9, 12, 15].map(f => (
                        <g key={f}>
                            <circle cx={f * 62 + 8} cy={strings.length * 40 / 2 + 0} r={6} fill="#1e293b" opacity="0.4" />
                        </g>
                    ))}
                    
                    {Array.from({ length: frets + 1 }).map((_, i) => (
                        <line key={i} x1={i * 62 + 40} y1={20} x2={i * 62 + 40} y2={strings.length * 40 - 20} stroke="#1e293b" strokeWidth={i === 0 ? 12 : 2} />
                    ))}

                    {strings.map((stringRoot, sIdx) => (
                        <g key={sIdx}>
                            <line x1={40} y1={sIdx * 40 + 20} x2={960} y2={sIdx * 40 + 20} stroke="#334155" strokeWidth={1 + sIdx/3} />
                            <text x="15" y={sIdx * 40 + 24} className="text-[10px] font-black fill-slate-600 uppercase">{getNoteName(stringRoot)}</text>

                            {Array.from({ length: frets + 1 }).map((_, fIdx) => {
                                const effectiveFret = fIdx === 0 ? capoFret : fIdx;
                                const noteIdx = (stringRoot + effectiveFret) % 12;
                                
                                const isScaleNote = scaleNotes.includes(noteIdx);
                                const isChordTone = chordNotes.includes(noteIdx);
                                const isDetected = detectedNoteIdx !== null && (detectedNoteIdx % 12) === noteIdx;
                                
                                // Verifica se esta casa específica é a próxima nota esperada
                                // Nota: upcomingNoteIdx aqui deve ser comparado com o FRET se sIdx for a corda correta
                                const isUpcoming = upcomingNoteIdx === fIdx && (6 - upcomingString!) === sIdx;

                                if (!isScaleNote && !isDetected && !isUpcoming) return null;

                                const interval = (noteIdx - rootIdx + 12) % 12;
                                const thermalColor = getNoteTemperatureColor(interval);

                                return (
                                    <g key={`${sIdx}-${fIdx}`}>
                                        {/* Upcoming Phantom Note */}
                                        {isUpcoming && !isDetected && (
                                            <motion.circle 
                                                cx={fIdx * 62 + (fIdx === 0 ? 15 : 10)} 
                                                cy={sIdx * 40 + 20} 
                                                r={16} 
                                                animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.1, 1] }}
                                                transition={{ repeat: Infinity, duration: 1 }}
                                                fill="#38bdf8"
                                            />
                                        )}

                                        <motion.circle 
                                            cx={fIdx * 62 + (fIdx === 0 ? 15 : 10)} 
                                            cy={sIdx * 40 + 20} 
                                            r={isChordTone ? 14 : 11} 
                                            animate={{ 
                                                scale: isDetected ? 1.25 : 1,
                                                fill: isDetected ? '#fff' : (isChordTone ? thermalColor : isUpcoming ? '#0ea5e9' : '#1e293b')
                                            }}
                                            className={cn("transition-all", isDetected ? "stroke-sky-400" : "stroke-slate-800")}
                                            strokeWidth={isDetected ? 3 : 1}
                                        />
                                        <text 
                                            x={fIdx * 62 + (fIdx === 0 ? 15 : 10)} y={sIdx * 40 + 24} 
                                            textAnchor="middle" 
                                            className={cn("text-[9px] font-black pointer-events-none", isDetected ? "fill-slate-900" : "fill-white")}
                                        >
                                            {getNoteName(noteIdx)}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
};
