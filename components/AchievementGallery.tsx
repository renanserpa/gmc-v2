
import React from 'react';
import { PlayerAchievement } from '../types';
import { motion } from 'framer-motion';
import { Trophy, Star, Shield, Zap, Sparkles, Lock } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/Tooltip';
import { cn } from '../lib/utils';

interface AchievementGalleryProps {
    achievements: PlayerAchievement[];
}

const ACHIEVEMENT_TYPES = [
    { id: 'first_lesson', name: 'Primeira Sinfonia', description: 'Compareceu à sua primeira aula no Maestro.', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { id: 'streak_3', name: 'No Compasso', description: 'Manteve um streak de 3 dias seguidos.', icon: Zap, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { id: 'mission_10', name: 'Mestre de Tarefas', description: 'Concluiu 10 missões musicais.', icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'store_item', name: 'Colecionador', description: 'Comprou seu primeiro item na Loja.', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'social_star', name: 'Estrela do Palco', description: 'Sua performance recebeu um High Five.', icon: Sparkles, color: 'text-pink-400', bg: 'bg-pink-500/10' },
];

export const AchievementGallery: React.FC<AchievementGalleryProps> = ({ achievements }) => {
    const unlockedIds = achievements.map(a => a.achievement_id);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {ACHIEVEMENT_TYPES.map((type, idx) => {
                const isUnlocked = unlockedIds.includes(type.id);
                const Icon = type.icon;

                return (
                    <Tooltip key={type.id}>
                        <TooltipTrigger asChild>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={isUnlocked ? { y: -5, scale: 1.05 } : {}}
                                className={cn(
                                    "relative flex flex-col items-center p-6 rounded-[32px] border-2 transition-all cursor-help",
                                    isUnlocked 
                                        ? "bg-slate-900 border-white/10 shadow-xl" 
                                        : "bg-slate-950/40 border-slate-800 opacity-60 grayscale"
                                )}
                            >
                                <div className={cn(
                                    "p-5 rounded-full mb-3 shadow-inner relative",
                                    isUnlocked ? type.bg : "bg-slate-900"
                                )}>
                                    {isUnlocked ? (
                                        <>
                                            <Icon className={cn("w-10 h-10", type.color)} />
                                            <motion.div 
                                                animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                                className={cn("absolute inset-0 blur-xl rounded-full", type.color.replace('text', 'bg'))}
                                            />
                                        </>
                                    ) : (
                                        <Lock className="w-10 h-10 text-slate-700" />
                                    )}
                                </div>
                                <p className={cn(
                                    "text-[10px] font-black uppercase tracking-widest text-center",
                                    isUnlocked ? "text-white" : "text-slate-600"
                                )}>
                                    {type.name}
                                </p>
                                
                                {isUnlocked && (
                                    <div className="absolute top-2 right-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    </div>
                                )}
                            </motion.div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[200px] text-center p-3">
                            <p className="font-black uppercase text-[10px] text-sky-400 mb-1">{isUnlocked ? 'Desbloqueado' : 'Bloqueado'}</p>
                            <p className="text-xs text-slate-300">{type.description}</p>
                        </TooltipContent>
                    </Tooltip>
                );
            })}
        </div>
    );
};
