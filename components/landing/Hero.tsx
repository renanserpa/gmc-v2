import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button.tsx';
import { Sparkles, ArrowRight, PlayCircle, Star, Music, Heart } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

export const Hero = () => {
  return (
    <section className="relative pt-48 pb-32 px-6 overflow-hidden min-h-screen flex flex-col justify-center">
      {/* Background Decorativo Phygital */}
      <div className="absolute inset-0 -z-10">
        <M.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-sky-500/10 blur-[120px] rounded-full" 
        />
        <M.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full" 
        />
      </div>

      {/* Partículas de Música Flutuantes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <M.div
            key={i}
            initial={{ opacity: 0, y: 100 }}
            animate={{ 
              opacity: [0, 0.3, 0], 
              y: -500,
              x: Math.sin(i) * 100 
            }}
            transition={{ 
              duration: 10 + i * 2, 
              repeat: Infinity, 
              delay: i * 1.5 
            }}
            className="absolute"
            style={{ 
              left: `${15 + i * 15}%`,
              bottom: '-50px'
            }}
          >
            <Music size={24 + i * 8} className="text-sky-500/40" />
          </M.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto text-center space-y-12 relative z-10">
        <M.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-sky-400 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl"
        >
          <Sparkles size={14} className="text-amber-400 animate-pulse" /> 
          O Futuro do Ensino Musical Infantil
        </M.div>

        <M.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h1 className="text-6xl md:text-[10rem] font-black text-white leading-[0.85] tracking-tighter uppercase italic">
            Música leve, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-400 to-indigo-500">
              natural e divertida
            </span>
          </h1>
        </M.div>

        <M.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-lg md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed italic"
        >
          Transformando o aprendizado em uma jornada épica através da metodologia <span className="text-white font-bold">Serpa-Híbrido</span>.
        </M.p>

        <M.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6"
        >
          <Button className="w-full md:w-auto px-12 py-10 rounded-[40px] text-sm font-black uppercase tracking-widest bg-white text-slate-950 hover:bg-sky-50 transition-all hover:scale-105 shadow-[0_20px_50px_rgba(56,189,248,0.3)] border-none" rightIcon={ArrowRight}>
            Explorar Loja de Apostilas
          </Button>
          <a href="#gcm">
            <Button variant="outline" className="w-full md:w-auto px-12 py-10 rounded-[40px] text-sm font-black uppercase tracking-widest border-white/10 hover:bg-white/5 backdrop-blur-md transition-all" leftIcon={PlayCircle}>
              GCM Maestro Software
            </Button>
          </a>
        </M.div>
      </div>
    </section>
  );
};