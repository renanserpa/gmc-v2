import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Flame, ShieldAlert, Sparkles } from 'lucide-react';
// Fix: Corrected import source for BossState to types.ts
import { BossState } from '../../types';
import { cn } from '../../lib/utils';

interface BossRaidHUDProps {
    boss: BossState;
}

export const BossRaidHUD: React.FC<BossRaidHUDProps> = ({ boss }) => {
    if (!boss.isActive) return null;

    const percentage = (boss.currentHp / boss.maxHp) * 100;
    const isCritical = boss.currentHp === 0;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-4xl px-4 pointer-events-none">
            <motion.div 
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-slate-900/40 backdrop-blur-2xl border-x-2 border-b-2 border-red-500/30 rounded-b-[48px] p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)] relative overflow-hidden"
            >
                {/* Enrage Aura */}
                <AnimatePresence>
                    {boss.isEnraged && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-red-600/5 animate-pulse"
                        />
                    )}
                </AnimatePresence>

                <div className="flex justify-between items-end mb-3 relative z-10 px-4">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "p-3 rounded-2xl transition-all",
                            boss.isEnraged ? "bg-red-600 text-white animate-bounce" : "bg-slate-950 text-red-500"
                        )}>
                            <Sword size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Technical Overlord</p>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                                {boss.name}
                            </h2>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="flex items-baseline gap-2">
                             <motion.span 
                                key={boss.currentHp}
                                initial={{ scale: 1.2, color: '#ef4444' }}
                                animate={{ scale: 1, color: '#fff' }}
                                className="text-3xl font-black tabular-nums"
                             >
                                {Math.round(boss.currentHp)}
                             </motion.span>
                             <span className="text-xs font-black text-slate-600">/ {boss.maxHp} HP</span>
                        </div>
                        {boss.isEnraged && (
                            <span className="text-[9px] font-black text-red-400 uppercase tracking-widest flex items-center justify-end gap-1">
                                <Flame size={10} fill="currentColor" /> Phase 2: Enraged
                            </span>
                        )}
                    </div>
                </div>

                <div className="h-6 bg-slate-950 rounded-full border border-white/5 p-1 relative overflow-hidden shadow-inner">
                    <motion.div 
                        initial={{ width: '100%' }}
                        animate={{ width: `${percentage}%` }}
                        className={cn(
                            "h-full rounded-full transition-all duration-300 relative",
                            boss.isEnraged ? "bg-gradient-to-r from-red-600 via-orange-500 to-red-500" : "bg-gradient-to-r from-red-600 to-rose-400"
                        )}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] -translate-x-full animate-[shimmer_2s_infinite]" />
                    </motion.div>
                </div>

                {isCritical && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4 text-center"
                    >
                        <span className="bg-emerald-500 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-900/40">
                            Victory: Mastery Gained! 🏆
                        </span>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};