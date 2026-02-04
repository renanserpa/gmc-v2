
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Sparkles, X, Loader2, Lightbulb } from 'lucide-react';
import { aiPedagogy } from '../../services/aiService.ts';
import { Button } from '../ui/Button.tsx';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

export const MaestroAI: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [vibe, setVibe] = useState('synth');

    useEffect(() => {
        const checkVibe = () => {
            const current = localStorage.getItem('maestro_active_vibe') || 'synth';
            setVibe(current);
        };
        checkVibe();
        window.addEventListener('storage', checkVibe);
        const interval = setInterval(checkVibe, 1000); // Polling simples para mudanças locais
        return () => {
            window.removeEventListener('storage', checkVibe);
            clearInterval(interval);
        };
    }, []);

    const handleAsk = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setResponse(null);
        haptics.medium();
        
        const result = await aiPedagogy.getLessonDynamic(prompt, "7-10 anos", vibe);
        setResponse(result);
        setLoading(false);
        haptics.success();
    };

    const vibeColors: any = {
        rock: 'bg-rose-600 border-rose-400',
        classical: 'bg-amber-600 border-amber-400',
        synth: 'bg-purple-600 border-purple-400'
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-24 right-8 z-[60] w-16 h-16 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all border-4 group",
                    vibeColors[vibe]
                )}
            >
                <Brain className="group-hover:animate-pulse" />
                <div className="absolute -top-2 -left-2 bg-amber-500 rounded-full p-1 animate-bounce">
                    <Sparkles size={12} />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <M.div 
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        className="fixed top-0 right-0 h-screen w-full md:w-[400px] bg-slate-950/95 backdrop-blur-2xl border-l border-white/10 z-[100] p-8 shadow-2xl flex flex-col"
                    >
                        <header className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-3">
                                <div className={cn("p-3 rounded-2xl transition-colors duration-500", vibe === 'rock' ? 'bg-rose-600' : vibe === 'classical' ? 'bg-amber-600' : 'bg-purple-600')}>
                                    <Brain size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Maestro <span className={vibe === 'rock' ? 'text-rose-500' : vibe === 'classical' ? 'text-amber-500' : 'text-purple-500'}>Brain</span></h3>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Modo {vibe.toUpperCase()}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </header>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                            <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl">
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                    "Mestre, estou configurado para o estilo <strong>{vibe.toUpperCase()}</strong>. Como posso ajudar na sua aula?"
                                </p>
                            </div>

                            {loading && (
                                <div className="flex flex-col items-center py-10 gap-4">
                                    <Loader2 className="animate-spin text-purple-500" size={32} />
                                    <p className="text-[10px] font-black text-slate-500 uppercase">Ajustando Timbre da IA...</p>
                                </div>
                            )}

                            {response && (
                                <M.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "p-6 rounded-3xl text-sm text-slate-200 leading-relaxed italic whitespace-pre-wrap shadow-inner border",
                                        vibe === 'rock' ? 'bg-rose-900/10 border-rose-500/30' : vibe === 'classical' ? 'bg-amber-900/10 border-amber-500/30' : 'bg-purple-900/20 border-purple-500/30'
                                    )}
                                >
                                    {response}
                                </M.div>
                            )}
                        </div>

                        <footer className="mt-auto pt-6 border-t border-white/5">
                            <div className="relative group">
                                <textarea 
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Ex: Sugira um riff de aquecimento..."
                                    className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:ring-2 focus:ring-purple-600 transition-all resize-none pr-12"
                                    rows={3}
                                />
                                <button 
                                    onClick={handleAsk}
                                    className={cn(
                                        "absolute bottom-4 right-4 p-2 text-white rounded-xl transition-colors shadow-lg",
                                        vibe === 'rock' ? 'bg-rose-600 hover:bg-rose-500' : vibe === 'classical' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-purple-600 hover:bg-purple-500'
                                    )}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </footer>
                    </M.div>
                )}
            </AnimatePresence>
        </>
    );
};
