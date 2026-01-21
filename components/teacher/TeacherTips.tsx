
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, GraduationCap, Info } from 'lucide-react';
import { TeacherTip } from '../../types';
import { cn } from '../../lib/utils';

const TIPS_CATALOG: TeacherTip[] = [
    { id: 't1', trigger: 'blues', title: 'A "Blue Note"', description: 'Diga ao aluno: A Blue Note (b5) é o tempero que transforma a escala em uma história.', color: 'bg-blue-600' },
    { id: 't2', trigger: 'caged', title: 'Regra de Ouro CAGED', description: 'Todo shape maior tem um "espelho" menor 3 casas atrás. Explore isso!', color: 'bg-emerald-600' },
    { id: 't3', trigger: 'spider', title: 'Postura Aranha', description: 'Check: O polegar do aluno está escondido atrás do braço? Isso dá agilidade.', color: 'bg-orange-600' }
];

export const TeacherTips: React.FC<{ activeContext: string | null }> = ({ activeContext }) => {
    const tip = TIPS_CATALOG.find(t => activeContext?.toLowerCase().includes(t.trigger));

    return (
        <AnimatePresence>
            {tip && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="fixed top-24 right-10 z-[150] w-80"
                >
                    <div className="bg-slate-900 border-2 border-white/5 rounded-[32px] shadow-2xl overflow-hidden ring-1 ring-white/10">
                        <div className={cn("p-4 flex items-center gap-3 text-white", tip.color)}>
                            <GraduationCap size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Maestro Insight</span>
                        </div>
                        <div className="p-6 space-y-3">
                            <h4 className="text-white font-black uppercase tracking-tight italic">{tip.title}</h4>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">"{tip.description}"</p>
                            <div className="pt-2 flex items-center gap-2 text-sky-400 text-[9px] font-black uppercase tracking-widest">
                                <Sparkles size={12} /> Sugestão Pedagógica IA
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
