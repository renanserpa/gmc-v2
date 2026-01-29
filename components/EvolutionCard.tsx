
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.tsx';
import { Clock, Trophy, Headphones, TrendingUp, Music, BrainCircuit, Mic2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.ts';
import { cn } from '../lib/utils.ts';
import { motion } from 'framer-motion';

// FIX: Casting motion components to any to bypass property errors
const M = motion as any;

interface EvolutionCardProps {
    studentId: string;
    className?: string;
}

export const EvolutionCard: React.FC<EvolutionCardProps> = ({ studentId, className }) => {
    const [stats, setStats] = useState({
        totalHours: 0,
        masteredSongs: 0,
        sketchesCount: 0,
        earTrainerScore: 0,
        latestRecording: null as any
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [practiceRes, masteredRes, recRes, sketchRes, earRes] = await Promise.all([
                    supabase.from('practice_sessions').select('duration_seconds').eq('student_id', studentId),
                    supabase.from('student_songs').select('id', { count: 'exact' }).eq('student_id', studentId).eq('status', 'mastered'),
                    supabase.from('performance_recordings').select('*, songs(title)').eq('student_id', studentId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
                    supabase.from('student_sketches').select('id', { count: 'exact' }).eq('student_id', studentId),
                    supabase.from('xp_events').select('id', { count: 'exact' }).eq('player_id', studentId).ilike('event_type', '%EAR%')
                ]);

                const totalSecs = practiceRes.data?.reduce((acc, curr) => acc + curr.duration_seconds, 0) || 0;
                
                setStats({
                    totalHours: Math.round((totalSecs / 3600) * 10) / 10,
                    masteredSongs: masteredRes.count || 0,
                    sketchesCount: sketchRes.count || 0,
                    earTrainerScore: earRes.count || 0,
                    latestRecording: recRes.data
                });
            } catch (e) {
                console.error("Evolution fetch error", e);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, [studentId]);

    if (loading) return <div className="h-48 w-full bg-slate-900/50 animate-pulse rounded-[32px] border border-white/5" />;

    return (
        <Card className={cn("bg-slate-900 border-slate-800 overflow-hidden relative rounded-[32px]", className)}>
            <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none" />
            
            <CardHeader className="pb-2 border-none">
                <CardTitle className="text-[10px] uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                    <TrendingUp size={12} className="text-sky-400" /> Cockpit de Evolução
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <M.div whileHover={{ y: -2 } as any} className="bg-slate-950/50 p-4 rounded-[24px] border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock size={12} className="text-sky-400" />
                            <span className="text-[9px] font-black text-slate-500 uppercase">Tempo</span>
                        </div>
                        <p className="text-xl font-black text-white">{stats.totalHours}H</p>
                    </M.div>

                    <M.div whileHover={{ y: -2 } as any} className="bg-slate-950/50 p-4 rounded-[24px] border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <Trophy size={12} className="text-amber-500" />
                            <span className="text-[9px] font-black text-slate-500 uppercase">Obras</span>
                        </div>
                        <p className="text-xl font-black text-white">{stats.masteredSongs}</p>
                    </M.div>

                    <M.div whileHover={{ y: -2 } as any} className="bg-slate-950/50 p-4 rounded-[24px] border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <Mic2 size={12} className="text-purple-400" />
                            <span className="text-[9px] font-black text-slate-500 uppercase">Ideias</span>
                        </div>
                        <p className="text-xl font-black text-white">{stats.sketchesCount}</p>
                    </M.div>

                    <M.div whileHover={{ y: -2 } as any} className="bg-slate-950/50 p-4 rounded-[24px] border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <BrainCircuit size={12} className="text-emerald-400" />
                            <span className="text-[9px] font-black text-slate-500 uppercase">Ouvido</span>
                        </div>
                        <p className="text-xl font-black text-white">{stats.earTrainerScore}</p>
                    </M.div>
                </div>

                {stats.latestRecording && (
                    <div className="space-y-3 pt-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Headphones size={12} className="text-sky-400" /> Última Transmissão
                        </p>
                        <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 shadow-inner">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <Music size={14} className="text-slate-500" />
                                    <p className="text-xs font-bold text-slate-300 truncate max-w-[150px]">{stats.latestRecording.songs?.title || 'Exercício'}</p>
                                </div>
                                <span className="text-[9px] text-slate-600 font-mono font-bold">
                                    {new Date(stats.latestRecording.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <audio src={stats.latestRecording.audio_url} controls className="w-full h-8 accent-sky-500" />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
