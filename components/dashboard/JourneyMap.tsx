
import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { cn } from '../../lib/utils.ts';
import { haptics } from '../../lib/haptics.ts';

const M = motion as any;

interface Lesson {
    id: string;
    title: string;
    status: 'completed' | 'current' | 'locked';
}

interface JourneyMapProps {
    lessons: Lesson[];
    onSelect: (lesson: Lesson) => void;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({ lessons, onSelect }) => {
    return (
        <div className="relative py-20 px-8 flex flex-col items-center gap-24 overflow-hidden">
            {/* Background Path (Dashed Line) */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 border-l-4 border-dashed border-white/5 z-0" />

            {lessons.map((lesson, idx) => {
                const isEven = idx % 2 === 0;
                const isLocked = lesson.status === 'locked';
                const isCurrent = lesson.status === 'current';
                const isDone = lesson.status === 'completed';

                return (
                    <M.div 
                        key={lesson.id}
                        initial={{ opacity: 0, x: isEven ? -100 : 100 }}
                        whileInView={{ opacity: 1, x: isEven ? -50 : 50 }}
                        viewport={{ once: true }}
                        className="relative z-10 flex items-center"
                    >
                        <button
                            onClick={() => { if (!isLocked) { onSelect(lesson); haptics.medium(); } }}
                            className={cn(
                                "relative w-24 h-24 rounded-[32px] flex items-center justify-center border-4 transition-all",
                                isDone ? "bg-amber-500 border-white shadow-[0_0_30px_#facc15]" :
                                isCurrent ? "bg-sky-600 border-white shadow-[0_0_40px_#38bdf8] animate-pulse" :
                                "bg-slate-900 border-slate-800"
                            )}
                        >
                            {isLocked ? <Lock className="text-slate-700" size={32} /> : 
                             isDone ? <Star className="text-white" size={32} fill="currentColor" /> :
                             <Zap className="text-white" size={32} fill="currentColor" />}
                            
                            {/* Point Label */}
                            <div className={cn(
                                "absolute w-48 pointer-events-none transition-all",
                                isEven ? "left-full ml-8 text-left" : "right-full mr-8 text-right",
                                isLocked ? "opacity-30" : "opacity-100"
                            )}>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Missão 0{idx + 1}</span>
                                <h4 className="text-sm font-black text-white uppercase italic truncate">{lesson.title}</h4>
                                {isCurrent && <span className="text-[8px] bg-sky-500 text-white px-2 py-0.5 rounded-full font-black uppercase mt-1 inline-block">Objetivo Ativo</span>}
                            </div>

                            {isDone && (
                                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full p-1 border-2 border-slate-950">
                                    <CheckCircle2 size={16} strokeWidth={3} />
                                </div>
                            )}
                        </button>
                    </M.div>
                );
            })}
        </div>
    );
};
