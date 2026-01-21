
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Users, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TeamResonanceWidgetProps {
    avgResonance: number; // 0-100
    activeStudents: number;
    isSuperSonic: boolean;
}

export const TeamResonanceWidget: React.FC<TeamResonanceWidgetProps> = ({ avgResonance, activeStudents, isSuperSonic }) => {
    return (
        <div className={cn(
            "bg-slate-900 border-2 rounded-[40px] p-6 overflow-hidden relative shadow-2xl transition-all duration-700",
            isSuperSonic ? "border-purple-500/40 shadow-purple-500/10" : "border-white/5"
        )}>
            {/* Background Glow */}
            <motion.div 
                animate={{ opacity: isSuperSonic ? [0.1, 0.3, 0.1] : 0.05 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-sky-500/10 pointer-events-none"
            />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-3 rounded-2xl transition-all",
                        isSuperSonic ? "bg-purple-600 text-white animate-bounce" : "bg-slate-950 text-sky-400"
                    )}>
                        <Activity size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Maestro Sync Index</p>
                        <h4 className="text-lg font-black text-white uppercase tracking-tight">Ressonância Coletiva</h4>
                    </div>
                </div>
                <div className="bg-slate-950 px-3 py-1 rounded-xl border border-white/5 flex items-center gap-2">
                    <Users size={12} className="text-slate-600" />
                    <span className="text-[10px] font-black text-white">{activeStudents}</span>
                </div>
            </div>

            <div className="flex items-end gap-6 relative z-10">
                <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-end">
                         <span className={cn(
                             "text-5xl font-black tracking-tighter leading-none transition-colors",
                             avgResonance > 80 ? "text-sky-400" : "text-white"
                         )}>
                             {Math.round(avgResonance)}%
                         </span>
                         <div className="text-right">
                             <p className="text-[8px] font-black text-slate-600 uppercase">Phase Align</p>
                             <p className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">OPTIMAL</p>
                         </div>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full border border-white/5 overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${avgResonance}%` }}
                            className={cn(
                                "h-full transition-all duration-1000 relative",
                                isSuperSonic ? "bg-purple-500" : "bg-sky-500"
                            )}
                        >
                             <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </motion.div>
                    </div>
                </div>
                
                {isSuperSonic && (
                    <motion.div 
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="p-3 bg-amber-500 text-slate-900 rounded-2xl shadow-lg"
                    >
                        <Zap size={24} fill="currentColor" />
                    </motion.div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2">
                <Sparkles size={12} className="text-sky-500" />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">A classe está vibrando em harmonia!</span>
            </div>
        </div>
    );
};
