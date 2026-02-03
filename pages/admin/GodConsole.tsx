
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Cpu, Database, ShieldCheck, Zap, 
    RefreshCw, Globe, Server, Activity,
    Code2, Terminal, AlertCircle, CheckCircle2
} from 'lucide-react';
import { databaseService, TableStatus } from '../../services/databaseService.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { cn } from '../../lib/utils.ts';
import { haptics } from '../../lib/haptics.ts';
import { KPICard } from '../../components/dashboard/KPICard.tsx';

const M = motion as any;

export default function GodConsole() {
    const [tables, setTables] = useState<TableStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [apiHealth, setApiHealth] = useState({
        supabase: 'checking',
        gemini: 'stable',
        edge: 'active'
    });

    const runDiagnostic = async () => {
        setLoading(true);
        haptics.heavy();
        try {
            const results = await databaseService.checkHealth();
            setTables(results);
            setApiHealth(prev => ({ ...prev, supabase: 'stable' }));
        } catch (e) {
            setApiHealth(prev => ({ ...prev, supabase: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        runDiagnostic();
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                <div>
                    <div className="flex items-center gap-2 text-cyan-500 mb-2">
                        <Terminal size={14} />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em]">Infrastructure Oversight</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                        God <span className="text-cyan-500">Dashboard</span>
                    </h1>
                </div>
                <Button onClick={runDiagnostic} isLoading={loading} className="h-14 px-8 rounded-2xl bg-cyan-600 hover:bg-cyan-500" leftIcon={RefreshCw}>
                    Recarregar Kernel
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard title="Cluster Health" value="OPTIMAL" icon={Activity} color="text-cyan-400" border="border-cyan-500" />
                <KPICard title="DB Connections" value={tables.length} icon={Database} color="text-emerald-400" border="border-emerald-500" />
                <KPICard title="Gemini Latency" value="124ms" icon={Zap} color="text-amber-400" border="border-amber-500" />
                <KPICard title="Security Layer" value="V7.6-RLS" icon={ShieldCheck} color="text-blue-400" border="border-blue-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Table Inventory */}
                <Card className="lg:col-span-8 bg-black/40 border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                    <CardHeader className="p-8 border-b border-white/5 bg-slate-950/50">
                        <CardTitle className="text-xs uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3">
                            <Database size={16} className="text-cyan-400" /> Kernel Table Inventory
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/20 text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-8 py-5">Tabela</th>
                                    <th className="px-8 py-5">Registros</th>
                                    <th className="px-8 py-5">Status Integridade</th>
                                    <th className="px-8 py-5 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {tables.map(table => (
                                    <tr key={table.tableName} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-8 py-5 font-mono text-[10px] text-cyan-400">{table.tableName}</td>
                                        <td className="px-8 py-5 text-[10px] font-bold text-white font-mono">{table.rowCount}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-1.5 h-1.5 rounded-full", table.exists ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500")} />
                                                <span className={cn("text-[9px] font-black uppercase", table.exists ? "text-emerald-500" : "text-red-500")}>
                                                    {table.exists ? 'SYNC' : 'MISSING'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="text-[9px] font-black text-slate-700 hover:text-white uppercase transition-colors">Query</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* API Health */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-900/60 border-white/5 rounded-[40px] p-8 shadow-xl">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Globe size={14} className="text-cyan-400" /> API External Pulse
                        </h4>
                        <div className="space-y-4">
                            {Object.entries(apiHealth).map(([api, status]) => (
                                <div key={api} className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5">
                                    <span className="text-[10px] font-black text-white uppercase">{api} API</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">{status}</span>
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="bg-cyan-950/20 border border-cyan-500/20 rounded-[40px] p-8 shadow-xl">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="text-cyan-500 shrink-0" size={20} />
                            <div>
                                <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Oracle Session</h5>
                                <p className="text-[10px] text-slate-500 mt-3 leading-relaxed font-medium">
                                    Você está logado com autoridade absoluta. Mudanças no schema via SQL Lab serão propagadas instantaneamente para todos os Tenants.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
