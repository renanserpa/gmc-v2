
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { getSubstitutions } from '../../lib/theoryEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Replace, ArrowRight } from 'lucide-react';
import { haptics } from '../../lib/haptics';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

export const ChordSubstitutor: React.FC = () => {
    const [targetChord, setTargetChord] = useState('C');
    const [selectedKey] = useState('C');

    const substitutions = useMemo(() => getSubstitutions(targetChord, selectedKey), [targetChord, selectedKey]);

    return (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-amber-500/5 blur-[120px] pointer-events-none" />
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <CardTitle className="text-amber-400 flex items-center gap-2">
                        <Replace size={20} /> Reharmonizer AI
                    </CardTitle>
                    <CardDescription>Substitutos para {targetChord}</CardDescription>
                </div>
                <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase px-2">Acorde:</span>
                    <input 
                        value={targetChord}
                        onChange={(e) => setTargetChord(e.target.value)}
                        className="w-16 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-white font-black text-center text-xs outline-none focus:border-amber-500 transition-all"
                    />
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                        {substitutions.map((sub, idx) => (
                            <motion.div
                                key={sub.chord}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-slate-950 border border-white/5 p-6 rounded-[32px] group hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-xl"
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-2xl font-black text-white group-hover:bg-amber-600 transition-all">
                                            {sub.chord}
                                        </div>
                                        <span className={cn(
                                            "text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest",
                                            sub.type === 'relative' ? "bg-sky-500/10 text-sky-400" :
                                            sub.type === 'tritone' ? "bg-red-500/10 text-red-400" : "bg-purple-500/10 text-purple-400"
                                        )}>
                                            {sub.type}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{sub.description}</p>
                                </div>
                                <button 
                                    onClick={() => haptics.success()}
                                    className="mt-6 w-full py-3 bg-slate-900 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    Trocar <ArrowRight size={12} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                <div className="bg-amber-500/5 p-6 rounded-[32px] border border-amber-500/10 flex items-start gap-4">
                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                        <Sparkles size={20} />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        A rearmonização muda a "cor" da base sem alterar a melodia principal.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
