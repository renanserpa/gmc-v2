
import React, { useState } from 'react';
import * as RRD from 'react-router-dom';
const { Outlet, NavLink } = RRD as any;
import { 
    GraduationCap, Building2, Terminal, 
    Users, Zap, Briefcase, ChevronDown, 
    Gamepad2, LogOut, Shield, Activity,
    Timer, ListMusic, Map, Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { PersonaSwitcher } from './admin/PersonaSwitcher.tsx';
import { cn } from '../lib/utils.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '../lib/haptics.ts';

const M = motion as any;

const StatusBadge = ({ status }: { status: 'STABLE' | 'BETA' | 'WIP' | 'PROTO' }) => {
    const colors = {
        STABLE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        BETA: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        WIP: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        PROTO: "bg-purple-500/10 text-purple-400 border-purple-500/20"
    };
    return (
        <span className={cn("text-[7px] font-black px-1.5 py-0.5 rounded border ml-auto", colors[status])}>
            {status}
        </span>
    );
};

const NavAccordion = ({ title, icon: Icon, children, id }: any) => {
    const storageKey = `maestro_nav_${id}`;
    const [isOpen, setIsOpen] = useState(() => localStorage.getItem(storageKey) === 'true');

    const toggle = () => {
        const next = !isOpen;
        setIsOpen(next);
        localStorage.setItem(storageKey, String(next));
        haptics.light();
    };

    return (
        <div className="mb-2">
            <button 
                onClick={toggle}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-white transition-colors group"
            >
                <Icon size={16} className="group-hover:text-sky-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">{title}</span>
                <ChevronDown size={14} className={cn("ml-auto transition-transform", isOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <M.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white/[0.02] rounded-2xl mx-2">
                        <div className="py-2 space-y-1">
                            {children}
                        </div>
                    </M.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function Layout() {
  const { signOut, actingRole } = useAuth();
  
  const isStudent = actingRole === 'student';
  const isMaestro = actingRole === 'professor' || actingRole === 'teacher_owner';
  const isGod = actingRole === 'god_mode';
  const isSaaS = actingRole === 'saas_admin_global' || isGod;

  const navItemClass = ({ isActive }: any) => cn(
    "flex items-center gap-4 px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all",
    isActive 
        ? (isStudent ? "text-pink-400 bg-pink-500/5 shadow-[inset_2px_0_0_#f472b6]" : "text-white bg-white/5 shadow-[inset_2px_0_0_#38bdf8]") 
        : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans">
        <aside className={cn(
            "w-72 border-r border-white/5 flex flex-col z-50 shadow-2xl transition-all duration-700",
            isStudent ? "bg-[#0f0a1d] border-pink-500/10" : "bg-slate-950"
        )}>
            <div className="p-6 border-b border-white/5 flex items-center gap-3">
                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-white font-black italic shadow-lg",
                    isStudent ? "bg-pink-600 rounded-[12px]" : "bg-sky-600"
                )}>M</div>
                <span className="font-black text-lg tracking-tighter uppercase italic">
                    Maestro <span className={isStudent ? "text-pink-500" : "text-sky-500"}>{isStudent ? "Arcade" : "Suite"}</span>
                </span>
            </div>

            <nav className="flex-1 overflow-y-auto custom-scrollbar py-6 px-2">
                {/* CLUSTER: GOD */}
                {isGod && (
                    <NavAccordion id="core" title="🚀 Core Engine" icon={Terminal}>
                        <NavLink to="/system/console" className={navItemClass}>Kernel Console <StatusBadge status="STABLE"/></NavLink>
                        <NavLink to="/system/sql" className={navItemClass}>SQL Lab <StatusBadge status="STABLE"/></NavLink>
                    </NavAccordion>
                )}

                {/* CLUSTER: SAAS */}
                {isSaaS && (
                    <NavAccordion id="business" title="💰 B2B Manager" icon={Briefcase}>
                        <NavLink to="/admin/business" className={navItemClass}>BI Analytics <StatusBadge status="BETA"/></NavLink>
                        <NavLink to="/admin/tenants" className={navItemClass}>Unidades <StatusBadge status="STABLE"/></NavLink>
                    </NavAccordion>
                )}

                {/* CLUSTER: MAESTRO */}
                {(isMaestro || isGod) && (
                    <NavAccordion id="maestro" title="🎵 Maestro Core" icon={GraduationCap}>
                        <NavLink to="/teacher/dashboard" className={navItemClass}>Meu Estúdio <StatusBadge status="BETA"/></NavLink>
                        <NavLink to="/teacher/classes" className={navItemClass}>Minhas Turmas <StatusBadge status="STABLE"/></NavLink>
                        <NavLink to="/system/dev/teacher/metronome" className={navItemClass}>Metrônomo Pro <StatusBadge status="BETA"/></NavLink>
                        <NavLink to="/system/dev/teacher/orchestrator" className={navItemClass}>Exercise Manager <StatusBadge status="BETA"/></NavLink>
                    </NavAccordion>
                )}

                {/* CLUSTER: STUDENT */}
                {(isStudent || isGod) && (
                    <NavAccordion id="arcade" title="🎮 Arcade Player" icon={Gamepad2}>
                        <NavLink to="/student/dashboard" className={navItemClass}>Meu Progresso <StatusBadge status="BETA"/></NavLink>
                        <NavLink to="/student/arcade" className={navItemClass}>Game Center <StatusBadge status="STABLE"/></NavLink>
                        <NavLink to="/student/practice" className={navItemClass}>Sala de Prática <StatusBadge status="STABLE"/></NavLink>
                    </NavAccordion>
                )}
            </nav>

            <div className="p-6 border-t border-white/5 bg-black/20">
                <button onClick={signOut} className="flex items-center gap-3 w-full text-[9px] font-black text-slate-700 hover:text-red-500 transition-colors uppercase tracking-[0.2em]">
                    <LogOut size={14} /> Sair do Sistema
                </button>
            </div>
        </aside>

        <main className="flex-1 overflow-y-auto relative bg-[#02040a] p-8 custom-scrollbar">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.02),transparent)] pointer-events-none" />
            <Outlet />
            <PersonaSwitcher />
        </main>
    </div>
  );
}
