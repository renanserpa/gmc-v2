
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ChevronDown, Check, Globe, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { cn } from '../../lib/utils.ts';
import { haptics } from '../../lib/haptics.ts';

const M = motion as any;

export const SchoolSwitcher: React.FC = () => {
    const { schoolId, setSchoolOverride } = useAuth();
    const [isOpen, setIsOpen] = React.useState(false);
    
    // Busca todas as escolas em tempo real
    const { data: schools } = useRealtimeSync<any>('schools', undefined, { column: 'name', ascending: true });

    const currentSchool = schools.find(s => s.id === schoolId);

    const handleSelect = (id: string | null, name: string) => {
        haptics.medium();
        setSchoolOverride(id);
        setIsOpen(false);
        console.log(`[Maestro Switcher] Contexto alterado para: ${name}`);
    };

    return (
        <div className="relative w-full px-2">
            <button
                onClick={() => { setIsOpen(!isOpen); haptics.light(); }}
                className={cn(
                    "w-full flex items-center justify-between p-4 rounded-3xl transition-all border group",
                    isOpen ? "bg-slate-800 border-sky-500/50" : "bg-slate-950 border-white/5 hover:border-white/10"
                )}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                        {currentSchool?.branding?.logoUrl ? (
                            <img src={currentSchool.branding.logoUrl} className="w-full h-full object-contain p-1" alt="Logo" />
                        ) : (
                            <Building2 size={20} className={schoolId ? "text-sky-400" : "text-slate-500"} />
                        )}
                    </div>
                    <div className="text-left min-w-0">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Contexto Ativo</p>
                        <p className="text-xs font-black text-white truncate uppercase italic">
                            {currentSchool?.name || 'Visão Global'}
                        </p>
                    </div>
                </div>
                <ChevronDown size={14} className={cn("text-slate-600 transition-transform", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <M.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute top-full left-2 right-2 mt-2 bg-slate-900 border border-white/10 rounded-[32px] shadow-2xl z-50 overflow-hidden py-3"
                        >
                            <div className="px-5 py-2 border-b border-white/5 mb-2">
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">Alternar Unidade</span>
                            </div>

                            <button
                                onClick={() => handleSelect(null, 'Global View')}
                                className={cn(
                                    "w-full px-5 py-3 flex items-center justify-between text-[10px] font-black uppercase tracking-widest transition-colors",
                                    !schoolId ? "text-sky-400 bg-sky-500/5" : "text-slate-500 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Globe size={14} />
                                    <span>Visão Global (Root)</span>
                                </div>
                                {!schoolId && <Check size={14} />}
                            </button>

                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {schools.map(school => (
                                    <button
                                        key={school.id}
                                        onClick={() => handleSelect(school.id, school.name)}
                                        className={cn(
                                            "w-full px-5 py-3 flex items-center justify-between text-[10px] font-black uppercase tracking-widest transition-colors",
                                            schoolId === school.id ? "text-sky-400 bg-sky-500/5" : "text-slate-500 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center">
                                                {school.branding?.logoUrl ? <img src={school.branding.logoUrl} className="w-3 h-3 object-contain" /> : <Building2 size={10} />}
                                            </div>
                                            <span className="truncate">{school.name}</span>
                                        </div>
                                        {schoolId === school.id && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        </M.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
