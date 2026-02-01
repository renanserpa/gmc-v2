
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Brain, Database, Upload, BookOpen, Trash2, Loader2, Sparkles, FileText, Tag, Layers, Glasses } from 'lucide-react';
import { maestroBrain } from '../services/maestroBrain.ts';
import { supabase } from '../lib/supabaseClient.ts';
import { notify } from '../lib/notification.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../lib/date.ts';
import { cn } from '../lib/utils.ts';

export default function BrainCenter() {
    const [docs, setDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTraining, setIsTraining] = useState(false);
    const [input, setInput] = useState({ 
        title: '', 
        content: '', 
        level: 'beginner', 
        type: 'theory',
        tags: [] as string[] 
    });

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
            setInput({ title: '', content: '', level: 'beginner', type: 'theory', tags: [] });
            loadDocs();
        }
        setIsTraining(false);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-24 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                        <Brain className="text-purple-500" /> Pedagogical <span className="text-purple-500">Neural Brain</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Provisione materiais, PDFs e diretrizes rítmicas para o ecossistema OlieMusic.</p>
                </div>
                <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-white/5 flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Knowledge Base Size</span>
                    <span className="text-sm font-black text-emerald-400">{docs.length} Ativos Digitais</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-7 bg-slate-900 border-white/5 rounded-[40px] shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Upload className="text-sky-400" /> Ingestão de Material
                        </CardTitle>
                        <CardDescription>Materiais inseridos aqui alimentam os insights da IA para Professores e Alunos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Título Pedagógico</label>
                            <input value={input.title} onChange={e => setInput({...input, title: e.target.value})} placeholder="Ex: Método Suzuki - Livro 1 - Postura do Violão" className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm outline-none focus:ring-2 focus:ring-sky-500/20" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 flex items-center gap-1"><Layers size={12}/> Categoria</label>
                                <select value={input.type} onChange={e => setInput({...input, type: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm appearance-none outline-none">
                                    <option value="theory">Teoria Musical</option>
                                    <option value="technique">Técnica (Elefante/Passarinho)</option>
                                    <option value="repertoire">Repertório</option>
                                    <option value="sensory">Atividade Sensorial</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 flex items-center gap-1"><Glasses size={12}/> Nível de Acesso</label>
                                <select value={input.level} onChange={e => setInput({...input, level: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm appearance-none outline-none">
                                    <option value="beginner">Iniciante (Maestro Kids)</option>
                                    <option value="intermediate">Intermediário</option>
                                    <option value="pro">Pro (Mestre)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Conteúdo Estruturado</label>
                            <textarea value={input.content} onChange={e => setInput({...input, content: e.target.value})} rows={8} placeholder="Cole as diretrizes técnicas ou transcrição do material aqui..." className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm outline-none focus:ring-2 focus:ring-sky-500/20 resize-none font-mono" />
                        </div>

                        <Button onClick={handleTrain} disabled={isTraining || !input.content} isLoading={isTraining} className="w-full py-6 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-sky-900/20" leftIcon={Sparkles}>
                            Sincronizar com a Rede Neural
                        </Button>
                    </CardContent>
                </Card>

                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center gap-2 px-2">
                        <BookOpen size={16} className="text-slate-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Ativos no Core</h3>
                    </div>

                    <div className="space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
                        <AnimatePresence>
                            {loading ? (
                                [...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-900/50 rounded-3xl animate-pulse border border-white/5" />)
                            ) : docs.map(doc => (
                                <motion.div key={doc.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900 border border-white/5 p-5 rounded-[32px] group hover:border-purple-500/30 transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-slate-950 rounded-2xl text-purple-500 shadow-inner">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white uppercase truncate max-w-[180px]">{doc.title}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[8px] font-black text-slate-500 uppercase bg-black/40 px-2 py-0.5 rounded border border-white/5">{doc.type || 'Doc'}</span>
                                                    <span className="text-[8px] font-black text-sky-400 uppercase">{doc.level}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="p-2 text-slate-700 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="bg-slate-950 p-6 rounded-[32px] border border-sky-500/10 flex items-start gap-4">
                        <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400"><Tag size={16} /></div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                            <strong className="text-sky-400 uppercase">Indexing Engine:</strong> Materiais "Técnica" são priorizados quando o sistema detecta instabilidade rítmica nos alunos via telemetria MIDI.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
