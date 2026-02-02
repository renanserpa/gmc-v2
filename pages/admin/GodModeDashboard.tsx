
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { KPICard } from '../../components/dashboard/KPICard.tsx';
import { 
    Activity, HardDrive, Cpu, Terminal, 
    Wifi, Database, ShieldAlert, Zap,
    History, RefreshCw, Code2, Server, Bug
} from 'lucide-react';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { telemetryService } from '../../services/telemetryService.ts';
import { motion } from 'framer-motion';

const M = motion as any;

export default function GodModeDashboard() {
    const [latency, setLatency] = useState(0);
    const { data: logs } = useRealtimeSync<any>('audit_logs', undefined, { column: 'created_at', ascending: false });
    
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
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Low Level Infrastructure Access</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Sovereign Authority Enabled</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard title="API Response" value={`${latency}ms`} icon={Wifi} color="text-red-400" border="border-red-500" />
                <KPICard title="DB Connections" value="Active (RLS Bypass)" icon={Database} color="text-red-400" border="border-red-500" />
                <KPICard title="Storage Node" value="Healthy" icon={HardDrive} color="text-red-400" border="border-red-500" />
                <KPICard title="Node.js Engine" value="v20.x stable" icon={Server} color="text-red-400" border="border-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Kernel Logs */}
                <Card className="lg:col-span-8 bg-black border-red-900/20 rounded-[48px] overflow-hidden shadow-2xl flex flex-col h-[600px]">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-red-950/10">
                        <h4 className="text-xs font-black text-red-500 uppercase tracking-[0.3em] flex items-center gap-3 font-mono">
                            <Bug size={18} /> Root Audit Stream (Raw)
                        </h4>
                        <RefreshCw size={14} className="text-red-900 animate-spin-slow" />
                    </div>
                    <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-[#050000]">
                        <div className="divide-y divide-white/5 font-mono">
                            {logs.slice(0, 30).map((log: any) => (
                                <div key={log.id} className="p-4 hover:bg-red-500/[0.03] transition-colors flex items-center gap-6">
                                    <div className="text-[9px] text-red-900/60">{new Date(log.created_at).toLocaleTimeString()}</div>
                                    <div className="px-2 py-0.5 bg-red-950/40 border border-red-900/20 rounded text-[8px] font-black uppercase text-red-500">{log.action}</div>
                                    <div className="text-[10px] text-slate-500 flex-1 truncate">
                                        <span className="text-red-400">{log.table_name}</span> » {JSON.stringify(log.new_data)}
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
                            <Cpu size={14} /> Resource Profiler
                        </h4>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span className="text-slate-500">Heap Usage</span>
                                    <span className="text-white">64 MB / 128 MB</span>
                                </div>
                                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                    <M.div initial={{ width: 0 }} animate={{ width: '50%' }} className="h-full bg-red-500 shadow-[0_0_10px_red]" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-red-600/5 border border-red-600/20 p-8 rounded-[40px] shadow-xl">
                        <div className="flex items-start gap-4">
                            <ShieldAlert className="text-red-600 shrink-0" />
                            <div>
                                <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Oracle Diagnostic</h5>
                                <p className="text-[11px] text-red-400/60 mt-2 leading-relaxed font-mono">
                                    INTEGRITY_CHECK: PASS <br />
                                    RLS_BYPASS: ENABLED <br />
                                    JWT_STATE: VALID
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
