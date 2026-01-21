
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HistoryEra } from '../../types';
import { Castle, Church, Crown, Music, Zap, Radio, Laptop } from 'lucide-react';
import { cn } from '../../lib/utils';
import { haptics } from '../../lib/haptics';

const ERAS: HistoryEra[] = [
    { id: 'ancient', name: 'Antiguidade', period: 'Até 476 d.C.', description: 'Liras, harpas e os primeiros cantos gregos.', color: 'from-amber-700 to-orange-900', font: 'serif', icon: Castle },
    { id: 'renaissance', name: 'Renascença', period: '1400 - 1600', description: 'Polifonia e o nascimento do alaúde.', color: 'from-emerald-700 to-teal-900', font: 'serif', icon: Church },
    { id: 'baroque', name: 'Barroco', period: '1600 - 1750', description: 'Bach, Vivaldi e o cravo onipresente.', color: 'from-purple-800 to-indigo-900', font: 'Georgia', icon: Crown },
    { id: 'classical', name: 'Clássico', period: '1750 - 1820', description: 'A perfeição de Mozart e Haydn.', color: 'from-sky-700 to-blue-900', font: 'Palatino', icon: Music },
    { id: 'romantic', name: 'Romântico', period: '1820 - 1910', description: 'A paixão de Beethoven e Chopin.', color: 'from-rose-800 to-red-950', font: 'Baskerville', icon: Zap },
    { id: 'modern', name: 'Modernismo', period: '1910 - 1950', description: 'Quebra de regras e jazz experimental.', color: 'from-slate-700 to-slate-900', font: 'Helvetica', icon: Radio },
    { id: 'contemporary', name: 'Digital', period: '1950 - Hoje', description: 'Sintetizadores, Rock e IA Musical.', color: 'from-sky-500 to-indigo-600', font: 'sans-serif', icon: Laptop },
];

export const MusicTimeline: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollXProgress } = useScroll({ container: containerRef });

    const handleEraClick = (era: HistoryEra) => {
        haptics.heavy();
        document.documentElement.style.setProperty('--era-font', era.font);
        document.documentElement.style.setProperty('--brand-primary', era.color.split(' ')[1].replace('to-', ''));
        // Emissão de evento para troca de música de fundo seria aqui
    };

    return (
        <div className="relative w-full h-[500px] bg-slate-950 rounded-[48px] border border-white/5 overflow-hidden group">
            {/* Scroll Indicator */}
            <motion.div 
                className="absolute top-0 left-0 h-1 bg-sky-500 z-50 origin-left"
                style={{ scaleX: scrollXProgress }}
            />

            <div 
                ref={containerRef}
                className="h-full flex items-center gap-10 overflow-x-auto px-20 custom-scrollbar snap-x snap-mandatory"
            >
                {ERAS.map((era, idx) => (
                    <motion.button
                        key={era.id}
                        onClick={() => handleEraClick(era)}
                        whileHover={{ y: -20, scale: 1.05 }}
                        className="snap-center shrink-0 w-[320px] h-[380px] rounded-[40px] p-8 flex flex-col justify-between text-left relative overflow-hidden group/era border border-white/5 shadow-2xl"
                    >
                        {/* Bg Gradient */}
                        <div className={cn("absolute inset-0 opacity-40 bg-gradient-to-br transition-all duration-700 group-hover/era:opacity-80", era.color)} />
                        
                        <div className="relative z-10">
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">{era.period}</span>
                            <h3 className="text-3xl font-black text-white mt-2 leading-none" style={{ fontFamily: era.font }}>{era.name}</h3>
                        </div>

                        <div className="relative z-10">
                            <p className="text-sm text-white/70 leading-relaxed font-medium mb-6">"{era.description}"</p>
                            <div className="flex justify-between items-center">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                    <era.icon size={24} className="text-white" />
                                </div>
                                <div className="text-[9px] font-black text-white uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                                    Explorar Era
                                </div>
                            </div>
                        </div>

                        {/* Parallax Element */}
                        <motion.div 
                            className="absolute -right-10 -bottom-10 opacity-10 group-hover/era:opacity-30 transition-opacity"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        >
                            <era.icon size={200} className="text-white" />
                        </motion.div>
                    </motion.button>
                ))}
            </div>

            {/* Hint overlay */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
        </div>
    );
};
