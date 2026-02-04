
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, Zap, Activity, Microscope } from 'lucide-react';
import { generateNeuralArt } from '../../services/aiService.ts';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

export const TechShowcase = () => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        generateNeuralArt("A cinematic, futuristic visualization of music notes flowing through a child's neural pathways, bioluminescent blue and purple colors, high-tech interface, soft bokeh background, 8k resolution.")
            .then(setImageUrl);
    }, []);

    return (
        <section className="py-40 px-6 relative overflow-hidden bg-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.05),transparent)]" />
            
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div className="space-y-12 relative z-10">
                    <div className="space-y-6">
                        <M.span 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-purple-500 text-[12px] font-black uppercase tracking-[0.6em] flex items-center gap-3"
                        >
                            <Microscope size={18} /> Neuroplasticidade Musical
                        </M.span>
                        <h2 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-[0.9]">
                            A Ciência do <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-400">Fluxo Criativo</span>
                        </h2>
                    </div>

                    <p className="text-slate-400 text-xl font-medium leading-relaxed italic border-l-4 border-purple-500 pl-8">
                        "O GCM Maestro não é apenas um app, é um ambiente regulador. Utilizamos biofeedback rítmico para manter o aluno na 'Zona de Fluxo' — onde o aprendizado acontece sem esforço."
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sky-400">
                                <Activity size={24} />
                                <h4 className="font-black uppercase text-sm">Biofeedback</h4>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Análise de áudio em tempo real que ajusta a dificuldade da missão para evitar frustração.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-purple-400">
                                <Cpu size={24} />
                                <h4 className="font-black uppercase text-sm">IA Pedagógica</h4>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Algoritmos baseados na metodologia Gordon que sugerem o próximo passo evolutivo do músico.</p>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <M.div 
                        initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        className="aspect-square bg-slate-900 rounded-[100px] border border-white/10 shadow-2xl overflow-hidden relative group"
                    >
                        {imageUrl ? (
                            <img src={imageUrl} alt="Neural Music Art" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms]" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-950">
                                <Zap className="text-purple-500 animate-pulse" size={48} />
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Gerando Visão Neural...</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center text-white">
                            <div>
                                <p className="text-[9px] font-black uppercase opacity-60">Engine Visual</p>
                                <p className="text-xs font-black uppercase tracking-widest italic">Maestro Imagination v1.2</p>
                            </div>
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                                <Brain size={20} />
                            </div>
                        </div>
                    </M.div>
                    
                    {/* Elementos Decorativos */}
                    <M.div 
                        animate={{ y: [0, -30, 0] }}
                        transition={{ duration: 6, repeat: Infinity }}
                        className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 blur-[80px] rounded-full"
                    />
                </div>
            </div>
        </section>
    );
};
