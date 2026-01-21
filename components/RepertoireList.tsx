
import React from 'react';
import { motion } from 'framer-motion';
import { Music, PlayCircle, Trophy, BarChart3, Clock } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

interface RepertoireListProps {
    songs: any[];
}

export const RepertoireList: React.FC<RepertoireListProps> = ({ songs }) => {
    if (songs.length === 0) {
        return (
            <div className="py-20 text-center space-y-4 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[40px]">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-50">
                    <Music className="text-slate-500" />
                </div>
                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs">Seu Livro de Músicas está Vazio</h3>
                <p className="text-slate-600 text-sm max-w-xs mx-auto">Complete missões e aulas para adicionar obras ao seu repertório!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {songs.map((item, idx) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                >
                    <Card className="bg-slate-900 border-white/5 hover:border-sky-500/30 transition-all group overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-slate-950 rounded-2xl text-sky-400 shadow-inner group-hover:scale-110 transition-transform">
                                        <Music size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-white uppercase tracking-tighter truncate max-w-[180px]">
                                            {item.songs?.title || 'Obra em Estudo'}
                                        </h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                            {item.songs?.original_key} • {item.songs?.bpm} BPM
                                        </p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 border shadow-lg",
                                    item.status === 'mastered' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                                )}>
                                    {item.status === 'mastered' ? <Trophy size={12} /> : <BarChart3 size={12} />}
                                    {item.status === 'mastered' ? 'Masterizada' : 'Em Estudo'}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                    <span>Nível de Domínio</span>
                                    <span>{item.mastery_level}%</span>
                                </div>
                                <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.mastery_level}%` }}
                                        className={cn(
                                            "h-full rounded-full relative",
                                            item.mastery_level >= 100 ? "bg-emerald-500" : "bg-sky-500"
                                        )}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-2">
                                <Button className="flex-1 text-[10px] h-10" variant="secondary" leftIcon={PlayCircle}>
                                    Abrir Estúdio
                                </Button>
                                <Button className="flex-1 text-[10px] h-10" variant="ghost" leftIcon={Clock}>
                                    Histórico
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};
