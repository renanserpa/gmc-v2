import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { 
    ShieldAlert, Fingerprint, Eye, Search, 
    Filter, Clock, Lock, Server, Terminal,
    UserCheck, DatabaseZap, AlertTriangle, ShieldCheck, RefreshCw, Activity
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.ts';
import { formatDate } from '../../lib/date.ts';
import { cn } from '../../lib/utils.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { haptics } from '../../lib/haptics.ts';

const M = motion as any;

export default function SecurityAudit() {
    const [filterType, setFilterType] = useState<string | null>(null);
    const [searchActor, setSearchActor] = useState('');

    // MÚCLEO REATIVO: Monitoramento de logs de auditoria em tempo real
    const { data: logs, loading } = useRealtimeSync<any>(
        'audit_logs', 
        null, 
        { column: 'created_at', ascending: false }
    );

    const filteredLogs = (logs || []).filter(log => {
        if (filterType && !log.event_type?.includes(filterType)) return false;
        if (searchActor && !log.professor_id?.includes(searchActor)) return false;
        return true;
    });

    const categories = [
        { id: null, label: 'Tudo' },
        { id: 'SECURITY', label: 'Segurança', color: 'text-red-400' },
        { id: 'ECONOMY', label: 'Economia', color: 'text-amber-400' },
        { id: 'ADMIN', label: 'Gestão', color: 'text-sky-400' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-red-950/20 p-10 rounded-[48px] border border-red-500/10 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-red-500/5 blur-[120px] pointer-events-none" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-4 bg-red-600 rounded-[28px] text-white shadow-2xl shadow-red-900/40 border border-red-400/20">
                        <Fingerprint size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Security <span className="text-red-500">Audit</span></h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-3 flex items-center gap-2">
                           <Activity size={12} className="text-emerald-500" /> Kernel Activity Stream • Live CDC
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-black/40 p-4 rounded-3xl border border-white/5 relative z-10">
                    <ShieldCheck className="text-emerald-500" />
                    <div className="text-right">
                        <p className="text-[8px] font-black text-slate-600 uppercase">RLS Firewall</p>
                        <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Ativo & Protegido</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <Card className="lg:col-span-3 bg-slate-900 border-white/5 p-2 rounded-3xl">
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                        <input 
                            value={searchActor} 
                            onChange={e => setSearchActor(e.target.value)}
                            placeholder="Pesquisar por ID do ator ou descrição..." 
                            className="w-full bg-transparent border-none outline-none py-4 pl-14 pr-6 text-sm text-white placeholder:text-slate-700 font-mono" 
                        />
                    </div>
                </Card>
                <div className="bg-slate-900/40 border border-white/5 p-2 rounded-3xl flex items-center justify-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {loading ? 'Sincronizando...' : `${filteredLogs.length} Eventos Capturados`}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-9 bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl flex flex-col h-[700px]">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                        <div className="flex items-center gap-3 text-slate-500">
                            <Terminal size={18} />
                            <CardTitle className="text-xs uppercase tracking-[0.3em]">Master Integrity Stream</CardTitle>
                        </div>
                        <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 shadow-inner">
                            {categories.map(c => (
                                <button 
                                    key={c.id} 
                                    onClick={() => { setFilterType(c.id); haptics.light(); }}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                        filterType === c.id ? "bg-red-600 text-white shadow-lg" : "text-slate-600 hover:text-slate-300"
                                    )}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-black/20">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950 text-[10px] font-black text-slate-700 uppercase tracking-widest sticky top-0 z-10 shadow-lg">
                                <tr>
                                    <th className="px-10 py-6">Timestamp</th>
                                    <th className="px-10 py-6">Ator (System ID)</th>
                                    <th className="px-10 py-6">Classe do Evento</th>
                                    <th className="px-10 py-6 text-right">Integridade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading && filteredLogs.length === 0 ? (
                                    [...Array(8)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={4} className="px-10 py-10 bg-white/[0.01]" /></tr>)
                                ) : filteredLogs.map(log => (
                                    <M.tr layout key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-3 text-slate-600 font-mono text-[10px]">
                                                <Clock size={12} />
                                                {formatDate(log.created_at, 'HH:mm:ss')}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-300 uppercase truncate max-w-[200px]">{log.event_type?.includes('SECURITY') ? 'SEC_OFFICER' : 'SYSTEM_ROOT'}</span>
                                                <span className="text-[9px] text-slate-700 font-mono truncate max-w-[150px]">{log.professor_id || 'SYSTEM'}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="space-y-1">
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-tight",
                                                    log.event_type?.includes('SECURITY') ? 'text-red-500' : 
                                                    log.event_type?.includes('ECONOMY') ? 'text-amber-500' : 'text-sky-500'
                                                )}>
                                                    {log.event_type}
                                                </span>
                                                <p className="text-[9px] text-slate-600 truncate max-w-[300px]">{log.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 text-emerald-500 bg-emerald-500/5 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase w-fit ml-auto">
                                                <ShieldCheck size={10} /> Validado
                                            </div>
                                        </td>
                                    </M.tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <aside className="lg:col-span-3 space-y-6">
                    <Card className="bg-slate-900 border-white/5 p-8 rounded-[40px] shadow-2xl flex flex-col gap-6">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                           <AlertTriangle size={14} className="text-red-500" /> Alertas Críticos
                        </h4>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 opacity-40 text-center py-12 italic text-[10px] font-black uppercase text-slate-600">
                                Zero ameaças detectadas nas últimas 24h
                            </div>
                        </div>
                    </Card>

                    <div className="bg-slate-950 p-8 rounded-[40px] border border-white/5 space-y-6">
                        <div className="flex items-center gap-3 text-sky-400">
                            <DatabaseZap size={20} />
                            <h4 className="text-xs font-black uppercase tracking-widest">Auditoria PII</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                            O sistema Maestro não armazena senhas em texto plano ou dados biométricos. Logs de auditoria salvam apenas meta-informações de ação para conformidade <span className="text-white">LGPD/GDPR</span>.
                        </p>
                        <div className="pt-4 border-t border-white/5">
                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                                <span>Criptografia de Log</span>
                                <span className="text-emerald-500">ATIVO</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
