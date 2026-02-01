import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getScaleNotes, getChordTones, getNoteName, getNoteTemperatureColor, NOTES_CHROMATIC } from '../../lib/theoryEngine';
import { useTuning } from '../../contexts/TuningContext';
import { useScreenMode } from '../../hooks/useScreenMode';
import { cn } from '../../lib/utils';
import { Settings2, Monitor, Zap } from 'lucide-react';

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

    // Design Tokens Adaptativos para Modo TV (Cyberpunk-pedagogic)
    const styles = {
        bg: isTvMode ? "bg-black" : "bg-slate-900/90",
        border: isTvMode ? "border-sky-500/50 shadow-[0_0_50px_rgba(56,189,248,0.1)]" : "border-white/5",
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
            {/* Overlay de Brilho modo TV */}
            {isTvMode && (
                <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]" />
                </div>
            )}

            <div className="flex justify-between items-center mb-10 px-2 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg transition-colors", isTvMode ? "bg-sky-500 text-slate-950" : "bg-sky-500/10 text-sky-400")}>
                            {isTvMode ? <Monitor size={20} /> : <Settings2 size={16} />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                                {isTvMode ? 'CLASSROOM HUD ACTIVE' : 'AFINAÇÃO'}
                            </span>
                            <span className="text-white font-black uppercase text-sm">
                                {activeTuning.label}
                            </span>
                        </div>
                    </div>
                </div>
                {isTvMode && (
                    <div className="flex items-center gap-3 bg-slate-950/80 px-6 py-2 rounded-full border border-sky-500/20 shadow-lg">
                        <Zap size={14} className="text-sky-400 animate-pulse" />
                        <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Sincronia Baixa Latência</span>
                    </div>
                )}
            </div>

            <div className="min-w-[1000px] relative z-10">
                <svg viewBox={`0 0 1000 ${strings.length * 40 + 40}`} className="w-full drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    {/* Braço do Violão */}
                    <rect x="40" y="20" width="920" height={strings.length * 40 - 40} fill={isTvMode ? "#050505" : "#020617"} rx="8" />
                    
                    {/* Trastes */}
                    {Array.from({ length: frets + 1 }).map((_, i) => (
                        <line key={i} x1={i * 62 + 40} y1={20} x2={i * 62 + 40} y2={strings.length * 40 - 20} stroke={styles.fretLine} strokeWidth={i === 0 ? 12 : 3} />
                    ))}

                    {/* Cordas e Notas */}
                    {strings.map((stringRoot, sIdx) => (
                        <g key={sIdx}>
                            <line x1={40} y1={sIdx * 40 + 20} x2={960} y2={sIdx * 40 + 20} stroke={styles.stringLine} strokeWidth={isTvMode ? 4 : 1 + sIdx/3} />
                            
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
                                            r={isDetected ? (isTvMode ? 22 : 14) : (isTvMode ? 14 : 11)} 
                                            animate={{ 
                                                scale: isDetected ? [1, 1.3, 1] : 1,
                                                fill: isDetected ? noteColor : (isUpcoming ? '#0ea5e9' : '#1e293b'),
                                                boxShadow: isDetected ? `0 0 20px ${noteColor}` : 'none'
                                            }}
                                            transition={{ duration: 0.15 }}
                                            className={cn("transition-all", isDetected ? "stroke-white" : "stroke-slate-800")}
                                            strokeWidth={isDetected ? 4 : 2}
                                        />
                                        <text 
                                            x={fIdx * 62 + (fIdx === 0 ? 15 : 10)} y={sIdx * 40 + 25} 
                                            textAnchor="middle" 
                                            className={cn("font-black pointer-events-none transition-all", isTvMode ? "text-[14px]" : "text-[10px]", isDetected ? "fill-black" : "fill-white")}
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