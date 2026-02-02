
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { KPICard } from '../../components/dashboard/KPICard.tsx';
import { 
    Activity, HardDrive, Cpu, Terminal, 
    Wifi, Database, ShieldAlert, Zap,
    History, RefreshCw, Code2, Server, Bug, 
    ShieldCheck, Fingerprint, Lock
} from 'lucide-react';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { telemetryService } from '../../services/telemetryService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../../lib/date.ts';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

export default function GodModeDashboard() {
    const [latency, setLatency] = useState(0);
    
    // ENGINE REALTIME: Monitorando mudanças globais
    const { data: logs, loading: loadingLogs } = useRealtimeSync<any>('audit_logs', undefined, { column: 'created_at', ascending: false });
    const { data: profiles } = useRealtimeSync<any>('profiles');
    const { data: schools } = useRealtimeSync<any>('schools');
    const { data: enrollments } = useRealtimeSync<any>('enrollments');

    useEffect(() => {
        const check = async () => {
            const res = await telemetryService.measureLatency();
            setLatency(res.ms);
        };
        check();
        const timer = setInterval(check, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-red-600 rounded-[28px] flex items-center justify-center text-white shadow-[0_0_40px_rgba(220,38,38,0.3)]">
                        <Terminal size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                            Kernel <span className="text-red-500">God Mode</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Infrastructure Authority & Telemetry</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-full">
                    <ShieldCheck className="text-red-500" size={16} />
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Bypass Layer Active</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard title="API Latency" value={`${latency}ms`} icon={Wifi} color="text-red-400" border="border-red-500" />
                <KPICard title="Total Profiles" value={profiles?.length || 0} icon={Fingerprint} color="text-red-400" border="border-red-500" />
                <KPICard title="Active Units" value={schools?.length || 0} icon={Database} color="text-red-400" border="border-red-500" />
                <KPICard title="Enrollments" value={enrollments?.length || 0} icon={Lock} color="text-red-400" border="border-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Kernel Logs */}
                <Card className="lg:col-span-8 bg-black border-red-900/20 rounded-[48px] overflow-hidden shadow-2xl flex flex-col h-[600px]">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-red-950/10">
                        <h4 className="text-xs font-black text-red-500 uppercase tracking-[0.3em] flex items-center gap-3 font-mono">
                            <Bug size={18} /> Root Audit Stream (Raw CDC)
                        </h4>
                        <RefreshCw size={14} className="text-red-900 animate-spin-slow" />
                    </div>
                    <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-[#050000]">
                        <div className="divide-y divide-white/5 font-mono">
                            {loadingLogs ? (
                                <div className="p-20 text-center animate-pulse text-red-900">Sincronizando Auditoria...</div>
                            ) : logs.map((log: any) => (
                                <div key={log.id} className="p-4 hover:bg-red-500/[0.03] transition-colors flex items-start gap-6 border-l-2 border-transparent hover:border-red-600">
                                    <div className="text-[9px] text-red-900/60 mt-1">{formatDate(log.created_at, 'HH:mm:ss')}</div>
                                    <div className={cn(
                                        "px-2 py-0.5 border rounded text-[8px] font-black uppercase shrink-0 mt-0.5",
                                        log.action === 'INSERT' ? "bg-emerald-950 text-emerald-500 border-emerald-900" :
                                        log.action === 'UPDATE' ? "bg-sky-950 text-sky-500 border-sky-900" :
                                        "bg-red-950 text-red-500 border-red-900"
                                    )}>
                                        {log.action}
                                    </div>
                                    <div className="text-[10px] flex-1">
                                        <span className="text-red-400 font-bold uppercase">{log.table_name}</span>
                                        <span className="text-slate-600 mx-2">»</span>
                                        <span className="text-slate-400 break-all">{JSON.stringify(log.new_data || log.old_data).slice(0, 150)}...</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* System Specs */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-900/60 border-white/5 p-8 rounded-[40px] shadow-xl">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Cpu size={14} /> Resource Diagnostic
                        </h4>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span className="text-slate-500">Supabase Engine</span>
                                    <span className="text-emerald-500">Connected</span>
                                </div>
                                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                    <M.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span className="text-slate-500">Memory Pressure</span>
                                    <span className="text-white">Normal</span>
                                </div>
                                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                    <M.div initial={{ width: 0 }} animate={{ width: '24%' }} className="h-full bg-sky-500" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-red-600/5 border border-red-600/20 p-8 rounded-[40px] shadow-xl">
                        <div className="flex items-start gap-4">
                            <ShieldAlert className="text-red-600 shrink-0" size={20} />
                            <div>
                                <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Sovereign Warnings</h5>
                                <p className="text-[11px] text-red-400/60 mt-3 leading-relaxed font-medium">
                                    Você está operando diretamente sobre o esquema público. Evite deleções em massa sem backup local.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
