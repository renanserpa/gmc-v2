
import React, { useEffect, useRef, useState } from 'react';
import { AlphaTabApi } from '@coderline/alphatab';
import { cn } from '../../lib/utils';
import { Loader2, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface InteractiveSheetProps {
  alphaTex: string;
  bpm: number;
  highlightMeasure?: number;
  onMeasureClick?: (measureIndex: number) => void;
  isPlaying?: boolean;
}

export const InteractiveSheet: React.FC<InteractiveSheetProps> = ({ 
  alphaTex, 
  bpm, 
  highlightMeasure, 
  onMeasureClick,
  isPlaying 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<AlphaTabApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Inicializa o motor profissional AlphaTab
    const api = new AlphaTabApi(containerRef.current, {
      core: {
        engine: 'svg',
      },
      display: {
        layoutMode: 'horizontal',
        staveProfile: 'scoreAndTab',
      },
      player: {
        enablePlayer: true,
        enableMetronome: true,
        enableCountIn: false
      }
    } as any);

    apiRef.current = api;

    api.renderFinished.on(() => setIsLoading(false));
    
    // Captura cliques rítmicos para navegação
    api.scoreLoaded.on((score) => {
        // Lógica de mapeamento de cliques em compassos
    });

    return () => api.destroy();
  }, []);

  useEffect(() => {
    if (apiRef.current && alphaTex) {
      apiRef.current.tex(alphaTex);
    }
  }, [alphaTex]);

  useEffect(() => {
    if (apiRef.current) {
        apiRef.current.playbackSpeed = bpm / 120; // Normaliza velocidade
        if (isPlaying) apiRef.current.play();
        else apiRef.current.pause();
    }
  }, [bpm, isPlaying]);

  return (
    <div className="relative w-full h-full bg-white rounded-[32px] overflow-hidden shadow-2xl border-[12px] border-slate-900">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md">
          <Loader2 className="animate-spin text-sky-500 mb-4" size={48} />
          <p className="text-white font-black uppercase text-[10px] tracking-widest">Sincronizando Partitura...</p>
        </div>
      )}
      
      <div className="absolute top-6 right-6 z-10 flex gap-2">
         <button className="p-3 bg-slate-900 text-white rounded-xl hover:bg-sky-600 transition-colors"><ZoomIn size={18}/></button>
         <button className="p-3 bg-slate-900 text-white rounded-xl hover:bg-sky-600 transition-colors"><ZoomOut size={18}/></button>
         <button className="p-3 bg-slate-900 text-white rounded-xl hover:bg-sky-600 transition-colors"><Maximize size={18}/></button>
      </div>

      <div ref={containerRef} className="w-full h-full overflow-y-auto p-8 custom-scrollbar alphaTab-canvas-container" />
    </div>
  );
};
