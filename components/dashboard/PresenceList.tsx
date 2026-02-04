
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from '../ui/UserAvatar.tsx';
import { Activity, Wifi, WifiOff, Zap } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

interface PresenceListProps {
    presences: any[]; // Estado do Supabase Presence
    telemetry: Record<string, number>;
}

export const PresenceList: React.FC<PresenceListProps> = ({ presences, telemetry }) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Activity size={14} className="text-emerald-500" /> Crew Sincronizada
                </h3>
                <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {presences.length} ONLINE
                </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <AnimatePresence>
                    {presences.map((p: any) => {
                        const user = p[0]; // Supabase presence array format
                        const hits = telemetry[user.id] || 0;
                        
                        return (
                            <motion.div
                                key={user.id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-slate-900/60 border border-white/5 p-4 rounded-[24px] flex items-center justify-between group hover:border-sky-500/30 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <UserAvatar src={user.avatar_url} name={user.name} size="md" />
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-lg" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase truncate max-w-[120px]">{user.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Wifi size={10} className="text-emerald-500" />
                                            <span className="text-[8px] font-bold text-slate-500 uppercase">Latency: 24ms</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1.5">
                                        <Zap size={10} className={cn("transition-colors", hits > 0 ? "text-amber-500" : "text-slate-700")} fill={hits > 0 ? "currentColor" : "none"} />
                                        <span className="text-[10px] font-mono font-black text-sky-400">{hits}</span>
                                    </div>
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter mt-1">Hits Nesta Jam</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {presences.length === 0 && (
                    <div className="py-12 border-2 border-dashed border-slate-800 rounded-[32px] text-center space-y-3 opacity-40">
                        <WifiOff size={32} className="mx-auto text-slate-700" />
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-8">Nenhum aluno detectado no radar</p>
                    </div>
                )}
            </div>
        </div>
    );
};
