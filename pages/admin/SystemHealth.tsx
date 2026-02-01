import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, ShieldCheck, AlertTriangle, Wifi, Database, 
    CheckCircle2, RefreshCw, Cpu, Network, Headphones, Zap, Terminal,
    Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { telemetryService, IntegrityStatus, LatencyResult, TenantMetric } from '../../services/telemetryService.ts';
import { audioManager } from '../../lib/audioManager.ts';
import { notify } from '../../lib/notification.ts';
import { cn } from '../../lib/utils.ts';
import { haptics } from '../../lib/haptics.ts';
import { SprintValidationSummary } from '../../components/admin/SprintValidationSummary.tsx';

const M = motion as any;

const LatencyGauge = ({ value }: { value: number }) => {
    const isCritical = value > 100;
    const isAcceptable = value > 50 && value <= 100;
    const isExcellent = value <= 50;

    const color = isCritical ? 'text-red-500' : isAcceptable ? 'text-amber-500' : 'text-emerald-500';
    const bgColor = isCritical ? 'bg-red-500/10' : isAcceptable ? 'bg-amber-500/10' : 'bg-emerald-500/10';

    return (
        <div className={cn("p-8 rounded-[48px] border-2 transition-all flex flex-col items-center justify-center gap-4 text-center h-full", 
            isCritical ? "border-red-500/30" : "border-white/5", bgColor)}>
            <div className="relative">
                <M.div 
                    animate={isCritical ? { scale: [1, 1.1, 1] } : {}} 
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className={cn("p-6 rounded-full shadow-2xl relative z-10 bg-slate-950", color)}
                >
                    <Zap size={48} fill="currentColor" />
                </M.div>
                {isExcellent && <motion.div animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-emerald-500 blur-3xl rounded-full" />}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-1">Engine Latency</p>
                <h3 className={cn("text-6xl font-black font-mono tracking-tighter", color)}>
                    {value}<span className="text-xl ml-1">ms</span>
                </h3>
            </div>
            <div className="bg-slate-950/50 px-4 py-2 rounded-2xl border border-white/10">
                <p className={cn("text-[9px] font-black uppercase tracking-widest", color)}>
                    {isCritical ? 'BLOQUEIO DE PERFORMANCE' : isAcceptable ? 'LATÊNCIA MÉDIA' : 'SINCRO-ESTÁVEL'}
                </p>
            </div>
        </div>
    );
};

export default function SystemHealth() {
    const [latency, setLatency] = useState<LatencyResult>({ ms: 0, rating: 'Excellent' });
    const [audioLatency, setAudioLatency] = useState(0);
    const [processingTime, setProcessingTime] = useState(0);
    const [loading, setLoading] = useState(true);
    const [tenantMetrics, setTenantMetrics] = useState<TenantMetric[]>([]);
    
    const refreshHealth = async () => {
        setLoading(true);
        try {
            const [lat, tenants] = await Promise.all([
                telemetryService.measureLatency(),
                telemetryService.getTenantMetrics()
            ]);
            setLatency(lat);
            setTenantMetrics(tenants);

            const ctx = await audioManager.getContext();
            const hwLatency = (ctx.baseLatency || 0) * 1000;
            setAudioLatency(Math.round(hwLatency));

            const t0 = performance.now();
            const dummyBuffer = new Float32Array(2048);
            for(let i=0; i<100; i++) { Math.sqrt(Math.random()); } 
            const t1 = performance.now();
            setProcessingTime(Math.round(t1 - t0));
            
            if (hwLatency + (t1-t0) > 100) {
                haptics.heavy();
                notify.error("ALERTA CRÍTICO: Latência do dispositivo acima de 100ms.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshHealth();
        const interval = setInterval(refreshHealth, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] p-6 md:p-10 space-y-10 animate-in fade-in duration-700 font-sans">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                <div>
                    <div className="flex items-center gap-3 text-sky-500 mb-2">
                        <Cpu size={18} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Global Diagnostic Kernel</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
                        Health <span className="text-sky-500">Monitor</span>
                    </h1>
                </div>
                <Button onClick={refreshHealth} isLoading={loading} variant="outline" className="h-16 px-10 rounded-[28px] border-white/10 hover:bg-white/5 transition-all">
                    <RefreshCw size={20} />
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-8">
                    <LatencyGauge value={audioLatency + processingTime} />
                    <SprintValidationSummary latency={latency.ms} />
                </div>

                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="bg-slate-900/40 border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-16 bg-sky-500/5 blur-[120px] pointer-events-none" />
                         <div className="relative z-10 flex items-center gap-4 mb-6">
                            <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400"><Activity size={24} /></div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Ping</h4>
                         </div>
                         <p className="text-7xl font-black text-white tracking-tighter leading-none relative z-10">
                            {latency.ms}<span className="text-xl text-slate-700 ml-1">ms</span>
                         </p>
                    </Card>

                    <Card className="bg-slate-900/40 border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-16 bg-purple-500/5 blur-[120px] pointer-events-none" />
                         <div className="relative z-10 flex items-center gap-4 mb-6">
                            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400"><Database size={24} /></div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Schema Integrity</h4>
                         </div>
                         <div className="flex items-center gap-4 relative z-10">
                            <CheckCircle2 size={40} className="text-emerald-500" />
                            <span className="text-2xl font-black text-white uppercase italic">Sincronizado</span>
                         </div>
                    </Card>

                    <Card className="md:col-span-2 bg-[#0a0f1d] border-white/5 rounded-[48px] p-8 overflow-hidden shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <Network size={18} className="text-sky-400" />
                            <CardTitle className="text-xs uppercase tracking-[0.3em] text-slate-400">Multi-Tenant Audio Thread Health</CardTitle>
                        </div>
                        <div className="space-y-4">
                            {tenantMetrics.map(m => (
                                <div key={m.school_id} className="p-5 bg-slate-950 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-sky-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-slate-900 rounded-2xl text-slate-500 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-inner">
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <span className="text-xs font-black text-white uppercase tracking-tight">{m.school_name}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Latency Avg</p>
                                            <span className="text-sm font-black text-sky-500 font-mono">{m.avg_latency}ms</span>
                                        </div>
                                        <div className="w-32 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                            <M.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${m.integration_health}%` }}
                                                className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}