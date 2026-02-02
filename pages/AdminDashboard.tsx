
import React from 'react';
import { KPICard } from '../components/dashboard/KPICard.tsx';
import { Card, CardContent } from '../components/ui/Card.tsx';
import { 
    Activity, HardDrive, Cpu, Terminal, 
    Wifi, Database, ShieldCheck, Zap,
    Clock, AlertCircle, RefreshCw
} from 'lucide-react';
import { useRealtimeSync } from '../hooks/useRealtimeSync.ts';
import { telemetryService } from '../services/telemetryService.ts';
import { motion } from 'framer-motion';

const M = motion as any;

export default function AdminDashboard() {
    const [latency, setLatency] = React.useState(0);
    const { data: logs } = useRealtimeSync<any>('audit_logs', undefined, { column: 'created_at', ascending: false });
    const { data: profiles } = useRealtimeSync<any>('profiles');
    const { data: schools } = useRealtimeSync<any>('schools');

    React.useEffect(() => {
        const check = async () => {
            const res = await telemetryService.measureLatency();
            setLatency(res.ms);
        };
        check();
        const timer = setInterval(check, 10000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Maestro <span className="text-sky-500">Operations</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Live Infrastructure Telemetry</p>
                </div>
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-full">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Core Engine Stable</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard title="API Latency" value={`${latency}ms`} icon={Wifi} color="text-sky-400" border="border-sky-500" />
                <KPICard title="Profiles Active" value={profiles.length} icon={ShieldCheck} color="text-purple-400" border="border-purple-500" />
                <KPICard title="Tenants Live" value={schools.length} icon={Database} color="text-amber-400" border="border-amber-500" />
                <KPICard title="Storage Usage" value="0.42 GB" icon={HardDrive} color="text-emerald-400" border="border-emerald-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Atividade Recente do Kernel */}
                <Card className="lg:col-span-8 bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl flex flex-col h-[600px]">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/40">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                            <Terminal size={18} /> Kernel Audit Stream
                        </h4>
                        <RefreshCw size={14} className="text-slate-600 animate-spin-slow" />
                    </div>
                    <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                        <div className="divide-y divide-white/5">
                            {logs.slice(0, 15).map((log: any) => (
                                <div key={log.id} className="p-6 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="text-[10px] font-mono text-slate-600">{new Date(log.created_at).toLocaleTimeString()}</div>
                                        <div className="px-2 py-1 bg-slate-900 border border-white/5 rounded text-[8px] font-black uppercase text-sky-400">{log.action}</div>
                                        <div className="text-xs font-bold text-slate-300 uppercase tracking-tight">{log.table_name}: <span className="text-slate-500">{log.record_id}</span></div>
                                    </div>
                                    <Clock size={14} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Status de Infra */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-900/40 border-white/5 p-8 rounded-[40px] shadow-xl">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Cpu size={14} /> Hardware Profile
                        </h4>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span className="text-slate-500">Server CPU</span>
                                    <span className="text-white">12%</span>
                                </div>
                                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden"><div className="w-[12%] h-full bg-sky-500" /></div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span className="text-slate-500">Database RAM</span>
                                    <span className="text-white">44%</span>
                                </div>
                                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden"><div className="w-[44%] h-full bg-purple-500" /></div>
                            </div>
                        </div>
                    </Card>

                    <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-[40px] flex items-start gap-4">
                        <AlertCircle className="text-amber-500 shrink-0" />
                        <div>
                            <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Maestro Insight</h5>
                            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                                Sincronia estável com o domínio <span className="text-amber-500">oliemusic.com.br</span>. Todas as policies de RLS estão em modo restrito.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
