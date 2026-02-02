
import React from 'react';
import { motion } from 'framer-motion';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;
import { Button } from '../ui/Button.tsx';
import { Sparkles, ArrowRight, PlayCircle, Music, Zap } from 'lucide-react';
import { uiSounds } from '../../lib/uiSounds.ts';

const M = motion as any;

export const Hero = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    uiSounds.playClick();
    navigate('/login');
  };

  return (
    <section className="relative pt-48 pb-32 px-6 overflow-hidden min-h-screen flex flex-col justify-center">
      <div className="absolute inset-0 -z-10">
        <M.div 
          animate={{ scale: [1, 1.2, 1.1, 1], rotate: [0, 90, 180, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-15%] left-[-10%] w-[800px] h-[800px] bg-sky-500/10 blur-[140px] rounded-full" 
        />
        <M.div 
          animate={{ scale: [1, 1.3, 1], x: [0, 100, -50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] bg-purple-500/10 blur-[120px] rounded-full" 
        />
      </div>

      <div className="max-w-7xl mx-auto text-center space-y-16 relative z-10">
        <M.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-4 px-8 py-3 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-full text-sky-400 text-[10px] font-black uppercase tracking-[0.5em] shadow-2xl"
        >
          <Sparkles size={16} className="text-amber-400 animate-pulse" /> 
          O Futuro do Ensino Musical Infantil
        </M.div>

        <div className="space-y-6">
          <h1 className="text-7xl md:text-[10rem] font-black text-white leading-[0.8] tracking-tighter uppercase italic drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            Música leve, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-400 to-indigo-500">
              natural e divertida
            </span>
          </h1>
        </div>

        <p className="text-slate-400 text-xl md:text-2xl max-w-4xl mx-auto font-medium leading-relaxed italic">
          Transformando o aprendizado em uma jornada épica através da metodologia <span className="text-white font-bold underline decoration-sky-500/50 underline-offset-8">Serpa-Híbrido</span>.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-10">
          <Button 
            onClick={handleStart}
            className="w-full md:w-auto px-16 py-12 rounded-[56px] text-base font-black uppercase tracking-[0.2em] bg-white text-slate-950 hover:bg-sky-50 transition-all hover:scale-105 shadow-[0_30px_70px_rgba(56,189,248,0.4)] border-none" 
            rightIcon={ArrowRight}
          >
            Começar Agora
          </Button>
          <Button 
            variant="outline" 
            onClick={handleStart}
            className="w-full md:w-auto px-16 py-12 rounded-[56px] text-base font-black uppercase tracking-[0.2em] border-white/10 hover:bg-white/[0.03] backdrop-blur-xl transition-all shadow-2xl ring-1 ring-white/5" 
            leftIcon={PlayCircle}
          >
            GCM Maestro Software
          </Button>
        </div>
      </div>
    </section>
  );
};
