
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldOff, Lock, ChevronDown, User, Users, GraduationCap, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { haptics } from '../../lib/haptics';
import { notify } from '../../lib/notification';
import { useAdmin } from '../../contexts/AdminContext.tsx';
import { UserRole } from '../../types.ts';

const M = motion as any;

export const GodModeBar: React.FC = () => {
    const { impersonatedRole, impersonate, isBypassActive, setBypassActive } = useAdmin();
    const [showSelector, setShowSelector] = useState(false);

    const roles = [
      { id: UserRole.Admin, label: 'Root Admin', icon: Zap },
      { id: UserRole.Professor, label: 'Professor', icon: GraduationCap },
      { id: UserRole.Student, label: 'Estudante', icon: User },
      { id: UserRole.Guardian, label: 'Responsável', icon: Users },
    ];

    return (
        <div className="h-10 bg-red-950/40 border-b border-red-500/20 backdrop-blur-md flex items-center px-6 justify-between shrink-0 z-[100] relative">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-red-500 animate-pulse">
                    <Zap size={14} fill="currentColor" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">God Mode Active</span>
                </div>

                <div className="h-4 w-px bg-red-500/20" />

                <div className="flex items-center gap-2 relative">
                    <span className="text-[8px] font-black text-slate-500 uppercase">Contexto Ativo:</span>
                    <button 
                      onClick={() => setShowSelector(!showSelector)}
                      className="flex items-center gap-1.5 text-[9px] font-bold text-slate-300 hover:text-white transition-colors bg-white/5 px-2 py-0.5 rounded border border-white/5"
                    >
                        {impersonatedRole ? `View as ${impersonatedRole.toUpperCase()}` : 'Global Root'} <ChevronDown size={10} className={cn("transition-transform", showSelector && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {showSelector && (
                        <M.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full mt-2 left-0 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-[110]"
                        >
                          <button 
                            onClick={() => { impersonate(null); setShowSelector(false); }}
                            className="w-full px-4 py-2 text-left text-[10px] font-black uppercase text-slate-400 hover:bg-white/5 hover:text-white flex items-center gap-2 border-b border-white/5 mb-1"
                          >
                            <ArrowLeft size={12} /> Reset to Root
                          </button>
                          {roles.map(role => (
                            <button 
                              key={role.id}
                              onClick={() => { impersonate(role.id); setShowSelector(false); }}
                              className={cn(
                                "w-full px-4 py-2 text-left text-[10px] font-bold uppercase transition-colors flex items-center gap-2",
                                impersonatedRole === role.id ? "text-sky-400 bg-sky-500/5" : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
                              )}
                            >
                              <role.icon size={12} /> {role.label}
                            </button>
                          ))}
                        </M.div>
                      )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button 
                    onClick={() => {
                        setBypassActive(!isBypassActive);
                        haptics.fever();
                        notify.error(isBypassActive ? "RLS Restored" : "RLS BYPASSED: Viewing Unfiltered Data");
                    }}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all",
                        isBypassActive 
                            ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]" 
                            : "bg-slate-900 text-slate-500 border border-white/5 hover:text-slate-300"
                    )}
                >
                    {isBypassActive ? <ShieldOff size={12} /> : <Lock size={12} />}
                    {isBypassActive ? "Bypass ON" : "RLS Lock"}
                </button>
            </div>
        </div>
    );
};
