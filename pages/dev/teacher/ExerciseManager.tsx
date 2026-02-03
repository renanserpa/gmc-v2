
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen, Search, Filter, Layers, 
    Music, Zap, Monitor, Smartphone, 
    ChevronRight, Play, LayoutGrid, Star 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { useMaestro } from '../../../contexts/MaestroContext.tsx';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync.ts';
import { supabase } from '../../../lib/supabaseClient.ts';
import { notify } from '../../../lib/notification.ts';
import { haptics } from '../../../lib/haptics.ts';
import { cn } from '../../../lib/utils.ts';
import { RENAN_SERPA_TABS } from '../../../lib/tabsStore.ts';

const M = motion as any;

const CATEGORIES = [
    { id: 'technique', label: 'Técnica', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'repertoire', label: 'Repertório', icon: Music, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { id: 'theory', label: 'Teoria Lúdica', icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

export default function ExerciseManager() {
    const { profile } = useAuth();
    const { activeSession } = useMaestro();
    const [search, setSearch] = useState('');
    const [activeCat, setActiveCat] = useState('technique');
    const [syncingId, setSyncingId] = useState<string | null>(null);

    // No piloto, usamos o RENAN_SERPA_TABS como biblioteca base
    const exercises = Object.entries(RENAN_SERPA_TABS).map(([id, alphaTex]) => ({
        id,
        title: id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        category: id.includes('walk') ? 'technique' : 'repertoire',
        difficulty: 'beginner'
    })).filter(ex => activeCat === 'all' || ex.category === activeCat);

    const handleLaunchToTV = async (exId: string) => {
        if (!profile?.school_id) return;
        setSyncingId(exId);
        haptics.heavy();
        
        try {
            const { error } = await supabase
                .from('classroom_orchestration')
                .upsert({
                    class_id: activeSession.classId || profile.school_id,
                    active_exercise_id: exId,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            notify.success("Exercício lançado nos dispositivos dos alunos!");
        } catch (e) {
            notify.error("Falha ao sincronizar telas.");
        } finally {
            setSyncingId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-32 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                        <Layers size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Content Vault v2.0</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Biblioteca <span className="text-purple-500">Mestre</span>
                    </h1>
                </div>
                <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-white/5">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                        <input 
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar exercício..." 
                            className="bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* CATEGORIAS */}
                <aside className="lg:col-span-3 space-y-4">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Navegação</h3>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveCat(cat.id); haptics.light(); }}
                            className={cn(
                                "w-full p-6 rounded-[32px] border-2 transition-all flex items-center gap-4 text-left group",
                                activeCat === cat.id 
                                    ? "bg-slate-900 border-purple-500 shadow-xl" 
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

                {/* GRID DE EXERCÍCIOS */}
                <main className="lg:col-span-9 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {exercises.map((ex, idx) => (
                            <M.div 
                                key={ex.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="bg-[#0a0f1d] border-white/5 rounded-[40px] p-8 group hover:border-purple-500/40 transition-all shadow-2xl relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-10 relative z-10">
                                        <div className="p-4 bg-slate-950 rounded-2xl text-purple-400 shadow-inner group-hover:scale-110 transition-transform">
                                            {ex.category === 'technique' ? <Zap size={24} /> : <Music size={24} />}
                                        </div>
                                        <div className="px-3 py-1 bg-black/40 rounded-full border border-white/10 flex items-center gap-2">
                                            <Star size={10} className="text-amber-500" fill="currentColor" />
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{ex.difficulty}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 relative z-10">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight truncate">{ex.title}</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Maestro Signature Series</p>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-white/5 flex gap-3 relative z-10">
                                        <Button 
                                            onClick={() => handleLaunchToTV(ex.id)}
                                            isLoading={syncingId === ex.id}
                                            className="flex-1 rounded-2xl bg-sky-600 hover:bg-sky-500 shadow-xl shadow-sky-900/20 text-[10px] font-black"
                                            leftIcon={Monitor}
                                        >
                                            LANÇAR NA TV
                                        </Button>
                                        <Button variant="ghost" className="p-4 rounded-2xl bg-slate-950 border border-white/5 text-slate-500 hover:text-white">
                                            <Smartphone size={18} />
                                        </Button>
                                    </div>
                                    
                                    {/* Overlay Background Pulse */}
                                    <div className="absolute top-0 right-0 p-24 bg-purple-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Card>
                            </M.div>
                        ))}
                    </div>

                    {exercises.length === 0 && (
                        <div className="py-32 text-center border-2 border-dashed border-slate-800 rounded-[48px] opacity-30">
                            <BookOpen size={64} className="mx-auto text-slate-700 mb-6" />
                            <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-500">Nenhum Ativo Digital Localizado</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
