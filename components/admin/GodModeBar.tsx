import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, UserCog, ShieldOff, Eye, ChevronDown, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { haptics } from '../../lib/haptics';
import { notify } from '../../lib/notification';

export const GodModeBar: React.FC = () => {
    const [bypassActive, setBypassActive] = useState(false);
    const [selectedContext, setSelectedContext] = useState('Global (Root)');

    const handleImpersonate = (name: string) => {
        haptics.heavy();
        notify.warning(`Impersonando: ${name}. Visão alterada.`);
    };

    return (
        <div className="h-10 bg-red-950/40 border-b border-red-500/20 backdrop-blur-md flex items-center px-6 justify-between shrink-0 z-50">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-red-500 animate-pulse">
                    <Zap size={14} fill="currentColor" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">God Mode Active</span>
                </div>

                <div className="h-4 w-px bg-red-500/20" />

                <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-slate-500 uppercase">Tenant Context:</span>
                    <button className="flex items-center gap-1.5 text-[9px] font-bold text-slate-300 hover:text-white transition-colors bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        {selectedContext} <ChevronDown size={10} />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex bg-black/40 rounded-md p-0.5 border border-white/5">
                    <button 
                        onClick={() => handleImpersonate('Professor Mock')}
                        className="px-3 py-1 text-[8px] font-black uppercase text-slate-500 hover:text-white transition-colors"
                    >
                        Impersonate View
                    </button>
                </div>

                <button 
                    onClick={() => {
                        setBypassActive(!bypassActive);
                        haptics.fever();
                        notify.error(bypassActive ? "RLS Restored" : "RLS BYPASSED: Viewing Unfiltered Data");
                    }}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all",
                        bypassActive 
                            ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]" 
                            : "bg-slate-900 text-slate-500 border border-white/5"
                    )}
                >
                    {bypassActive ? <ShieldOff size={12} /> : <Lock size={12} />}
                    Bypass RLS
                </button>
            </div>
        </div>
    );
};