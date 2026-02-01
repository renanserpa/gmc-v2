import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldOff, Lock, ChevronDown, User, Users, GraduationCap, ArrowLeft, Search, Eye, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { haptics } from '../../lib/haptics';
import { notify } from '../../lib/notification';
import { useAdmin } from '../../contexts/AdminContext.tsx';
import { useAuditLog } from '../../hooks/useAuditLog.ts';
import { UserRole } from '../../types.ts';
import { supabase } from '../../lib/supabaseClient.ts';

const M = motion as any;

export const GodModeBar: React.FC = () => {
    const { impersonatedRole, impersonate, impersonatedStudentId, mirrorStudent, isBypassActive, setBypassActive } = useAdmin();
    const { logAlteration } = useAuditLog();
    const [showSelector, setShowSelector] = useState(false);
    const [showMirrorSearch, setShowMirrorSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [students, setStudents] = useState<any[]>([]);

    const roles = [
      { id: UserRole.Admin, label: 'Root Admin', icon: Zap },
      { id: UserRole.Professor, label: 'Professor', icon: GraduationCap },
      { id: UserRole.Student, label: 'Estudante', icon: User },
      { id: UserRole.Guardian, label: 'Responsável', icon: Users },
    ];

    useEffect(() => {
        if (showMirrorSearch && searchQuery.length > 2) {
            supabase.from('students').select('id, name').ilike('name', `%${searchQuery}%`).limit(5)
                .then(({ data }) => setStudents(data || []));
        }
    }, [searchQuery, showMirrorSearch]);

    const handleImpersonate = (roleId: UserRole | null) => {
        const oldRole = impersonatedRole;
        impersonate(roleId);
        
        // Log auditing context change if bypass is active
        if (isBypassActive) {
            logAlteration('ADMIN_CONTEXT', 'IMPERSONATION_ROLE', oldRole, roleId);
        }
        setShowSelector(false);
    };

    const handleMirror = (studentId: string | null) => {
        const oldId = impersonatedStudentId;
        mirrorStudent(studentId);

        // Log auditing mirroring if bypass is active
        if (isBypassActive) {
            logAlteration('ADMIN_CONTEXT', 'MIRROR_STUDENT', oldId, studentId);
        }
        setShowMirrorSearch(false);
    };

    return (
        <div className="h-10 bg-red-950/40 border-b border-red-500/20 backdrop-blur-md flex items-center px-6 justify-between shrink-0 z-[100] relative">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-red-500 animate-pulse">
                    <Zap size={14} fill="currentColor" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">God Mode Active</span>
                </div>

                <div className="h-4 w-px bg-red-500/20" />

                <div className="flex items-center gap-2 relative">
                    <span className="text-[8px] font-black text-slate-500 uppercase">Visão:</span>
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
                          {roles.map(role => (
                            <button key={role.id} onClick={() => handleImpersonate(role.id as UserRole)} className={cn("w-full px-4 py-2 text-left text-[10px] font-bold uppercase transition-colors flex items-center gap-2", impersonatedRole === role.id ? "text-sky-400 bg-sky-500/5" : "text-slate-500 hover:bg-white/5 hover:text-slate-200")}><role.icon size={12} /> {role.label}</button>
                          ))}
                        </M.div>
                      )}
                    </AnimatePresence>
                </div>

                <div className="h-4 w-px bg-red-500/20" />

                {/* Session Mirroring Selector */}
                <div className="flex items-center gap-2 relative">
                    <span className="text-[8px] font-black text-slate-500 uppercase">Mirror:</span>
                    <button 
                      onClick={() => { setShowMirrorSearch(!showMirrorSearch); setShowSelector(false); }}
                      className={cn(
                          "flex items-center gap-1.5 text-[9px] font-bold transition-all px-2 py-0.5 rounded border",
                          impersonatedStudentId ? "bg-purple-600 border-purple-400 text-white" : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                      )}
                    >
                        <Eye size={10} /> {impersonatedStudentId ? 'Mirroring Active' : 'Select Aluno'}
                    </button>

                    <AnimatePresence>
                      {showMirrorSearch && (
                        <M.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full mt-2 left-0 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[110]"
                        >
                          <div className="p-3 bg-slate-950 border-b border-white/5 flex items-center gap-2">
                              <Search size={14} className="text-slate-500" />
                              <input 
                                autoFocus
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Buscar aluno..."
                                className="bg-transparent border-none outline-none text-[10px] font-bold text-white w-full"
                              />
                          </div>
                          <div className="max-h-40 overflow-y-auto p-1 custom-scrollbar">
                              {impersonatedStudentId && (
                                  <button onClick={() => handleMirror(null)} className="w-full px-3 py-2 text-left text-[10px] font-black uppercase text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-b border-white/5"><X size={10} /> Stop Mirroring</button>
                              )}
                              {students.map(s => (
                                  <button key={s.id} onClick={() => handleMirror(s.id)} className="w-full px-3 py-2 text-left text-[10px] font-bold text-slate-300 hover:bg-white/5 hover:text-white truncate">{s.name}</button>
                              ))}
                              {students.length === 0 && searchQuery.length > 2 && <p className="p-4 text-center text-[9px] text-slate-600 uppercase font-black">Nenhum resultado</p>}
                          </div>
                        </M.div>
                      )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button 
                    onClick={() => {
                        const newState = !isBypassActive;
                        setBypassActive(newState);
                        haptics.fever();
                        notify.error(newState ? "RLS BYPASSED: Security Risk Active" : "RLS Restored: Global Shield ON");
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
