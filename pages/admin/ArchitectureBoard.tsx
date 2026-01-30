
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Play, Power, Trash2, ShieldCheck, 
    AlertCircle, Bug, Ghost, RefreshCw, Layers,
    Activity, Settings, Cpu
} from 'lucide-react';
import { orchestratorService } from '../../services/orchestratorService.ts';
import { FeatureItem, FeatureStatus } from '../../data/featureRegistry.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';

const M = motion as any;

const COLUMNS = [
    { id: 'operational', label: 'Operacional', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
    { id: 'testing', label: 'Beta / Testes', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/5' },
    { id: 'broken', label: 'Crítico / Bug', icon: Bug, color: 'text-red-500', bg: 'bg-red-500/5' },
    { id: 'graveyard', label: 'Obsoleto', icon: Ghost, color: 'text-slate-500', bg: 'bg-slate-500/5' }
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFeatures();
    }, []);

    const loadFeatures = async () => {
        setLoading(true);
        try {
            const data = await orchestratorService.getFeatures();
            setFeatures(Array.isArray(data) ? data : []);
        } catch (e) {
            notify.error("Erro ao sincronizar orquestrador.");
        } finally {
            setLoading(false);
        }
    };

    const handleDiagnostic = async (id: string) => {
        setDiagnosingId(id);
        haptics.medium();
        const result = await orchestratorService.runDiagnostic(id);
        
        if (result === 'Pass') {
            notify.success(`Módulo ${id}: Integridade Confirmada.`);
        } else {
            notify.error(`ALERTA: Falha no diagnóstico de ${id}.`);
            const updated = await orchestratorService.updateStatus(id, 'broken');
            setFeatures(updated);
        }
        setDiagnosingId(null);
    };

    const handleToggle = async (id: string) => {
        try {
            const updated = await orchestratorService.toggleFeature(id);
            setFeatures(updated);
            haptics.medium();
            notify.warning(`Kill Switch: Status alterado para ${id}`);
        } catch (e) {
            notify.error("Falha ao acionar Kill Switch.");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <RefreshCw size={32} className="text-sky-500 animate-spin" />
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Acessando Kernel...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3 leading-none">
                        System <span className="text-purple-500">Orchestrator</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
                        <Layers size={14} className="text-purple-500" /> Governança de Features em Tempo Real
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={loadFeatures} variant="outline" className="rounded-2xl h-14 w-14 p-0 border-white/5">
                        <RefreshCw size={20} />
                    </Button>
                    <div className="bg-slate-950 px-6 py-2 rounded-2xl border border-white/5 flex flex-col items-end justify-center">
                        <span className="text-[8px] font-black text-slate-600 uppercase">Cluster Uptime</span>
                        <span className="text-lg font-black text-emerald-400 font-mono">99.98%</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                {COLUMNS.map(col => (
                    <div key={col.id} className="space-y-4">
                        <div className={cn("p-4 rounded-2xl border border-white/5 flex items-center gap-3", col.bg)}>
                            <col.icon size={16} className={col.color} />
                            <h3 className={cn("text-[9px] font-black uppercase tracking-[0.2em]", col.color)}>
                                {col.label}
                            </h3>
                            <span className="ml-auto text-[10px] font-black text-slate-700 bg-black/40 px-2 py-0.5 rounded-md">
                                {features.filter(f => statusToCol(f.status) === col.id).length}
                            </span>
                        </div>

                        <div className="space-y-3 min-h-[400px]">
                            <AnimatePresence mode="popLayout">
                                {features
                                    .filter(f => statusToCol(f.status) === col.id)
                                    .map(feature => (
                                        <M.div
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
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[140px]">
                                                        {feature.name}
                                                    </h4>
                                                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                                                        {feature.version} • {feature.priority}
                                                    </p>
                                                </div>
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    feature.isActive ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-red-500"
                                                )} />
                                            </div>

                                            <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 italic mb-4">
                                                "{feature.description}"
                                            </p>

                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleDiagnostic(feature.id)}
                                                    className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl hover:bg-sky-500 hover:text-white transition-all"
                                                >
                                                    <Play size={14} fill="currentColor" />
                                                </button>
                                                
                                                {feature.toggleable && (
                                                    <button 
                                                        onClick={() => handleToggle(feature.id)}
                                                        className={cn(
                                                            "p-2.5 rounded-xl transition-all",
                                                            feature.isActive ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                                        )}
                                                    >
                                                        <Power size={14} />
                                                    </button>
                                                )}
                                            </div>

                                            {diagnosingId === feature.id && (
                                                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] rounded-[32px] flex items-center justify-center">
                                                    <Activity size={24} className="text-sky-500 animate-pulse" />
                                                </div>
                                            )}
                                        </M.div>
                                    ))}
                            </AnimatePresence>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
