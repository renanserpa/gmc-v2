
import React from 'react';
import { Play, Square, Gauge, Timer as TimerIcon } from 'lucide-react';
import { Card } from '../ui/Card.tsx';
import { Button } from '../ui/Button.tsx';
import { cn } from '../../lib/utils.ts';

interface MetronomeControlProps {
  bpm: number;
  setBpm: (val: number) => void;
  isPlaying: boolean;
  onToggle: () => void;
  onPanic: () => void;
  isProgressive: boolean;
  onToggleProgressive: () => void;
}

export const MetronomeControl: React.FC<MetronomeControlProps> = ({
  bpm, setBpm, isPlaying, onToggle, onPanic, isProgressive, onToggleProgressive
}) => {
  return (
    <Card className="bg-[#0a0f1d] border-4 border-sky-500/30 rounded-[56px] p-10 shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-start mb-8">
        <div className="p-4 bg-sky-600 rounded-3xl text-white shadow-xl">
          <TimerIcon size={32} />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Master Pulse</p>
          <p className="text-6xl font-black text-white font-mono leading-none">{bpm}</p>
        </div>
      </div>

      <div className="space-y-10">
        <input 
          type="range" min="40" max="220" value={bpm} 
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-full h-4 accent-sky-500 bg-slate-900 rounded-full appearance-none cursor-pointer"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={onToggle}
            className={cn(
              "h-24 rounded-[32px] font-black text-lg uppercase tracking-widest transition-all shadow-xl",
              isPlaying ? "bg-rose-600 animate-pulse" : "bg-emerald-600"
            )}
          >
            {isPlaying ? <Square size={32} fill="white"/> : <Play size={32} fill="white"/>}
          </Button>
          <Button 
            onClick={onPanic}
            variant="outline"
            className="h-24 rounded-[32px] border-4 border-amber-500/50 text-amber-500 font-black uppercase text-xs"
            leftIcon={Gauge}
          >
            PÂNICO (-50%)
          </Button>
        </div>

        <button 
          onClick={onToggleProgressive}
          className={cn(
            "w-full py-6 rounded-3xl border-2 font-black uppercase text-[10px] tracking-[0.4em] transition-all",
            isProgressive ? "bg-purple-600 border-white text-white shadow-purple-500/50" : "bg-slate-950 border-white/5 text-slate-500"
          )}
        >
          {isProgressive ? 'PROGRESSÃO ATIVA: +5BPM / 4 COMP.' : 'ATIVAR METRÔNOMO PROGRESSIVO'}
        </button>
      </div>
    </Card>
  );
};
