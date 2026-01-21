
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Star, ChevronRight } from 'lucide-react';
import { getParentEducationalInsight } from '../../services/aiService';
import { Card, CardContent } from '../ui/Card';

export const DailyFact: React.FC<{ studentActivity: string }> = ({ studentActivity }) => {
    const [fact, setFact] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const insight = await getParentEducationalInsight(studentActivity);
            setFact(insight);
            setLoading(false);
        };
        load();
    }, [studentActivity]);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border-indigo-500/30 rounded-[40px] overflow-hidden shadow-2xl relative group">
                <div className="absolute top-0 right-0 p-24 bg-sky-500/10 blur-[80px] pointer-events-none" />
                
                <CardContent className="p-8 space-y-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 text-sky-300">
                            <Brain size={28} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-sky-400 uppercase tracking-[0.3em] block mb-1">Pilar Pedagógico</span>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">O Porquê da Prática</h3>
                        </div>
                    </div>

                    <div className="bg-slate-950/60 p-6 rounded-[32px] border border-white/5 relative">
                        <Sparkles className="absolute -top-2 -right-2 text-amber-400" size={20} fill="currentColor" />
                        {loading ? (
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-slate-800 rounded-full animate-pulse" />
                                <div className="h-3 w-[70%] bg-slate-800 rounded-full animate-pulse" />
                            </div>
                        ) : (
                            <p className="text-lg font-medium text-slate-200 italic leading-relaxed">
                                "{fact}"
                            </p>
                        )}
                    </div>

                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-500 uppercase">
                            <Star size={12} className="text-amber-500" fill="currentColor" /> Maestro Knowledge Base
                        </div>
                        <button className="text-sky-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-1 hover:gap-3 transition-all">
                            Saiba Mais <ChevronRight size={14} />
                        </button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
