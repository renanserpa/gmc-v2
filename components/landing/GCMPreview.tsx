import React from 'react';
import { Button } from '../ui/Button.tsx';
import { Terminal, Sparkles, Cpu, ShieldCheck, ArrowRight, Zap, Layers, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
// Add missing import for 'cn' utility
import { cn } from '../../lib/utils.ts';

const M = motion as any;

export const GCMPreview = () => {
    return (
        <section id="gcm" className="py-48 px-6 relative overflow-hidden">
            {/* Linhas de Grade Estilo Tron */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <div className="max-w-7xl mx-auto bg-gradient-to-br from-slate-900 to-black rounded-[100px] p-12 md:p-32 text-center space-y-16 relative overflow-hidden border border-white/5 shadow-[0_0_120px_rgba(0,0,0,1)]">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-sky-500/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full animate-pulse" />
                
                <div className="relative z-10 space-y-12">
                    <M.div 
                        initial={{ rotate: -10, scale: 0.8 }}
                        whileInView={{ rotate: 0, scale: 1 }}
                        className="w-28 h-28 bg-gradient-to-tr from-sky-400 to-blue-600 backdrop-blur-md rounded-[32px] flex items-center justify-center mx-auto border border-white/30 shadow-[0_0_40px_#0ea5e9] relative"
                    >
                        <Cpu className="text-white" size={56} />
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-white rounded-[32px] blur-xl"
                        />
                    </M.div>

                    <div className="space-y-6">
                        <M.span 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-[12px] font-black text-sky-400 uppercase tracking-[0.6em]"
                        >
                            Next-Gen Music Software
                        </M.span>
                        <h2 className="text-6xl md:text-9xl font-black text-white uppercase tracking-tighter italic leading-[0.8] drop-shadow-2xl">
                            Software <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-400">GCM Maestro</span>
                        </h2>
                        <p className="text-slate-400 text-xl md:text-3xl max-w-4xl mx-auto font-medium leading-relaxed italic">
                            O primeiro ecossistema gamificado que utiliza <span className="text-white">inteligência rítmica</span> para conectar alunos, professores e pais em tempo real.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-10">
                        {[
                            { label: 'Detecção de Pitch', icon: Activity, color: 'text-emerald-400' },
                            { label: 'Sincronia TV-Modo', icon: Sparkles, color: 'text-sky-300' },
                            { label: 'Motor de Missões', icon: Zap, color: 'text-amber-400' },
                            { label: 'Cloud Pedagógica', icon: Layers, color: 'text-purple-400' }
                        ].map((item, i) => (
                            <M.div 
                                key={i} 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="px-8 py-6 bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col items-center gap-4 group hover:bg-white/[0.07] transition-all"
                            >
                                <item.icon className={cn("transition-transform group-hover:scale-125", item.color)} size={32} />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.label}</span>
                            </M.div>
                        ))}
                    </div>

                    <div className="pt-16">
                        <Button className="bg-sky-500 text-white hover:bg-white hover:text-slate-950 px-20 py-12 rounded-[64px] font-black uppercase tracking-[0.3em] text-xl shadow-[0_20px_70px_rgba(14,165,233,0.4)] transition-all hover:scale-110 active:scale-95 border-none" rightIcon={ArrowRight}>
                            Entrar na Lista de Espera Beta
                        </Button>
                        <p className="mt-8 text-slate-600 text-[10px] font-bold uppercase tracking-[0.4em]">Acesso antecipado exclusivo para escolas parceiras</p>
                    </div>
                </div>
            </div>
        </section>
    );
};