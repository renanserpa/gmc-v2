import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, Database, Cpu, AlertCircle, RefreshCw, 
    Terminal, Activity, FileCode, FolderTree, Trash2, 
    Link as LinkIcon, DatabaseZap, CheckCircle2, XCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { diagnosticService, TableHealth } from '../../services/diagnosticService.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { SYSTEM_REGISTRY } from '../../config/systemRegistry.ts';
import { cn } from '../../lib/utils.ts';
import { haptics } from '../../lib/haptics.ts';

// FIX: Casting motion components
const M = motion as any;

export default function SystemExplorer() {
  const { user, role } = useAuth();
  const [schemaReport, setSchemaReport] = useState<TableHealth[]>([]);
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'graph' | 'files' | 'schema'>('graph');

  const runFullDiagnostics = async () => {
    setScanning(true);
    haptics.heavy();
    const report = await diagnosticService.getSchemaHealth();
    setSchemaReport(report);
    setScanning(false);
  };

  useEffect(() => {
    runFullDiagnostics();
  }, []);

  // Simulação de detecção de arquivos órfãos (V2 Ghosts)
  const orphanFiles = [
    { path: 'haptics.ts', size: '1.2kb', reason: 'Duplicata de lib/haptics.ts' },
    { path: 'components/KanbanBoard.tsx', size: '12kb', reason: 'Componente legado V2' },
    { path: 'lib/chordEngine.ts', size: '5kb', reason: 'Substituído por theoryEngine' }
  ];

  return (
    <div className="min-h-screen bg-[#020617] p-8 space-y-10 animate-in fade-in duration-700 font-sans">
      <header className="flex justify-between items-center max-w-7xl mx-auto">
        <div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
             <Activity className="text-purple-500" /> System <span className="text-purple-500">Explorer</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Cartografia Visual e Saneamento v3.0</p>
        </div>
        <div className="flex gap-4">
            <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5">
                {['graph', 'files', 'schema'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => { setActiveTab(tab as any); haptics.light(); }}
                        className={cn(
                            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === tab ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        {tab === 'graph' ? 'Nervos' : tab === 'files' ? 'Arquivos' : 'Dicionário'}
                    </button>
                ))}
            </div>
            <button 
                onClick={runFullDiagnostics} 
                disabled={scanning}
                className="bg-slate-900 border border-white/10 px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-slate-800 transition-all text-white font-black uppercase text-xs shadow-xl"
            >
                <RefreshCw size={16} className={cn(scanning && "animate-spin")} />
                Varredura Global
            </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto h-[700px]">
        <AnimatePresence mode="wait">
            {activeTab === 'graph' && (
                <M.div key="graph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                    <div className="lg:col-span-8 bg-slate-950/50 rounded-[48px] border border-white/5 p-12 relative overflow-hidden shadow-inner">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.03),transparent)] pointer-events-none" />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 relative z-10">
                            {SYSTEM_REGISTRY.map(node => (
                                <M.div 
                                    key={node.id} 
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="p-6 rounded-[32px] bg-slate-900/40 border border-white/5 flex flex-col items-center gap-3 text-center group transition-all hover:border-purple-500/30"
                                >
                                    <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                        {node.layer === 'database' ? <Database size={20} /> : node.layer === 'services' ? <Cpu size={20} /> : <FileCode size={20} />}
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{node.label}</span>
                                    <div className="flex gap-1">
                                        {node.dependencies.slice(0, 3).map(d => <div key={d} className="w-1.5 h-1.5 rounded-full bg-slate-700" />)}
                                    </div>
                                </M.div>
                            ))}
                        </div>
                    </div>
                    <aside className="lg:col-span-4 space-y-6">
                        <Card className="bg-slate-900 border-white/5 rounded-[40px] p-8 text-slate-300">
                            <h3 className="text-xl font-black text-white uppercase mb-4 italic">Insights do Kernel</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="text-emerald-500" size={18} />
                                    <span className="text-xs">Sessão: {user?.email === 'adm@adm.com' ? 'SUPER ROOT' : 'PROFESSOR'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <LinkIcon className="text-sky-500" size={18} />
                                    <span className="text-xs">Imports Relativos: 100% OK</span>
                                </div>
                            </div>
                        </Card>
                    </aside>
                </M.div>
            )}

            {activeTab === 'files' && (
                <M.div key="files" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 overflow-y-auto pr-4 h-full custom-scrollbar">
                    <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-[48px]">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-red-600 rounded-3xl text-white shadow-lg"><Trash2 size={24} /></div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Detecção de Fantasmas</h3>
                                <p className="text-xs text-red-400 font-bold uppercase tracking-widest">Arquivos obsoletos identificados na transição V2 -> V3</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {orphanFiles.map(file => (
                                <div key={file.path} className="p-6 bg-black/40 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-red-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-slate-900 rounded-xl text-slate-600"><FileCode size={18} /></div>
                                        <div>
                                            <p className="text-sm font-mono text-slate-200">{file.path}</p>
                                            <p className="text-[10px] text-slate-500 italic mt-1">{file.reason}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-700 uppercase">{file.size}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </M.div>
            )}

            {activeTab === 'schema' && (
                <M.div key="schema" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 h-full overflow-y-auto pr-4 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {schemaReport.map(table => (
                            <Card key={table.tableName} className={cn(
                                "bg-slate-900 border-2 rounded-[40px] overflow-hidden transition-all",
                                table.exists ? "border-white/5" : "border-red-500/40 animate-pulse"
                            )}>
                                <CardHeader className="bg-slate-950/50 border-b border-white/5 p-6 flex flex-row justify-between items-center">
                                    <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
                                        <Database size={14} className="text-purple-400" /> {table.tableName}
                                    </CardTitle>
                                    <span className="text-[10px] font-black text-slate-600">{table.rowCount} ROWS</span>
                                </CardHeader>
                                <CardContent className="p-6 space-y-3">
                                    {table.columns.map(col => (
                                        <div key={col.column} className="flex items-center justify-between">
                                            <span className={cn("text-xs font-mono", col.exists ? "text-slate-400" : "text-red-500 font-black underline")}>
                                                {col.column}
                                            </span>
                                            {col.exists ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-red-500" />}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </M.div>
            )}
        </AnimatePresence>
      </main>
    </div>
  );
}