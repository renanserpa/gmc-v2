import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LearningModule, ModuleStatus } from '../../types.ts';
import { Book, Zap, Music, Trophy, Lock, CheckCircle2, Star, Mountain, Trees, Waves, Ghost, Flame, Wind } from 'lucide-react';
import { cn } from '../../lib/utils.ts';
import { haptics } from '../../lib/haptics.ts';
import { UserAvatar } from '../ui/UserAvatar.tsx';

interface ModuleMapProps {
    modules: LearningModule[];
    completedIds: string[];
    onSelectModule: (mod: LearningModule) => void;
    avatarUrl?: string | null;
    studentName?: string;
}

export const ModuleMap: React.FC<ModuleMapProps> = ({ 
    modules, 
    completedIds, 
    onSelectModule, 
    avatarUrl, 
    studentName 
}) => {
    const getStatus = (mod: LearningModule, index: number): ModuleStatus => {
        if (completedIds.includes(mod.id)) return ModuleStatus.Completed;
        if (index === 0) return ModuleStatus.Available;
        const prevMod = modules[index - 1];
        return completedIds.includes(prevMod.id) ? ModuleStatus.Available : ModuleStatus.Locked;
    };

    const getBiomeConfig = (type: string) => {
        switch (type) {
            case 'theory': return { icon: Book, color: 'text-emerald-400', bg: 'bg-emerald-500/20', glow: 'shadow-emerald-500/40', biome: <Trees className="text-emerald-500/20" size={120} /> };
            case 'technique': return { icon: Zap, color: 'text-sky-400', bg: 'bg-sky-500/20', glow: 'shadow-sky-500/40', biome: <Wind className="text-sky-500/20" size={120} /> };
            case 'repertoire': return { icon: Music, color: 'text-purple-400', bg: 'bg-purple-500/20', glow: 'shadow-purple-500/40', biome: <Waves className="text-purple-500/20" size={120} /> };
            case 'boss': return { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/20', glow: 'shadow-amber-500/60', biome: <Mountain className="text-slate-500/20" size={150} /> };
            default: return { icon: Star, color: 'text-slate-400', bg: 'bg-slate-500/20', glow: 'shadow-slate-500/20', biome: null };
        }
    };

    return (
        <div className="relative w-full py-48 bg-slate-950/60 rounded-[64px] border border-white/5 overflow-hidden shadow-inner min-h-[1000px] cursor-grab active:cursor-grabbing">
            {/* World Map Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 opacity-30 animate-pulse"><Trees size={140} className="text-emerald-900" /></div>
                <div className="absolute top-[40%] right-10 opacity-20"><Mountain size={200} className="text-slate-800" /></div>
                <div className="absolute bottom-20 left-[15%] opacity-30"><Waves size={160} className="text-sky-900" /></div>
                <div className="absolute top-[20%] right-[25%] opacity-10"><Ghost size={80} className="text-purple-900" /></div>
                
                {/* Cloud Overlay */}
                <motion.div 
                    animate={{ x: [-100, 100] }} 
                    transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: "linear" }}
                    className="absolute top-1/4 left-0 w-full h-32 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent blur-3xl"
                />
            </div>

            <div className="max-w-md mx-auto flex flex-col items-center gap-40 relative z-10">
                {modules.map((mod, idx) => {
                    const status = getStatus(mod, idx);
                    const isLocked = status === ModuleStatus.Locked;
                    const isCompleted = status === ModuleStatus.Completed;
                    const isCurrent = status === ModuleStatus.Available;
                    
                    const config = getBiomeConfig(mod.icon_type);
                    const Icon = config.icon;
                    
                    // Zigue-zague dinâmico estilo Candy Crush / Mario World
                    const xOffset = Math.sin(idx * 2) * 120;

                    return (
                        <div key={mod.id} className="relative flex flex-col items-center" style={{ transform: `translateX(${xOffset}px)` }}>
                            
                            {/* Connector Trail */}
                            {idx < modules.length - 1 && (
                                <div className="absolute top-full h-40 w-1 overflow-visible">
                                    <svg className="h-full w-64 -left-32 absolute">
                                        <motion.path 
                                            d={`M 32 0 Q ${-xOffset * 0.6} 80 32 160`} 
                                            fill="none" 
                                            stroke={isCompleted ? "#10b981" : isCurrent ? "#38bdf8" : "#1e293b"} 
                                            strokeWidth="12" 
                                            strokeLinecap="round" 
                                            strokeDasharray="1 24"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            className="transition-colors duration-1000"
                                        />
                                    </svg>
                                </div>
                            )}

                            {/* Biome Decorative Background */}
                            <div className="absolute inset-0 -z-10 flex items-center justify-center scale-150 opacity-40">
                                {config.biome}
                            </div>

                            {/* Island Container */}
                            <div className="relative group">
                                {/* Floating Shadow */}
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/40 blur-xl rounded-full scale-x-150 group-hover:scale-x-110 transition-transform" />

                                {/* The Island/Node */}
                                <motion.button
                                    whileHover={!isLocked ? { y: -12, scale: 1.05 } : {}}
                                    whileTap={!isLocked ? { scale: 0.95 } : {}}
                                    onClick={() => {
                                        if (!isLocked) {
                                            haptics.heavy();
                                            onSelectModule(mod);
                                        } else {
                                            haptics.error();
                                        }
                                    }}
                                    className={cn(
                                        "relative w-32 h-32 rounded-[48px] border-4 flex flex-col items-center justify-center transition-all duration-700 shadow-2xl",
                                        isCompleted ? "bg-emerald-500/10 border-emerald-400 shadow-emerald-500/30" :
                                        isCurrent ? `${config.bg} border-sky-400 shadow-sky-400/50 animate-glow` :
                                        "bg-slate-900 border-slate-800 opacity-40 grayscale"
                                    )}
                                >
                                    {isLocked ? (
                                        <Lock className="text-slate-700" size={40} />
                                    ) : (
                                        <Icon className={cn("transition-transform group-hover:rotate-12", config.color)} size={48} />
                                    )}

                                    {/* Level Badge */}
                                    <div className="absolute -top-4 -right-4 bg-slate-950 border-2 border-slate-800 rounded-2xl w-10 h-10 flex items-center justify-center shadow-xl">
                                        <span className="text-xs font-black text-white">{idx + 1}</span>
                                    </div>

                                    {/* Completion Marker */}
                                    {isCompleted && (
                                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg border-4 border-slate-950">
                                            <CheckCircle2 size={16} strokeWidth={3} />
                                        </div>
                                    )}
                                </motion.button>

                                {/* Title Card */}
                                <div className={cn(
                                    "absolute top-1/2 -translate-y-1/2 w-64 pointer-events-none transition-all duration-500",
                                    xOffset > 0 ? "right-full mr-16 text-right" : "left-full ml-16 text-left",
                                    isLocked ? "opacity-30" : "opacity-100"
                                )}>
                                    <motion.div
                                        initial={{ opacity: 0, x: xOffset > 0 ? 20 : -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-1"
                                    >
                                        <span className={cn("text-[9px] font-black uppercase tracking-[0.4em] block", isCompleted ? "text-emerald-500" : isCurrent ? "text-sky-400" : "text-slate-600")}>
                                            {mod.icon_type === 'boss' ? 'Desafio Mestre' : `Módulo 0${idx + 1}`}
                                        </span>
                                        <h3 className="font-black text-2xl text-white uppercase tracking-tighter leading-tight drop-shadow-lg">
                                            {mod.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-2 justify-end md:justify-start">
                                            {!isCompleted && !isLocked && (
                                                <div className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1.5">
                                                    <Star size={10} className="text-amber-500" fill="currentColor" />
                                                    <span className="text-[10px] font-black text-white">+{mod.xp_reward} XP</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Player Avatar on Path (Current Location) */}
                                <AnimatePresence>
                                    {isCurrent && (
                                        <motion.div 
                                            layoutId="world-map-player"
                                            initial={{ y: -40, opacity: 0 }}
                                            animate={{ y: -85, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            className="absolute left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2"
                                        >
                                            <div className="relative">
                                                <div className="absolute -inset-4 bg-sky-500/40 rounded-full blur-2xl animate-pulse" />
                                                <UserAvatar 
                                                    src={avatarUrl} 
                                                    name={studentName || 'Hero'} 
                                                    size="lg" 
                                                    className="border-4 border-white shadow-2xl relative z-10 scale-125"
                                                />
                                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase shadow-xl z-20 border-2 border-slate-950 whitespace-nowrap">
                                                    VOCÊ ESTÁ AQUI
                                                </div>
                                            </div>
                                            <motion.div 
                                                animate={{ y: [0, 5, 0] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                                className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-sky-500"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};