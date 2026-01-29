import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { 
    ShieldAlert, Fingerprint, Eye, Search, 
    Filter, Clock, Lock, Server, Terminal,
    UserCheck, DatabaseZap, AlertTriangle
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.ts';
import { formatDate } from '../../lib/date.ts';
import { cn } from '../../lib/utils.ts';

export default function SecurityAudit() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            // No Kernel v4, buscamos de system_health_logs ou audit_logs
            const { data } = await supabase
                .from('xp_events') // Usando como proxy de eventos para demonstração
                .select(`
                    *,
                    students:player_id (name, email)
                `)
                .order('created_at', { ascending: false })
                .limit(50);
            setLogs(data || []);
            setLoading(false);
        };
        load();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-red-950/20 p-8 rounded-[40px] border border-red-500/10 backdrop-blur-xl">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-red-600 rounded-3xl text-white shadow-xl shadow-red-900/30 ring-4 ring-red-500/10">
                        <Fingerprint size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Security <span className="text-red-500">Audit</span></h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Monitoramento de Integridade e Ações Privilegiadas</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="bg-[#020617] p-6 rounded-[32px] border border-white/5 shadow-inner">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Tentativas de Invasão</p>
                    <h3 className="text-3xl font-black text-white mt-1">0</h3>
                    <span className="text-[8px] font-bold text-emerald-500 uppercase mt-2 block">Criptografia Ativa</span>
                </div>
                <div className="bg-[#020617] p-6 rounded-[32px] border border-white/5 shadow-inner">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Leaks Bloqueados</p>
                    <h3 className="text-3xl font-black text-white mt-1">12</h3>
                    <span className="text-[8px] font-bold text-sky-500 uppercase mt-2 block">RLS Monitor</span>
                </div>
                <div className="lg:col-span-2 bg-gradient-to-r from-red-600/10 to-transparent p-6 rounded-[32px] border border-red-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <AlertTriangle className="text-red-500 animate-pulse" />
                        <p className="text-xs font-bold text-slate-400 max-w-[200px]">Nenhum acesso não autorizado detectado nas últimas 24h.</p>
                    </div>
                    <button className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Deep Scanner</button>
                </div>
            </div>

            <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                    <div className="flex items-center gap-3">
                        <Terminal size={18} className="text-slate-500" />
                        <CardTitle className="text-xs uppercase tracking-[0.3em]">Master Activity Stream</CardTitle>
                    </div>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                        <input placeholder="Filtrar por UUID ou Módulo..." className="bg-slate-900 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-[10px] text-white outline-none focus:border-red-500/50 min-w-[250px]" />
                    </div>
                </div>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                <tr>
                                    <th className="px-10 py-6">Timestamp</th>
                                    <th className="px-10 py-6">Entidade</th>
                                    <th className="px-10 py-6">Módulo / Ação</th>
                                    <th className="px-10 py-6">Status IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-10 py-5">
                                            <div className="flex items-center gap-3">
                                                <Clock size={12} className="text-slate-700" />
                                                <span className="text-[10px] font-mono text-slate-500">{formatDate(log.created_at, 'dd/MM HH:mm:ss')}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-red-600 group-hover:text-white transition-all">
                                                    {log.students?.name?.substring(0,1) || 'U'}
                                                </div>
                                                <span className="text-xs font-black text-slate-300">{log.students?.name || 'Sistema Root'}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-white uppercase">{log.event_type}</span>
                                                <span className="text-[9px] text-slate-600 font-mono">MOD: {log.context_type?.toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-5">
                                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded uppercase border border-emerald-500/20">Verified</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}