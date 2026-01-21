
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Calendar, Music } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { formatDate } from '../../lib/date';
import { cn } from '../../lib/utils';

export const PracticeHistory: React.FC<{ studentId: string }> = ({ studentId }) => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase
                .from('xp_events')
                .select('*')
                .eq('player_id', studentId)
                .eq('event_type', 'PRACTICE_SESSION')
                .order('created_at', { ascending: false })
                .limit(4);
            setSessions(data || []);
            setLoading(false);
        };
        load();
    }, [studentId]);

    if (loading) return <div className="h-40 w-full bg-slate-900/50 rounded-3xl animate-pulse" />;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
                <Clock size={14} className="text-slate-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Diário de Bordo</span>
            </div>
            <div className="space-y-2">
                {sessions.map((s, idx) => (
                    <motion.div 
                        key={s.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-sky-500/20 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-900 rounded-xl text-slate-600 group-hover:text-sky-400 transition-colors">
                                <Music size={14} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white uppercase">Prática no Estúdio</p>
                                <p className="text-[8px] font-bold text-slate-600 uppercase mt-0.5">{formatDate(s.created_at, 'dd MMM • HH:mm')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-sky-500/10 px-2 py-1 rounded-lg border border-sky-500/20">
                            <Zap size={10} className="text-sky-400" fill="currentColor" />
                            <span className="text-[10px] font-black text-sky-400">+{s.xp_amount}</span>
                        </div>
                    </motion.div>
                ))}
                {sessions.length === 0 && (
                    <div className="py-8 text-center border-2 border-dashed border-slate-900 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Nenhuma sessão gravada</p>
                    </div>
                )}
            </div>
        </div>
    );
};
