import React from 'react';
import * as RRD from 'react-router-dom';
const { NavLink, Outlet, Navigate, useNavigate } = RRD as any;
import { 
    LayoutDashboard, Users, Building2, Terminal, 
    Activity, ShieldAlert, LogOut, Cpu, Brain, Layers,
    Award, Fingerprint, Coins, ShieldCheck, Megaphone, Zap,
    History, Search, Gavel
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { GodModeBar } from '../components/admin/GodModeBar.tsx';
import { cn } from '../lib/utils.ts';
import { haptics } from '../lib/haptics.ts';

export default function AdminLayout() {
    const { user, role, signOut } = useAuth();
    const navigate = useNavigate();
    
    const isRoot = user?.email === 'serparenan@gmail.com' || role === 'super_admin' || role === 'admin';

    if (!isRoot) {
        console.error("[Security] Bloqueio Administrativo:", user?.email);
        return <Navigate to="/" replace />;
    }

    const navItemClass = ({ isActive }: { isActive: boolean }) => cn(
        "flex items-center gap-4 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all group relative overflow-hidden",
        isActive 
            ? "bg-sky-600 text-white shadow-2xl shadow-sky-900/40 translate-x-1" 
            : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
    );

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-300">
            <aside className="w-full md:w-80 bg-[#0a0f1d] border-r border-white/5 flex flex-col shrink-0 z-50 shadow-2xl">
                <div className="p-10 border-b border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-600 rounded-[20px] flex items-center justify-center text-white shadow-2xl">
                        <Cpu size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-white uppercase tracking-tighter leading-none italic">
                            Maestro <span className="text-sky-500">Admin</span>
                        </h1>
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1.5">Kernel v5.0 Master</p>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className="px-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] mb-4 mt-4">Núcleo Central</p>
                    <NavLink to="/admin" end className={navItemClass}>
                        <LayoutDashboard size={18} /> Resumo
                    </NavLink>
                    <NavLink to="/admin/explorer" className={navItemClass}>
                        <Activity size={18} /> War Room
                    </NavLink>
                    <NavLink to="/admin/tenants" className={navItemClass}>
                        <Building2 size={18} /> Tenants
                    </NavLink>
                    <NavLink to="/admin/users" className={navItemClass}>
                        <Users size={18} /> Usuários
                    </NavLink>
                    
                    <p className="px-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] mb-4 mt-8">Operações</p>
                    <NavLink to="/admin/broadcast" className={navItemClass}>
                        <Megaphone size={18} /> Broadcast
                    </NavLink>
                    <NavLink to="/admin/economy" className={navItemClass}>
                        <Coins size={18} /> Economia
                    </NavLink>
                    <NavLink to="/admin/gamification" className={navItemClass}>
                        <Zap size={18} /> Dopamina
                    </NavLink>
                    <NavLink to="/admin/orchestrator" className={navItemClass}>
                        <Layers size={18} /> Orquestrador
                    </NavLink>
                    
                    <p className="px-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] mb-4 mt-8">Segurança</p>
                    <NavLink to="/admin/audit" className={navItemClass}>
                        <History size={18} /> Auditoria
                    </NavLink>
                    <NavLink to="/admin/health" className={navItemClass}>
                        <Search size={18} /> Diagnóstico
                    </NavLink>
                </nav>

                <div className="p-6 border-t border-white/5 space-y-4 bg-black/40">
                    <div className="bg-slate-900/80 p-4 rounded-3xl border border-white/5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                            <ShieldCheck size={20} className="text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-white uppercase truncate">{user?.email}</p>
                            <p className="text-[8px] font-bold text-slate-600 uppercase">Root Authority</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => { haptics.heavy(); signOut(); navigate('/'); }} 
                        className="flex items-center gap-3 w-full px-6 py-4 text-[10px] font-black text-slate-600 hover:text-red-500 rounded-2xl transition-all uppercase tracking-[0.2em]"
                    >
                        <LogOut size={16} /> Encerrar Núcleo
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <GodModeBar />
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#020617] p-8 md:p-12 relative">
                    <div className="max-w-7xl mx-auto relative z-10">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}