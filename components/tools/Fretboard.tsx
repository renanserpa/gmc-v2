import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getScaleNotes, getChordTones, getNoteName, getNoteTemperatureColor, NOTES_CHROMATIC } from '../../lib/theoryEngine';
import { useTuning } from '../../contexts/TuningContext';
import { useScreenMode } from '../../hooks/useScreenMode';
import { cn } from '../../lib/utils';
import { Settings2, Monitor } from 'lucide-react';

interface FretboardProps {
    rootKey: string;
    scaleType?: string;
    activeChord?: string;
    detectedNoteIdx?: number | null;
    upcomingNoteIdx?: number | null;
    upcomingString?: number | null;
    capoFret?: number;
    className?: string;
}

/**
 * Fretboard Maestro Digital.
 * Suporta Modo TV (Alto Contraste) para visibilidade em sala de aula a 3 metros.
 */
export const Fretboard: React.FC<FretboardProps> = ({ 
    rootKey, scaleType = 'major', activeChord, detectedNoteIdx = null, 
    upcomingNoteIdx = null, upcomingString = null, capoFret = 0, className 
}) => {
    const { activeTuning } = useTuning();
    const { isTvMode } = useScreenMode();
    const frets = 15;
    const strings = activeTuning.notes;
    
    const rootIdx = useMemo(() => {
        const match = rootKey.match(/^([A-G][#b]?)/);
        return match ? NOTES_CHROMATIC.indexOf(match[1].replace('b', '#')) : 0;
    }, [rootKey]);

    const scaleNotes = useMemo(() => getScaleNotes(rootIdx, scaleType), [rootIdx, scaleType]);
    const chordNotes = useMemo(() => activeChord ? getChordTones(activeChord) : [], [activeChord]);

    // Design Tokens Adaptativos para Modo TV
    const styles = {
        bg: isTvMode ? "bg-black" : "bg-slate-900/90",
        border: isTvMode ? "border-sky-500/50" : "border-white/5",
        noteActive: isTvMode ? "#39FF14" : "#38bdf8", // Neon Green na TV
        noteError: "#FF3131", // Vibrant Red
        fretLine: isTvMode ? "#334155" : "#1e293b",
        stringLine: isTvMode ? "#475569" : "#334155"
    };

    return (
        <div className={cn(
            "w-full overflow-x-auto custom-scrollbar rounded-[48px] p-10 border shadow-2xl relative transition-all duration-700",
            styles.bg, styles.border, className
        )}>
            <div className="flex justify-between items-center mb-8 px-2">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
                            {isTvMode ? <Monitor size={16} /> : <Settings2 size={16} />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {isTvMode ? 'CLASSROOM TV MODE ACTIVE' : activeTuning.label}
                        </span>
                    </div>
                </div>
            </div>

            <div className="min-w-[1000px] relative">
                <svg viewBox={`0 0 1000 ${strings.length * 40 + 40}`} className="w-full">
                    {/* Braço do Violão */}
                    <rect x="40" y="20" width="920" height={strings.length * 40 - 40} fill={isTvMode ? "#000" : "#020617"} rx="4" />
                    
                    {/* Trastes */}
                    {Array.from({ length: frets + 1 }).map((_, i) => (
                        <line key={i} x1={i * 62 + 40} y1={20} x2={i * 62 + 40} y2={strings.length * 40 - 20} stroke={styles.fretLine} strokeWidth={i === 0 ? 12 : 2} />
                    ))}

                    {/* Cordas e Notas */}
                    {strings.map((stringRoot, sIdx) => (
                        <g key={sIdx}>
                            <line x1={40} y1={sIdx * 40 + 20} x2={960} y2={sIdx * 40 + 20} stroke={styles.stringLine} strokeWidth={isTvMode ? 3 : 1 + sIdx/3} />
                            
                            {Array.from({ length: frets + 1 }).map((_, fIdx) => {
                                const effectiveFret = fIdx === 0 ? capoFret : fIdx;
                                const noteIdx = (stringRoot + effectiveFret) % 12;
                                
                                const isScaleNote = scaleNotes.includes(noteIdx);
                                const isDetected = detectedNoteIdx !== null && (detectedNoteIdx % 12) === noteIdx;
                                const isUpcoming = upcomingNoteIdx === fIdx && (6 - upcomingString!) === sIdx;

                                if (!isScaleNote && !isDetected && !isUpcoming) return null;

                                const interval = (noteIdx - rootIdx + 12) % 12;
                                const noteColor = isDetected ? styles.noteActive : getNoteTemperatureColor(interval);

                                return (
                                    <g key={`${sIdx}-${fIdx}`}>
                                        <motion.circle 
                                            cx={fIdx * 62 + (fIdx === 0 ? 15 : 10)} 
                                            cy={sIdx * 40 + 20} 
                                            r={isDetected ? (isTvMode ? 18 : 14) : 11} 
                                            animate={{ 
                                                scale: isDetected ? [1, 1.3, 1] : 1,
                                                fill: isDetected ? noteColor : (isUpcoming ? '#0ea5e9' : '#1e293b')
                                            }}
                                            transition={{ duration: 0.2 }}
                                            className={cn("transition-all", isDetected ? "stroke-white" : "stroke-slate-800")}
                                            strokeWidth={isDetected ? 3 : 1}
                                        />
                                        <text 
                                            x={fIdx * 62 + (fIdx === 0 ? 15 : 10)} y={sIdx * 40 + 24} 
                                            textAnchor="middle" 
                                            className={cn("font-black pointer-events-none", isTvMode ? "text-[12px]" : "text-[9px]", isDetected ? "fill-black" : "fill-white")}
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
