import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
    Database, ShieldAlert, CheckCircle2, AlertTriangle, 
    Copy, RefreshCw, Terminal, Activity, Server, Code2 
} from 'lucide-react';
import { databaseService, TableStatus } from '../../services/databaseService';
import { GCM_DB_SCHEMA } from '../../data/schemaDefaults';
import { notify } from '../../lib/notification';
import { haptics } from '../../lib/haptics';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function DatabaseConsole() {
    const [diagnostics, setDiagnostics] = useState<TableStatus[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastScan, setLastScan] = useState<Date | null>(null);

    const runDiagnostic = async () => {
        setLoading(true);
        haptics.medium();
        try {
            const results = await databaseService.checkHealth();
            setDiagnostics(results);
            setLastScan(new Date());
            notify.success("Diagnóstico concluído com sucesso.");
        } catch (e) {
            notify.error("Erro ao comunicar com o servidor Supabase.");
        } finally {
            setLoading(false);
        }
    };

    const copySQL = () => {
        navigator.clipboard.writeText(GCM_DB_SCHEMA);
        haptics.success();
        notify.success("DDL copiado para o clipboard!");
    };

    useEffect(() => {
        runDiagnostic();
    }, []);

    const allOk = diagnostics.length > 0 && diagnostics.every(d => d.exists);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-emerald-500/10 rounded-3xl text-emerald-400 shadow-inner border border-emerald-500/20">
                        <Server size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none italic">
                            Infra <span className="text-sky-500">Diagnostic</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                            <Activity size={12} className="text-emerald-500" /> Monitoramento de Integridade SQL
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button 
                        variant="secondary" 
                        onClick={runDiagnostic} 
                        isLoading={loading}
                        leftIcon={RefreshCw}
                        className="px-8 rounded-2xl text-[10px]"
                    >
                        Re-scan
                    </Button>
                    <Button 
                        onClick={copySQL}
                        leftIcon={Copy}
                        className="px-8 rounded-2xl text-[10px]"
                    >
                        Copiar DDL
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Painel de Status das Tabelas */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <Terminal size={16} className="text-slate-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Inventory Status</h3>
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {diagnostics.map((table, idx) => (
                                <motion.div
                                    key={table.tableName}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={cn(
                                        "p-5 rounded-[32px] border transition-all flex items-center justify-between",
                                        table.exists ? "bg-slate-900 border-white/5" : "bg-red-500/10 border-red-500/30"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center",
                                            table.exists ? "bg-slate-950 text-emerald-400" : "bg-slate-950 text-red-500"
                                        )}>
                                            {table.exists ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-tight">{table.tableName}</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                                                {table.exists ? `Sincronizada • ${table.rowCount} registros` : 'Esquema Desatualizado'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 rounded-lg text-[8px] font-black uppercase border",
                                        table.exists ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                                    )}>
                                        {table.exists ? 'OK' : 'MISSING'}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <Card className="bg-amber-500/5 border-amber-500/20 rounded-[32px] p-6">
                        <div className="flex gap-4">
                            <ShieldAlert className="text-amber-500 shrink-0" size={24} />
                            <div className="space-y-2">
                                <p className="text-xs font-black text-white uppercase tracking-wider">Aviso de Segurança</p>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    O GCM Maestro não possui permissão para alterar a estrutura do banco (DDL) via cliente por motivos de segurança. Caso existam tabelas "MISSING", copie o script ao lado e execute manualmente no painel administrativo do Supabase.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Painel de Script SQL */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <Code2 size={16} className="text-slate-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Source DDL (v3.0)</h3>
                    </div>

                    <Card className="bg-slate-950 border-white/5 rounded-[40px] overflow-hidden shadow-2xl h-[600px] flex flex-col">
                        <div className="p-4 bg-slate-900/80 border-b border-white/5 flex items-center justify-between">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                            </div>
                            <span className="text-[9px] font-mono text-slate-600 uppercase font-black">maestro_schema_final.sql</span>
                        </div>
                        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar font-mono text-[11px] leading-relaxed text-sky-400/80 selection:bg-sky-500/30">
                            <pre className="whitespace-pre-wrap">{GCM_DB_SCHEMA}</pre>
                        </div>
                        <div className="p-4 bg-slate-900/50 border-t border-white/5 text-center">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">GCM Maestro Database Automation Engine</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}