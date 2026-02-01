import React from 'react';
import * as RRD from 'react-router-dom';
const { NavLink, Outlet, Navigate, useNavigate } = RRD as any;
import { 
    LayoutDashboard, Users, Building2, Terminal, 
    Activity, ShieldAlert, LogOut, 
    Network, Megaphone, Coins, ShieldCheck, Zap,
    Award, Fingerprint, Box, Cpu, Brain, Layers
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { GodModeBar } from '../components/admin/GodModeBar.tsx';
import { cn } from '../lib/utils.ts';
import { haptics } from '../lib/haptics.ts';

export default function AdminLayout() {
    const { user, role, signOut } = useAuth();
    const navigate = useNavigate();
    
    // TRAVA DE SEGURANÇA ROOT: Email específico ou Role Administrativa
    const isGlobalRoot = user?.email === 'serparenan@gmail.com' || user?.email === 'admin@oliemusic.dev';
    const isAdmin = role === 'admin' || role === 'super_admin' || isGlobalRoot;

    if (!isAdmin) {
        console.error("[Maestro Security] Tentativa de acesso administrativo negada. User:", user?.email, "Role:", role);
        return <Navigate to="/" replace />;
    }

    const navItemClass = ({ isActive }: { isActive: boolean }) => cn(
        "flex items-center gap-4 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all group relative overflow-hidden",
        isActive 
            ? "bg-sky-600 text-white shadow-2xl shadow-sky-900/40 translate-x-1" 
            : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
    );

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-300 selection:bg-sky-500/30">
            {/* Sidebar de Comando */}
            <aside className="w-full md:w-80 bg-[#0a0f1d] border-r border-white/5 flex flex-col shrink-0 z-50 shadow-2xl">
                <div className="p-10 border-b border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-600 rounded-[20px] flex items-center justify-center text-white shadow-2xl relative overflow-hidden group cursor-pointer border border-sky-400/20">
                        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Cpu size={24} className="group-hover:rotate-12 transition-transform relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-white uppercase tracking-tighter leading-none italic">
                            Maestro <span className="text-sky-500">Admin</span>
                        </h1>
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1.5">Kernel v5.0 Master</p>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-10 overflow-y-auto custom-scrollbar pt-10">
                    <div className="space-y-1.5">
                        <p className="px-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] mb-4">Núcleo Central</p>
                        <NavLink to="/admin" end className={navItemClass}>
                            <LayoutDashboard size={18} /> Resumo Executivo
                        </NavLink>
                        <NavLink to="/admin/explorer" className={navItemClass}>
                            <Activity size={18} /> War Room (Kernel)
                        </NavLink>
                        <NavLink to="/admin/orchestrator" className={navItemClass}>
                            <Layers size={18} /> Orquestrador
                        </NavLink>
                    </div>

                    <div className="space-y-1.5">
                        <p className="px-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] mb-4">Inteligência</p>
                        <NavLink to="/admin/brain" className={navItemClass}>
                            <Brain size={18} /> Cérebro Neural
                        </NavLink>
                        <NavLink to="/admin/gamification" className={navItemClass}>
                            <Award size={18} /> Lab Progressão
                        </NavLink>
                    </div>

                    <div className="space-y-1.5">
                        <p className="px-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] mb-4">Governança B2B</p>
                        <NavLink to="/admin/tenants" className={navItemClass}>
                            <Building2 size={18} /> Tenants / Escolas
                        </NavLink>
                        <NavLink to="/admin/users" className={navItemClass}>
                            <Users size={18} /> Usuários Totais
                        </NavLink>
                        <NavLink to="/admin/economy" className={navItemClass}>
                            <Coins size={18} /> Economia Global
                        </NavLink>
                    </div>

                    <div className="space-y-1.5">
                        <p className="px-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] mb-4">Segurança</p>
                        <NavLink to="/admin/security" className={navItemClass}>
                            <Fingerprint size={18} /> Auditoria Master
                        </NavLink>
                        <NavLink to="/admin/broadcast" className={navItemClass}>
                            <Megaphone size={18} /> Global Broadcast
                        </NavLink>
                        <NavLink to="/admin/health" className={navItemClass}>
                            <Terminal size={18} /> System Health
                        </NavLink>
                    </div>
                </nav>

                <div className="p-6 border-t border-white/5 space-y-4 bg-black/40 backdrop-blur-md">
                    <div className="bg-slate-900/80 p-4 rounded-3xl border border-white/5 flex items-center gap-4 shadow-inner">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shadow-inner relative group">
                            <ShieldCheck size={20} className="text-emerald-500" />
                            <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-white uppercase truncate">{user?.email}</p>
                            <p className="text-[8px] font-bold text-slate-600 uppercase">Status: Root Identity</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => { haptics.heavy(); signOut(); navigate('/'); }} 
                        className="flex items-center gap-3 w-full px-6 py-4 text-[10px] font-black text-slate-600 hover:text-red-500 rounded-2xl transition-all uppercase tracking-[0.2em] hover:bg-red-500/5"
                    >
                        <LogOut size={16} /> Encerrar Núcleo
                    </button>
                </div>
            </aside>

            {/* Canvas de Conteúdo */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <GodModeBar />
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#020617] p-8 md:p-12 relative">
                    <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-sky-500/5 to-transparent pointer-events-none" />
                    <div className="max-w-7xl mx-auto relative z-10">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}