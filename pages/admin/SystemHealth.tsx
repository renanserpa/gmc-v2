
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, ShieldCheck, Terminal as TerminalIcon, AlertTriangle, 
    Wifi, Database, CheckCircle2, XCircle, Code, RefreshCw, 
    Zap, Cpu, ChevronRight, Copy, DatabaseZap, Trash2, Flame, Brain, Sparkles,
    ShieldOff, Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { telemetryService, IntegrityStatus, LatencyResult, SystemLog } from '../../services/telemetryService.ts';
import { GCM_DB_SCHEMA } from '../../data/schemaDefaults.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useAdmin } from '../../contexts/AdminContext.tsx';
import { notify } from '../../lib/notification.ts';
import { cn } from '../../lib/utils.ts';
import { haptics } from '../../lib/haptics.ts';

const M = motion as any;

export default function SystemHealth() {
    const { user } = useAuth();
    const { isBypassActive } = useAdmin();
    const [latency, setLatency] = useState<LatencyResult>({ ms: 0, rating: 'Excellent' });
    const [latencyHistory, setLatencyHistory] = useState<number[]>(new Array(24).fill(0));
    const [integrity, setIntegrity] = useState<IntegrityStatus[]>([]);
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFixOpen, setIsFixOpen] = useState(false);
    
    // IA Telemetry
    const [aiLoad, setAiLoad] = useState(15);
    const logContainerRef = useRef<HTMLDivElement>(null);

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
            setAiLoad(Math.floor(Math.random() * 20) + 10);
        } catch (e) {
            notify.error("Connection Interrupted");
        } finally {
            setLoading(false);
        }
    };

    // FIX: Added handleEnvironmentPurge to fix missing function error
    const handleEnvironmentPurge = () => {
        haptics.heavy();
        if (window.confirm("🚨 RESET DE FÁBRICA: Isso limpará permanentemente todos os dados de cache, banco de dados de áudio, sessões de login e configurações locais. Você será deslogado imediatamente. Confirmar?")) {
            // 1. Limpa Armazenamento Síncrono
            localStorage.clear();
            sessionStorage.clear();
            
            // 2. Limpa Banco de Dados Offline (Cache de Áudio)
            try {
                indexedDB.deleteDatabase('OlieMusicCache');
            } catch (e) {
                console.warn("[Kernel] Falha ao deletar IndexedDB:", e);
            }

            notify.warning("Purgando dados... Reiniciando.");
            
            // 3. Força recarregamento da aplicação
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
            setAiLoad(l => Math.max(5, Math.min(95, l + (Math.random() * 10 - 5))));
            
            // Simulação de logs dinâmicos
            if (Math.random() > 0.7) {
              const newLog: SystemLog = {
                timestamp: new Date().toLocaleTimeString(),
                level: Math.random() > 0.9 ? 'ERROR' : 'INFO',
                source: 'NETWORK',
                message: 'Neural heartbeat pulse detected.'
              };
              setLogs(prev => [newLog, ...prev].slice(0, 50));
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const copyRepair = () => {
        const repairSql = user ? `-- SCRIPT DE REPARO DE PERFIL\nINSERT INTO public.profiles (id, email, role, full_name)\nVALUES ('${user.id}', '${user.email}', 'admin', 'God Mode Admin')\nON CONFLICT (id) DO UPDATE SET role = 'admin';` : '';
        navigator.clipboard.writeText(repairSql);
        haptics.success();
        notify.success("Script de Reparo copiado!");
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-10 font-mono text-slate-300 space-y-10 selection:bg-sky-500/30 selection:text-sky-200 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-sky-500">
                        <Cpu size={18} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Engineering Dashboard</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                        System <span className="text-sky-500">Integrity</span> v4.0
                    </h1>
                </div>
                <div className="flex gap-4">
                    <div className={cn(
                      "bg-slate-900/50 border p-4 rounded-2xl flex items-center gap-4 shadow-inner transition-colors",
                      isBypassActive ? "border-red-500/30" : "border-white/10"
                    )}>
                        <div className="text-right">
                            <p className="text-[8px] font-black text-slate-500 uppercase">Security Layer</p>
                            <p className={cn("text-xs font-bold uppercase", isBypassActive ? "text-red-500" : "text-emerald-500")}>
                              {isBypassActive ? 'RLS BYPASSED' : 'RLS ENFORCED'}
                            </p>
                        </div>
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isBypassActive ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-400")}>
                            {isBypassActive ? <ShieldOff size={20} /> : <Lock size={20} />}
                        </div>
                    </div>
                    <Button onClick={refreshHealth} isLoading={loading} variant="outline" className="h-full px-8 rounded-2xl border-white/10 hover:bg-white/5">
                        <RefreshCw size={16} className={cn(loading && "animate-spin")} />
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-900/40 border-white/5 rounded-[40px] overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 p-16 bg-sky-500/5 blur-[80px] pointer-events-none" />
                        <CardHeader className="p-8 border-b border-white/5">
                            <CardTitle className="text-sm flex items-center gap-3 text-sky-400">
                                <Wifi size={18} /> Net Latency (Realtime)
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
                                        <span className={cn("text-[10px] font-black uppercase tracking-widest", latency.rating === 'Excellent' ? "text-emerald-400" : "text-amber-400")}>
                                            {latency.rating} Stability
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-end gap-1 h-16 w-32">
                                    {latencyHistory.map((val, i) => (
                                        <div 
                                            key={i} 
                                            className={cn("flex-1 rounded-t-sm transition-all duration-500", val < 150 ? "bg-sky-500/40" : "bg-red-500/60")}
                                            style={{ height: `${Math.max(5, Math.min(100, (val / 500) * 100))}%` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-purple-950/20 border-purple-500/20 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-lg">
                                        <Brain size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black uppercase text-sm tracking-widest">Neural Motor</h4>
                                        <p className="text-[9px] font-black text-purple-400 uppercase mt-1">Google Gemini 3 Flash</p>
                                    </div>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[8px] font-black text-emerald-400">SYNCED</div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                                    <span>Processing Load</span>
                                    <span className="text-white">{Math.round(aiLoad)}%</span>
                                </div>
                                <div className="h-2 bg-slate-900 rounded-full border border-white/5 overflow-hidden">
                                    <M.div animate={{ width: `${aiLoad}%` }} className={cn("h-full transition-all duration-1000", aiLoad > 80 ? "bg-red-500 shadow-[0_0_10px_#ef4444]" : "bg-purple-500")} />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-slate-900/60 p-6 rounded-[32px] border border-white/5 space-y-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Sparkles size={14} className="text-sky-500" /> Active Session Stats</p>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                              <p className="text-[8px] font-black text-slate-700 uppercase">Memory</p>
                              <p className="text-lg font-black text-white">42.8<span className="text-xs text-slate-600 ml-0.5">MB</span></p>
                           </div>
                           <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                              <p className="text-[8px] font-black text-slate-700 uppercase">Requests</p>
                              <p className="text-lg font-black text-white">842</p>
                           </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-8">
                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[40px] overflow-hidden shadow-2xl flex flex-col h-[550px]">
                        <div className="p-6 bg-slate-900/80 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <TerminalIcon size={16} className="text-emerald-400" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Maestro Kernel Logs</span>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => setLogs([])} className="text-[8px] uppercase font-black text-slate-600 hover:text-white">Clear Stream</Button>
                        </div>
                        <CardContent ref={logContainerRef} className="flex-1 overflow-y-auto p-8 font-mono text-[10px] leading-relaxed custom-scrollbar bg-black/20">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-4 py-1.5 hover:bg-white/5 px-2 rounded group border-l-2 border-transparent hover:border-sky-500/40">
                                    <span className="text-slate-700 shrink-0">[{log.timestamp}]</span>
                                    <span className={cn(
                                        "font-black w-12 shrink-0",
                                        log.level === 'ERROR' ? 'text-red-500' : 
                                        log.level === 'WARN' ? 'text-amber-500' : 'text-sky-500'
                                    )}>{log.level}</span>
                                    <span className="text-emerald-500 shrink-0 font-bold">@{log.source}:</span>
                                    <span className="text-slate-400 group-hover:text-slate-200 transition-colors">{log.message}</span>
                                </div>
                            ))}
                            {logs.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center gap-4">
                                    <Activity size={48} className="animate-pulse" />
                                    <p className="text-xs uppercase font-black tracking-widest">Aguardando telemetria...</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-slate-900/40 border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Database size={16} className="text-sky-400" /> Schema Integrity
                            </h4>
                            <div className="space-y-3">
                                {integrity.slice(0, 4).map(table => (
                                    <div key={table.tableName} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-2xl border border-white/5">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{table.tableName}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] font-black text-slate-600">{table.rowCount} records</span>
                                            {table.status === 'healthy' ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-red-500" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="bg-red-500/5 border-red-500/20 rounded-[40px] p-8 flex flex-col justify-between">
                            <div>
                                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Flame size={16} className="text-red-500" /> Maintenance
                                </h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed italic">Purga de emergência para casos de dessincronização severa.</p>
                            </div>
                            <Button 
                              variant="danger" 
                              onClick={handleEnvironmentPurge} 
                              className="w-full mt-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                              leftIcon={Trash2}
                            >
                              Factory Reset Kernel
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
