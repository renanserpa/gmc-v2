
import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Trophy, Target } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DailyGoalCardProps {
    currentMinutes: number;
    goalMinutes: number;
    className?: string;
}

export const DailyGoalCard: React.FC<DailyGoalCardProps> = ({ currentMinutes, goalMinutes, className }) => {
    const percentage = Math.min((currentMinutes / goalMinutes) * 100, 100);
    const isComplete = percentage >= 100;

    return (
        <div className={cn("bg-slate-900 border border-white/5 p-6 rounded-[32px] relative overflow-hidden group shadow-2xl", className)}>
            <div className="absolute top-0 right-0 p-16 bg-sky-500/5 blur-[60px] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Target size={14} className="text-sky-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Meta Diária</span>
                </div>
                {isComplete && (
                    <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="bg-amber-500 text-white p-1 rounded-lg"
                    >
                        <Trophy size={14} />
                    </motion.div>
                )}
            </div>

            <div className="flex flex-col items-center gap-4 py-2">
                <div className="relative w-28 h-28">
                    {/* Circle Background */}
                    <svg className="w-full h-full -rotate-90">
                        <circle cx="56" cy="56" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-950" />
                        <motion.circle 
                            cx="56" cy="56" r="50" fill="none" stroke="currentColor" strokeWidth="8"
                            strokeDasharray="314.159"
                            initial={{ strokeDashoffset: 314.159 }}
                            animate={{ strokeDashoffset: 314.159 - (314.159 * percentage) / 100 }}
                            className={cn("transition-colors duration-1000", isComplete ? "text-amber-500" : "text-sky-500")}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                            animate={isComplete ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Flame className={cn("w-8 h-8", isComplete ? "text-amber-500 fill-current" : "text-slate-800")} />
                        </motion.div>
                        <span className="text-[10px] font-black text-white mt-1">{Math.round(percentage)}%</span>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-2xl font-black text-white tabular-nums">
                        {currentMinutes}<span className="text-slate-600 text-sm font-bold">/{goalMinutes}m</span>
                    </p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                        {isComplete ? 'Meta Alcançada!' : 'Foco na Prática'}
                    </p>
                </div>
            </div>
        </div>
    );
};
