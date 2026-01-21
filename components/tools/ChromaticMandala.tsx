
import React from 'react';
import { motion } from 'framer-motion';
import { NOTES_CHROMATIC, getNoteCoords } from '../../lib/theoryEngine';
import { cn } from '../../lib/utils';

interface ChromaticMandalaProps {
    activeNotes: number[];
    rootNote?: number;
    detectedNoteIdx?: number | null; // Adicionado para feedback real
    size?: number;
    className?: string;
}

export const ChromaticMandala: React.FC<ChromaticMandalaProps> = ({ 
    activeNotes, 
    rootNote = 0, 
    detectedNoteIdx = null,
    size = 280,
    className 
}) => {
    const center = size / 2;
    const radius = size * 0.4;

    const points = activeNotes.map(idx => getNoteCoords(idx, radius, center));
    const detectedCoords = detectedNoteIdx !== null ? getNoteCoords(detectedNoteIdx, radius, center) : null;
    const rootCoords = getNoteCoords(rootNote, radius, center);

    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <svg width={size} height={size} className="overflow-visible">
                {/* Linhas de conexão (A Mandala) */}
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + (points.length > 2 ? ' Z' : '')}
                    fill="rgba(56, 189, 248, 0.1)"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />

                {/* Vetor da Nota Detectada (Feedback Real) */}
                {detectedCoords && (
                    <motion.line
                        x1={rootCoords.x}
                        y1={rootCoords.y}
                        x2={detectedCoords.x}
                        y2={detectedCoords.y}
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    />
                )}

                {/* Pontos das 12 notas */}
                {NOTES_CHROMATIC.map((note, i) => {
                    const coords = getNoteCoords(i, radius, center);
                    const isActive = activeNotes.includes(i);
                    const isDetected = detectedNoteIdx === i;

                    return (
                        <g key={note}>
                            <circle
                                cx={coords.x}
                                cy={coords.y}
                                r={isDetected ? 8 : isActive ? 6 : 3}
                                className={cn(
                                    "transition-all duration-300",
                                    isDetected ? "fill-amber-500" : isActive ? "fill-sky-400" : "fill-slate-800"
                                )}
                            />
                            {(isActive || isDetected) && (
                                <motion.circle
                                    cx={coords.x}
                                    cy={coords.y}
                                    r={isDetected ? 14 : 12}
                                    className={cn(
                                        "fill-none",
                                        isDetected ? "stroke-amber-500/50" : "stroke-sky-500/50"
                                    )}
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ repeat: Infinity, duration: isDetected ? 0.8 : 2 }}
                                />
                            )}
                            <text
                                x={coords.x}
                                y={coords.y}
                                dy={isActive || isDetected ? -15 : -10}
                                textAnchor="middle"
                                className={cn(
                                    "text-[10px] font-black uppercase tracking-tighter transition-colors",
                                    isDetected ? "fill-amber-400" : isActive ? "fill-white" : "fill-slate-600"
                                )}
                            >
                                {note}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};
