
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Library, Plus, Video, Music, FileText, Search, Zap, CheckCircle2, Star, Eye, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrentStudent } from '../hooks/useCurrentStudent';
import { getContentLibrary, addLibraryItem } from '../services/dataService';
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

export default function LibraryPage() {
    const { user, role } = useAuth();
    const { student, refetch: refetchStudent } = useCurrentStudent();
    const [items, setItems] = useState<ContentLibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ContentLibraryItem | null>(null);
    const [search, setSearch] = useState('');
    const [completing, setCompleting] = useState(false);

    const [newItem, setNewItem] = useState<Partial<ContentLibraryItem>>({
        title: '', type: 'video', url: '', difficulty_level: 'beginner'
    });

    useEffect(() => {
        if (user?.id) loadLibrary();
    }, [user, role, student?.professor_id]);

    const loadLibrary = async () => {
        setLoading(true);
        try {
            const profId = role === 'professor' ? user.id : student?.professor_id;
            if (profId) {
                const data = await getContentLibrary(profId);
                setItems(data);
            }
        } catch (e) {
            notify.error("Erro ao carregar biblioteca.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async () => {
        if (!newItem.title || !newItem.url) return;
        try {
            await addLibraryItem({ ...newItem, professor_id: user.id });
            notify.success("Item adicionado com sucesso!");
            setIsAddOpen(false);
            loadLibrary();
        } catch (e) {
            notify.error("Falha ao salvar item.");
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

    const filteredItems = items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));

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
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Biblioteca Maestro</h1>
                    <p className="text-slate-500 font-medium">Repositório central de conhecimento e materiais pedagógicos.</p>
                </div>
                {role === 'professor' && (
                    <Button onClick={() => setIsAddOpen(true)} leftIcon={Plus} className="px-8 py-6 rounded-2xl">
                        Novo Material
                    </Button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-3 bg-slate-900 border-white/5 p-4 rounded-3xl">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Pesquisar por título ou tag..." 
                            className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-sky-500/20 transition-all outline-none"
                        />
                    </div>
                </Card>
                {role === 'student' && student && (
                    <Card className="bg-slate-950 border-sky-500/20 p-4 rounded-3xl flex items-center justify-between shadow-lg shadow-sky-950/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400">
                                <Zap size={20} fill="currentColor" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Masterizado</p>
                                <p className="text-lg font-black text-white">{student.completed_content_ids?.length || 0} Itens</p>
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredItems.map(item => {
                    const done = isCompleted(item.id);
                    return (
                        <motion.div 
                            key={item.id} 
                            layout
                            whileHover={{ y: -4, scale: 1.02 }}
                            onClick={() => setSelectedItem(item)}
                            className={cn(
                                "cursor-pointer group relative bg-slate-900 border transition-all rounded-[32px] overflow-hidden p-6",
                                done ? "border-emerald-500/30 bg-emerald-500/5 shadow-emerald-950/20 shadow-xl" : "border-white/5 hover:border-sky-500/40"
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn(
                                    "p-3 rounded-2xl transition-transform group-hover:scale-110 shadow-inner",
                                    done ? "bg-emerald-500/10" : "bg-slate-950"
                                )}>
                                    {done ? <CheckCircle2 className="text-emerald-400" /> : getIcon(item.type)}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="px-2 py-1 rounded-lg text-[9px] font-black uppercase bg-slate-950 text-slate-500 border border-white/5">
                                        {item.difficulty_level}
                                    </div>
                                    {!done && role === 'student' && (
                                        <div className="flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase tracking-tighter">
                                            <Star size={8} fill="currentColor" /> +20 XP
                                        </div>
                                    )}
                                </div>
                            </div>
                            <h3 className={cn(
                                "text-sm font-black uppercase truncate mb-1",
                                done ? "text-emerald-400" : "text-white"
                            )}>{item.title}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase truncate opacity-60">Sincronizado via Maestro</p>
                            
                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center group-hover:opacity-100 transition-opacity">
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest flex items-center gap-1",
                                    done ? "text-emerald-500/60" : "text-sky-400"
                                )}>
                                    {done ? "DOMINADO" : <><Eye size={12} /> ESTUDAR AGORA</>}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}

                {loading && [...Array(4)].map((_, i) => (
                    <div key={i} className="h-48 bg-slate-900/50 rounded-[32px] animate-pulse border border-white/5" />
                ))}
            </div>

            {/* Modal: Adicionar Item */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-900 border-slate-800">
                    <DialogHeader>
                        <DialogTitle>Novo Material Pedagógico</DialogTitle>
                        <DialogDescription>Adicione links do YouTube, arquivos ou tablaturas AlphaTex.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Título</label>
                            <input 
                                value={newItem.title} 
                                onChange={e => setNewItem({...newItem, title: e.target.value})}
                                className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-white text-sm" 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo</label>
                                <select 
                                    value={newItem.type}
                                    onChange={e => setNewItem({...newItem, type: e.target.value as any})}
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-white text-sm"
                                >
                                    <option value="video">Vídeo (YouTube)</option>
                                    <option value="audio">Áudio (MP3)</option>
                                    <option value="tab">Tablatura (AlphaTex)</option>
                                    <option value="pdf">Documento PDF</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Dificuldade</label>
                                <select 
                                    value={newItem.difficulty_level}
                                    onChange={e => setNewItem({...newItem, difficulty_level: e.target.value as any})}
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-white text-sm"
                                >
                                    <option value="beginner">Iniciante</option>
                                    <option value="intermediate">Intermediário</option>
                                    <option value="pro">Pro / Master</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">URL ou AlphaTex</label>
                            <textarea 
                                value={newItem.url} 
                                onChange={e => setNewItem({...newItem, url: e.target.value})}
                                placeholder={newItem.type === 'tab' ? "\\tuning E2 A2 D3 G3 B3 E4 . 0.6 2.6" : "https://..."}
                                className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-white text-sm resize-none" 
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAddItem}>Salvar Material</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Preview Item */}
            {selectedItem && (
                <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
                    <DialogContent className="max-w-5xl bg-slate-950 border-slate-800 rounded-[48px] p-0 overflow-hidden shadow-2xl">
                        <div className="flex flex-col h-full">
                            <div className="bg-slate-900 p-8 border-b border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-950 rounded-2xl text-sky-400 shadow-inner">
                                        {getIcon(selectedItem.type)}
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">
                                            {selectedItem.title}
                                        </DialogTitle>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                            Estúdio de Conhecimento OlieMusic
                                        </p>
                                    </div>
                                </div>
                                {role === 'student' && !isCompleted(selectedItem.id) && (
                                    <div className="flex items-center gap-4 bg-slate-950 p-2 rounded-2xl border border-white/5 shadow-inner">
                                        <div className="px-4 text-right">
                                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Recompensa</p>
                                            <p className="text-sm font-black text-amber-500">+20 XP</p>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            isLoading={completing}
                                            onClick={() => handleMasterContent(selectedItem.id)}
                                            className="px-6 rounded-xl text-[10px] font-black uppercase"
                                            leftIcon={CheckCircle2}
                                        >
                                            Masterizar
                                        </Button>
                                    </div>
                                )}
                                {isCompleted(selectedItem.id) && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl flex items-center gap-3 text-emerald-400">
                                        <CheckCircle2 size={18} />
                                        <span className="text-xs font-black uppercase tracking-widest">Conteúdo Dominado</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 min-h-[500px] overflow-y-auto custom-scrollbar">
                                {selectedItem.type === 'video' && <VideoPlayer url={selectedItem.url} title={selectedItem.title} />}
                                {selectedItem.type === 'tab' && (
                                    <TablatureView alphaTex={selectedItem.url} isTvMode={false} />
                                )}
                                {selectedItem.type === 'pdf' && (
                                    <div className="bg-slate-900 rounded-[40px] p-24 text-center space-y-6">
                                        <FileText size={80} className="mx-auto text-slate-700 opacity-20" />
                                        <p className="text-slate-400 font-medium">Este material exige visualização externa segura.</p>
                                        <Button onClick={() => window.open(selectedItem.url)} className="px-10" leftIcon={ExternalLink}>Abrir Documento Completo</Button>
                                    </div>
                                )}
                                {selectedItem.type === 'audio' && (
                                    <div className="bg-slate-900 rounded-[40px] p-24 text-center space-y-6">
                                        <div className="w-24 h-24 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-sky-500/20 animate-pulse">
                                            <Music size={40} className="text-sky-400" />
                                        </div>
                                        <audio src={selectedItem.url} controls className="w-full max-w-md mx-auto accent-sky-500" />
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
