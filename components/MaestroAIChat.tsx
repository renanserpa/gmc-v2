
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, X, MessageSquare, Zap, Loader2 } from 'lucide-react';
import { Student } from '../types';
import { getMaestroAdvice } from '../services/aiService';
import { Card, CardContent } from './ui/Card';
import { cn } from '../lib/utils';
import { uiSounds } from '../lib/uiSounds';

interface MaestroAIChatProps {
    student: Student;
}

export const MaestroAIChat: React.FC<MaestroAIChatProps> = ({ student }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [advice, setAdvice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchAdvice = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const text = await getMaestroAdvice(student);
            setAdvice(text);
            uiSounds.playSuccess();
        } catch (err) {
            setAdvice("Continue focado na sua jornada! A música é um caminho de constância.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && !advice) {
            fetchAdvice();
        }
    }, [isOpen]);

    return (
        <div className="fixed bottom-24 right-6 z-[60]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="mb-4 w-80 md:w-96"
                    >
                        <Card className="bg-slate-900 border-sky-500/30 shadow-2xl shadow-sky-900/20 overflow-hidden rounded-[32px]">
                            <div className="bg-sky-600 p-4 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="bg-white/20 p-1.5 rounded-lg">
                                        <Bot size={18} className="text-white" />
                                    </div>
                                    <span className="text-xs font-black text-white uppercase tracking-widest">Maestro Virtual</span>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>
                            <CardContent className="p-6 space-y-4">
                                <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 relative min-h-[80px] flex items-center justify-center">
                                    {loading ? (
                                        <div className="flex flex-col items-center py-4 gap-2">
                                            <Loader2 size={24} className="animate-spin text-sky-400" />
                                            <p className="text-[10px] font-black text-slate-500 uppercase">Consultando as Partituras...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm text-slate-300 leading-relaxed italic text-center">
                                                "{advice}"
                                            </p>
                                            <div className="absolute -bottom-2 -left-2 bg-sky-500 p-1 rounded-md">
                                                <Sparkles size={12} className="text-white" />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={fetchAdvice}
                                        disabled={loading}
                                        className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-sky-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Zap size={14} fill="currentColor" /> Nova Dica Técnica
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setIsOpen(!isOpen); uiSounds.playClick(); }}
                className={cn(
                    "p-5 rounded-full shadow-2xl transition-all relative flex items-center justify-center",
                    isOpen ? "bg-slate-800 text-sky-400" : "bg-sky-600 text-white"
                )}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} fill="currentColor" />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500"></span>
                    </span>
                )}
            </motion.button>
        </div>
    );
};
