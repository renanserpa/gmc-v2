
import React from 'react';
import { Mission, MissionStatus } from '../../types';
import { Check, Clock, Sparkles } from 'lucide-react';
import { MISSION_STATUS_MAP } from '../../lib/dictionaries';
import { formatDate } from '../../lib/date';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '../../lib/haptics';
import { cn } from '../../lib/utils';

interface MissionItemProps {
    mission: Mission;
    onComplete: (mission: Mission) => void;
    index: number;
}

export const MissionItem: React.FC<MissionItemProps> = ({ mission, onComplete, index }) => {
    const statusConfig = MISSION_STATUS_MAP[mission.status] || MISSION_STATUS_MAP[MissionStatus.Pending];
    const isDone = mission.status === MissionStatus.Done;

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
                opacity: 1, 
                y: isDone ? [0, -12, 0] : 0,
                scale: isDone ? [1, 1.05, 1] : 1,
                borderColor: isDone ? 'rgba(34, 197, 94, 0.5)' : 'rgba(51, 65, 85, 1)',
                backgroundColor: isDone ? 'rgba(15, 23, 42, 0.8)' : 'rgba(30, 41, 59, 1)'
            }}
            transition={{ 
                duration: 0.6,
                y: { type: "spring", stiffness: 300, damping: 15 },
                scale: { duration: 0.4 },
                opacity: { delay: index * 0.05 }
            }}
            whileHover={{ y: isDone ? 0 : -2, scale: isDone ? 1 : 1.01 }}
            className={cn(
                "relative p-5 rounded-2xl border transition-all duration-300 overflow-hidden",
                isDone ? "shadow-[0_0_30px_rgba(34,197,94,0.1)]" : "shadow-lg"
            )}
        >
            {/* Background Glow on Completion */}
            <AnimatePresence>
                {isDone && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1.2 }}
                        className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent pointer-events-none blur-2xl"
                    />
                )}
            </AnimatePresence>

            <div className="flex gap-4 relative z-10">
                <div className="flex-shrink-0 pt-1">
                    <motion.button
                        onClick={() => {
                            if (!isDone) {
                                haptics.success();
                                onComplete(mission);
                            }
                        }}
                        disabled={isDone}
                        whileTap={!isDone ? { scale: 0.8 } : undefined}
                        className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                            isDone
                            ? "bg-green-500 text-white shadow-[0_0_25px_rgba(34,197,94,0.5)] border-none"
                            : "bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-sky-500 hover:border-sky-500 hover:text-white"
                        )}
                    >
                        <AnimatePresence mode="wait">
                            {isDone ? (
                                <motion.div
                                    key="check-done"
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: [0, 1.5, 1], rotate: 0 }}
                                    transition={{ 
                                        type: "spring", 
                                        stiffness: 500, 
                                        damping: 12,
                                        delay: 0.1 
                                    }}
                                >
                                    <Check size={24} strokeWidth={4} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="check-pending"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="w-2.5 h-2.5 rounded-full bg-current"
                                />
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                        <h3 className={cn(
                            "font-black text-lg tracking-tight transition-all duration-500",
                            isDone ? "text-slate-500 line-through opacity-60" : "text-slate-100"
                        )}>
                            {mission.title}
                        </h3>
                        <div className="flex flex-col items-end shrink-0">
                            <span className={cn(
                                "text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-widest border transition-colors",
                                isDone ? "bg-slate-800 text-slate-600 border-slate-700" : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                            )}>
                                +{mission.xp_reward} XP
                            </span>
                        </div>
                    </div>
                    
                    <p className={cn(
                        "text-sm mb-3 leading-relaxed transition-colors",
                        isDone ? "text-slate-600" : "text-slate-400"
                    )}>
                        {mission.description}
                    </p>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Clock size={12} className="text-slate-600" />
                            {formatDate(mission.created_at || new Date(), "dd MMM")}
                        </div>
                        <div className={cn(
                            "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                            statusConfig.color, statusConfig.bgColor, statusConfig.borderColor
                        )}>
                            <statusConfig.icon size={12} />
                            {statusConfig.label}
                        </div>
                        
                        {isDone && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center gap-1 text-[10px] font-black text-amber-500 uppercase tracking-widest"
                            >
                                <Sparkles size={12} /> Masterizado
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
