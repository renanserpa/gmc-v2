
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

interface PianoBoardProps {
    activeNotes: string[]; // Notas MIDI como strings (ex: "C3", "C#3")
    onNoteToggle?: (note: string) => void;
    interactive?: boolean;
    className?: string;
}

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const PianoBoard: React.FC<PianoBoardProps> = ({ activeNotes, onNoteToggle, interactive = true, className }) => {
    const renderOctave = (octave: number) => {
        return NOTES.map((noteName) => {
            const fullNote = `${noteName}${octave}`;
            const isBlack = noteName.includes('#');
            const isActive = activeNotes.includes(fullNote);

            return (
                <button
                    key={fullNote}
                    disabled={!interactive}
                    onClick={() => onNoteToggle?.(fullNote)}
                    className={cn(
                        "relative transition-all duration-150 flex items-end justify-center pb-4 select-none",
                        isBlack 
                            ? "bg-slate-900 w-10 h-32 -mx-5 z-10 rounded-b-lg border-x border-slate-700 shadow-2xl" 
                            : "bg-white w-16 h-52 border border-slate-200 rounded-b-xl z-0 shadow-md",
                        isActive && (isBlack ? "bg-sky-500 shadow-[0_0_20px_#0ea5e9]" : "bg-sky-400 shadow-[0_0_30px_#38bdf8]"),
                        !interactive && "cursor-default"
                    )}
                >
                    <span className={cn(
                        "text-[10px] font-black pointer-events-none transition-colors",
                        isBlack ? "text-slate-500" : "text-slate-300",
                        isActive && "text-white"
                    )}>
                        {noteName}
                    </span>
                </button>
            );
        });
    };

    return (
        <div className={cn("flex justify-center bg-slate-950 p-10 rounded-[64px] border-4 border-white/5 shadow-2xl overflow-x-auto custom-scrollbar select-none", className)}>
            <div className="flex items-start">
                {renderOctave(3)}
                {renderOctave(4)}
            </div>
        </div>
    );
};
