
import React from 'react';
import { Card } from '../ui/Card.tsx';
import { Skeleton } from '../ui/Skeleton.tsx';
import { LucideIcon, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip.tsx';
import { motion } from 'framer-motion';

// FIX: Casting motion components to any to bypass property errors
const M = motion as any;

interface KPICardProps {
    title: string;
    description?: string;
    value: number | string | undefined;
    icon: LucideIcon;
    color: string;
    border: string;
}

export const KPICard: React.FC<KPICardProps> = ({ title, description, value, icon: Icon, color, border }) => {
    return (
        <Card className={`border-l-4 ${border} bg-[#020617]/40 backdrop-blur-md border-white/5 shadow-sm hover:bg-slate-900/60 transition-all duration-300 group`}>
            <div className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-slate-950 ${color} group-hover:scale-110 transition-transform duration-300 shadow-inner border border-white/5`}>
                    <Icon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-2xl font-black text-slate-100 tracking-tight">
                        {value === undefined ? <Skeleton className="h-8 w-16" /> : value}
                    </div>
                    
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <M.p 
                            initial={{ opacity: 0 } as any}
                            animate={{ opacity: 1 } as any}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-[10px] text-slate-500 uppercase font-black tracking-wider truncate"
                        >
                            {title}
                        </M.p>
                        
                        {description && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <M.button 
                                        whileHover={{ scale: 1.2 } as any}
                                        whileTap={{ scale: 0.9 } as any}
                                        className="text-slate-600 hover:text-sky-400 transition-colors focus:outline-none outline-none"
                                        aria-label={`Informação sobre ${title}`}
                                    >
                                        <Info size={12} />
                                    </M.button>
                                </TooltipTrigger>
                                <TooltipContent 
                                    side="top" 
                                    className="bg-slate-950/95 backdrop-blur-xl border-sky-400/20 px-4 py-2 z-[100] shadow-2xl rounded-xl"
                                >
                                    <p className="max-w-[200px] leading-relaxed text-slate-200 text-center text-[10px] font-bold uppercase tracking-tight">
                                        {description}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};
