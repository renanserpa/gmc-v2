
import React, { useState } from 'react';
import * as RRD from 'react-router-dom';
const { Outlet, NavLink, useNavigate, useLocation } = RRD as any;
import { 
    Building2, Users, LayoutDashboard, 
    LogOut, Presentation, ListMusic, Radio,
    Zap, Shield, Terminal, Gamepad2, ArrowRightLeft,
    ShoppingBag, Briefcase, ChevronLeft, ChevronRight,
    Layout
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { PersonaSwitcher } from './admin/PersonaSwitcher.tsx';
import { cn } from '../lib/utils.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '../lib/haptics.ts';

const M = motion as any;

export default function LayoutWrapper() {
  const { signOut, actingRole, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const isStudentArea = location.pathname.includes('/student');

  const toggleSidebar = () => {
    haptics.medium();
    setIsCollapsed(!isCollapsed);
  };

  const navItemClass = ({ isActive }: any) => cn(
    "flex items-center gap-4 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-l-4",
    isCollapsed ? "justify-center px-0 border-l-0 border-b-4" : "px-6 border-l-4",
    isActive 
        ? "text-cyan-400 bg-cyan-400/5 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.1)]" 
        : "text-slate-600 border-transparent hover:text-slate-300 hover:bg-white/[0.02]"
  );

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100 flex overflow-hidden font-sans">
        {/* SIDEBAR ASIDE */}
        <aside className={cn(
            "border-r border-white/5 flex flex-col z-50 shadow-2xl bg-[#050505] relative transition-all duration-500 ease-in-out",
            isCollapsed ? "w-20" : "w-80"
        )}>
            {/* Toggle Button */}
            <button 
                onClick={toggleSidebar}
                className="absolute -right-3 top-24 w-6 h-12 bg-sky-600 border border-white/10 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-sky-500 transition-colors z-50"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-cyan-500/50 via-transparent to-purple-500/50" />
            
            {/* LOGO AREA */}
            <div className={cn("p-8 border-b border-white/5 bg-black/40 transition-all", isCollapsed && "p-4 flex flex-col items-center")}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black italic shadow-[0_0_15px_#0ea5e9] bg-sky-600 animate-pulse shrink-0">M</div>
                    {!isCollapsed && (
                        <M.span 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="font-black text-xl tracking-tighter uppercase italic text-white whitespace-nowrap"
                        >
                            Maestro <span className="text-sky-500">Suite</span>
                        </M.span>
                    )}
                </div>
                {!isCollapsed && (
                    <M.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-2 px-4 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-center"
                    >
                        <p className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em] drop-shadow-[0_0_8px_#22d3ee]">
                            {isStudentArea ? 'MODO ARCADE ALUNO' : 'MODO COMANDO MESTRE'}
                        </p>
                    </M.div>
                )}
            </div>

            {/* NAVIGATION LINKS */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar py-6">
                {!isStudentArea ? (
                    <div className="space-y-1">
                        {!isCollapsed && <p className="px-8 text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] mb-4">Command Center</p>}
                        <NavLink to="/teacher/dashboard" title="Dashboard" className={navItemClass}>
                            <LayoutDashboard size={18} className="shrink-0" />
                            {!isCollapsed && <span>Dashboard</span>}
                        </NavLink>
                        <NavLink to="/admin/school" title="Minha Unidade" className={navItemClass}>
                            <Building2 size={18} className="shrink-0" />
                            {!isCollapsed && <span>Minha Unidade</span>}
                        </NavLink>
                        <NavLink to="/teacher/classes" title="Grade Horária" className={navItemClass}>
                            <ListMusic size={18} className="shrink-0" />
                            {!isCollapsed && <span>Grade Horária</span>}
                        </NavLink>
                        <NavLink to="/teacher/students" title="Lista de Alunos" className={navItemClass}>
                            <Users size={18} className="shrink-0" />
                            {!isCollapsed && <span>Lista de Alunos</span>}
                        </NavLink>
                        <NavLink to="/teacher/orchestrator" title="Orchestrator Live" className={navItemClass}>
                            <Radio size={18} className="text-rose-500 shrink-0" />
                            {!isCollapsed && <span>Orchestrator Live</span>}
                        </NavLink>
                        <NavLink to="/teacher/whiteboard" title="Lousa Digital" className={navItemClass}>
                            <Presentation size={18} className="shrink-0" />
                            {!isCollapsed && <span>Lousa Digital</span>}
                        </NavLink>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {!isCollapsed && <p className="px-8 text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] mb-4">Arcade Player</p>}
                        <NavLink to="/student/dashboard" title="Meu Arcade" className={navItemClass}>
                            <Gamepad2 size={18} className="text-purple-500 shrink-0" />
                            {!isCollapsed && <span>Meu Arcade</span>}
                        </NavLink>
                        <NavLink to="/student/practice" title="Sala de Treino" className={navItemClass}>
                            <Radio size={18} className="text-sky-500 shrink-0" />
                            {!isCollapsed && <span>Sala de Treino</span>}
                        </NavLink>
                        <NavLink to="/student/shop" title="Skins & Loja" className={navItemClass}>
                            <ShoppingBag size={18} className="text-amber-500 shrink-0" />
                            {!isCollapsed && <span>Skins & Loja</span>}
                        </NavLink>
                        <NavLink to="/student/inventory" title="Meu Inventário" className={navItemClass}>
                            <Briefcase size={18} className="text-emerald-500 shrink-0" />
                            {!isCollapsed && <span>Meu Inventário</span>}
                        </NavLink>
                    </div>
                )}
            </nav>

            {/* FOOTER ACTIONS */}
            <div className={cn("p-6 border-t border-white/5 bg-black/40 space-y-3 transition-all", isCollapsed && "p-2")}>
                <button 
                    onClick={() => {
                        haptics.heavy();
                        navigate(isStudentArea ? '/teacher/dashboard' : '/student/dashboard');
                    }}
                    title={isStudentArea ? 'Voltar ao Mestre' : 'Mudar Visão Aluno'}
                    className={cn(
                        "flex items-center justify-center gap-3 w-full p-4 rounded-2xl border font-black text-[9px] uppercase tracking-widest transition-all",
                        isStudentArea 
                            ? "bg-slate-900 border-white/10 text-slate-400 hover:text-white" 
                            : "bg-purple-900/20 border-purple-500/30 text-purple-400 hover:bg-purple-600 hover:text-white shadow-xl",
                        isCollapsed && "p-3"
                    )}
                >
                    <ArrowRightLeft size={14} className="shrink-0" />
                    {!isCollapsed && <span>{isStudentArea ? 'VOLTAR AO MESTRE' : 'MUDAR VISÃO ALUNO'}</span>}
                </button>

                <button 
                    onClick={signOut} 
                    title="Sair"
                    className={cn(
                        "flex items-center justify-center gap-3 w-full p-4 rounded-2xl bg-red-950/10 border border-red-500/20 text-[9px] font-black text-red-500 hover:bg-red-600 hover:text-white transition-all uppercase tracking-[0.2em]",
                        isCollapsed && "p-3"
                    )}
                >
                    <LogOut size={14} className="shrink-0" /> 
                    {!isCollapsed && <span>Sair</span>}
                </button>
            </div>
        </aside>

        <main className="flex-1 overflow-y-auto relative bg-[#02040a] p-12 custom-scrollbar">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.03),transparent)] pointer-events-none" />
            <Outlet />
            <PersonaSwitcher />
        </main>
    </div>
  );
}
