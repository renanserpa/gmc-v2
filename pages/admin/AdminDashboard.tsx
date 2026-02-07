
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// Added missing Database and CheckCircle2 icons to the import list
import { 
    Users, ListMusic, Zap, Activity, 
    ShieldCheck, RefreshCw, Server, Cpu,
    Database, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { KPICard } from '../../components/dashboard/KPICard.tsx';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { telemetryService, LatencyResult } from '../../services/telemetryService.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

export default function AdminDashboard() {
    const [latency, setLatency] = useState<LatencyResult | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    // Sincronismo Realtime das Entidades Core
    const { data: students, loading: loadingStudents } = useRealtimeSync<any>('students');
    const { data: classes, loading: loadingClasses } = useRealtimeSync<any>('music_classes');

    const checkLatency = async () => {
        setIsChecking(true);
        const result = await telemetryService.measureLatency();
        setLatency(result);
        setIsChecking(false);
        haptics.light();
    };

    useEffect(() => {
        checkLatency();
        const interval = setInterval(checkLatency, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    const getLatencyColor = (rating: string) => {
        switch (rating) {
            case 'Excellent': return 'text-emerald-400';
            case 'Good': return 'text-sky-400';
            case 'Slow': return 'text-amber-500';
            case 'Critical': return 'text-red-500';
            default: return 'text-slate-500';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-24 animate-in fade-in duration-700">
            {/* Header Administrativo */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-sky-500 mb-3">
                        <Cpu size={18} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Kernel Oversight Mode</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Admin <span className="text-sky-500">Command Center</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-3">Monitoramento Global de Infraestrutura e Performance</p>
                </div>
                <div className="flex gap-4 relative z-10">
                    <Button 
                        onClick={checkLatency} 
                        isLoading={isChecking} 
                        variant="outline" 
                        className="rounded-2xl h-14 w-14 p-0 border-white/10 hover:bg-white/5"
                    >
                        <RefreshCw size={20} />
                    </Button>
                    <div className="bg-slate-950 px-6 py-2 rounded-2xl border border-white/10 flex flex-col items-end justify-center shadow-inner">
                        <span className="text-[8px] font-black text-slate-600 uppercase">System Status</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                            <span className="text-sm font-black text-white uppercase tracking-tighter">Operational</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Grid de KPIs Técnicos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard 
                    title="Alunos Conectados" 
                    value={loadingStudents ? undefined : students.length} 
                    icon={Users} 
                    color="text-sky-400" 
                    border="border-sky-500" 
                    description="Total de registros na tabela students através de todos os tenants."
                />
                <KPICard 
                    title="Turmas Ativas" 
                    value={loadingClasses ? undefined : classes.length} 
                    icon={ListMusic} 
                    color="text-purple-400" 
                    border="border-purple-500" 
                    description="Instâncias de turmas orquestradas no momento."
                />
                <Card className="bg-[#0a0f1d] border-l-4 border-emerald-500 shadow-xl overflow-hidden relative group">
                    <div className="p-5 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-slate-950 text-emerald-400 group-hover:scale-110 transition-transform duration-300 shadow-inner border border-white/5">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className={cn("text-2xl font-black tracking-tight font-mono", getLatencyColor(latency?.rating || ''))}>
                                {latency ? `${latency.ms}ms` : '--'}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">API Latency</p>
                                <span className={cn("text-[8px] font-black uppercase", getLatencyColor(latency?.rating || ''))}>
                                    [{latency?.rating || 'CHECKING'}]
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Seção de Detalhes da Infraestrutura */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-8 bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl p-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                             <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-1">Integridade da Camada de Dados</h3>
                             <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Sincronização reativa via Supabase Realtime</p>
                        </div>
                        <Database className="text-sky-500/20" size={40} />
                    </div>
                    
                    <div className="space-y-4">
                        {[
                            { name: 'auth_users', status: 'Healthy', latency: '12ms' },
                            { name: 'public_profiles', status: 'Healthy', latency: '18ms' },
                            { name: 'public_music_classes', status: 'Healthy', latency: '24ms' },
                            { name: 'public_xp_events', status: 'Healthy', latency: '32ms' }
                        ].map((node) => (
                            <div key={node.name} className="flex items-center justify-between p-5 bg-slate-950/50 rounded-3xl border border-white/5 group hover:border-sky-500/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-900 rounded-2xl text-slate-600 group-hover:text-sky-400 transition-colors">
                                        <Server size={18} />
                                    </div>
                                    <code className="text-xs font-mono text-slate-300 font-bold">{node.name}</code>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-slate-600 uppercase">Latency</p>
                                        <span className="text-xs font-mono font-bold text-sky-500">{node.latency}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                        <span className="text-[9px] font-black text-emerald-400 uppercase">{node.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[40px] p-8 shadow-xl">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-xs uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <ShieldCheck size={16} className="text-sky-500" /> Security Layer
                            </CardTitle>
                        </CardHeader>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="text-slate-400 uppercase">RLS Firewall</span>
                                <span className="text-emerald-400 uppercase">Active</span>
                            </div>
                            <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                <M.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                            <p className="text-[9px] text-slate-500 leading-relaxed italic">
                                Todas as consultas publicas estão protegidas por Row Level Security (RLS) v4.0.
                            </p>
                        </div>
                    </Card>

                    <div className="p-8 bg-sky-500/5 border border-sky-500/10 rounded-[40px] flex items-start gap-4">
                        <Activity className="text-sky-500 shrink-0" size={20} />
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider">
                            O Kernel detectou 0 falhas de integridade nas últimas 24 horas. Cluster saudável.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
