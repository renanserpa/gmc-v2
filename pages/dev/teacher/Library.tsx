
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Library, Search, Star, ExternalLink, 
    BookOpen, Layers, X, Download, Monitor, Zap,
    Eye, ShieldCheck, Music, FileImage, Send, Plus, 
    Filter, Heart, Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog.tsx';
import { useAuth } from '../../../contexts/AuthContext.tsx';
/* Added useMaestro import */
import { useMaestro } from '../../../contexts/MaestroContext.tsx';
import { getLibraryItems, toggleFavoriteItem } from '../../../services/dataService.ts';
import { classroomService } from '../../../services/classroomService.ts';
import { haptics } from '../../../lib/haptics.ts';
import { cn } from '../../../lib/utils.ts';
import { notify } from '../../../lib/notification.ts';
import { ContentLibraryItem } from '../../../types.ts';

const M = motion as any;

const CATEGORIES = [
    { id: 'all', label: 'Tudo', icon: Layers },
    { id: 'repertoire', label: 'Repertório', icon: Music },
    { id: 'exercise', label: 'Exercícios', icon: Zap },
    { id: 'theory', label: 'Teoria', icon: BookOpen },
    { id: 'backing_track', label: 'Backing Tracks', icon: Play },
];

export default function ContentVault() {
    /* Fixed: Destructured user from useAuth and activeSession from useMaestro */
    const { user } = useAuth();
    const { activeSession } = useMaestro();
    const [items, setItems] = useState<ContentLibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCat, setActiveCat] = useState('all');
    const [isBroadcasting, setIsBroadcasting] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id) {
            loadItems();
        }
    }, [user?.id]);

    const loadItems = async () => {
        setLoading(true);
        try {
            const data = await getLibraryItems(user!.id);
            setItems(data);
        } catch (e) {
            notify.error("Falha ao carregar cofre de conteúdo.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFav = async (item: ContentLibraryItem) => {
        haptics.light();
        try {
            await toggleFavoriteItem(item.id, item.is_favorite);
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_favorite: !i.is_favorite } : i));
        } catch (e) {}
    };

    const handleLaunchToClass = async (item: ContentLibraryItem) => {
        if (!activeSession.classId) {
            notify.warning("Inicie uma sessão de aula para lançar conteúdo.");
            return;
        }
        setIsBroadcasting(item.id);
        haptics.success();
        try {
            await classroomService.sendCommand(activeSession.classId, {
                type: 'CONTENT_LAUNCH',
                payload: item,
                timestamp: Date.now()
            });
            notify.success(`"${item.title}" lançado na TV e dispositivos.`);
        } catch (e) {
            notify.error("Falha na sincronia live.");
        } finally {
            setTimeout(() => setIsBroadcasting(null), 2000);
        }
    };

    const filtered = items.filter(i => 
        (activeCat === 'all' || i.category === activeCat) &&
        (i.title.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-900/40 p-10 rounded-[56px] border border-white/5 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-purple-500/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                        <Library size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Resource Management</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Content <span className="text-purple-500">Vault</span>
                    </h1>
                </div>
                <div className="flex gap-4 relative z-10">
                    <Card className="bg-slate-950/80 border-white/5 p-2 rounded-3xl shadow-xl min-w-[300px]">
                        <div className="relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                            <input 
                                value={search} 
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Pesquisar no cofre..." 
                                className="w-full bg-transparent border-none outline-none py-4 pl-14 pr-6 text-sm text-white font-mono placeholder:text-slate-700" 
                            />
                        </div>
                    </Card>
                    <Button className="h-16 w-16 p-0 rounded-3xl bg-purple-600"><Plus size={32}/></Button>
                </div>
            </header>

            <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => { setActiveCat(cat.id); haptics.light(); }}
                        className={cn(
                            "px-8 py-4 rounded-2xl border-2 transition-all flex items-center gap-3 whitespace-nowrap",
                            activeCat === cat.id 
                                ? "bg-purple-600 border-white text-white shadow-xl" 
                                : "bg-slate-900 border-white/5 text-slate-500 hover:border-purple-500/30"
                        )}
                    >
                        <cat.icon size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <AnimatePresence mode="popLayout">
                    {filtered.map((item, idx) => (
                        <M.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ y: -8 }}
                        >
                            <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden group hover:border-purple-500/40 transition-all shadow-2xl relative">
                                <div className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="p-4 bg-slate-950 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform">
                                            <Music size={24} />
                                        </div>
                                        <button 
                                            onClick={() => handleToggleFav(item)}
                                            className={cn("p-2 rounded-xl transition-all", item.is_favorite ? "text-pink-500" : "text-slate-700 hover:text-slate-400")}
                                        >
                                            <Heart size={20} fill={item.is_favorite ? "currentColor" : "none"} />
                                        </button>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight truncate leading-tight">{item.title}</h3>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{item.category}</p>
                                    </div>

                                    <div className="pt-6 border-t border-white/5 flex gap-3">
                                        <Button 
                                            onClick={() => handleLaunchToClass(item)}
                                            isLoading={isBroadcasting === item.id}
                                            className="flex-1 py-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-[10px] font-black uppercase tracking-widest"
                                            leftIcon={Monitor}
                                        >
                                            LANÇAR AULA
                                        </Button>
                                        <Button variant="ghost" className="p-4 rounded-2xl bg-slate-950 border border-white/5 text-slate-500 hover:text-white">
                                            <ExternalLink size={18} />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </M.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
