
import React from 'react';
import { motion } from 'framer-motion';
import { TabExercise, TabMeasure } from '../../lib/tabsStore.ts';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

interface TabRendererProps {
  exercise: TabExercise;
  activeMeasure: number;
  onMeasureClick: (index: number) => void;
  zoom: number;
}

export const TabRenderer: React.FC<TabRendererProps> = ({ 
  exercise, 
  activeMeasure, 
  onMeasureClick,
  zoom 
}) => {
  const stringsCount = 6;
  const stringNames = ['E', 'B', 'G', 'D', 'A', 'E'];
  const measureWidth = 200 * zoom;
  const stringSpacing = 20 * zoom;

  return (
    <div className="w-full overflow-x-auto custom-scrollbar py-10 px-4 flex justify-center bg-slate-950/30 rounded-[40px] border border-white/5">
      <div className="flex items-start min-w-max relative">
        {/* Nomes das Cordas */}
        <div className="mr-4 mt-[-4px]">
          {stringNames.map((name, i) => (
            <div key={i} style={{ height: stringSpacing }} className="text-[10px] font-black text-slate-700 flex items-center">
              {name}
            </div>
          ))}
        </div>

        {/* Desenho dos Compassos */}
        <div className="flex">
          {exercise.measures.map((measure, mIdx) => (
            <div 
              key={mIdx}
              onClick={() => onMeasureClick(mIdx)}
              className={cn(
                "relative transition-all duration-300 cursor-pointer group",
                activeMeasure === mIdx ? "opacity-100" : "opacity-40 hover:opacity-60"
              )}
              style={{ width: measureWidth, height: (stringsCount - 1) * stringSpacing }}
            >
              {/* Highlight Background */}
              {activeMeasure === mIdx && (
                <M.div 
                  layoutId="measure-highlight"
                  className="absolute -inset-2 bg-sky-500/10 rounded-xl border-2 border-sky-500/30 z-0"
                />
              )}

              {/* Linhas das Cordas */}
              {Array.from({ length: stringsCount }).map((_, sIdx) => (
                <div 
                  key={sIdx} 
                  className="absolute w-full h-px bg-slate-800" 
                  style={{ top: sIdx * stringSpacing }} 
                />
              ))}

              {/* Barra Final do Compasso */}
              <div className="absolute right-0 top-0 h-full w-px bg-slate-700" />

              {/* Notas */}
              {measure.notes.map((note, nIdx) => {
                const xPos = (nIdx + 1) * (measureWidth / (measure.notes.length + 1));
                const yPos = (note.string - 1) * stringSpacing;
                return (
                  <div 
                    key={nIdx}
                    className={cn(
                      "absolute -translate-x-1/2 -translate-y-1/2 font-black font-mono transition-all z-10",
                      activeMeasure === mIdx ? "text-white scale-110" : "text-slate-500"
                    )}
                    style={{ left: xPos, top: yPos, fontSize: 12 * zoom }}
                  >
                    <div className="bg-slate-950 px-1 rounded-sm leading-none">
                      {note.fret}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
