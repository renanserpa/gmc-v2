
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, User, Hammer, Book, Music, X, ArrowRight } from 'lucide-react';
// FIX: Using wildcard import for react-router-dom to bypass environment-specific export resolution errors
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;
import { haptics } from '../../lib/haptics';
import { cn } from '../../lib/utils';
import { SearchResult } from '../../types';

export const OmniSearch: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const results: SearchResult[] = [
        { id: 't-1', type: 'tool', title: 'Metrônomo', subtitle: 'Prática de Ritmo', path: '/student/practice', icon: Hammer },
        { id: 't-2', type: 'tool', title: 'Afinador', subtitle: 'Pitch Precision', path: '/student/practice', icon: Music },
        { id: 'c-1', type: 'concept', title: 'Escala Pentatônica', subtitle: 'Wiki Teoria', path: '/wiki', icon: Book },
        { id: 's-1', type: 'student', title: 'Enzo Maestro', subtitle: 'Ver Perfil', path: '/professor', icon: User },
    ];

    const filtered = query ? results.filter(r => 
        r.title.toLowerCase().includes(query.toLowerCase()) || 
        r.subtitle.toLowerCase().includes(query.toLowerCase())
    ) : [];

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            setIsOpen(prev => !prev);
            haptics.medium();
        }
        if (e.key === 'Escape') setIsOpen(false);
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-start justify-center pt-24 p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: -20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: -10 }}
                        className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden relative z-10"
                    >
                        <div className="p-6 flex items-center gap-4 border-b border-white/5">
                            <Search className="text-slate-500" size={24} />
                            <input 
                                autoFocus
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Busque por alunos, ferramentas ou conceitos (Ctrl+K)..."
                                className="bg-transparent border-none outline-none text-xl text-white w-full placeholder:text-slate-700"
                            />
                            <div className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded-lg border border-white/5">
                                <Command size={12} className="text-slate-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase">K</span>
                            </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {query && filtered.length === 0 ? (
                                <div className="py-20 text-center space-y-4 opacity-40">
                                    <X className="mx-auto" />
                                    <p className="text-sm font-black uppercase tracking-widest">Nenhum resultado encontrado</p>
                                </div>
                            ) : query ? (
                                filtered.map(res => (
                                    <button 
                                        key={res.id}
                                        onClick={() => { navigate(res.path); setIsOpen(false); haptics.light(); }}
                                        className="w-full p-4 rounded-2xl bg-slate-950/50 hover:bg-sky-600 border border-white/5 transition-all flex items-center gap-4 group"
                                    >
                                        <div className="p-3 bg-slate-900 rounded-xl group-hover:bg-white/20 text-sky-400 group-hover:text-white">
                                            <res.icon size={20} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="text-sm font-black text-white uppercase group-hover:text-white">{res.title}</p>
                                            <p className="text-[10px] font-bold text-slate-500 group-hover:text-sky-100 uppercase tracking-widest">{res.subtitle}</p>
                                        </div>
                                        <ArrowRight size={16} className="text-slate-700 group-hover:text-white" />
                                    </button>
                                ))
                            ) : (
                                <div className="p-10 text-center opacity-20">
                                    <p className="text-xs font-black uppercase tracking-widest">Digite para buscar no Ecossistema Maestro</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
