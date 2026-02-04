
import React from 'react';
import { motion } from 'framer-motion';
import { LessonStep } from '../../types.ts';
import { Play, CheckCircle2, Circle, Video, Activity, Music, Brain } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

interface LessonPlaylistProps {
    steps: LessonStep[];
    currentStepId?: string;
    completedStepIds: string[];
    onStepSelect: (step: LessonStep) => void;
}

export const LessonPlaylist: React.FC<LessonPlaylistProps> = ({ 
    steps, 
    currentStepId, 
    completedStepIds, 
    onStepSelect 
}) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return Video;
            case 'exercise': return Activity;
            case 'song': return Music;
            case 'theory': return Brain;
            default: return Circle;
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Playlist da Aula</h3>
            <div className="space-y-2">
                {steps.map((step, idx) => {
                    const Icon = getIcon(step.type);
                    const isCurrent = step.id === currentStepId;
                    const isDone = completedStepIds.includes(step.id);

                    return (
                        <motion.button
                            key={step.id}
                            whileHover={{ x: 4 }}
                            onClick={() => onStepSelect(step)}
                            className={cn(
                                "w-full p-4 rounded-2xl border transition-all flex items-center gap-4 text-left group",
                                isCurrent 
                                    ? "bg-sky-600 border-white shadow-lg shadow-sky-900/20" 
                                    : isDone 
                                        ? "bg-slate-900/40 border-emerald-500/20 opacity-60" 
                                        : "bg-slate-900/60 border-white/5 hover:border-white/10"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                isCurrent ? "bg-white text-sky-600" : "bg-slate-950 text-slate-500"
                            )}>
                                {isDone ? <CheckCircle2 size={20} className="text-emerald-400" /> : <Icon size={20} />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "text-[9px] font-black uppercase tracking-widest mb-0.5",
                                    isCurrent ? "text-sky-100" : "text-slate-600"
                                )}>
                                    Passo {idx + 1} • {step.duration_mins}m
                                </p>
                                <p className={cn(
                                    "text-sm font-black truncate uppercase tracking-tight",
                                    isCurrent ? "text-white" : "text-slate-300"
                                )}>
                                    {step.title}
                                </p>
                            </div>

                            {isCurrent && (
                                <div className="w-2 h-2 bg-white rounded-full animate-ping shadow-[0_0_10px_white]" />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};
