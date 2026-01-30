
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Triangle, Square, Music, Target, Activity, Zap } from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { useAccessibility } from '../contexts/AccessibilityContext.tsx';

// Design Tokens - Maestro Colors
const MAESTRO_COLORS: Record<string, string> = {
  'DO': '#FF0000',
  'RE': '#FF7F00',
  'MI': '#FFFF00',
  'FA': '#00FF00',
  'SOL': '#00FFFF',
  'LA': '#0000FF',
  'SI': '#8B00FF',
};

interface RhythmPracticeTVProps {
  note?: string;
  bpm?: number;
  isZenMode?: boolean;
  accuracy?: number;
}

const M = motion as any;

export default function RhythmPracticeTV({ 
  note = "DO", 
  bpm = 120, 
  isZenMode = false, 
  accuracy = 98 
}: RhythmPracticeTVProps) {
  const { settings } = useAccessibility();
  const [progress, setProgress] = useState(0);

  // Simulação de progresso linear (Anti-Ansiedade)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 0 : prev + 0.1));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const noteColor = useMemo(() => MAESTRO_COLORS[note] || '#38bdf8', [note]);

  return (
    <div className={cn(
      "w-full h-screen flex flex-col items-center justify-between p-16 transition-all duration-1000 overflow-hidden font-sans",
      isZenMode ? "bg-[#0F172A]" : "bg-[#0A0A0A]"
    )}>
      {/* Barra de Progresso Linear Constante */}
      <div className="fixed top-0 left-0 w-full h-6 bg-white/5 z-50">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 ease-linear shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      {/* NPC Lucca: Regulador Emocional */}
      <M.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-12 left-12 flex items-center gap-8 z-40"
      >
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-white/20 overflow-hidden bg-slate-800 shadow-2xl relative z-10">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Lucca&backgroundColor=b6e3f4`} 
              alt="Lucca" 
              className={cn("w-full h-full transition-all", isZenMode ? "grayscale-0" : "brightness-110")} 
            />
          </div>
          <M.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-sky-400 blur-2xl rounded-full -z-10" 
          />
        </div>
        
        <M.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl rounded-tl-none shadow-2xl border border-white/20 max-w-sm"
        >
          <p className="text-slate-900 font-black text-2xl leading-tight uppercase italic tracking-tighter">
            {isZenMode 
              ? "Tudo bem, Rockstar! Vamos respirar fundo e tocar devagar." 
              : "Sinta o pulso! Você está no fluxo da música."}
          </p>
        </M.div>
      </M.div>

      {/* Alvo Rítmico Central: Cor + Geometria (PECS) */}
      <div className="flex-1 flex flex-col items-center justify-center gap-12 pt-20">
        <M.div 
          animate={isZenMode ? {} : { scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 60/bpm }}
          className="relative"
        >
          <div 
            className="w-[450px] h-[450px] rounded-[64px] flex items-center justify-center shadow-[0_0_120px_rgba(255,255,255,0.1)] ring-[16px] ring-white/5 transition-colors duration-500"
            style={{ backgroundColor: noteColor }}
          >
            {/* PECS: Tônica = Triângulo */}
            <Triangle 
              size={280} 
              color="white" 
              fill="white" 
              className="drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]" 
            />
          </div>
          
          {/* Brilho Reativo de Pulso */}
          <M.div 
            animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 60/bpm, ease: "easeOut" }}
            className="absolute inset-0 rounded-[64px] border-8 border-white/20"
          />
        </M.div>

        <M.h1 
          key={note}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "text-white text-[12rem] font-black tracking-widest uppercase italic drop-shadow-2xl leading-none",
            settings.dyslexicFont ? "font-dyslexic" : ""
          )}
        >
          {note}
        </M.h1>
      </div>

      {/* Performance HUD: Visibilidade 3 Metros */}
      <div className="w-full flex justify-between items-end text-white pb-12 px-16">
        <div className="space-y-2">
          <span className="flex items-center gap-3 text-4xl opacity-50 uppercase font-black tracking-[0.3em]">
            <Zap size={32} /> Tempo
          </span>
          <div className="flex items-baseline gap-4">
            <span className="text-[10rem] font-mono tabular-nums leading-none font-black tracking-tighter">
              {isZenMode ? '60' : bpm}
            </span>
            <span className="text-5xl uppercase opacity-40 font-black tracking-widest">BPM</span>
          </div>
        </div>

        <div className="text-right space-y-2">
          <span className="flex items-center justify-end gap-3 text-4xl opacity-50 uppercase font-black tracking-[0.3em]">
            Precisão <Activity size={32} />
          </span>
          <div className="flex items-baseline justify-end gap-4">
            <span className="text-[10rem] font-mono text-emerald-400 leading-none font-black tracking-tighter">
              {accuracy}%
            </span>
          </div>
        </div>
      </div>

      {/* Vinheta Estética */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}
