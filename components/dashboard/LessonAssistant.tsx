
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Bot, X, Loader2 } from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

// Kernels & Services
import { maestroBrain } from '../../services/maestroBrain';
import { useAuth } from '../../contexts/AuthContext';

// Utils & Libs
import { cn } from '../../lib/utils';
import { haptics } from '../../lib/haptics';

const M = motion as any;

export const LessonAssistant: React.FC = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
        { role: 'bot', text: 'Olá Mestre! Como posso ajudar na sua aula hoje?' }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;
        
        const userText = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsTyping(true);
        haptics.light();
        
        try {
            const response = await maestroBrain.ask(userText);
            setMessages(prev => [...prev, { role: 'bot', text: response }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'bot', text: 'Minha rede neural desafinou. Pode repetir?' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-24 left-6 z-[60]">
            <AnimatePresence>
                {isOpen && (
                    <M.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-80 md:w-96 shadow-2xl"
                    >
                        <Card className="bg-slate-900 border-2 border-purple-500/30 rounded-[40px] overflow-hidden flex flex-col h-[550px]">
                            <CardHeader className="bg-purple-600 p-4 border-none flex flex-row items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-xl">
                                        <Brain size={20} className="text-white" />
                                    </div>
                                    <CardTitle className="text-xs text-white uppercase tracking-widest leading-none">Maestro Brain</CardTitle>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </CardHeader>
                            
                            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-900/50">
                                {messages.map((m, i) => (
                                    <M.div 
                                        key={i} 
                                        initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={cn(
                                            "max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed",
                                            m.role === 'user' ? "bg-purple-600 text-white ml-auto" : "bg-slate-800 text-slate-200 mr-auto border border-white/5"
                                        )}
                                    >
                                        {m.text}
                                    </M.div>
                                ))}
                                {isTyping && (
                                    <div className="bg-slate-800 text-slate-400 mr-auto p-4 rounded-3xl border border-white/5 flex items-center gap-3">
                                        <Loader2 size={16} className="animate-spin text-purple-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Digitando...</span>
                                    </div>
                                )}
                            </CardContent>

                            <div className="p-4 bg-slate-950/80 border-t border-white/5">
                                <div className="flex gap-2">
                                    <input 
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                                        placeholder="Pergunte ao Maestro..."
                                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                                    />
                                    <button 
                                        onClick={handleSend}
                                        className="p-3.5 bg-purple-600 text-white rounded-2xl"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </M.div>
                )}
            </AnimatePresence>
            <M.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setIsOpen(!isOpen); haptics.medium(); }}
                className={cn(
                    "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all border-4",
                    isOpen ? "bg-slate-800 border-purple-500 text-purple-400" : "bg-purple-600 border-white text-white"
                )}
            >
                <Bot size={32} />
            </M.button>
        </div>
    );
};
