
import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { BookOpen, Search, History, Music, GraduationCap, ChevronRight, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { haptics } from '../../lib/haptics';

const CATEGORIES = [
    { id: 'History', label: 'História da Música', icon: History, color: 'text-amber-400' },
    { id: 'Theory', label: 'Teoria Musical', icon: Music, color: 'text-sky-400' },
    { id: 'Instruments', label: 'Organologia', icon: Layers, color: 'text-emerald-400' },
    { id: 'Pedagogy', label: 'Pedagogia GCM', icon: GraduationCap, color: 'text-purple-400' },
];

export default function KnowledgeBase() {
    const [selectedCat, setSelectedCat] = useState('Theory');

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">Wiki Maestro</h1>
                    <p className="text-slate-500 mt-2 font-medium">A enciclopédia definitiva da rede de ensino OlieMusic.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Sidebar Categorias */}
                <aside className="lg:col-span-3 space-y-3">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setSelectedCat(cat.id); haptics.light(); }}
                            className={cn(
                                "w-full p-6 rounded-[32px] border-2 transition-all flex items-center gap-4 text-left group",
                                selectedCat === cat.id 
                                    ? "bg-slate-900 border-white/10 shadow-xl" 
                                    : "bg-transparent border-transparent opacity-50 hover:opacity-100"
                            )}
                        >
                            <div className={cn("p-3 rounded-2xl bg-slate-950 shadow-inner group-hover:scale-110 transition-transform", cat.color)}>
                                <cat.icon size={20} />
                            </div>
                            <span className="text-xs font-black text-white uppercase tracking-widest">{cat.label}</span>
                        </button>
                    ))}
                </aside>

                {/* Main Viewer */}
                <main className="lg:col-span-9 space-y-8">
                    <Card className="bg-slate-900/60 border-white/5 p-10 rounded-[64px] min-h-[600px] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[120px] pointer-events-none" />
                        
                        <div className="flex justify-between items-start mb-12 relative z-10">
                            <div>
                                <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.5em] mb-2 block">Explorando</span>
                                <h2 className="text-4xl font-black text-white uppercase tracking-tight leading-none">{selectedCat}</h2>
                            </div>
                            <div className="relative w-80">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                <input placeholder="Buscar nesta categoria..." className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-12 text-sm text-white outline-none focus:border-sky-500/50" />
                            </div>
                        </div>

                        {/* Listagem de Verbetes (Simulação RAG) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                            {[1, 2, 3, 4, 5].map(i => (
                                <button key={i} className="p-6 rounded-[32px] bg-slate-950/80 border border-white/5 hover:border-sky-500/30 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-sky-500" />
                                        <p className="text-sm font-black text-slate-300 uppercase tracking-tight group-hover:text-white">Artigo Exemplo Maestro #{i}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-700 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>

                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-30">
                            <BookOpen size={16} className="text-slate-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sincronizado com Vetores Suzuki</span>
                        </div>
                    </Card>
                </main>
            </div>
        </div>
    );
}
