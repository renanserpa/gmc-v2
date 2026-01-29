import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Brain, Database, Upload, BookOpen, Trash2, Loader2, Sparkles, FileText } from 'lucide-react';
import { maestroBrain } from '../services/maestroBrain.ts';
import { supabase } from '../lib/supabaseClient.ts';
import { notify } from '../lib/notification.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../lib/date.ts';

export default function BrainCenter() {
    const [docs, setDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTraining, setIsTraining] = useState(false);
    const [input, setInput] = useState({ title: '', content: '' });

    useEffect(() => {
        loadDocs();
    }, []);

    const loadDocs = async () => {
        setLoading(true);
        const { data } = await supabase.from('knowledge_docs').select('*').order('created_at', { ascending: false });
        setDocs(data || []);
        setLoading(false);
    };

    const handleTrain = async () => {
        if (!input.title || !input.content) return;
        setIsTraining(true);
        const success = await maestroBrain.ingestDocument(input.title, input.content);
        if (success) {
            setInput({ title: '', content: '' });
            loadDocs();
        }
        setIsTraining(false);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-24 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                        <Brain className="text-purple-500" /> Maestro Brain Center
                    </h1>
                    <p className="text-slate-500 font-medium">Alimente a inteligência do seu sistema com seus próprios manuais e teorias.</p>
                </div>
                <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-slate-500 uppercase">Status do RAG</span>
                        <span className="text-sm font-black text-emerald-400 flex items-center gap-1">
                            <Database size={12} /> Vetorizador Online
                        </span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-7 bg-slate-900 border-white/5 rounded-[40px] shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Upload className="text-sky-400" /> Nova Carga de Conhecimento
                        </CardTitle>
                        <CardDescription>Cole o conteúdo de PDFs, Manuais ou Metodologias Suzuki.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Título do Documento</label>
                            <input 
                                value={input.title}
                                onChange={e => setInput({...input, title: e.target.value})}
                                placeholder="Ex: Manual Suzuki Vol 1 - Técnica de Arco"
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm outline-none focus:ring-2 focus:ring-sky-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Conteúdo Textual</label>
                            <textarea 
                                value={input.content}
                                onChange={e => setInput({...input, content: e.target.value})}
                                rows={10}
                                placeholder="Cole o texto cru aqui para o motor de IA aprender..."
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm outline-none focus:ring-2 focus:ring-sky-500/20 resize-none font-mono"
                            />
                        </div>
                        <Button 
                            onClick={handleTrain} 
                            disabled={isTraining || !input.content}
                            isLoading={isTraining}
                            className="w-full py-6 rounded-2xl text-lg font-black uppercase tracking-widest"
                            leftIcon={Sparkles}
                        >
                            Treinar Cérebro Agora
                        </Button>
                    </CardContent>
                </Card>

                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center gap-2 px-2">
                        <BookOpen size={16} className="text-slate-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Conhecimento Sincronizado</h3>
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence>
                            {loading ? (
                                [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-900/50 rounded-3xl animate-pulse border border-white/5" />)
                            ) : docs.length === 0 ? (
                                <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-[40px] opacity-40">
                                    <FileText className="mx-auto mb-4" />
                                    <p className="text-xs font-black uppercase">Vazio</p>
                                </div>
                            ) : (
                                docs.map(doc => (
                                    <motion.div 
                                        key={doc.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-slate-900 border border-white/5 p-5 rounded-[32px] flex items-center justify-between group hover:border-sky-500/30 transition-all shadow-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-slate-950 rounded-2xl text-purple-500 shadow-inner">
                                                <Brain size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white uppercase truncate max-w-[180px]">{doc.title}</h4>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">
                                                    {formatDate(doc.created_at)} • {doc.tokens} Tokens
                                                </p>
                                            </div>
                                        </div>
                                        <button className="p-2 text-slate-700 hover:text-red-400 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="bg-slate-950 p-6 rounded-[32px] border border-sky-500/10">
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                            <strong className="text-sky-400 uppercase">Maestro AI:</strong> Quanto mais documentos você inserir, mais precisas serão as sugestões de aula. Os textos são quebrados em chunks e armazenados com embeddings vetoriais de 768 dimensões.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}