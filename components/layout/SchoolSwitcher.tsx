
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Building2, ChevronDown, Check, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { haptics } from '../../lib/haptics';

export const SchoolSwitcher: React.FC = () => {
    const { activeSchool, schools, switchSchool, isLoading } = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);

    if (isLoading || schools.length <= 1 && !activeSchool) return null;

    return (
        <div className="relative px-2 mb-4">
            <button
                onClick={() => { setIsOpen(!isOpen); haptics.light(); }}
                className={cn(
                    "w-full flex items-center justify-between p-3 rounded-2xl transition-all border",
                    isOpen ? "bg-slate-800 border-white/20" : "bg-slate-900/40 border-white/5 hover:border-white/10"
                )}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                         style={{ backgroundColor: activeSchool?.branding.primaryColor || '#1e293b' }}>
                        {activeSchool?.branding.logoUrl ? (
                            <img src={activeSchool.branding.logoUrl} className="w-5 h-5 object-contain" alt="Logo" />
                        ) : (
                            <Building2 size={16} className="text-white" />
                        )}
                    </div>
                    <div className="text-left min-w-0">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Contexto</p>
                        <p className="text-xs font-black text-white truncate uppercase">
                            {activeSchool?.name || 'Alunos Particulares'}
                        </p>
                    </div>
                </div>
                <ChevronDown size={14} className={cn("text-slate-500 transition-transform", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full left-2 right-2 mb-2 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden py-2"
                        >
                            <div className="px-4 py-2 border-b border-white/5 mb-2">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Minhas Unidades</span>
                            </div>

                            {/* Opção B2C (Particulares) */}
                            <button
                                onClick={() => { switchSchool(null); setIsOpen(false); haptics.medium(); }}
                                className={cn(
                                    "w-full px-4 py-3 flex items-center justify-between text-xs font-bold transition-colors",
                                    !activeSchool ? "text-sky-400 bg-sky-500/5" : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-800 rounded-lg"><User size={14} /></div>
                                    <span>Alunos Particulares (B2C)</span>
                                </div>
                                {!activeSchool && <Check size={14} />}
                            </button>

                            {/* Lista B2B (Escolas) */}
                            {schools.map(school => (
                                <button
                                    key={school.id}
                                    onClick={() => { switchSchool(school.id); setIsOpen(false); haptics.medium(); }}
                                    className={cn(
                                        "w-full px-4 py-3 flex items-center justify-between text-xs font-bold transition-colors",
                                        activeSchool?.id === school.id ? "text-sky-400 bg-sky-500/5" : "text-slate-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${school.branding.primaryColor}20` }}>
                                            <Building2 size={14} style={{ color: school.branding.primaryColor }} />
                                        </div>
                                        <span>{school.name}</span>
                                    </div>
                                    {activeSchool?.id === school.id && <Check size={14} />}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
