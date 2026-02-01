import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Library, Plus, Video, Music, FileText, Search, Zap, CheckCircle2, Star, Eye, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrentStudent } from '../hooks/useCurrentStudent';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { addLibraryItem } from '../services/dataService';
import { completeLibraryItem } from '../services/gamificationService';
import { ContentLibraryItem } from '../types';
import { Button } from '../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/Dialog';
import { notify } from '../lib/notification';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoPlayer } from '../components/VideoPlayer';
import { TablatureView } from '../components/tools/TablatureView';
import { cn } from '../lib/utils';
import { haptics } from '../lib/haptics';
import confetti from 'canvas-confetti';

const M = motion as any;

export default function LibraryPage() {
    const { user, role, profile } = useAuth();
    const { student, refetch: refetchStudent } = useCurrentStudent();
    
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ContentLibraryItem | null>(null);
    const [search, setSearch] = useState('');
    const [completing, setCompleting] = useState(false);

    const [newItem, setNewItem] = useState<Partial<ContentLibraryItem>>({
        title: '', type: 'video', url: '', difficulty_level: 'beginner'
    });

    // ENGINE REALTIME: Sincronização Automática baseada no school_id
    const schoolId = profile?.school_id || student?.school_id || null;
    const { data: items, loading } = useRealtimeSync<any>('content_library', schoolId, { column: 'created_at', ascending: false });

    const handleAddItem = async () => {
        if (!newItem.title || !newItem.url) {
            notify.warning("Preencha título e link do material.");
            return;
        }
        try {
            await addLibraryItem({ 
                ...newItem, 
                professor_id: user!.id,
                // Injeta school_id para garantir real-time no tenant correto
                school_id: schoolId 
            } as any);
            notify.success("Material sincronizado na Cloud!");
            setIsAddOpen(false);
            setNewItem({ title: '', type: 'video', url: '', difficulty_level: 'beginner' });
        } catch (e) {
            notify.error("Falha ao salvar material.");
        }
    };

    const handleMasterContent = async (itemId: string) => {
        if (!student) return;
        setCompleting(true);
        haptics.heavy();
        
        try {
            await completeLibraryItem(student.id, itemId);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            await refetchStudent();
            setSelectedItem(null);
        } catch (err) {
            notify.error("Erro ao masterizar.");
        } finally {
            setCompleting(false);
        }
    };

    const filteredItems = (items || []).filter(i => i.title.toLowerCase().includes(search.toLowerCase()));

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="text-red-400" />;
            case 'audio': return <Music className="text-sky-400" />;
            case 'tab': return <FileText className="text-purple-400" />;
            default: return <FileText className="text-slate-400" />;
        }
    };

    const isCompleted = (itemId: string) => student?.completed_content_ids?.includes(itemId);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[48px] border border-white/5 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Biblioteca <span className="text-purple-500">Maestro</span></h1>
                    <p className="text-slate-500 mt-2 text-[10px] font-black uppercase tracking-[0.3em]">Knowledge Base & Assets Repository</p>
                </div>
                {role === 'professor' && (
                    <Button onClick={() => setIsAddOpen(true)} leftIcon={Plus} className="px-10 py-6 rounded-2xl bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-900/20 text-xs font-black uppercase tracking-widest relative z-10">
                        Novo Material
                    </Button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-3 bg-slate-900 border-white/5 p-2 rounded-3xl shadow-lg">
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                        <input 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Pesquisar por título, tag ou dificuldade..." 
                            className="w-full bg-transparent border-none outline-none py-4 pl-14 pr-6 text-sm text-white placeholder:text-slate-700"
                        />
                    </div>
                </Card>
                {role === 'student' && student && (
                    <div className="bg-slate-900/60 border border-sky-500/20 p-4 rounded-3xl flex items-center justify-center gap-4 shadow-xl">
                        <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Masterizado</p>
                            <p className="text-xl font-black text-white leading-none">{student.completed_content_ids?.length || 0}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map(item => {
                        const done = isCompleted(item.id);
                        return (
                            <M.div 
                                key={item.id} 
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ y: -8 }}
                                onClick={() => setSelectedItem(item)}
                                className={cn(
                                    "cursor-pointer group relative bg-slate-900 border transition-all rounded-[40px] overflow-hidden p-8",
                                    done ? "border-emerald-500/30 bg-emerald-500/[0.02] shadow-emerald-950/10 shadow-2xl" : "border-white/5 hover:border-sky-500/40"
                                )}
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className={cn(
                                        "p-4 rounded-2xl transition-all group-hover:scale-110 shadow-inner",
                                        done ? "bg-emerald-500/10" : "bg-slate-950"
                                    )}>
                                        {done ? <CheckCircle2 className="text-emerald-400" size={24} /> : getIcon(item.type)}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="px-3 py-1 rounded-full text-[8px] font-black uppercase bg-slate-950 text-slate-600 border border-white/5 tracking-widest">
                                            {item.difficulty_level}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <h3 className={cn(
                                        "text-base font-black uppercase tracking-tight truncate leading-tight",
                                        done ? "text-emerald-400" : "text-white"
                                    )}>{item.title}</h3>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Sincronia Live Maestro</p>
                                </div>
                                
                                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest flex items-center gap-2",
                                        done ? "text-emerald-500/60" : "text-sky-400"
                                    )}>
                                        {done ? "CONTEÚDO DOMINADO" : <><Eye size={14} /> ESTUDAR AGORA</>}
                                    </span>
                                </div>

                                {!done && role === 'student' && (
                                    <div className="absolute top-4 right-4 flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase bg-amber-500/5 px-2 py-0.5 rounded-full">
                                        <Star size={10} fill="currentColor" /> +20 XP
                                    </div>
                                )}
                            </M.div>
                        );
                    })}
                </AnimatePresence>

                {loading && filteredItems.length === 0 && (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="h-64 bg-slate-900/40 rounded-[40px] animate-pulse border border-white/5" />
                    ))
                )}
                
                {!loading && filteredItems.length === 0 && (
                    <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-800 rounded-[48px] opacity-30">
                        <Library size={64} className="mx-auto text-slate-700 mb-6" />
                        <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-500">Nenhum Ativo Digital Localizado</p>
                    </div>
                )}
            </div>

            {/* Modal: Adicionar Item */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 rounded-[48px] p-10 shadow-2xl max-w-lg">
                    <DialogHeader className="space-y-4 mb-6">
                        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <Plus size={32} />
                        </div>
                        <DialogTitle className="text-2xl font-black text-white uppercase italic">Novo Material</DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs font-bold uppercase tracking-widest">Provisionamento de Ativos Pedagógicos.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Título do Material</label>
                            <input 
                                value={newItem.title} 
                                onChange={e => setNewItem({...newItem, title: e.target.value})}
                                placeholder="Ex: Método Suzuki - Livro 1"
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:ring-4 focus:ring-purple-600/20" 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Tipo</label>
                                <select 
                                    value={newItem.type}
                                    onChange={e => setNewItem({...newItem, type: e.target.value as any})}
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm appearance-none"
                                >
                                    <option value="video">Vídeo (YouTube)</option>
                                    <option value="audio">Áudio (PCM/MP3)</option>
                                    <option value="tab">Tablatura (AlphaTex)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Dificuldade</label>
                                <select 
                                    value={newItem.difficulty_level}
                                    onChange={e => setNewItem({...newItem, difficulty_level: e.target.value as any})}
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm appearance-none"
                                >
                                    <option value="beginner">Iniciante</option>
                                    <option value="intermediate">Intermediário</option>
                                    <option value="pro">Pro / Master</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Endereço de Acesso (URL)</label>
                            <input 
                                value={newItem.url} 
                                onChange={e => setNewItem({...newItem, url: e.target.value})}
                                placeholder="https://youtube.com/..."
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm font-mono" 
                            />
                        </div>
                    </div>
                    
                    <DialogFooter className="mt-10 gap-3 border-t border-white/5 pt-8">
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="text-[10px] font-black uppercase">Cancelar</Button>
                        <Button onClick={handleAddItem} className="bg-purple-600 hover:bg-purple-500 text-white px-10 py-6 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">Salvar na Cloud</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Preview Item */}
            {selectedItem && (
                <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
                    <DialogContent className="max-w-5xl bg-slate-950 border-slate-800 rounded-[64px] p-0 overflow-hidden shadow-2xl">
                        <div className="flex flex-col h-full">
                            <div className="bg-slate-900 p-10 border-b border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-slate-950 rounded-2xl text-sky-400 shadow-inner">
                                        {getIcon(selectedItem.type)}
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter italic">
                                            {selectedItem.title}
                                        </DialogTitle>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                                            <Zap size={12} className="text-amber-500" fill="currentColor" /> Estúdio de Conhecimento OlieMusic
                                        </p>
                                    </div>
                                </div>
                                {role === 'student' && !isCompleted(selectedItem.id) && (
                                    <div className="flex items-center gap-6 bg-slate-950 p-3 rounded-3xl border border-white/5 shadow-inner">
                                        <div className="px-4 text-right">
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Recompensa de Maestria</p>
                                            <p className="text-lg font-black text-amber-500">+20 XP</p>
                                        </div>
                                        <Button 
                                            size="lg" 
                                            isLoading={completing}
                                            onClick={() => handleMasterContent(selectedItem.id)}
                                            className="px-8 py-6 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-sky-600 hover:bg-sky-500"
                                            leftIcon={CheckCircle2}
                                        >
                                            Masterizar
                                        </Button>
                                    </div>
                                )}
                                {isCompleted(selectedItem.id) && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-8 py-4 rounded-3xl flex items-center gap-4 text-emerald-400 shadow-lg shadow-emerald-950/20">
                                        <CheckCircle2 size={24} />
                                        <span className="text-xs font-black uppercase tracking-[0.2em]">Conteúdo Dominado</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-10 min-h-[500px] overflow-y-auto custom-scrollbar">
                                {selectedItem.type === 'video' && <VideoPlayer url={selectedItem.url} title={selectedItem.title} />}
                                {selectedItem.type === 'tab' && (
                                    <TablatureView alphaTex={selectedItem.url} isTvMode={false} />
                                )}
                                {selectedItem.type === 'pdf' && (
                                    <div className="bg-slate-900 rounded-[48px] p-32 text-center space-y-8 border border-white/5">
                                        <div className="w-24 h-24 bg-slate-950 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                                            <FileText size={48} className="text-slate-700" />
                                        </div>
                                        <p className="text-slate-400 text-lg font-medium italic">"A teoria é o mapa, mas a música é o território."</p>
                                        <Button onClick={() => window.open(selectedItem.url)} className="px-12 py-8 rounded-[32px] text-lg font-black uppercase tracking-widest shadow-2xl" leftIcon={ExternalLink}>Abrir Documento Seguro</Button>
                                    </div>
                                )}
                                {selectedItem.type === 'audio' && (
                                    <div className="bg-slate-900 rounded-[48px] p-32 text-center space-y-8 border border-white/5">
                                        <div className="w-24 h-24 bg-sky-500/10 rounded-[40px] flex items-center justify-center mx-auto mb-4 border border-sky-500/20 animate-pulse">
                                            <Music size={48} className="text-sky-400" />
                                        </div>
                                        <audio src={selectedItem.url} controls className="w-full max-w-xl mx-auto accent-sky-500" />
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Iniciando decodificação de áudio Maestro...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}