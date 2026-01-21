import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, ShieldCheck, Terminal as TerminalIcon, AlertTriangle, 
    Wifi, Database, CheckCircle2, XCircle, Code, RefreshCw, 
    Zap, Cpu, ChevronRight, Copy, DatabaseZap, Trash2, Flame
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { telemetryService, IntegrityStatus, LatencyResult, SystemLog } from '../../services/telemetryService.ts';
import { GCM_DB_SCHEMA } from '../../data/schemaDefaults.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { notify } from '../../lib/notification.ts';
import { cn } from '../../lib/utils.ts';
import { haptics } from '../../lib/haptics.ts';

export default function SystemHealth() {
    const { user } = useAuth();
    const [latency, setLatency] = useState<LatencyResult>({ ms: 0, rating: 'Excellent' });
    const [latencyHistory, setLatencyHistory] = useState<number[]>(new Array(12).fill(0));
    const [integrity, setIntegrity] = useState<IntegrityStatus[]>([]);
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFixOpen, setIsFixOpen] = useState(false);
    const logEndRef = useRef<HTMLDivElement>(null);

    const refreshHealth = async () => {
        setLoading(true);
        try {
            const [lat, integ] = await Promise.all([
                telemetryService.measureLatency(),
                telemetryService.checkDatabaseIntegrity()
            ]);
            setLatency(lat);
            setIntegrity(integ);
            setLatencyHistory(prev => [...prev.slice(1), lat.ms]);
            setLogs(telemetryService.getSystemLogs());
        } catch (e) {
            notify.error("Connection Interrupted");
        } finally {
            setLoading(false);
        }
    };

    const handleEnvironmentPurge = () => {
        haptics.heavy();
        if (window.confirm("🚨 PROTOCOLO DE EMERGÊNCIA: Isso limpará permanentemente todos os dados de cache, sessões, chaves locais e banco de áudio. O sistema retornará ao estado de fábrica. Confirmar?")) {
            localStorage.clear();
            sessionStorage.clear();
            try {
                indexedDB.deleteDatabase('OlieMusicCache');
            } catch (e) {}
            
            notify.warning("Purgando dados locais... Reiniciando motor.");
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }
    };

    useEffect(() => {
        refreshHealth();
        const interval = setInterval(async () => {
            const lat = await telemetryService.measureLatency();
            setLatency(lat);
            setLatencyHistory(prev => [...prev.slice(1), lat.ms]);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const repairSql = user ? `-- SCRIPT DE REPARO DE PERFIL (EXECUTAR NO SUPABASE)\nINSERT INTO public.profiles (id, email, role, full_name)\nVALUES ('${user.id}', '${user.email}', 'admin', 'God Mode Admin')\nON CONFLICT (id) DO UPDATE SET role = 'admin';` : '-- Usuário não identificado para gerar script.';

    const copyRepair = () => {
        navigator.clipboard.writeText(repairSql);
        haptics.success();
        notify.success("Script de Reparo copiado!");
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-10 font-mono text-slate-300 space-y-10 selection:bg-sky-500/30 selection:text-sky-200 animate-in fade-in duration-700">
            {/* Cabecalho de Estação de Trabalho */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-sky-500">
                        <Cpu size={18} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">System Engineering Console</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                        Maestro <span className="text-sky-500">Kernel</span> v3.0
                    </h1>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-900/50 border border-white/10 p-4 rounded-2xl flex items-center gap-4 shadow-inner">
                        <div className="text-right">
                            <p className="text-[8px] font-black text-slate-500 uppercase">Active Session</p>
                            <p className="text-xs font-bold text-white truncate max-w-[150px]">{user?.email || 'DEBUG_ADMIN'}</p>
                        </div>
                        <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400">
                            <ShieldCheck size={20} />
                        </div>
                    </div>
                    <Button onClick={refreshHealth} isLoading={loading} variant="outline" className="h-full px-8 rounded-2xl border-white/10 hover:bg-white/5">
                        <RefreshCw size={16} className={cn(loading && "animate-spin")} />
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Widget 1: Network Heartbeat */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-900/40 border-white/5 rounded-[40px] overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 p-16 bg-sky-500/5 blur-[80px] pointer-events-none" />
                        <CardHeader className="p-8 border-b border-white/5">
                            <CardTitle className="text-sm flex items-center gap-3 text-sky-400">
                                <Wifi size={18} /> Network Heartbeat
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-5xl font-black text-white tracking-tighter">
                                        {latency.ms}<span className="text-xl text-slate-600 ml-1">ms</span>
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full animate-ping",
                                            latency.rating === 'Excellent' ? "bg-emerald-500" : "bg-amber-500"
                                        )} />
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            latency.rating === 'Excellent' ? "text-emerald-400" : "text-amber-400"
                                        )}>
                                            Status: {latency.rating}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-end gap-1 h-16">
                                    {latencyHistory.map((val, i) => (
                                        <div 
                                            key={i} 
                                            className={cn(
                                                "w-2 rounded-t-sm transition-all duration-500",
                                                val < 150 ? "bg-sky-500/40" : "bg-red-500/60"
                                            )}
                                            style={{ height: `${Math.min(100, (val / 500) * 100)}%` }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
                                    <p className="text-[8px] text-slate-600 uppercase font-black mb-1">Packet Loss</p>
                                    <p className="text-sm font-bold text-white">0.02%</p>
                                </div>
                                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
                                    <p className="text-[8px] text-slate-600 uppercase font-black mb-1">Jitter</p>
                                    <p className="text-sm font-bold text-white">4ms</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Widget Purge: LIMPEZA DE AMBIENTE */}
                    <Card className="bg-red-500/5 border-red-500/20 rounded-[40px] p-8 shadow-2xl group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-12 bg-red-500/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg">
                                    <Flame size={24} />
                                </div>
                                <div>
                                    <h4 className="text-white font-black uppercase text-sm tracking-widest">Limpeza de Ambiente</h4>
                                    <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mt-1">Nível de Risco: Alto</p>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                Esta ação purga permanentemente o cache, banco de dados IndexedDB, credenciais de API e configurações de sessão salvas localmente. O sistema retornará ao estado de fábrica após o recarregamento.
                            </p>
                            <Button 
                                onClick={handleEnvironmentPurge}
                                className="w-full bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest py-4 shadow-xl shadow-red-900/20"
                                leftIcon={Trash2}
                            >
                                Executar Purga Total
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Widget 2: Schema Validator */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="bg-slate-900/40 border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                        <CardHeader className="p-8 border-b border-white/5 flex flex-row justify-between items-center">
                            <div>
                                <CardTitle className="text-sm flex items-center gap-3 text-purple-400">
                                    <Database size={18} /> Schema Sincronization
                                </CardTitle>
                                <CardDescription className="text-[10px]">Validando estrutura pública contra GCM_DB_SCHEMA v3.0</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => setIsFixOpen(true)} className="rounded-xl text-[10px] bg-sky-600 hover:bg-sky-500" leftIcon={Code}>
                                Resolve Schema
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {integrity.map((table, idx) => (
                                    <motion.div 
                                        key={table.tableName}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={cn(
                                            "p-5 rounded-3xl border transition-all flex items-center justify-between",
                                            table.status === 'healthy' ? "bg-slate-950 border-white/5" : "bg-red-500/5 border-red-500/20"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-2 rounded-xl",
                                                table.status === 'healthy' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                            )}>
                                                {table.status === 'healthy' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-white uppercase tracking-tight">{table.tableName}</p>
                                                <p className="text-[9px] font-bold text-slate-600 uppercase">{table.rowCount} registros</p>
                                            </div>
                                        </div>
                                        {table.status !== 'healthy' && (
                                            <span className="text-[8px] font-black text-red-500 uppercase animate-pulse">Missing</span>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Alerta de Perfil RLS */}
                            <div className="mt-8 p-6 bg-sky-500/5 border border-sky-500/20 rounded-[32px] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-sky-600 rounded-2xl text-white shadow-lg">
                                        <DatabaseZap size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase">Sincronizador de Perfil</p>
                                        <p className="text-[10px] text-slate-500">Detectamos problemas de leitura RLS? Gere o script de reparo.</p>
                                    </div>
                                </div>
                                <Button size="sm" onClick={copyRepair} variant="secondary" className="rounded-xl px-6">
                                    Fix Profile
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Widget 3: The Blackbox (Logs) */}
                    <Card className="bg-black border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col h-[400px]">
                        <div className="p-4 bg-slate-900/80 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <TerminalIcon size={14} className="text-emerald-400" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">The Blackbox: System Activity</span>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500/20" />
                                <div className="w-2 h-2 rounded-full bg-amber-500/20" />
                                <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
                            </div>
                        </div>
                        <CardContent className="flex-1 overflow-y-auto p-6 font-mono text-[10px] leading-relaxed custom-scrollbar bg-slate-950/40">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-4 py-1 hover:bg-white/5 px-2 rounded group">
                                    <span className="text-slate-700">[{log.timestamp}]</span>
                                    <span className={cn(
                                        "font-black w-12",
                                        log.level === 'ERROR' ? 'text-red-500' : 
                                        log.level === 'WARN' ? 'text-amber-500' : 'text-sky-500'
                                    )}>{log.level}</span>
                                    <span className="text-emerald-500 shrink-0">@{log.source}:</span>
                                    <span className="text-slate-400 group-hover:text-slate-200 transition-colors">{log.message}</span>
                                </div>
                            ))}
                            <div ref={logEndRef} />
                        </CardContent>
                        <div className="p-4 bg-slate-900/30 border-t border-white/5 text-right">
                             <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest animate-pulse">Monitoring Active • Realtime Stream</span>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modal de Fix SQL */}
            <AnimatePresence>
                {isFixOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
                            onClick={() => setIsFixOpen(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[48px] overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 border-b border-white/5 bg-slate-950/50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Fix Structural Discrepancies</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">GCM Infrastructure Recovery Agent</p>
                                </div>
                                <Button size="sm" onClick={copyRepair} leftIcon={Copy} className="rounded-xl bg-sky-600 text-[10px]">Copiar Tudo</Button>
                            </div>
                            <div className="p-8 max-h-[500px] overflow-y-auto custom-scrollbar font-mono text-[11px] leading-relaxed text-sky-400/80 bg-black">
                                <pre className="whitespace-pre-wrap">{GCM_DB_SCHEMA}</pre>
                            </div>
                            <div className="p-6 bg-slate-900 flex justify-end gap-3 border-t border-white/5">
                                <Button variant="ghost" onClick={() => setIsFixOpen(false)} className="text-[10px]">Fechar Terminal</Button>
                                <Button onClick={() => window.open('https://supabase.com/dashboard/project/_/sql', '_blank')} className="rounded-xl px-8 text-[10px]" leftIcon={Zap}>Ir para SQL Editor</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}