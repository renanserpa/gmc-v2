
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card.tsx';
import { Button } from '../ui/Button.tsx';
import { LessonStep } from '../../types.ts';
import { cn } from '../../lib/utils.ts';

interface LessonScriptPanelProps {
  steps: LessonStep[];
  currentIdx: number;
  onNext: () => void;
  onPrev: () => void;
}

export const LessonScriptPanel: React.FC<LessonScriptPanelProps> = ({ steps, currentIdx, onNext, onPrev }) => {
  return (
    <div className="fixed top-24 right-10 w-80 z-50">
      <Card className="bg-slate-900/90 border-2 border-sky-500/40 rounded-[40px] shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-sky-600">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Roteiro da Missão</span>
            <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] font-black">{currentIdx + 1} / {steps.length}</span>
          </div>
          <h4 className="text-xl font-black text-white uppercase italic leading-none truncate">
            {steps[currentIdx].title}
          </h4>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <Button onClick={onPrev} variant="ghost" disabled={currentIdx === 0} className="flex-1 bg-slate-800 rounded-xl h-14"><ChevronLeft/></Button>
            <Button onClick={onNext} disabled={currentIdx === steps.length - 1} className="flex-[3] bg-sky-500 hover:bg-sky-400 rounded-xl h-14 font-black uppercase text-xs">PRÓXIMO</Button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar pr-2">
            {steps.map((step, i) => (
              <div key={step.id} className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-all",
                i === currentIdx ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" : "text-slate-600 opacity-60"
              )}>
                <span className="text-[10px] font-black font-mono">0{i+1}</span>
                <span className="text-[11px] font-bold uppercase truncate">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
