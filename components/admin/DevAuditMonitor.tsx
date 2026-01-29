import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Terminal, ShieldAlert, Activity, Wifi, 
    WifiOff, AlertCircle, CheckCircle2, User, 
    Lock, Unlock, Trash2, Bug, X, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { cn } from '../../lib/utils.ts';
import { haptics } from '../../lib/haptics.ts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.tsx';

// FIX: Casting motion components to any
const M = motion as any;

interface LogEntry {
    id: number;
    timestamp: string;
    msg: string;
    type: 'error' | 'warn' | 'info';
}

export const DevAuditMonitor: React.FC = () => {
    const { user, role } = useAuth();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [socketStatus, setSocketStatus] = useState<'connecting' | 'online' | 'offline'>('connecting');
    const [rlsProbe, setRlsProbe] = useState({ profiles: 'checking', audit: 'checking' });
    const [isExpanded, setIsExpanded] = useState(false);
    const [isProbing, setIsProbing] = useState(false);

    const addLog = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
        setLogs(prev => [{
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            msg,
            type
        }, ...prev].slice(0, 20));
    }, []);

    const debugRLS = async () => {
        setIsProbing(true);
        haptics.medium();
        addLog('Executando debugRLS: Verificando integridade das camadas...', 'info');

        // Teste 1: Profiles
        const { error: pErr } = await supabase.from('profiles').select('id').limit(1);
        const pStatus = pErr ? 'blocked' : 'allowed';
        
        // Teste 2: Audit Logs
        const { error: aErr } = await supabase.from('audit_logs').select('id').limit(1);
        const aStatus = aErr ? 'blocked' : 'allowed';

        setRlsProbe({ profiles: pStatus, audit: aStatus });
        
        if (pErr) addLog(`Camada Profiles: 🔴 BLOQUEADO (${pErr.message})`, 'error');
        else addLog('Camada Profiles: 🟢 ACESSO OK', 'info');

        if (aErr) addLog(`Camada Audit: 🔴 BLOQUEADO (${aErr.message})`, 'warn');
        else addLog('Camada Audit: 🟢 ACESSO OK', 'info');

        setIsProbing(false);
    };

    useEffect(() => {
        const channel = supabase.channel('dev-health-check');
        channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') setSocketStatus('online');
            if (status === 'CHANNEL_ERROR') setSocketStatus('offline');
        });

        // Executa diagnóstico inicial
        if (user) debugRLS();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const errorCount = logs.filter(l => l.type === 'error').length;

    return (
        <div className="fixed bottom-6 left-6 z-[9999] font-mono">
            <AnimatePresence>
                {isExpanded && (
                    <M.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[380px]"
                    >
                        <Card className="bg-slate-950 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden p-0">
                            <div className="bg-slate-900/80 p-6 mb-0 border-b border-white/5 flex items-center justify-between">
                                <CardTitle className="text-[10px] flex items-center gap-2 text-sky-400">
                                    <Terminal size={14} /> Maestro Kernel Monitor
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-2.5 h-2.5 rounded-full animate-pulse",
                                        socketStatus === 'online' ? "bg-emerald-500" : "bg-red-500"
                                    )} />
                                    <button onClick={() => setIsExpanded(false)} className="p-2 text-slate-500 hover:text-white">
                                        <ChevronDown size={18} />
                                    </button>
                                </div>
                            </div>

                            <CardContent className="p-6 space-y-6">
                                <section className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Integridade RLS</p>
                                        <button onClick={debugRLS} disabled={isProbing} className="text-[8px] text-sky-500 uppercase font-black">
                                            {isProbing ? 'Sincronizando...' : 'Re-Diagnosticar'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className={cn("p-3 rounded-2xl border flex items-center justify-between", rlsProbe.profiles === 'allowed' ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20")}>
                                            <span className="text-[10px] font-bold text-slate-300">Profiles</span>
                                            <span>{rlsProbe.profiles === 'allowed' ? '🟢' : '🔴'}</span>
                                        </div>
                                        <div className={cn("p-3 rounded-2xl border flex items-center justify-between", rlsProbe.audit === 'allowed' ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20")}>
                                            <span className="text-[10px] font-bold text-slate-300">Audit Logs</span>
                                            <span>{rlsProbe.audit === 'allowed' ? '🟢' : '🔴'}</span>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-2">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Kernel Stream</p>
                                    <div className="bg-black border border-white/5 rounded-2xl h-40 overflow-y-auto p-4 text-[9px] shadow-inner custom-scrollbar">
                                        {logs.map(log => (
                                            <div key={log.id} className="mb-2 flex gap-2 border-l border-white/5 pl-2">
                                                <span className="text-slate-700">[{log.timestamp}]</span>
                                                <span className={cn("font-bold", log.type === 'error' ? 'text-red-500' : log.type === 'warn' ? 'text-amber-500' : 'text-sky-500')}>{log.type.toUpperCase()}:</span>
                                                <span className="text-slate-300 break-all">{log.msg}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </CardContent>
                        </Card>
                    </M.div>
                )}
            </AnimatePresence>

            <M.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setIsExpanded(!isExpanded); haptics.light(); }}
                className={cn(
                    "flex items-center gap-3 px-6 py-4 rounded-full border shadow-2xl transition-all",
                    errorCount > 0 ? "bg-red-600 border-red-400 text-white animate-pulse" : "bg-slate-900 border-white/10 text-slate-400"
                )}
            >
                <Bug size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Oracle Diagnostic</span>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </M.button>
        </div>
    );
};