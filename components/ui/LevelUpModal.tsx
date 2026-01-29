import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles, X } from 'lucide-react';
import { LottiePlayer } from './LottiePlayer.tsx';
import { Button } from './Button.tsx';
import { uiSounds } from '../../lib/uiSounds.ts';

// FIX: Casting motion components to any to bypass property errors
const M = motion as any;

interface LevelUpModalProps {
  level: number;
  isOpen: boolean;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ level, isOpen, onClose }) => {
  React.useEffect(() => {
    if (isOpen) {
      uiSounds.playSuccess();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <M.div
            initial={{ opacity: 0 } as any}
            animate={{ opacity: 1 } as any}
            exit={{ opacity: 0 } as any}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            onClick={onClose}
          />
          
          <M.div
            initial={{ scale: 0.8, opacity: 0, y: 20 } as any}
            animate={{ scale: 1, opacity: 1, y: 0 } as any}
            exit={{ scale: 0.8, opacity: 0, y: 20 } as any}
            className="relative bg-slate-900 border border-sky-500/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl shadow-sky-500/20"
          >
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40">
                <LottiePlayer animationUrl="https://lottie.host/81a22334-b9d9-4b10-86bc-5a4d4b1a6428/MTUnLDVq5W.json" />
            </div>

            <div className="mt-8 space-y-6">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-sky-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                    <div className="relative bg-slate-800 p-4 rounded-full border-2 border-sky-400">
                        <Trophy size={48} className="text-sky-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-400 to-indigo-500 uppercase tracking-tighter">
                        LEVEL UP!
                    </h2>
                    <p className="text-slate-400 font-medium">Você atingiu o nível</p>
                    <div className="text-7xl font-black text-white">{level}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
                        <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                        <span className="block text-xs text-slate-500 uppercase font-bold">Mais XP</span>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
                        <Sparkles className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                        <span className="block text-xs text-slate-500 uppercase font-bold">Novos Itens</span>
                    </div>
                </div>

                <Button onClick={onClose} className="w-full py-4 text-lg">
                    Continuar Jornada
                </Button>
            </div>

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </M.div>
        </div>
      )}
    </AnimatePresence>
  );
};