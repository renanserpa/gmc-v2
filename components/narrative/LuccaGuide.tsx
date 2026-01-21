
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface LuccaGuideProps {
    message: string;
    missionTitle?: string;
    onAction?: () => void;
    isOpen: boolean;
    onClose: () => void;
}

export const LuccaGuide: React.FC<LuccaGuideProps> = ({ message, missionTitle, onAction, isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: 100, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[400px] z-[70]"
                >
                    <div className="bg-slate-900 border-2 border-sky-500/30 rounded-[40px] shadow-2xl overflow-hidden">
                        <div className="bg-sky-600 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Lucca&backgroundColor=b6e3f4`} alt="Lucca" className="w-full h-full" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/70 uppercase leading-none mb-1">Mestre Mirim</p>
                                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Lucca</h4>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {missionTitle && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] font-black text-amber-500 uppercase tracking-widest">
                                    <Star size={10} fill="currentColor" /> Missão: {missionTitle}
                                </div>
                            )}
                            <p className="text-slate-200 text-lg font-bold leading-tight">"{message}"</p>
                            <div className="flex gap-3">
                                <Button onClick={onAction} className="flex-1 py-4 rounded-2xl text-xs font-black uppercase">
                                    Aceitar Desafio <Sparkles size={14} className="ml-2" />
                                </Button>
                                <Button variant="ghost" onClick={onClose} className="px-6 rounded-2xl text-xs font-black uppercase text-slate-500">
                                    Depois
                                </Button>
                            </div>
                        </div>
                    </div>
                    <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute -top-12 -left-4 pointer-events-none hidden md:block"
                    >
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Lucca`} className="w-20 h-20 drop-shadow-2xl" alt="Lucca Avatar" />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
