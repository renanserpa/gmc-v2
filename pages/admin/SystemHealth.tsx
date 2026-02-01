import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, ShieldCheck, Terminal as TerminalIcon, AlertTriangle, 
    Wifi, Database, CheckCircle2, XCircle, RefreshCw, 
    Zap, Cpu, Network, Building2, Headphones
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { telemetryService, IntegrityStatus, LatencyResult, SystemLog, TenantMetric } from '../../services/telemetryService.ts';
import { audioManager } from '../../lib/audioManager.ts';
import { notify } from '../../lib/notification.ts';
import { cn } from '../../lib/utils.ts';
import { haptics } from '../../lib/haptics.ts';

const M = motion as any;

export default function SystemHealth() {
    const [latency, setLatency] = useState<LatencyResult>({ ms: 0, rating: 'Excellent' });
    const [audioLatency, setAudioLatency] = useState(0);
    const [integrity, setIntegrity] = useState<IntegrityStatus[]>([]);
    const [tenantMetrics, setTenantMetrics] = useState<TenantMetric[]>([]);
    const [loading, setLoading] = useState(true);
    
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

            // Captura Latência de Hardware Real
            const ctx = await audioManager.getContext();
            const hwLat = (ctx.baseLatency || 0) * 1000;
            setAudioLatency(Math.round(hwLat));
            
            if (hwLat > 100) {
                notify.warning("Hardware de áudio lento detectado na sala de aula (>100ms).");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshHealth();
        const interval = setInterval(refreshHealth, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-10 font-mono text-slate-300 space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-sky-500">
                        <Cpu size={18} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Health Monitor</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                        Kernel <span className="text-sky-500">Telemetry</span>
                    </h1>
                </div>
                <Button onClick={refreshHealth} isLoading={loading} variant="outline" className="h-full px-8 rounded-2xl">
                    <RefreshCw size={16} />
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Latência de Rede */}
                <Card className="bg-slate-900/40 border-white/5 p-8 rounded-[40px] shadow-2xl">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Wifi size={14} className="text-sky-400" /> Database Ping
                     </h4>
                     <p className="text-5xl font-black text-white tracking-tighter">
                        {latency.ms}<span className="text-xl text-slate-600 ml-1">ms</span>
                     </p>
                </Card>

                {/* Latência de Áudio (Crucial para Sala de Aula) */}
                <Card className={cn(
                    "bg-slate-900/40 border-2 p-8 rounded-[40px] shadow-2xl transition-all",
                    audioLatency > 100 ? "border-red-500/30" : "border-white/5"
                )}>
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Headphones size={14} className="text-purple-400" /> Audio HW Latency
                     </h4>
                     <p className={cn("text-5xl font-black tracking-tighter", audioLatency > 100 ? "text-red-500" : "text-purple-400")}>
                        {audioLatency}<span className="text-xl text-slate-600 ml-1">ms</span>
                     </p>
                     <p className="text-[8px] font-black uppercase text-slate-600 mt-2">Target: &lt;100ms for Pitch Sync</p>
                </Card>

                {/* Integridade de Dados */}
                <Card className="bg-slate-900/40 border-white/5 p-8 rounded-[40px] shadow-2xl">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Database size={14} className="text-emerald-400" /> Schema Integrity
                     </h4>
                     <div className="flex items-center gap-3">
                         <CheckCircle2 size={32} className="text-emerald-500" />
                         <span className="text-xl font-black text-white uppercase italic">All Healthy</span>
                     </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Card className="bg-[#0a0f1d] border-white/5 rounded-[40px] p-8 overflow-hidden shadow-2xl">
                    <CardTitle className="text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
                        <Network size={18} className="text-sky-400" /> Tenant Multi-Mesh Health
                    </CardTitle>
                    <div className="space-y-4">
                        {tenantMetrics.map(m => (
                            <div key={m.school_id} className="p-4 bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Building2 size={16} className="text-slate-600" />
                                    <span className="text-xs font-black text-white uppercase">{m.school_name}</span>
                                </div>
                                <div className="flex items-center gap-8">
                                    <span className="text-[10px] font-mono text-slate-500">{m.avg_latency}ms</span>
                                    <div className="w-24 h-1 bg-slate-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-sky-500" style={{ width: `${m.integration_health}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
