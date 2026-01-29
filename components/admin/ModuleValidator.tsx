import React, { useState } from 'react';
import { SystemNode } from '../../config/systemRegistry.ts';
import { diagnosticService, DiagnosticResult } from '../../services/diagnosticService.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.tsx';
import { Button } from '../ui/Button.tsx';
import { 
    FileCode, Link, Package, Play, 
    CheckCircle2, XCircle, Loader2, Info
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';
// FIX: Added missing imports from framer-motion
import { motion, AnimatePresence } from 'framer-motion';

// FIX: Casting motion components to any to bypass property errors in this environment
const M = motion as any;

interface ModuleValidatorProps {
    node: SystemNode | null;
    onClose: () => void;
}

export const ModuleValidator: React.FC<ModuleValidatorProps> = ({ node, onClose }) => {
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState<DiagnosticResult | null>(null);

    if (!node) return null;

    const runTest = async () => {
        setTesting(true);
        setResult(null);
        
        let res: DiagnosticResult;
        if (node.layer === 'database') {
            res = await diagnosticService.checkTable(node.path.replace('public.', ''));
        } else {
            res = await diagnosticService.validateModuleImport(node.path);
        }
        
        setResult(res);
        setTesting(false);
    };

    return (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-[#020617] border-l border-sky-500/30 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-[100] animate-in slide-in-from-right p-8 flex flex-col gap-6 overflow-y-auto">
            <header className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sky-400">
                        <FileCode size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Inspeção de Módulo</span>
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase italic">{node.label}</h2>
                </div>
                <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                    <XCircle size={24} />
                </button>
            </header>

            <div className="space-y-4">
                <Card className="bg-slate-900/50 p-6 rounded-3xl border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Localização Física</p>
                    <code className="text-xs text-sky-300 break-all font-mono bg-black/40 p-3 rounded-xl block border border-white/5">
                        {node.path}
                    </code>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-2">Dependências</p>
                        <div className="flex flex-wrap gap-1">
                            {node.dependencies.map(dep => (
                                <span key={dep} className="text-[9px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-white/5">
                                    {dep}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-2">Layer Root</p>
                        <span className="text-[10px] font-black text-sky-500 uppercase">{node.layer}</span>
                    </div>
                </div>

                <Card className="bg-slate-900/50 p-6 rounded-3xl border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Info size={12} /> Documentação
                    </p>
                    <p className="text-sm text-slate-400 leading-relaxed italic">"{node.description}"</p>
                </Card>
            </div>

            <div className="mt-auto space-y-4">
                <Button 
                    onClick={runTest} 
                    isLoading={testing}
                    className="w-full py-6 rounded-2xl text-xs font-black uppercase tracking-widest"
                    leftIcon={Play}
                >
                    Executar Scanner de Integridade
                </Button>

                <AnimatePresence>
                    {result && (
                        <div className={cn(
                            "p-6 rounded-[32px] border-2 animate-in fade-in zoom-in duration-300",
                            result.success ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" : "bg-red-500/10 border-red-500/40 text-red-400"
                        )}>
                            <div className="flex items-center gap-3 mb-2">
                                {result.success ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                                <p className="font-black uppercase text-xs tracking-widest">
                                    {result.success ? 'Sincronizado' : 'Falha Detectada'}
                                </p>
                            </div>
                            {!result.success && (
                                <p className="text-[10px] font-mono leading-relaxed bg-black/20 p-2 rounded-lg">
                                    ERRO: {result.error}
                                </p>
                            )}
                            {result.success && result.latency && (
                                <p className="text-[9px] font-black opacity-60">Latência: {result.latency}ms</p>
                            )}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
