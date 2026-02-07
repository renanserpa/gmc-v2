
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNoteName } from '../../lib/theoryEngine.ts';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

const STRINGS_TUNING = [4, 11, 7, 2, 9, 4]; 
const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'];

interface GuitarBoardProps {
  selectedNotes: Set<string>;
  onNoteToggle: (sIdx: number, fIdx: number) => void;
  className?: string;
}

export const GuitarBoard: React.FC<GuitarBoardProps> = ({ selectedNotes, onNoteToggle, className }) => {
  return (
    <div className={cn("flex flex-col gap-0 w-full px-4 scale-110 origin-center", className)}>
      {STRINGS_TUNING.map((rootNote, sIdx) => (
        <div key={sIdx} className="h-16 flex items-center relative border-b-2 border-slate-800/30 last:border-0 group">
          <div className="w-14 flex items-center justify-center font-black text-slate-700 text-lg border-r-4 border-slate-800 bg-slate-900/30">
            {STRING_LABELS[sIdx]}
          </div>
          {Array.from({ length: 13 }).map((_, fIdx) => {
            const key = `${sIdx}-${fIdx}`;
            const isSelected = selectedNotes.has(key);
            const noteIdx = (rootNote + fIdx) % 12;

            return (
              <button 
                key={fIdx} 
                onClick={() => onNoteToggle(sIdx, fIdx)} 
                className={cn(
                  "flex-1 h-full border-r border-slate-800/50 flex items-center justify-center relative", 
                  fIdx === 0 && "border-r-8 border-slate-700 bg-slate-900/20"
                )}
              >
                <div className="absolute w-full h-[2px] bg-slate-800" />
                <AnimatePresence>
                  {isSelected && (
                    <M.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      exit={{ scale: 0 }}
                      className="w-10 h-10 rounded-full bg-sky-500 border-4 border-white shadow-2xl flex items-center justify-center z-10"
                    >
                      <span className="text-[12px] font-black text-white">{getNoteName(noteIdx)}</span>
                    </M.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
