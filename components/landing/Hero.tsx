import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button.tsx';
import { Sparkles, ArrowRight, PlayCircle, Star, Music, Heart, Zap } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

export const Hero = () => {
  return (
    <section className="relative pt-48 pb-32 px-6 overflow-hidden min-h-screen flex flex-col justify-center">
      {/* Background Decorativo Phygital Avançado */}
      <div className="absolute inset-0 -z-10">
        <M.div 
          animate={{ 
            scale: [1, 1.2, 1.1, 1],
            rotate: [0, 90, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-15%] left-[-10%] w-[800px] h-[800px] bg-sky-500/10 blur-[140px] rounded-full" 
        />
        <M.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, 100, -50, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] bg-purple-500/10 blur-[120px] rounded-full" 
        />
        {/* Camada de Granulado Estético */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Partículas de Música Flutuantes com Profundidade */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <M.div
            key={i}
            initial={{ opacity: 0, y: 100, scale: 0.5 }}
            animate={{ 
              opacity: [0, 0.4, 0], 
              y: -800,
              x: Math.sin(i * 1.5) * 150,
              scale: [0.5, 1.2, 0.8],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 12 + i * 3, 
              repeat: Infinity, 
              delay: i * 2,
              ease: "linear"
            }}
            className="absolute"
            style={{ 
              left: `${10 + i * 12}%`,
              bottom: '-100px'
            }}
          >
            {i % 2 === 0 ? <Music size={24 + i * 10} className="text-sky-400/40" /> : <Zap size={20 + i * 8} className="text-purple-400/40" fill="currentColor" />}
          </M.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto text-center space-y-16 relative z-10">
        <M.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-4 px-8 py-3 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-full text-sky-400 text-[10px] font-black uppercase tracking-[0.5em] shadow-2xl ring-1 ring-white/5"
        >
          <Sparkles size={16} className="text-amber-400 animate-pulse" /> 
          O Futuro do Ensino Musical Infantil
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping ml-2" />
        </M.div>

        <M.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
          className="space-y-6"
        >
          <h1 className="text-7xl md:text-[11rem] font-black text-white leading-[0.8] tracking-tighter uppercase italic drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            Música leve, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-400 to-indigo-500 animate-gradient-x">
              natural e divertida
            </span>
          </h1>
        </M.div>

        <M.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-slate-400 text-xl md:text-3xl max-w-4xl mx-auto font-medium leading-relaxed italic"
        >
          Transformando o aprendizado em uma jornada épica através da metodologia <span className="text-white font-bold underline decoration-sky-500/50 underline-offset-8">Serpa-Híbrido</span>.
        </M.p>

        <M.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col md:flex-row items-center justify-center gap-8 pt-10"
        >
          <Button className="w-full md:w-auto px-16 py-12 rounded-[56px] text-base font-black uppercase tracking-[0.2em] bg-white text-slate-950 hover:bg-sky-50 transition-all hover:scale-105 shadow-[0_30px_70px_rgba(56,189,248,0.4)] border-none group" rightIcon={ArrowRight}>
            Apostilas e Kits
          </Button>
          <a href="#gcm">
            <Button variant="outline" className="w-full md:w-auto px-16 py-12 rounded-[56px] text-base font-black uppercase tracking-[0.2em] border-white/10 hover:bg-white/[0.03] backdrop-blur-xl transition-all shadow-2xl ring-1 ring-white/5" leftIcon={PlayCircle}>
              GCM Maestro Software
            </Button>
          </a>
        </M.div>

        {/* Social Proof Phygital */}
        <M.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-20 flex flex-col items-center gap-6"
        >
            <div className="flex -space-x-4">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-12 h-12 rounded-2xl border-4 border-[#020617] bg-slate-800 overflow-hidden shadow-xl ring-1 ring-white/10">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=avatar${i}`} alt="user" />
                    </div>
                ))}
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Junte-se a +2.500 pequenos mestres na rede</p>
        </M.div>
      </div>
    </section>
  );
};