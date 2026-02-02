
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldOff, Lock, ChevronDown, User, Users, GraduationCap, ArrowLeft, Search, Eye, X, Terminal, Briefcase } from 'lucide-react';
import { cn } from '../../lib/utils';
import { haptics } from '../../lib/haptics';
import { notify } from '../../lib/notification';
import { useAdmin } from '../../contexts/AdminContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useAuditLog } from '../../hooks/useAuditLog.ts';
import { UserRole } from '../../types.ts';
import { supabase } from '../../lib/supabaseClient.ts';

const M = motion as any;

export const GodModeBar: React.FC = () => {
    const { user } = useAuth();
    const { impersonatedRole, impersonate, impersonatedStudentId, mirrorStudent, isBypassActive, setBypassActive } = useAdmin();
    const { logAlteration } = useAuditLog();
    
    const [showSelector, setShowSelector] = useState(false);
    const [showMirrorSearch, setShowMirrorSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [students, setStudents] = useState<any[]>([]);

    const isRoot = user?.email === 'serparenan@gmail.com';

    useEffect(() => {
        if (showMirrorSearch && searchQuery.length > 2) {
            supabase.from('students').select('id, name').ilike('name', `%${searchQuery}%`).limit(5)
                .then(({ data }) => setStudents(data || []));
        }
    }, [searchQuery, showMirrorSearch]);

    const handleImpersonate = (roleId: UserRole | null) => {
        const oldRole = impersonatedRole;
        impersonate(roleId);
        
        if (isBypassActive) {
            logAlteration('ADMIN_CONTEXT', 'IMPERSONATION_ROLE', oldRole, roleId);
        }
        setShowSelector(false);
    };

    const toggleBypass = () => {
        const newState = !isBypassActive;
        setBypassActive(newState);
        haptics.fever();
        if (newState) {
            notify.error("GOD MODE ACTIVATED: Infrastructure Controls Unlocked");
        } else {
            notify.info("GOD MODE RESTRICTED: Returning to SaaS Business View");
        }
    };

    return (
        <div className={cn(
            "h-12 border-b backdrop-blur-md flex items-center px-6 justify-between shrink-0 z-[100] relative transition-colors duration-500",
            isBypassActive ? "bg-red-950/40 border-red-500/20" : "bg-slate-900/60 border-white/5"
        )}>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    {isBypassActive ? (
                        <div className="flex items-center gap-2 text-red-500 animate-pulse">
                            <Terminal size={14} />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Developer Engine On</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sky-400">
                            <Briefcase size={14} />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">SaaS Business Manager</span>
                        </div>
                    )}
                </div>

                <div className="h-4 w-px bg-white/10" />

                <div className="flex items-center gap-2 relative">
                    <span className="text-[8px] font-black text-slate-500 uppercase">Contexto:</span>
                    <button 
                      onClick={() => { setShowSelector(!showSelector); setShowMirrorSearch(false); }}
                      className="flex items-center gap-1.5 text-[9px] font-bold text-slate-300 hover:text-white transition-colors bg-white/5 px-2 py-0.5 rounded border border-white/5"
                    >
                        {impersonatedRole ? impersonatedRole.toUpperCase() : 'ROOT'} <ChevronDown size={10} className={cn("transition-transform", showSelector && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {showSelector && (
                        <M.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full mt-2 left-0 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-[110]"
                        >
                          <button onClick={() => handleImpersonate(null)} className="w-full px-4 py-2 text-left text-[10px] font-black uppercase text-slate-400 hover:bg-white/5 hover:text-white flex items-center gap-2 border-b border-white/5 mb-1"><ArrowLeft size={12} /> Reset to Root</button>
                          {[UserRole.GodMode, UserRole.SaaSAdminGlobal, UserRole.SaaSAdminFinance, UserRole.SaaSAdminOps, UserRole.Professor, UserRole.Student].map(role => (
                            <button key={role} onClick={() => handleImpersonate(role as UserRole)} className={cn("w-full px-4 py-2 text-left text-[10px] font-bold uppercase transition-colors flex items-center gap-2", impersonatedRole === role ? "text-sky-400 bg-sky-500/5" : "text-slate-500 hover:bg-white/5 hover:text-slate-200")}>{role}</button>
                          ))}
                        </M.div>
                      )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {isRoot && (
                    <button 
                        onClick={toggleBypass}
                        className={cn(
                            "flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all border-2",
                            isBypassActive 
                                ? "bg-red-600 border-white text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] scale-105" 
                                : "bg-slate-900 border-white/10 text-slate-500 hover:border-red-500/50 hover:text-red-400"
                        )}
                    >
                        {isBypassActive ? <Zap size={12} fill="white" /> : <ShieldOff size={12} />}
                        {isBypassActive ? "Ativar God Mode" : "God Mode Off"}
                    </button>
                )}
            </div>
        </div>
    );
};
