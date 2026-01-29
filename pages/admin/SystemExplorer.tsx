import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Database, Activity, ShieldCheck, AlertCircle, 
    CheckCircle2, XCircle, RefreshCw, Cpu, Network,
    Layout, Terminal, Box, Search, Zap, ShieldAlert
} from 'lucide-react';
import { diagnosticService, TableHealth } from '../../services/diagnosticService.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { supabase } from '../../lib/supabaseClient.ts';
import { cn } from '../../lib/utils.ts';
import { haptics } from '../../lib/haptics.ts';
import { notify } from '../../lib/notification.ts';

const M = motion as any;

export default function SystemExplorer() {
    const [schema, setSchema] = useState<TableHealth[]>([]);
    const [loading, setLoading] = useState(true);
    const [tracing, setTracing] = useState(false);
    const [selectedTable, setSelectedTable] = useState<TableHealth | null>(null);

    const runAudit = async () => {
        setLoading(true);
        haptics.medium();
        const report = await diagnosticService.getSchemaHealth();
        setSchema(report);
        setLoading(false);
    };

    const runDeepTrace = async () => {
        setTracing(true);
        haptics.heavy();
        notify.info("Iniciando Deep Trace: Validando RLS Layer...");
        
        try {
            // Tenta uma operação de escrita em uma tabela de admin (store_items)
            // Se falhar com 42501, o RLS está bloqueando (comportamento correto para não-admins)
            // Para o usuário adm@adm.com, deve passar.
            const testId = '00000000-0000-0000-0000-000000000000';
            const { error } = await supabase.from('store_items').upsert({
                id: testId,
                name: 'CORE_HEALTH_PROBE',
                price_coins: 0,
                is_active: false
            });

            if (error && error.code === '42501') {
                notify.error("Deep Trace Falhou: Permissão RLS negada na Camada de Escrita.");
            } else if (!error) {
                notify.success("Deep Trace OK: Acesso Root Confirmado.");
                // Cleanup
                await supabase.from('store_items').delete().eq('id', testId);
            } else {
                notify.warning(`Deep Trace Inconclusivo: ${error.message}`);
            }
        } catch (e) {
            notify.error("Erro crítico durante execução do Trace.");
        } finally {
            setTracing(false);
        }
    };

    useEffect(() => { runAudit(); }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <Network className="text-sky-500 animate-pulse" /> System <span className="text-sky-500">War Room</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Mapa Neural de Integridade Kernel v4.0</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={runDeepTrace} isLoading={tracing} leftIcon={ShieldAlert} className="rounded-2xl border-red-500/20 text-red-500 hover:bg-red-500/5">
                        Deep Trace (RLS)
                    </Button>
                    <Button onClick={runAudit} isLoading={loading} leftIcon={RefreshCw} className="rounded-2xl px-8">
                        Recarregar Auditoria
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual Map of Nodes */}
                <Card className="lg:col-span-8 bg-[#020617] border-white/5 rounded-[48px] p-10 relative overflow-hidden shadow-inner min-h-[600px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03),transparent)]" />
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 relative z-10">
                        {schema.map((table, idx) => (
                            <M.button
                                key={table.tableName}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                onClick={() => { setSelectedTable(table); haptics.light(); }}
                                className={cn(
                                    "p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 text-center group",
                                    table.exists ? "bg-slate-900/60 border-white/5" : "bg-red-500/10 border-red-500/40 animate-pulse",
                                    selectedTable?.tableName === table.tableName && "border-sky-500 bg-slate-800"
                                )}
                            >
                                <div className={cn(
                                    "p-3 rounded-2xl shadow-inner",
                                    table.exists ? "bg-slate-950 text-sky-400" : "bg-slate-950 text-red-500"
                                )}>
                                    <Database size={24} />
                                </div>
                                <div>
                                    <span className="text-[11px] font-black text-white uppercase tracking-widest block">{table.tableName}</span>
                                    <span className="text-[9px] font-bold text-slate-600 uppercase mt-1">{table.rowCount} registros</span>
                                </div>
                            </M.button>
                        ))}
                    </div>
                </Card>

                {/* Data Dictionary / Inspector */}
                <aside className="lg:col-span-4 space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedTable ? (
                            <M.div 
                                key={selectedTable.tableName}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <Card className="bg-slate-900 border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                                    <CardHeader className="bg-slate-950/50 p-6 border-b border-white/5">
                                        <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
                                            <Search size={16} className="text-sky-500" /> Inspetor: {selectedTable.tableName}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Colunas Obrigatórias</p>
                                            {selectedTable.columns.map(col => (
                                                <div key={col.column} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-white/5">
                                                    <code className="text-xs font-mono text-slate-400">{col.column}</code>
                                                    {col.exists ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-red-500" />}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </M.div>
                        ) : (
                            <Card className="bg-slate-900/40 border-white/5 rounded-[40px] p-10 text-center opacity-40 h-full flex flex-col justify-center items-center">
                                <Terminal size={48} className="mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Selecione um nodo para inspecionar o contrato de dados</p>
                            </Card>
                        )}
                    </AnimatePresence>
                </aside>
            </div>
        </div>
    );
}