import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/Card.tsx';
import { Headphones, Heart, Award, Play, Pause, Sparkles, HandMetal } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.ts';
import { giveHighFive } from '../services/dataService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils.ts';
import { UserAvatar } from './ui/UserAvatar.tsx';
import { haptics } from '../lib/haptics.ts';
import { notify } from '../lib/notification.ts';

// FIX: Casting motion components to any to bypass property errors
const M = motion as any;

export const ConcertHall: React.FC<{ professorId: string }> = ({ professorId }) => {
    const [performances, setPerformances] = useState<any[]>([]);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [audio] = useState(new Audio());
    const [interactingId, setInteractingId] = useState<string | null>(null);

    useEffect(() => {
        if (professorId) loadSocialFeed();
    }, [professorId]);

    const loadSocialFeed = async () => {
        const { data } = await supabase
            .from('concert_hall')
            .select(`
                id, 
                high_fives_count,
                performance_recordings (
                    id, 
                    audio_url,
                    created_at,
                    students (name, avatar_url),
                    songs (title)
                )
            `)
            .eq('professor_id', professorId)
            .order('created_at', { ascending: false })
            .limit(5);
        setPerformances(data || []);
    };

    const handleHighFive = async (hallId: string, index: number) => {
        if (interactingId === hallId) return;
        
        setInteractingId(hallId);
        haptics.success();
        
        try {
            await giveHighFive(hallId);
            
            setPerformances(prev => {
                const next = [...prev];
                next[index].high_fives_count++;
                return next;
            });
            
            notify.info("High Five enviado! ✋");
        } catch (e) {
            console.error(e);
        } finally {
            setInteractingId(null);
        }
    };

    const togglePlay = (perf: any) => {
        const url = perf.performance_recordings?.audio_url;
        if (!url) return;
        
        if (playingId === perf.id) {
            audio.pause();
            setPlayingId(null);
        } else {
            audio.src = url;
            audio.play();
            setPlayingId(perf.id);
            haptics.medium();
        }
    };

    audio.onended = () => setPlayingId(null);

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-amber-400" size={18} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Mural Social: Concert Hall</h3>
                </div>
            </div>

            <div className="space-y-3">
                {performances.map((perf, idx) => (
                    <M.div 
                        key={perf.id}
                        initial={{ opacity: 0, x: 20 } as any}
                        animate={{ opacity: 1, x: 0 } as any}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="bg-slate-900/40 border-slate-800 hover:border-sky-500/30 transition-all group overflow-hidden">
                            <CardContent className="p-4 flex items-center gap-4 relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="relative">
                                    <UserAvatar src={perf.performance_recordings?.students?.avatar_url} name={perf.performance_recordings?.students?.name || 'Aluno'} size="md" />
                                    <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-slate-950">
                                        <Award size={10} className="text-white" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-white truncate">{perf.performance_recordings?.students?.name || 'Performista'}</p>
                                    <p className="text-[9px] text-slate-500 uppercase font-bold truncate">Obra: {perf.performance_recordings?.songs?.title || 'Exercício'}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => togglePlay(perf)}
                                        className={cn(
                                            "p-3 rounded-xl transition-all",
                                            playingId === perf.id ? "bg-amber-500 text-white shadow-lg shadow-amber-900/40" : "bg-slate-800 text-slate-400 hover:text-sky-400"
                                        )}
                                    >
                                        {playingId === perf.id ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                                    </button>
                                    
                                    <M.button 
                                        whileTap={{ scale: 1.4 } as any}
                                        onClick={() => handleHighFive(perf.id, idx)}
                                        className="flex flex-col items-center gap-0.5 px-2 group/btn relative"
                                    >
                                        <HandMetal 
                                            size={18} 
                                            className={cn(
                                                "transition-colors",
                                                interactingId === perf.id ? "text-white" : "text-pink-500 group-hover/btn:text-pink-400"
                                            )} 
                                        />
                                        <span className="text-[10px] font-black text-slate-500">{perf.high_fives_count}</span>
                                    </M.button>
                                </div>
                            </CardContent>
                        </Card>
                    </M.div>
                ))}

                {performances.length === 0 && (
                    <div className="py-10 border border-dashed border-slate-800 rounded-2xl text-center">
                        <p className="text-[10px] font-black text-slate-600 uppercase">O palco está vazio. Aguarde curadoria.</p>
                    </div>
                )}
            </div>
        </section>
    );
};