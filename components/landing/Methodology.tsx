import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/Card.tsx';
import { Brain, Music, Sparkles, Zap, Heart, Target, Lightbulb } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

const PILLARS = [
    { 
        title: 'Mergulho Natural', 
        desc: 'Baseado em Suzuki e Gordon. O aluno aprende música como aprende a falar: ouvindo e imergindo antes da teoria.', 
        icon: Music, 
        color: 'text-sky-400',
        bg: 'bg-sky-500/10'
    },
    { 
        title: 'Corpo & Ritmo', 
        desc: 'Dalcroze lúdico. O ritmo não é contado, é sentido. Movimento e ludicidade como ferramentas de fixação.', 
        icon: Heart, 
        color: 'text-pink-500',
        bg: 'bg-pink-500/10'
    },
    { 
        title: 'Sincronia Digital', 
        desc: 'Tecnologia que apoia, não substitui. Gamificação profunda que gera o hábito da prática diária com alegria.', 
        icon: Zap, 
        color: 'text-amber-400',
        bg: 'bg-amber-500/10'
    }
];

export const Methodology = () => {
    return (
        <section id="metodologia" className="py-40 px-6 bg-[#020617] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />
            
            <div className="max-w-7xl mx-auto space-y-32">
                <div className="flex flex-col md:flex-row justify-between items-end gap-16">
                    <div className="max-w-3xl space-y-8">
                        <M.span 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="text-[11px] font-black text-sky-500 uppercase tracking-[0.5em] flex items-center gap-3"
                        >
                            <Lightbulb size={16} /> The Serpa-Hybrid Engine
                        </M.span>
                        <h2 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none">
                            O Diferencial <br /> <span className="text-sky-400">Serpa-Híbrido</span>
                        </h2>
                        <p className="text-slate-400 text-xl font-medium leading-relaxed italic max-w-2xl">
                            "Combinamos o calor do ensino humano clássico com a precisão dos algoritmos de engajamento modernos. Criamos um loop infinito de motivação."
                        </p>
                    </div>
                    <M.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="p-12 bg-slate-900/40 rounded-[64px] border border-white/5 flex items-center gap-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-sky-500/5 group-hover:bg-sky-500/10 transition-colors" />
                        <div className="p-5 bg-sky-500 rounded-3xl text-white shadow-xl relative z-10"><Target size={40} /></div>
                        <div className="text-left relative z-10">
                            <p className="text-5xl font-black text-white leading-none tracking-tighter">98%</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Aderência Pedagógica</p>
                        </div>
                    </M.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {PILLARS.map((pillar, i) => (
                        <M.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -16 }}
                            className="h-full"
                        >
                            <Card className="h-full bg-slate-900/60 border-white/5 p-12 rounded-[64px] relative overflow-hidden group hover:border-sky-500/30 transition-all duration-500">
                                <div className="absolute top-0 right-0 p-32 bg-white/5 blur-[80px] pointer-events-none group-hover:bg-white/10 transition-colors" />
                                <CardContent className="p-0 space-y-10 relative z-10">
                                    <div className={cn("p-6 rounded-[32px] w-fit shadow-inner transition-all group-hover:scale-110", pillar.bg, pillar.color)}>
                                        <pillar.icon size={48} />
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-4xl font-black text-white uppercase tracking-tight leading-none">{pillar.title}</h3>
                                        <p className="text-slate-400 text-lg font-medium leading-relaxed">{pillar.desc}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </M.div>
                    ))}
                </div>
            </div>
        </section>
    );
};