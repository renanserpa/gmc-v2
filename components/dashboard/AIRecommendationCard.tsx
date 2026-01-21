
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, ArrowRight, Target, Sparkles, Zap } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { uiSounds } from '../../lib/uiSounds';

interface Recommendation {
    title: string;
    description: string;
    focusArea: 'pitch' | 'rhythm' | 'technique';
    xpReward: number;
}

interface AIRecommendationCardProps {
    recommendation: Recommendation | null;
    onAction: () => void;
}

export const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({ recommendation, onAction }) => {
    if (!recommendation) return null;

    const areaConfigs = {
        pitch: { color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30', label: 'Precisão de Notas' },
        rhythm: { color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', label: 'Timing & Groove' },
        technique: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Técnica Pura' }
    };

    const config = areaConfigs[recommendation.focusArea];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            <Card className={cn("bg-slate-900/60 border-2 overflow-hidden relative group", config.border)}>
                <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none" />
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className={cn("p-5 rounded-[28px] shadow-lg relative overflow-hidden", config.bg)}>
                                <Brain size={32} className={config.color} />
                                <motion.div 
                                    animate={{ opacity: [0, 1, 0], scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-white/10"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={cn("text-[9px] font-black uppercase tracking-[0.3em]", config.color)}>Maestro Recommendation</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                                    {recommendation.title}
                                </h3>
                                <p className="text-slate-400 text-sm mt-2 font-medium max-w-md italic">
                                    "{recommendation.description}"
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                            <div className="bg-slate-950/80 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-3 shadow-inner">
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Foco Atual</p>
                                    <p className={cn("text-[10px] font-black uppercase", config.color)}>{config.label}</p>
                                </div>
                                <div className="w-px h-6 bg-white/5" />
                                <div className="flex items-center gap-1.5">
                                    <Zap size={14} className="text-amber-500" fill="currentColor" />
                                    <span className="text-lg font-black text-white">+{recommendation.xpReward}</span>
                                </div>
                            </div>
                            <Button 
                                onClick={() => { uiSounds.playClick(); onAction(); }}
                                className="w-full md:w-auto px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-sky-900/20"
                                leftIcon={Target}
                            >
                                Iniciar Treino Focado
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
