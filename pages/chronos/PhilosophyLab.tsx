import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Brain, MessageSquare, Sparkles, User, Send, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { maestroBrain } from '../../services/maestroBrain';
import { Philosopher } from '../../types';
import { cn } from '../../lib/utils';
import { haptics } from '../../lib/haptics';

const PHILOSOPHERS: Philosopher[] = [
    { id: 'aristotle', name: 'Aristóteles', era: 'Grécia Antiga', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aristotle', system_prompt: 'Aja como Aristóteles falando sobre o Ethos da música.' },
    { id: 'bach', name: 'J.S. Bach', era: 'Barroco', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bach', system_prompt: 'Aja como Bach falando sobre contraponto e a glória divina na harmonia.' },
    { id: 'beethoven', name: 'L.V. Beethoven', era: 'Romântico', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Beethoven', system_prompt: 'Aja como Beethoven falando sobre paixão, luta e a liberdade da expressão musical.' }
];

export default function PhilosophyLab() {
    const [selected, setSelected] = useState<Philosopher>(PHILOSOPHERS[0]);
    const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAsk = async () => {
        if (!input.trim() || loading) return;
        const text = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text }]);
        setLoading(true);
        haptics.light();

        try {
            // No protótipo, injetamos a persona no prompt
            const prompt = `[CONTEXTO: Você é ${selected.name}, da era ${selected.era}. ${selected.system_prompt}] Usuário pergunta: ${text}`;
            const answer = await maestroBrain.ask(prompt);
            setMessages(prev => [...prev, { role: 'bot', text: answer }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'bot', text: 'O tempo apagou minha resposta. Tente novamente.' }]);
        } finally {
            setLoading(false);
            haptics.medium();
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-24 animate-in fade-in duration-700">
            <header className="flex items-center gap-6">
                <div className="p-4 bg-purple-600 rounded-3xl text-white shadow-xl shadow-purple-900/30">
                    <Brain size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Philosophy Lab</h1>
                    <p className="text-slate-500 font-medium mt-2">Converse com os grandes mestres e filósofos da história da música.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Seletor de Persona */}
                <aside className="lg:col-span-4 space-y-4">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Invocar Mentor</h3>
                    {PHILOSOPHERS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => { setSelected(p); setMessages([]); haptics.light(); }}
                            className={cn(
                                "w-full p-6 rounded-[32px] border-2 transition-all flex items-center gap-5 text-left group",
                                selected.id === p.id 
                                    ? "bg-slate-900 border-purple-500 shadow-2xl scale-[1.02]" 
                                    : "bg-slate-950/40 border-transparent opacity-50 hover:opacity-100"
                            )}
                        >
                            <img src={p.avatar_url} className="w-14 h-14 rounded-2xl bg-slate-800" alt={p.name} />
                            <div>
                                <h4 className="font-black text-white uppercase tracking-tight">{p.name}</h4>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{p.era}</p>
                            </div>
                        </button>
                    ))}
                </aside>

                {/* Chat Container */}
                <main className="lg:col-span-8">
                    <Card className="bg-slate-900 border-white/5 h-[650px] flex flex-col rounded-[48px] overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
                        
                        <CardHeader className="bg-slate-950/50 p-8 border-b border-white/5 flex flex-row items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center">
                                <Bot size={24} className="text-purple-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Conversando com {selected.name}</CardTitle>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Sincronia Temporal Ativa</p>
                            </div>
                        </CardHeader>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                            <AnimatePresence>
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center gap-4">
                                        <MessageSquare size={64} />
                                        <p className="text-sm font-black uppercase tracking-widest">Diga "Olá" para {selected.name}</p>
                                    </div>
                                ) : (
                                    messages.map((m, i) => (
                                        <motion.div 
                                            key={i}
                                            initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={cn(
                                                "max-w-[80%] p-5 rounded-[28px] text-sm leading-relaxed",
                                                m.role === 'user' 
                                                    ? "bg-sky-600 text-white ml-auto rounded-tr-none" 
                                                    : "bg-slate-800 text-slate-200 mr-auto rounded-tl-none border border-white/5 italic"
                                            )}
                                        >
                                            {m.text}
                                        </motion.div>
                                    ))
                                )}
                                {loading && (
                                    <div className="bg-slate-800 text-slate-400 mr-auto p-5 rounded-[28px] rounded-tl-none border border-white/5 flex items-center gap-3">
                                        <Loader2 size={16} className="animate-spin text-purple-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Ouvindo o passado...</span>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="p-8 bg-slate-950/80 border-t border-white/5 flex gap-3">
                            <input 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAsk()}
                                placeholder={`Pergunte algo a ${selected.name}...`}
                                className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-4 focus:ring-purple-500/20 transition-all shadow-inner"
                            />
                            <button 
                                onClick={handleAsk}
                                disabled={!input.trim() || loading}
                                className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center hover:bg-purple-500 disabled:opacity-50 transition-all shadow-xl"
                            >
                                <Send size={24} />
                            </button>
                        </div>
                    </Card>
                </main>
            </div>
        </div>
    );
}