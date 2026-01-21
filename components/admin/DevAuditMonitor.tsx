import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Terminal, ShieldAlert, Activity, Wifi, 
    WifiOff, AlertCircle, CheckCircle2, User, 
    Lock, Unlock, Trash2, Bug, X, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { haptics } from '../../lib/haptics';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

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
        addLog('Executando debugRLS: Verificando políticas de segurança...', 'info');

        // Teste 1: Profiles (Geralmente aberto para o dono ou leitura pública)
        const { error: pErr } = await supabase.from('profiles').select('id').limit(1);
        const pStatus = pErr ? 'blocked' : 'allowed';
        
        // Teste 2: Audit Logs (Deve ser restrito a admins/professores)
        const { error: aErr } = await supabase.from('audit_logs').select('id').limit(1);
        const aStatus = aErr ? 'blocked' : 'allowed';

        setRlsProbe({ profiles: pStatus, audit: aStatus });
        
        if (pErr) addLog(`Profiles Probe: 🔴 BLOQUEADO (${pErr.message})`, 'warn');
        else addLog('Profiles Probe: 🟢 PERMITIDO', 'info');

        if (aErr) addLog(`Audit Probe: 🔴 BLOQUEADO (${aErr.message})`, 'warn');
        else addLog('Audit Probe: 🟢 PERMITIDO', 'info');

        addLog('Debug RLS finalizado.', 'info');
        setIsProbing(false);
    };

    useEffect(() => {
        const handleError = (e: ErrorEvent) => addLog(e.message, 'error');
        const handleRejection = (e: PromiseRejectionEvent) => addLog(e.reason?.message || 'Promise Rejected', 'error');

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleRejection);

        const channel = supabase.channel('dev-health-check');
        channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') setSocketStatus('online');
            if (status === 'CHANNEL_ERROR') setSocketStatus('offline');
        });

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleRejection);
            supabase.removeChannel(channel);
        };
    }, [addLog]);

    useEffect(() => {
        if (user) debugRLS();
    }, [user]);

    const errorCount = logs.filter(l => l.type === 'error').length;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-mono">
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[380px]"
                    >
                        <Card className="bg-slate-950 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden p-0">
                            <div className="bg-slate-900/80 p-6 mb-0 border-b border-white/5 flex items-center justify-between">
                                <CardTitle className="text-[10px] flex items-center gap-2 text-sky-400">
                                    <Terminal size={14} /> Maestro Dev Audit
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-2.5 h-2.5 rounded-full animate-pulse",
                                        socketStatus === 'online' ? "bg-emerald-500" : "bg-red-500"
                                    )} title={socketStatus === 'online' ? 'Socket Online' : 'Socket Offline'} />
                                    
                                    <button 
                                        onClick={() => setLogs([])} 
                                        className="p-2 text-slate-500 hover:text-white transition-colors"
                                        title="Limpar Console"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    
                                    <button 
                                        onClick={() => setIsExpanded(false)} 
                                        className="p-2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        <ChevronDown size={18} />
                                    </button>
                                </div>
                            </div>

                            <CardContent className="p-6 space-y-6">
                                {/* Pilar 1: Identidade */}
                                <section className="space-y-2">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Auth Identity</p>
                                    <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 space-y-1 shadow-inner">
                                        <p className="text-[10px] text-slate-400 flex items-center gap-2">
                                            <User size={10} /> UUID: <span className="text-white truncate">{user?.id}</span>
                                        </p>
                                        <p className="text-[10px] text-slate-400 flex items-center gap-2">
                                            <ShieldAlert size={10} /> Role: <span className="text-sky-400 font-black uppercase">{role}</span>
                                        </p>
                                    </div>
                                </section>

                                {/* Pilar 2: RLS Security Probe */}
                                <section className="space-y-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">RLS Security Probe</p>
                                        <button 
                                            onClick={debugRLS} 
                                            disabled={isProbing}
                                            className="text-[8px] font-black text-sky-500 hover:text-sky-400 uppercase tracking-widest flex items-center gap-1"
                                        >
                                            <RefreshCw size={8} className={cn(isProbing && "animate-spin")} /> Re-Probe
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className={cn(
                                            "p-3 rounded-xl border flex flex-col gap-2 shadow-sm transition-all",
                                            rlsProbe.profiles === 'allowed' ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
                                        )}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black uppercase text-slate-300">Profiles</span>
                                                <span className="text-xs">{rlsProbe.profiles === 'allowed' ? '🟢' : rlsProbe.profiles === 'checking' ? '🟡' : '🔴'}</span>
                                            </div>
                                            <div className={cn(
                                                "text-[8px] font-bold uppercase py-0.5 px-1.5 rounded w-fit",
                                                rlsProbe.profiles === 'allowed' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                            )}>
                                                {rlsProbe.profiles === 'allowed' ? 'Permitido' : 'Bloqueado'}
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "p-3 rounded-xl border flex flex-col gap-2 shadow-sm transition-all",
                                            rlsProbe.audit === 'allowed' ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
                                        )}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black uppercase text-slate-300">Audit Logs</span>
                                                <span className="text-xs">{rlsProbe.audit === 'allowed' ? '🟢' : rlsProbe.audit === 'checking' ? '🟡' : '🔴'}</span>
                                            </div>
                                            <div className={cn(
                                                "text-[8px] font-bold uppercase py-0.5 px-1.5 rounded w-fit",
                                                rlsProbe.audit === 'allowed' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                            )}>
                                                {rlsProbe.audit === 'allowed' ? 'Permitido' : 'Bloqueado'}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Pilar 3: Blackbox Console */}
                                <section className="space-y-2">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">The Blackbox: Activity</p>
                                    <div className="bg-black border border-white/5 rounded-2xl h-44 overflow-y-auto p-4 custom-scrollbar text-[9px] shadow-inner">
                                        {logs.length === 0 ? (
                                            <p className="text-slate-800 italic">Aguardando sinais de sistema...</p>
                                        ) : (
                                            logs.map(log => (
                                                <div key={log.id} className="mb-2 flex gap-2 border-l border-white/5 pl-2">
                                                    <span className="text-slate-700 shrink-0">[{log.timestamp}]</span>
                                                    <span className={cn(
                                                        "font-bold",
                                                        log.type === 'error' ? 'text-red-500' : 
                                                        log.type === 'warn' ? 'text-amber-500' : 'text-sky-500'
                                                    )}>{log.type.toUpperCase()}:</span>
                                                    <span className="text-slate-300 break-all">{log.msg}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </section>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setIsExpanded(!isExpanded); haptics.light(); }}
                className={cn(
                    "flex items-center gap-3 px-6 py-4 rounded-full border shadow-2xl transition-all",
                    errorCount > 0 
                        ? "bg-red-600 border-red-400 text-white animate-pulse" 
                        : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
                )}
            >
                <div className="flex items-center gap-2">
                    {socketStatus === 'online' ? <Wifi size={14} className="text-emerald-400" /> : <WifiOff size={14} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        {errorCount > 0 ? `${errorCount} System Issues` : 'Kernel Status: Healthy'}
                    </span>
                </div>
                <div className="w-px h-4 bg-white/10 mx-1" />
                {isExpanded ? <ChevronDown size={14} /> : <Bug size={14} />}
            </motion.button>
        </div>
    );
};
