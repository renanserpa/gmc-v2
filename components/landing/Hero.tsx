import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button.tsx';
import { Sparkles, ArrowRight, PlayCircle } from 'lucide-react';

const M = motion as any;

export const Hero = () => {
  return (
    <section className="relative pt-40 pb-20 px-6 overflow-hidden">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-sky-500/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto text-center space-y-8">
        <M.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-[10px] font-black uppercase tracking-[0.3em]"
        >
          <Sparkles size={14} fill="currentColor" /> Pedagogia Musical do Futuro
        </M.div>

        <M.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter uppercase italic"
        >
          Música leve, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-400 to-indigo-500">natural e divertida</span>
        </M.h1>

        <M.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Unimos a tradição de Suzuki, Dalcroze e Gordon com tecnologia de ponta para transformar o aprendizado do seu filho em uma jornada épica.
        </M.p>

        <M.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4 pt-6"
        >
          <Button className="w-full md:w-auto px-10 py-8 rounded-[32px] text-sm font-black uppercase tracking-widest shadow-2xl shadow-sky-900/40" rightIcon={ArrowRight}>
            Explorar Apostilas
          </Button>
          <Button variant="outline" className="w-full md:w-auto px-10 py-8 rounded-[32px] text-sm font-black uppercase tracking-widest border-white/10 hover:bg-white/5" leftIcon={PlayCircle}>
            Conhecer o GCM
          </Button>
        </M.div>
      </div>
    </section>
  );
};