
import React from 'react';
import { motion } from 'framer-motion';
// Fixed: Removed non-existent Tooltip import from lucide-react
import { LucideIcon, Info, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

export const DevStatusBadge: React.FC<{ status: 'wip' | 'proto' | 'beta' | 'stable' }> = ({ status }) => {
    const config = {
        wip: { label: '🚧 WORK IN PROGRESS', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        proto: { label: '🧪 PROTOTYPE', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        beta: { label: '✨ BETA TEST', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
        stable: { label: '✅ STABLE CORE', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
    };
    const c = config[status];
    return (
        <div className={cn("px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest flex items-center gap-2", c.bg, c.color, c.border)}>
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", c.color.replace('text', 'bg'))} />
            {c.label}
        </div>
    );
};

export const DevPageHeader: React.FC<{ icon: LucideIcon, title: string, description: string, status?: any }> = ({ icon: Icon, title, description, status = 'wip' }) => (
    <div className="mb-10 space-y-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-4 bg-slate-900 rounded-[24px] border border-white/5 text-amber-500 shadow-xl">
                    <Icon size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">{title}</h1>
                    <p className="text-slate-500 text-xs font-medium">{description}</p>
                </div>
            </div>
            <DevStatusBadge status={status} />
        </div>
        <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-transparent to-transparent" />
    </div>
);

export const FeatureList: React.FC<{ features: string[] }> = ({ features }) => (
    <div className="bg-slate-950/50 rounded-3xl border border-white/5 p-6 space-y-3">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Clock size={12} /> Backlog de Implementação
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-xl border border-white/5 text-[11px] text-slate-400 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    {f}
                </div>
            ))}
        </div>
    </div>
);

export const TechnicalNotes: React.FC<{ notes: string }> = ({ notes }) => (
    <div className="mt-8 bg-amber-950/10 border border-amber-500/10 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="text-amber-500 shrink-0" size={16} />
        <div className="space-y-1">
            <p className="text-[10px] font-black text-amber-500 uppercase">Notas de Engenharia</p>
            <p className="text-[10px] text-slate-500 font-mono leading-relaxed">{notes}</p>
        </div>
    </div>
);
