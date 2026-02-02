
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Code2, Terminal, Play, Trash2, Database, 
    Search, Table as TableIcon, Copy, Loader2,
    Zap, AlertTriangle
} from 'lucide-react';
import { databaseService } from '../../services/databaseService.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';

const TABLES = [
    'profiles', 'schools', 'students', 'music_classes', 
    'enrollments', 'missions', 'xp_events', 'audit_logs'
];

export default function SQLLab() {
    const [selectedTable, setSelectedTable] = useState('profiles');
    const [result, setResult] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [limit, setLimit] = useState(20);

    const executeSelect = async () => {
        setLoading(true);
        haptics.heavy();
        try {
            const data = await databaseService.runQuery(selectedTable, { limit });
            setResult(data);
            notify.success(`Query OK: ${data.length} registros retornados.`);
        } catch (e: any) {
            notify.error("SQL Error: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/40 p-8 rounded-[48px] border border-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-emerald-600 rounded-3xl text-white shadow-xl shadow-emerald-900/30">
                        <Code2 size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">SQL <span className="text-emerald-500">Lab</span></h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Data Exploration & Emergency Patching</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-slate-950 p-2 rounded-2xl border border-white/10 flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-600 uppercase px-2">Limit</span>
                        <input 
                            type="number" value={limit} onChange={e => setLimit(Number(e.target.value))}
                            className="w-16 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                        />
                    </div>
                    <Button onClick={executeSelect} isLoading={loading} className="px-10 h-14 rounded-2xl bg-emerald-600" leftIcon={Play}>Run SELECT *</Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <aside className="lg:col-span-3 space-y-4">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Tables Catalog</h3>
                    <div className="flex flex-col gap-2">
                        {TABLES.map(t => (
                            <button
                                key={t}
                                onClick={() => { setSelectedTable(t); haptics.light(); }}
                                className={cn(
                                    "p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-3 group",
                                    selectedTable === t 
                                        ? "bg-emerald-600/10 border-emerald-500 text-white shadow-lg" 
                                        : "bg-slate-950 border-transparent text-slate-600 hover:text-slate-300"
                                )}
                            >
                                <TableIcon size={16} className={selectedTable === t ? "text-emerald-400" : "text-slate-700"} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{t}</span>
                            </button>
                        ))}
                    </div>
                </aside>

                <main className="lg:col-span-9">
                    <Card className="bg-black border-white/5 rounded-[48px] overflow-hidden shadow-2xl h-[700px] flex flex-col font-mono">
                        <div className="bg-slate-950 p-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Terminal size={18} className="text-emerald-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase">Query Result Console</span>
                            </div>
                            <button onClick={() => setResult(null)} className="text-slate-700 hover:text-white transition-colors"><Trash2 size={16} /></button>
                        </div>
                        <div className="flex-1 overflow-auto custom-scrollbar p-8">
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-4 text-emerald-900">
                                        <Loader2 className="animate-spin" size={48} />
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Stream...</p>
                                    </div>
                                ) : result ? (
                                    <div className="space-y-4">
                                        <pre className="text-emerald-400/80 text-[11px] leading-relaxed whitespace-pre-wrap">
                                            {JSON.stringify(result, null, 2)}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 gap-4 text-slate-500">
                                        <Database size={64} />
                                        <p className="text-xs font-black uppercase tracking-widest">Execute uma query para ver os dados brutos</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Card>
                </main>
            </div>
        </div>
    );
}
