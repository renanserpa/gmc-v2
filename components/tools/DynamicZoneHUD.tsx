
import React from 'react';
import { motion } from 'framer-motion';
import { Ghost, Bird, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DynamicZoneHUDProps {
    targetZone: 'soft' | 'normal' | 'heavy';
    isActive: boolean;
}

export const DynamicZoneHUD: React.FC<DynamicZoneHUDProps> = ({ targetZone, isActive }) => {
    if (!isActive) return null;

    return (
        <div className="fixed right-32 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-8 pointer-events-none">
            <div className="flex flex-col items-center gap-4">
                <motion.div 
                    animate={targetZone === 'heavy' ? { scale: [1, 1.3, 1], opacity: 1 } : { opacity: 0.2 }}
                    className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 flex flex-col items-center gap-2"
                >
                    <Zap size={24} className="text-amber-500" />
                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Elefante</span>
                </motion.div>

                <div className="h-32 w-1 bg-slate-800 rounded-full relative overflow-hidden">
                    <motion.div 
                        animate={{ 
                            y: targetZone === 'heavy' ? -40 : targetZone === 'soft' ? 40 : 0,
                            height: '40px'
                        }}
                        className="absolute top-1/2 -translate-y-1/2 w-full bg-sky-500 shadow-[0_0_15px_#0ea5e9]"
                    />
                </div>

                <motion.div 
                    animate={targetZone === 'soft' ? { scale: [1, 1.3, 1], opacity: 1 } : { opacity: 0.2 }}
                    className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/30 flex flex-col items-center gap-2"
                >
                    <Bird size={24} className="text-sky-400" />
                    <span className="text-[8px] font-black text-sky-400 uppercase tracking-widest">Passarinho</span>
                </motion.div>
            </div>
        </div>
    );
};
