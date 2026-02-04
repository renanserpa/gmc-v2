
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, Search, Star, ExternalLink, 
    BookOpen, Layers, X, Download, Monitor, Zap,
    Eye, ShieldCheck, Music, FileImage, Send
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog.tsx';
import { haptics } from '../../../lib/haptics.ts';
import { cn } from '../../../lib/utils.ts';
import { notify } from '../../../lib/notification.ts';

const M = motion as any;

const MOCK_MATERIALS = [
    { id: 'm1', title: 'Apostila RedHouse - Nível 1', type: 'PDF', category: 'Metodologia', thumb: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80' },
    { id: 'm2', title: 'Tabela de Intervalos Pro', type: 'IMAGE', category: 'Teoria', thumb: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80' },
    { id: 'm3', title: 'Ciclo de Quintas Interativo', type: 'PDF', category: 'Harmonia', thumb: 'https://images.unsplash.com/photo-1514525253361-bee8718a300a?w=400&q=80' },
    { id: 'm4', title: 'Checklist de Postura', type: 'IMAGE', category: 'Técnica', thumb: 'https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=400&q=80' },
];

export default function Materials() {
    const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [isBroadcasting, setIsBroadcasting] = useState<string | null>(null);

    const handleOpen = (item: any) => {
        haptics.medium();
        setSelectedMaterial(item);
    };

    const handleSendToStudent = (item: any) => {
        setIsBroadcasting(item.id);
        haptics.success();
        notify.success(`Material "${item.title}" sincronizado na jornada do aluno!`);
        setTimeout(() => setIsBroadcasting(null), 2000);
    };

    const filtered = MOCK_MATERIALS.filter(m => 
        m.title.toLowerCase().includes(search.toLowerCase()) || 
        m.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-900/40 p-10 rounded-[56px] border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-purple-500/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                        <BookOpen size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Pedagogical Resource Center</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Materiais <span className="text-purple-500">Mestre</span>
                    </h1>
                </div>
                <Card className="bg-slate-950/80 border-white/5 p-2 rounded-3xl shadow-xl relative z-10 min-w-[300px]">
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                        <input 
                            value={search} 
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar ativos Suzuki/Gordon..." 
                            className="w-full bg-transparent border-none outline-none py-4 pl-14 pr-6 text-sm text-white font-mono placeholder:text-slate-700" 
                        />
                    </div>
                </Card>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {filtered.map((item, idx) => (
                    <M.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -12 }}
                    >
                        <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden group hover:border-purple-500/40 transition-all shadow-2xl relative">
                            <div className="aspect-[4/3] relative overflow-hidden bg-slate-800">
                                <img src={item.thumb} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-110" alt={item.title} />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-transparent to-transparent" />
                                <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">{item.type}</span>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-4">
                                    <button 
                                        onClick={() => handleOpen(item)}
                                        className="p-4 bg-white text-slate-950 rounded-full shadow-2xl hover:scale-110 transition-transform"
                                    >
                                        <Eye size={24} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight truncate">{item.title}</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{item.category}</p>
                                </div>
                                <Button 
                                    onClick={() => handleSendToStudent(item)}
                                    isLoading={isBroadcasting === item.id}
                                    className="w-full py-4 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/20 hover:bg-purple-600 hover:text-white text-[10px] font-black uppercase tracking-widest"
                                    leftIcon={Send}
                                >
                                    ENVIAR ALUNO
                                </Button>
                            </div>
                        </Card>
                    </M.div>
                ))}
            </div>

            {/* Viewer Modal */}
            <Dialog open={!!selectedMaterial} onOpenChange={() => setSelectedMaterial(null)}>
                <DialogContent className="max-w-5xl bg-slate-950 border-slate-800 rounded-[64px] p-0 overflow-hidden shadow-2xl h-[85vh] flex flex-col">
                    <div className="p-8 bg-slate-900 border-b border-white/5 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-purple-600 rounded-3xl text-white shadow-xl shadow-purple-900/40">
                                {selectedMaterial?.type === 'PDF' ? <FileText size={28} /> : <FileImage size={28} />}
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter italic">
                                    {selectedMaterial?.title}
                                </DialogTitle>
                                <DialogDescription className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">GCM Maestro Visualizer Core • Versão Homologada</DialogDescription>
                            </div>
                        </div>
                        <button onClick={() => setSelectedMaterial(null)} className="p-4 bg-slate-800 rounded-full hover:bg-white/10 transition-all">
                            <X size={24} className="text-slate-400" />
                        </button>
                    </div>
                    
                    <div className="flex-1 bg-black flex items-center justify-center p-12 overflow-hidden relative group">
                         {/* Renderizador de Mock para Homologação */}
                         <div className="text-center space-y-8 animate-in zoom-in duration-500 w-full max-w-2xl">
                            <Zap size={100} className="text-sky-500 mx-auto opacity-20 animate-pulse" />
                            <h3 className="text-3xl font-black text-slate-700 uppercase tracking-tighter italic">RENDERIZANDO ATIVO PEDAGÓGICO...</h3>
                            <div className="bg-slate-900 border border-white/5 p-8 rounded-[40px] shadow-2xl">
                                <p className="text-xs text-slate-500 font-mono leading-relaxed">
                                    ESTADO: SANDBOX_READY<br/>
                                    MIME_TYPE: APPLICATION/{selectedMaterial?.type}<br/>
                                    SECURITY: RLS_BYPASSED_TEACHER
                                </p>
                            </div>
                         </div>
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.05),transparent)]" />
                    </div>

                    <div className="p-8 bg-slate-900 border-t border-white/5 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-4 text-emerald-500">
                            <ShieldCheck size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Sincronia Criptografada Ativa</span>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="ghost" className="rounded-2xl h-14 border border-white/5 text-[10px] font-black uppercase tracking-widest">Baixar Cópia</Button>
                            <Button onClick={() => handleSendToStudent(selectedMaterial)} className="rounded-2xl px-12 h-14 bg-sky-600 font-black uppercase text-xs shadow-xl tracking-widest">Transmitir para Alunos</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
