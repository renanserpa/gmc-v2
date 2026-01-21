
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Flame } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FlowZoneOverlayProps {
    flowFactor: number; // 0 a 1
    isActive: boolean;
}

export const FlowZoneOverlay: React.FC<FlowZoneOverlayProps> = ({ flowFactor, isActive }) => {
    const isFever = flowFactor > 0.85 && isActive;

    return (
        <AnimatePresence>
            {isFever && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
                >
                    {/* Vinheta de Energia */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(56,189,248,0.1)_100%)] shadow-[inset_0_0_150px_rgba(56,189,248,0.2)]" />
                    
                    {/* Partículas de Flow */}
                    <motion.div 
                        animate={{ 
                            y: [0, -1000],
                            opacity: [0, 1, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-0 left-0 w-full h-full flex justify-around opacity-30"
                    >
                        {[...Array(12)].map((_, i) => (
                            <Zap key={i} className="text-sky-400" size={16 + (i % 4) * 8} />
                        ))}
                    </motion.div>

                    <motion.div 
                        initial={{ scale: 0.8, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                    >
                        <div className="bg-sky-500 text-white px-6 py-2 rounded-full border-2 border-white shadow-[0_0_30px_#0ea5e9] flex items-center gap-3">
                            <Sparkles size={20} className="animate-spin" />
                            <span className="text-xl font-black uppercase italic tracking-tighter">FEVER MODE: ULTRA SYNC</span>
                        </div>
                        <span className="text-[10px] font-black text-sky-400 uppercase tracking-[0.4em] drop-shadow-lg">Multiplicador de XP x2 Ativo</span>
                    </motion.div>

                    {/* Blue Fire em volta das bordas */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent blur-sm" />
                    <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent blur-sm" />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
