import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { 
    Trophy, Star, Zap, Edit3, Plus, 
    Trash2, Save, BarChart3, Award, Sparkles,
    Settings2, ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

export default function GamificationLab() {
    const [levels, setLevels] = useState<number[]>([0, 100, 250, 450, 700, 1000]);
    const [badges, setBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const { data: bData } = await supabase.from('achievements').select('*');
        setBadges(bData || []);
        setLoading(false);
    };

    const addLevel = () => {
        const next = levels[levels.length - 1] + 300;
        setLevels([...levels, next]);
        haptics.medium();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <Sparkles className="text-amber-500" /> Progression <span className="text-amber-500">Lab</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Engenharia de Dopamina e Curva de Aprendizado</p>
                </div>
                <Button leftIcon={Save} className="bg-amber-600 hover:bg-amber-500 rounded-2xl px-8">Salvar Configuração</Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Level Curve Editor */}
                <Card className="lg:col-span-5 bg-slate-900 border-white/5 rounded-[40px] shadow-2xl">
                    <CardHeader className="border-b border-white/5 p-8">
                        <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
                            <BarChart3 size={16} className="text-sky-500" /> Curva de Níveis (XP)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        {levels.map((xp, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center font-black text-slate-500 border border-white/5">
                                    {i + 1}
                                </div>
                                <div className="flex-1 relative">
                                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={14} />
                                    <input 
                                        type="number" 
                                        value={xp}
                                        onChange={(e) => {
                                            const next = [...levels];
                                            next[i] = parseInt(e.target.value);
                                            setLevels(next);
                                        }}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white font-mono text-sm outline-none focus:border-sky-500/50"
                                    />
                                </div>
                                <button className="p-2 text-slate-700 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        <Button variant="ghost" onClick={addLevel} className="w-full border-2 border-dashed border-slate-800 rounded-2xl py-6 text-slate-500 hover:border-sky-500/50 hover:text-sky-400" leftIcon={Plus}>
                            Adicionar Rank
                        </Button>
                    </CardContent>
                </Card>

                {/* Badge Factory */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                            <Award size={16} /> Conquistas Ativas (Badges)
                        </h3>
                        <Button size="sm" variant="secondary" className="rounded-xl px-4" leftIcon={Plus}>Nova Achievement</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {badges.map(badge => (
                            <M.div 
                                key={badge.id}
                                whileHover={{ y: -5 }}
                                className="bg-slate-900 border border-white/5 p-6 rounded-[32px] flex items-start gap-4 relative group"
                            >
                                <div className="p-4 bg-slate-950 rounded-2xl text-amber-500 shadow-inner">
                                    <Trophy size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-black text-white uppercase truncate">{badge.name}</h4>
                                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{badge.description}</p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="bg-sky-500/10 text-sky-400 text-[8px] font-black px-2 py-0.5 rounded border border-sky-500/20">+{badge.xp_reward} XP</span>
                                    </div>
                                </div>
                                <button className="absolute top-4 right-4 p-2 bg-slate-950 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:text-sky-400">
                                    <Edit3 size={14} />
                                </button>
                            </M.div>
                        ))}
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-[32px] flex items-start gap-4">
                        <Settings2 className="text-amber-500 shrink-0" size={24} />
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                            <strong className="text-white uppercase">Economy Logic:</strong> A taxa de conversão padrão do Kernel v4.0 é de 10% (10 XP = 1 OlieCoin). Alterar os níveis aqui recalculará o progresso de todos os alunos na próxima sincronia.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}