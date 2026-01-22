import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mb-8"
      >
        <div className="absolute -inset-8 bg-sky-500/20 rounded-full blur-3xl" />
        <div className="relative bg-slate-900 p-6 rounded-[32px] border border-white/5 shadow-2xl">
          <Loader2 className="animate-spin text-sky-400" size={40} />
        </div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]"
      >
        Carregando Módulo...
      </motion.p>
    </div>
  );
};

export default LoadingScreen;
