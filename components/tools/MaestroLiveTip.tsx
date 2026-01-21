
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Zap, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MaestroLiveTipProps {
    message: string | null;
    type?: 'info' | 'warning' | 'powerup';
}

export const MaestroLiveTip: React.FC<MaestroLiveTipProps> = ({ message, type = 'info' }) => {
    const configs = {
        info: { icon: Info, color: 'text-sky-400', bg: 'bg-slate-900/90', border: 'border-sky-500/30' },
        warning: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-950/90', border: 'border-amber-500/50' },
        powerup: { icon: Zap, color: 'text-yellow-400', bg: 'bg-slate-900/90', border: 'border-yellow-400/50' }
    };

    const config = configs[type];
    const Icon = config.icon;

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, x: 100, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.8 }}
                    className={cn(
                        "fixed top-32 right-10 z-[80] p-6 rounded-[32px] border-2 shadow-2xl backdrop-blur-xl flex items-center gap-5 max-w-sm",
                        config.bg, config.border
                    )}
                >
                    <div className={cn("p-4 rounded-2xl bg-white/5", config.color)}>
                        <Icon size={32} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Dica do Maestro</p>
                        <p className="text-xl font-black text-white uppercase tracking-tight leading-tight">
                            {message}
                        </p>
                    </div>
                    <motion.div 
                        className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
