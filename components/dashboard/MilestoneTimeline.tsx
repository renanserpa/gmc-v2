
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Flag, Zap, Calendar } from 'lucide-react';
import { formatDate } from '../../lib/date';
import { cn } from '../../lib/utils';

interface Milestone {
    id: string;
    title: string;
    date: string;
    icon: any;
    xp: number;
    isUpcoming?: boolean;
}

export const MilestoneTimeline: React.FC<{ milestones: Milestone[] }> = ({ milestones }) => {
    return (
        <div className="relative pt-12 pb-8 px-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center min-w-max gap-0 relative">
                {/* Linha de Base */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 z-0" />

                {milestones.map((ms, idx) => {
                    const Icon = ms.icon;
                    return (
                        <div key={ms.id} className="relative flex flex-col items-center w-48 shrink-0 group">
                            <div className="mb-6 relative z-10">
                                <motion.div 
                                    whileHover={{ scale: 1.2, rotate: 5 }}
                                    className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all shadow-xl",
                                        ms.isUpcoming 
                                            ? "bg-slate-900 border-slate-700 text-slate-600" 
                                            : "bg-sky-600 border-white text-white shadow-sky-900/40"
                                    )}
                                >
                                    <Icon size={20} />
                                </motion.div>
                                
                                {!ms.isUpcoming && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                                )}
                            </div>

                            <div className="text-center space-y-1 max-w-[140px]">
                                <h4 className={cn("text-[10px] font-black uppercase tracking-tighter", ms.isUpcoming ? "text-slate-600" : "text-white")}>
                                    {ms.title}
                                </h4>
                                {!ms.isUpcoming && (
                                    <p className="text-[8px] font-mono font-bold text-slate-500 uppercase flex items-center justify-center gap-1">
                                        <Calendar size={8} /> {formatDate(ms.date, 'dd MMM')}
                                    </p>
                                )}
                                {ms.isUpcoming && (
                                    <span className="text-[8px] font-black text-sky-500 uppercase tracking-widest">Em Breve</span>
                                )}
                            </div>

                            {/* Tooltip Hover Simples */}
                            <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 px-3 py-1 rounded-lg border border-white/5 text-[8px] font-black text-sky-400 whitespace-nowrap">
                                RECOMPENSA: +{ms.xp} XP
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
