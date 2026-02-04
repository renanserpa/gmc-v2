
import React from 'react';
import * as RRD from 'react-router-dom';
const { Outlet, NavLink } = RRD as any;
import { 
    Building2, Users, LayoutDashboard, 
    LogOut, Presentation, ListMusic, Radio,
    Zap, Shield, Terminal
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { PersonaSwitcher } from './admin/PersonaSwitcher.tsx';
import { cn } from '../lib/utils.ts';
import { motion } from 'framer-motion';

const M = motion as any;

export default function Layout() {
  const { signOut, actingRole, user } = useAuth();
  
  const navItemClass = ({ isActive }: any) => cn(
    "flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-l-4",
    isActive 
        ? "text-cyan-400 bg-cyan-400/5 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.1)]" 
        : "text-slate-600 border-transparent hover:text-slate-300 hover:bg-white/[0.02]"
  );

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100 flex overflow-hidden font-sans">
        {/* SIDEBAR HARD RESET - COR PRETO ABSOLUTO */}
        <aside className="w-80 border-r border-white/5 flex flex-col z-50 shadow-2xl bg-[#050505] relative">
            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-cyan-500/50 via-transparent to-purple-500/50" />
            
            <div className="p-8 border-b border-white/5 bg-black/40">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black italic shadow-[0_0_15px_#0ea5e9] bg-sky-600 animate-pulse">M</div>
                    <span className="font-black text-xl tracking-tighter uppercase italic text-white">Maestro <span className="text-sky-500">Suite</span></span>
                </div>
                {/* TÍTULO DE VALIDAÇÃO NEON CYAN */}
                <div className="py-2 px-4 rounded-lg bg-cyan-950/30 border border-cyan-500/30">
                    <p className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em] animate-pulse drop-shadow-[0_0_8px_#22d3ee]">
                        GCM MAESTRO - MODO SPRINT 01
                    </p>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto custom-scrollbar py-6">
                <div className="space-y-1">
                    <p className="px-8 text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] mb-4">Command Center</p>
                    <NavLink to="/teacher/dashboard" className={navItemClass}><LayoutDashboard size={18}/> Dashboard</NavLink>
                    <NavLink to="/admin/school" className={navItemClass}><Building2 size={18}/> Minha Unidade</NavLink>
                    <NavLink to="/teacher/classes" className={navItemClass}><ListMusic size={18}/> Grade Horária</NavLink>
                    <NavLink to="/teacher/students" className={navItemClass}><Users size={18}/> Lista de Alunos</NavLink>
                    <NavLink to="/teacher/orchestrator" className={navItemClass}><Radio size={18} className="text-rose-500"/> Orchestrator Live</NavLink>
                    <NavLink to="/teacher/whiteboard" className={navItemClass}><Presentation size={18}/> Lousa Digital</NavLink>
                </div>
            </nav>

            <div className="p-8 border-t border-white/5 bg-black/40">
                <div className="flex items-center gap-4 mb-6 px-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sessão: {user?.email?.split('@')[0]}</span>
                </div>
                <button onClick={signOut} className="flex items-center gap-3 w-full p-4 rounded-2xl bg-red-950/10 border border-red-500/20 text-[9px] font-black text-red-500 hover:bg-red-600 hover:text-white transition-all uppercase tracking-[0.2em]">
                    <LogOut size={14} /> Encerrar Kernel
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
