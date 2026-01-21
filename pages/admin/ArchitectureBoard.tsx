import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Play, Power, Trash2, ShieldCheck, 
    AlertCircle, Bug, Ghost, RefreshCw, Layers,
    Activity, Settings
} from 'lucide-react';
import { orchestratorService } from '../../services/orchestratorService';
import { FeatureItem, FeatureStatus } from '../../data/featureRegistry';
import { notify } from '../../lib/notification';
import { haptics } from '../../lib/haptics';
import { cn } from '../../lib/utils';
import { Card } from '../../components/ui/Card';

const COLUMNS = [
    { id: 'operational', label: 'Operational', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
    { id: 'testing', label: 'Beta / Testing', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/5' },
    { id: 'broken', label: 'Critical Issues', icon: Bug, color: 'text-red-500', bg: 'bg-red-500/5' },
    { id: 'graveyard', label: 'Graveyard', icon: Ghost, color: 'text-slate-500', bg: 'bg-slate-500/5' }
];

const statusToCol = (status: FeatureStatus) => {
    if (status === 'stable') return 'operational';
    if (status === 'beta' || status === 'maintenance') return 'testing';
    if (status === 'broken') return 'broken';
    return 'graveyard';
};

export default function ArchitectureBoard() {
    const [features, setFeatures] = useState<FeatureItem[]>([]);
    const [diagnosingId, setDiagnosingId] = useState<string | null>(null);

    useEffect(() => {
        setFeatures(orchestratorService.getFeatures());
    }, []);

    const handleDiagnostic = async (id: string) => {
        setDiagnosingId(id);
        haptics.medium();
        const result = await orchestratorService.runDiagnostic(id);
        
        if (result === 'Pass') {
            notify.success(`Módulo ${id}: Integridade Confirmada.`);
        } else {
            notify.error(`ALERTA: Falha no diagnóstico de ${id}. Movendo para quarentena.`);
            const updated = orchestratorService.updateStatus(id, 'broken');
            setFeatures(updated);
            haptics.heavy();
        }
        setDiagnosingId(null);
    };

    const handleToggle = (id: string) => {
        const updated = orchestratorService.toggleFeature(id);
        setFeatures(updated);
        haptics.medium();
        notify.warning(`Kill Switch acionado para: ${id}`);
    };

    const handleDeprecate = (id: string) => {
        const updated = orchestratorService.updateStatus(id, 'deprecated');
        setFeatures(updated);
        haptics.heavy();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                        System <span className="text-purple-500">Orchestrator</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 uppercase font-bold tracking-widest flex items-center gap-2">
                        <Layers size={14} className="text-purple-500" /> Governança de Features & Kill Switches
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => window.location.reload()}
                        className="p-4 bg-slate-950 border border-white/10 rounded-2xl text-slate-500 hover:text-white transition-all"
                    >
                        <RefreshCw size={20} />
                    </button>
                    <div className="bg-slate-950 px-6 py-3 rounded-2xl border border-white/5 flex flex-col items-end">
                        <span className="text-[9px] font-black text-slate-600 uppercase">Uptime Score</span>
                        <span className="text-lg font-black text-emerald-400 font-mono">99.98%</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                {COLUMNS.map(col => (
                    <div key={col.id} className="space-y-4">
                        <div className={cn("p-4 rounded-[28px] border border-white/5 flex items-center gap-3", col.bg)}>
                            <col.icon size={18} className={col.color} />
                            <h3 className={cn("text-[10px] font-black uppercase tracking-[0.2em]", col.color)}>
                                {col.label}
                            </h3>
                            <span className="ml-auto text-[10px] font-black text-slate-700 bg-black/40 px-2 py-0.5 rounded-md">
                                {features.filter(f => statusToCol(f.status) === col.id).length}
                            </span>
                        </div>

                        <div className="space-y-3 min-h-[500px]">
                            <AnimatePresence mode="popLayout">
                                {features
                                    .filter(f => statusToCol(f.status) === col.id)
                                    .map(feature => (
                                        <motion.div
                                            key={feature.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className={cn(
                                                "group relative p-6 rounded-[32px] border transition-all duration-300",
                                                feature.isActive 
                                                    ? "bg-[#0a0f1d] border-white/5 shadow-xl hover:border-purple-500/30" 
                                                    : "bg-black border-red-900/20 grayscale opacity-60"
                                            )}
                                        >
                                            {/* Status Dot Pulsante */}
                                            <div className="absolute top-6 right-6">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    feature.isActive ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-red-500",
                                                    feature.isActive && "animate-pulse"
                                                )} />
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-sm font-black text-white uppercase tracking-tight truncate pr-6">
                                                        {feature.name}
                                                    </h4>
                                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                                                        Kernel {feature.version} • {feature.priority}
                                                    </p>
                                                </div>

                                                <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 italic">
                                                    "{feature.description}"
                                                </p>

                                                {/* Action Bar (Hover Only) */}
                                                <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleDiagnostic(feature.id)}
                                                        disabled={diagnosingId === feature.id}
                                                        className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl hover:bg-sky-500 hover:text-white transition-all"
                                                        title="Run Diagnostic"
                                                    >
                                                        {diagnosingId === feature.id ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                                                    </button>
                                                    
                                                    {feature.toggleable && (
                                                        <button 
                                                            onClick={() => handleToggle(feature.id)}
                                                            className={cn(
                                                                "p-2.5 rounded-xl transition-all",
                                                                feature.isActive ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                                            )}
                                                            title="Kill Switch"
                                                        >
                                                            <Power size={14} />
                                                        </button>
                                                    )}

                                                    <button 
                                                        onClick={() => handleDeprecate(feature.id)}
                                                        className="p-2.5 bg-slate-800 text-slate-500 rounded-xl hover:bg-slate-700 hover:text-slate-200 transition-all ml-auto"
                                                        title="Deprecate"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Loading Overlay for Diagnostics */}
                                            {diagnosingId === feature.id && (
                                                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] rounded-[32px] flex items-center justify-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Activity size={24} className="text-sky-500 animate-bounce" />
                                                        <span className="text-[8px] font-black text-sky-500 uppercase animate-pulse">Scanning...</span>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                            </AnimatePresence>
                        </div>
                    </div>
                ))}
            </div>

            <footer className="bg-slate-900/20 border border-white/5 p-8 rounded-[40px] flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
                        <Settings size={20} />
                    </div>
                    <div className="max-w-2xl">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">Protocolo Admin-Core</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium mt-1">
                            A desativação de features críticas (marcadas como toggleable: false) é restrita ao console via DB Triggers. 
                            Alterações nesta tela afetam a renderização condicional de menus para todos os alunos e professores em tempo real.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Diagnostic Latency</p>
                        <p className="text-xl font-black text-white leading-none">1.2s</p>
                    </div>
                    <div className="w-px h-10 bg-white/5" />
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Nodes Active</p>
                        <p className="text-xl font-black text-white leading-none">
                            {features.filter(f => f.isActive).length}/{features.length}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}