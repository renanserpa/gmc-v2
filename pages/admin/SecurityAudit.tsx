import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { 
    ShieldAlert, Fingerprint, Search, Clock, 
    Terminal, ShieldCheck, Activity, ChevronDown, 
    ChevronUp, Database, User, ShieldX
} from 'lucide-react';
import { formatDate } from '../../lib/date.ts';
import { cn } from '../../lib/utils.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { haptics } from '../../lib/haptics.ts';

const M = motion as any;

const AuditDiffViewer = ({ oldData, newData }: { oldData: any, newData: any }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!oldData && !newData) return null;

    // Sanitização de Auditoria: Mascara campos sensíveis (LGPD Compliance)
    const sanitize = (obj: any) => {
        if (!obj) return obj;
        const masked = { ...obj };
        const SENSITIVE_KEYS = ['password', 'hash', 'token', 'secret', 'key', 'email'];
        SENSITIVE_KEYS.forEach(k => {
            if (masked[k]) masked[k] = '******** [REDACTED]';
        });
        return masked;
    };

    const sOld = sanitize(oldData);
    const sNew = sanitize(newData);

    return (
        <div className="mt-4 space-y-2">
            <button 
                onClick={() => { setIsExpanded(!isExpanded); haptics.light(); }}
                className="flex items-center gap-2 text-[9px] font-black text-sky-400 uppercase tracking-widest hover:text-sky-300 transition-colors"
            >
                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {isExpanded ? 'Recolher snapshot' : 'Ver Diffs de Alteração'}
            </button>
            <AnimatePresence>
                {isExpanded && (
                    <M.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-black/40 rounded-2xl border border-white/5 font-mono text-[10px]">
                            <div className="space-y-2 border-r border-white/5 pr-4">
                                <p className="text-slate-600 uppercase font-black tracking-widest pb-1 flex items-center gap-2">
                                    <Clock size={10} /> Estado Anterior
                                </p>
                                <pre className="text-red-400/60 whitespace-pre-wrap leading-relaxed">
                                    {oldData ? JSON.stringify(sOld, null, 2) : '// INITIAL_INSERT'}
                                </pre>
                            </div>
                            <div className="space-y-2 pl-4">
                                <p className="text-emerald-500 uppercase font-black tracking-widest pb-1 flex items-center gap-2">
                                    <Activity size={10} /> Novo Estado
                                </p>
                                <pre className="text-emerald-400/80 whitespace-pre-wrap leading-relaxed">
                                    {newData ? JSON.stringify(sNew, null, 2) : '// RECORD_DELETED'}
                                </pre>
                            </div>
                        </div>
                    </M.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function SecurityAudit() {
    const [search, setSearch] = useState('');

    // MÚCLEO REATIVO: Monitoramento Live CDC
    const { data: logs, loading } = useRealtimeSync<any>('audit_logs');

    const filteredLogs = (logs || []).filter(log => {
        const actorId = log.user_id || '';
        const tableName = log.table_name || '';
        const action = log.action || '';
        return actorId.includes(search) || 
               tableName.toLowerCase().includes(search.toLowerCase()) ||
               action.toLowerCase().includes(search.toLowerCase());
    });

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
                        <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Global Shield Active</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <Card className="lg:col-span-3 bg-slate-900 border-white/5 p-2 rounded-3xl shadow-lg">
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                        <input 
                            value={search} 
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Pesquisar por Ator, Tabela ou Ação..." 
                            className="w-full bg-transparent border-none outline-none py-4 pl-14 pr-6 text-sm text-white font-mono" 
                        />
                    </div>
                </Card>
                <div className="bg-slate-900/40 border border-white/5 p-2 rounded-3xl flex items-center justify-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {loading ? 'Sincronizando...' : `${filteredLogs.length} Eventos Capturados`}
                    </p>
                </div>
            </div>

            <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl flex flex-col h-[750px]">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                    <div className="flex items-center gap-3 text-slate-500">
                        <Terminal size={18} />
                        <CardTitle className="text-xs uppercase tracking-[0.3em]">Master Integrity Stream</CardTitle>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[8px] font-black text-slate-600 uppercase">Live WebSocket</span>
                    </div>
                </div>
                <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-black/20">
                    <div className="divide-y divide-white/5">
                        {loading && filteredLogs.length === 0 ? (
                            [...Array(6)].map((_, i) => <div key={i} className="p-10 animate-pulse bg-white/[0.01]" />)
                        ) : filteredLogs.map(log => (
                            <M.div layout key={log.id} className="p-8 hover:bg-white/[0.01] transition-colors group">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-6">
                                        <div className="text-slate-600 font-mono text-[10px] flex flex-col items-center border-r border-white/5 pr-6">
                                            <span className="font-black text-white">{formatDate(log.created_at, 'HH:mm')}</span>
                                            <span className="opacity-40">{formatDate(log.created_at, 'ss')}s</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                                    log.action === 'INSERT' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    log.action === 'UPDATE' ? "bg-sky-500/10 text-sky-400 border-sky-500/20" :
                                                    "bg-red-500/10 text-red-400 border-red-500/20"
                                                )}>
                                                    {log.action}
                                                </span>
                                                <span className="text-xs font-black text-white uppercase flex items-center gap-2">
                                                    <Database size={12} className="text-slate-600" /> {log.table_name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <User size={10} className="text-slate-700" />
                                                <p className="text-[9px] text-slate-500 font-mono truncate max-w-[200px]"> Ator: {log.user_id || 'SYSTEM_INTERNAL'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-950/80 px-4 py-1.5 rounded-xl border border-white/5 flex items-center gap-2">
                                        <ShieldCheck size={12} className="text-emerald-500" />
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Audit Verified</span>
                                    </div>
                                </div>
                                
                                <AuditDiffViewer oldData={log.old_data} newData={log.new_data} />
                            </M.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
