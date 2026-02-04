
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, User, Users, GraduationCap, Shield, Code, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';
// FIX: Using wildcard import for react-router-dom to bypass environment-specific export resolution errors
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;
import { cn } from '../../lib/utils.ts';
import { haptics } from '../../lib/haptics.ts';

const M = motion as any;

const ROLES = [
  { id: 'super_admin', label: 'Super Admin', icon: Zap, color: 'text-red-400', bg: 'bg-red-500/10' },
  { id: 'professor', label: 'Professor', icon: GraduationCap, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  { id: 'student', label: 'Estudante', icon: User, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'guardian', label: 'Responsável', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'school_manager', label: 'Gestor', icon: Users, color: 'text-orange-400', bg: 'bg-orange-500/10' },
];

export const DevSwitcher: React.FC = () => {
  /**
   * FIX: Destructuring setActingRole and actingRole from AuthContext.
   * actingRole is aliased to 'role' to maintain compatibility with existing mapping logic.
   */
  const { setActingRole, getDashboardPath, actingRole: role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSwitch = (newRole: string) => {
    haptics.heavy();
    // FIX: Replaced setRoleOverride with correct AuthContext method setActingRole
    setActingRole(newRole);
    const targetPath = getDashboardPath(newRole);
    navigate(targetPath);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] font-sans">
      <AnimatePresence>
        {isOpen && (
          <M.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-72 bg-slate-900/95 backdrop-blur-xl border-2 border-sky-500/30 rounded-[32px] p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Code size={14} className="text-sky-400" /> Kernel Switcher
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSwitch(r.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-2xl transition-all border group",
                    role === r.id 
                      ? "bg-sky-600 border-white text-white shadow-lg" 
                      : "bg-slate-950 border-white/5 text-slate-400 hover:border-sky-500/30 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl", role === r.id ? "bg-white/20" : r.bg)}>
                      <r.icon size={16} className={role === r.id ? "text-white" : r.color} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{r.label}</span>
                  </div>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest text-center">Modo de Desenvolvimento Ativo</p>
            </div>
          </M.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all border-4",
          isOpen ? "bg-slate-800 border-sky-500 text-sky-400" : "bg-sky-600 border-white text-white"
        )}
      >
        <Code size={24} />
      </button>
    </div>
  );
};
