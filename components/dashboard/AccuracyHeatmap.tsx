
import React from 'react';
import { motion } from 'framer-motion';
import { NoteStats } from '../../lib/audioPro.ts';
import { NOTES_CHROMATIC } from '../../lib/theoryEngine.ts';
import { cn } from '../../lib/utils.ts';
import { Target, Activity, Clock } from 'lucide-react';

interface AccuracyHeatmapProps {
    heatmap: Record<number, NoteStats>;
    className?: string;
}

export const AccuracyHeatmap: React.FC<AccuracyHeatmapProps> = ({ heatmap, className }) => {
    const notes = Object.keys(heatmap).map(Number).sort((a, b) => a - b);
    
    if (notes.length === 0) return null;

    return (
        <div className={cn("bg-slate-900/40 border border-white/5 p-6 rounded-[32px] space-y-6", className)}>
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <Target size={16} className="text-sky-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Mapa de Micro-Precisão</h3>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[8px] font-black text-slate-600 uppercase">Perfeito</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-[8px] font-black text-slate-600 uppercase">Instável</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {notes.map(noteIdx => {
                    const stats = heatmap[noteIdx];
                    const noteName = NOTES_CHROMATIC[noteIdx % 12];
                    const octave = Math.floor(noteIdx / 12) - 1;
                    
                    // Cálculo de cor baseado no centsDiff e stability
                    const isStable = stats.stabilityScore > 0.85 && Math.abs(stats.avgCentsDiff) < 10;
                    const isWarning = stats.stabilityScore < 0.7 || Math.abs(stats.avgCentsDiff) > 15;

                    return (
                        <motion.div 
                            key={noteIdx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn(
                                "p-4 rounded-2xl border transition-all flex flex-col gap-3 relative overflow-hidden",
                                isStable ? "bg-emerald-500/5 border-emerald-500/20" : 
                                isWarning ? "bg-amber-500/5 border-amber-500/20" : "bg-slate-950 border-white/5"
                            )}
                        >
                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-white">{noteName}</span>
                                    <span className="text-[10px] font-bold text-slate-600">{octave}</span>
                                </div>
                                <Activity size={12} className={cn(isWarning ? "text-amber-500" : "text-slate-700")} />
                            </div>

                            <div className="space-y-1.5 relative z-10">
                                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-500">
                                    <span>Pitch</span>
                                    <span className={cn(Math.abs(stats.avgCentsDiff) > 15 ? "text-amber-400" : "text-slate-400")}>
                                        {stats.avgCentsDiff > 0 ? '+' : ''}{Math.round(stats.avgCentsDiff)}c
                                    </span>
                                </div>
                                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, stats.stabilityScore * 100)}%` }}
                                        className={cn("h-full", isWarning ? "bg-amber-500" : "bg-sky-500")}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-[8px] font-black text-slate-600 uppercase">
                                <Clock size={8} />
                                <span>Jitter: {Math.round(stats.jitter * 1000)}ms</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
