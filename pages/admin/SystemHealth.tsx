import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, ShieldCheck, Terminal as TerminalIcon, AlertTriangle, 
    Wifi, Database, CheckCircle2, XCircle, Code, RefreshCw, 
    Zap, Cpu, ChevronRight, Copy, DatabaseZap, Trash2, Flame, Brain, Sparkles,
    ShieldOff, Lock, Network, Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { telemetryService, IntegrityStatus, LatencyResult, SystemLog, TenantMetric } from '../../services/telemetryService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useAdmin } from '../../contexts/AdminContext.tsx';
import { notify } from '../../lib/notification.ts';
import { cn } from '../../lib/utils.ts';
import { haptics } from '../../lib/haptics.ts';

const M = motion as any;

const TenantNeuralHeatmap = ({ metrics }: { metrics: TenantMetric[] }) => (
    <Card className="bg-slate-900/40 border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
        <CardHeader className="p-8 border-b border-white/5 bg-slate-950/20">
            <CardTitle className="text-xs flex items-center gap-3 text-sky-400 uppercase tracking-widest">
                <Network size={18} /> Neural Heatmap per Tenant
            </CardTitle>
            <CardDescription className="text-[10px] font-medium text-slate-500">Mapeamento de latência e erros segmentado por escola.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <div className="divide-y divide-white/5">
                {metrics.map(m => (
                    <div key={m.school_id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-950 rounded-xl text-slate-500 group-hover:text-sky-400 transition-colors">
                                <Building2 size={16} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-white uppercase">{m.school_name}</p>
                                <p className="text-[8px] text-slate-500 font-mono">{m.school_id}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-10">
                            <div className="text-right">
                                <p className="text-[8px] font-black text-slate-600 uppercase">Avg Latency</p>
                                <p className={cn("text-xs font-mono font-bold", m.avg_latency > 150 ? "text-red-400" : "text-emerald-400")}>
                                    {m.avg_latency}ms
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-black text-slate-600 uppercase">Integr. Errors</p>
                                <p className={cn("text-xs font-mono font-bold", m.error_count > 5 ? "text-red-500" : "text-amber-500")}>
                                    {m.error_count}
                                </p>
                            </div>
                            <div className="w-32 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                <M.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${m.integration_health}%` }}
                                    className={cn("h-full", m.integration_health > 90 ? "bg-emerald-500" : "bg-amber-500")}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {metrics.length === 0 && (
                <div className="p-12 text-center text-slate-600 uppercase font-black text-[10px] tracking-widest italic opacity-40">
                    Aguardando sinal dos clusters periféricos...
                </div>
            )}
        </CardContent>
    </Card>
);

export default function SystemHealth() {
    const { user } = useAuth();
    const { isBypassActive } = useAdmin();
    const [latency, setLatency] = useState<LatencyResult>({ ms: 0, rating: 'Excellent' });
    const [latencyHistory, setLatencyHistory] = useState<number[]>(new Array(24).fill(0));
    const [integrity, setIntegrity] = useState<IntegrityStatus[]>([]);
    const [tenantMetrics, setTenantMetrics] = useState<TenantMetric[]>([]);
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [aiLoad, setAiLoad] = useState(15);
    const logContainerRef = useRef<HTMLDivElement>(null);

    const refreshHealth = async () => {
        setLoading(true);
        try {
            const [lat, integ, tenants] = await Promise.all([
                telemetryService.measureLatency(),
                telemetryService.checkDatabaseIntegrity(),
                telemetryService.getTenantMetrics()
            ]);
            setLatency(lat);
            setIntegrity(integ);
            setTenantMetrics(tenants);
            setLatencyHistory(prev => [...prev.slice(1), lat.ms]);
            setLogs(telemetryService.getSystemLogs());
            setAiLoad(Math.floor(Math.random() * 20) + 10);
        } catch (e) {
            notify.error("Connection Interrupted");
        } finally {
            setLoading(false);
        }
    };

    const handleEnvironmentPurge = () => {
        haptics.heavy();
        if (window.confirm("🚨 RESET DE FÁBRICA: Isso limpará permanentemente todos os dados de cache... Confirmar?")) {
            localStorage.clear();
            sessionStorage.clear();
            try { indexedDB.deleteDatabase('OlieMusicCache'); } catch (e) {}
            window.location.href = '/';
        }
    };

    useEffect(() => {
        refreshHealth();
        const interval = setInterval(async () => {
            const lat = await telemetryService.measureLatency();
            setLatency(lat);
            setLatencyHistory(prev => [...prev.slice(1), lat.ms]);
            setAiLoad(l => Math.max(5, Math.min(95, l + (Math.random() * 10 - 5))));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-10 font-mono text-slate-300 space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-sky-500">
                        <Cpu size={18} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Engineering Dashboard</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                        System <span className="text-sky-500">Integrity</span> v4.3
                    </h1>
                </div>
                <div className="flex gap-4">
                    <Button onClick={refreshHealth} isLoading={loading} variant="outline" className="h-full px-8 rounded-2xl">
                        <RefreshCw size={16} />
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <TenantNeuralHeatmap metrics={tenantMetrics} />
                    
                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[40px] overflow-hidden shadow-2xl flex flex-col h-[400px]">
                        <div className="p-6 bg-slate-900/80 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <TerminalIcon size={16} className="text-emerald-400" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Maestro Kernel Logs</span>
                            </div>
                        </div>
                        <CardContent ref={logContainerRef} className="flex-1 overflow-y-auto p-8 font-mono text-[10px] leading-relaxed bg-black/20">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-4 py-1.5 hover:bg-white/5 px-2 rounded border-l-2 border-transparent hover:border-sky-500/40">
                                    <span className="text-slate-700 shrink-0">[{log.timestamp}]</span>
                                    <span className={cn("font-black w-12 shrink-0", log.level === 'ERROR' ? 'text-red-500' : 'text-sky-500')}>{log.level}</span>
                                    <span className="text-slate-400">{log.message}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-6">
                     <Card className="bg-slate-900/40 border-white/5 rounded-[40px] overflow-hidden shadow-2xl p-8">
                         <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                             <Wifi size={18} className="text-sky-400" /> Global Health
                         </h4>
                         <div className="space-y-2">
                             <p className="text-5xl font-black text-white tracking-tighter">
                                 {latency.ms}<span className="text-xl text-slate-600 ml-1">ms</span>
                             </p>
                             <p className={cn("text-[10px] font-black uppercase tracking-widest", latency.rating === 'Excellent' ? 'text-emerald-400' : 'text-amber-500')}>
                                Rating: {latency.rating}
                             </p>
                         </div>
                     </Card>
                     
                     <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8 space-y-4">
                         <div className="flex items-center gap-3">
                             <DatabaseZap className="text-purple-400" size={20} />
                             <h4 className="text-xs font-black uppercase text-white tracking-widest">Integridade SQL</h4>
                         </div>
                         <div className="space-y-2">
                             {integrity.map(item => (
                                 <div key={item.tableName} className="flex items-center justify-between text-[10px] font-bold uppercase">
                                     <span className="text-slate-500">{item.tableName}</span>
                                     <span className={cn(item.status === 'healthy' ? "text-emerald-400" : "text-red-400")}>
                                         {item.status === 'healthy' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                     </span>
                                 </div>
                             ))}
                         </div>
                     </div>

                     <Button 
                        variant="danger" 
                        onClick={handleEnvironmentPurge} 
                        className="w-full py-6 rounded-[32px] text-[10px] font-black uppercase tracking-widest"
                        leftIcon={Trash2}
                     >
                        Factory Reset Kernel
                     </Button>
                </div>
            </div>
        </div>
    );
}
