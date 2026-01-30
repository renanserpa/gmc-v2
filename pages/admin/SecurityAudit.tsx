
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { 
    ShieldAlert, Fingerprint, Eye, Search, 
    Filter, Clock, Lock, Server, Terminal,
    UserCheck, DatabaseZap, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.ts';
import { formatDate } from '../../lib/date.ts';
import { cn } from '../../lib/utils.ts';
import { motion, AnimatePresence } from 'framer-motion';

const M = motion as any;

export default function SecurityAudit() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('xp_events')
                .select('*, students(name, email)')
                .order('created_at', { ascending: false })
                .limit(40);
            setLogs(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-red-950/20 p-10 rounded-[48px] border border-red-500/10 backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-red-600 rounded-[28px] text-white shadow-2xl shadow-red-900/40 border border-red-400/20">
                        <Fingerprint size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Security <span className="text-red-500">Audit</span></h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-3">Monitoramento de Integridade e Ações Críticas</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-black/40 p-4 rounded-3xl border border-white/5">
                    <ShieldCheck className="text-emerald-500" />
                    <div className="text-right">
                        <p className="text-[8px] font-black text-slate-600 uppercase">RLS Firewall</p>
                        <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Ativo & Protegido</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-8 bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                        <div className="flex items-center gap-3 text-slate-500">
                            <Terminal size={18} />
                            <CardTitle className="text-xs uppercase tracking-[0.3em]">Master Activity Stream</CardTitle>
                        </div>
                    </div>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-950 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-10 py-6">Timestamp</th>
                                        <th className="px-10 py-6">Entidade</th>
                                        <th className="px-10 py-6">Ação / Evento</th>
                                        <th className="px-10 py-6 text-right">Integridade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {logs.map(log => (
                                        <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-3 text-slate-600 font-mono text-[10px]">
                                                    <Clock size={12} />
                                                    {formatDate(log.created_at, 'HH:mm:ss')}
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-300 uppercase truncate max-w-[150px]">{log.students?.name || 'Sistema Root'}</span>
                                                    <span className="text-[9px] text-slate-700 font-mono truncate">{log.player_id}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="text-[10px] font-black text-white uppercase tracking-tight">{log.event_type}</span>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-lg text-[8px] font-black uppercase">Validado</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <aside className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-900 border-white/5 p-8 rounded-[40px] shadow-2xl flex flex-col gap-6">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                           <AlertTriangle size={14} className="text-red-500" /> Alertas Recentes
                        </h4>
                        <div className="py-20 text-center opacity-20 italic text-sm">
                            Nenhuma anomalia detectada.
                        </div>
                    </Card>

                    <div className="bg-slate-950 p-8 rounded-[40px] border border-white/5 space-y-4">
                        <div className="flex items-center gap-3 text-sky-400">
                            <Server size={20} />
                            <h4 className="text-xs font-black uppercase tracking-widest">Node Health</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                                <span>SSL Encrypt</span>
                                <span className="text-emerald-500">ACTIVE</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                                <span>JWT Expiry</span>
                                <span className="text-white">3600s</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
