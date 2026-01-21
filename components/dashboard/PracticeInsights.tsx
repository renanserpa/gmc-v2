
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../lib/utils';

interface PracticeInsightsProps {
    insight?: string;
    focusArea: 'pitch' | 'rhythm' | 'technique';
    className?: string;
}

export const PracticeInsights: React.FC<PracticeInsightsProps> = ({ insight, focusArea, className }) => {
    if (!insight) return null;

    const areaLabels = {
        pitch: "Precisão Melódica",
        rhythm: "Estabilidade Rítmica",
        technique: "Postura Técnica"
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn("bg-slate-950/80 border border-sky-500/20 rounded-[40px] p-8 relative overflow-hidden group", className)}
        >
            <div className="absolute top-0 right-0 p-24 bg-sky-500/5 blur-[80px] pointer-events-none group-hover:bg-sky-500/10 transition-colors" />
            
            <div className="flex items-start gap-6 relative z-10">
                <div className="p-4 bg-sky-600 rounded-[24px] text-white shadow-xl shadow-sky-900/40">
                    <Brain size={28} />
                </div>
                
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-500">Maestro Insight</span>
                            <div className="h-1 w-8 bg-sky-500/20 rounded-full" />
                        </div>
                        <div className="bg-slate-900 px-3 py-1 rounded-full border border-white/5">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{areaLabels[focusArea]}</span>
                        </div>
                    </div>

                    <p className="text-xl font-medium text-sky-100 leading-snug italic">
                        "{insight}"
                    </p>

                    <div className="flex items-center gap-6 pt-2">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <TrendingUp size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Evolução Detectada</span>
                        </div>
                        <div className="flex items-center gap-2 text-sky-400">
                            <Target size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Foco Cirúrgico</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Partículas decorativas */}
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-10 -right-10 opacity-10"
            >
                <Zap size={100} className="text-sky-500" />
            </motion.div>
        </motion.div>
    );
};
