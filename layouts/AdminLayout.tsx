import React, { useState } from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Users, Building2, Terminal, 
    Activity, Database, ShieldAlert, LogOut, 
    ChevronDown, ChevronRight, Settings, Box, Network
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GodModeBar } from '../components/admin/GodModeBar';
import { cn } from '../lib/utils';
import { haptics } from '../lib/haptics';

export default function AdminLayout() {
    // @ts-ignore - FIX: Property 'role' does not exist on type 'AuthContextType'. Added to AuthContext.
    const { user, role, signOut } = useAuth();
    const navigate = useNavigate();
    const [engExpanded, setEngExpanded] = useState(true);

    const isGod = user?.email === 'admin@oliemusic.dev';
    const isAdmin = role === 'admin' || isGod;

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    const navItemClass = ({ isActive }: { isActive: boolean }) => cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
        isActive 
            ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20" 
            : "text-slate-400 hover:text-white hover:bg-white/5"
    );

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-300 selection:bg-purple-500/30">
            {/* Sidebar */}
            <aside className="w-full md:w-72 bg-[#0a0f1d] border-r border-white/5 flex flex-col shrink-0">
                <div className="p-8 border-b border-white/5 flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-900/20">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-white uppercase tracking-tighter">Maestro Admin</h1>
                        <p className="text-[9px] font-bold text-purple-500 uppercase tracking-widest">Global Control</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-1">
                        <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">Monitoramento</p>
                        <NavLink to="/admin" end className={navItemClass}>
                            <LayoutDashboard size={18} /> Dashboard
                        </NavLink>
                        <NavLink to="/admin/architecture" className={navItemClass}>
                            <Network size={18} /> Architecture Board
                        </NavLink>
                    </div>

                    <div className="space-y-1">
                        <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">Governança</p>
                        <NavLink to="/admin/users" className={navItemClass}>
                            <Users size={18} /> Gestão de Usuários
                        </NavLink>
                        <NavLink to="/admin/tenants" className={navItemClass}>
                            <Building2 size={18} /> Escolas / Tenants
                        </NavLink>
                    </div>

                    <div className="space-y-1">
                        <button 
                            onClick={() => setEngExpanded(!engExpanded)}
                            className="w-full flex items-center justify-between px-4 py-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-slate-400 transition-colors"
                        >
                            <span>Engenharia Core</span>
                            {engExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </button>
                        
                        {engExpanded && (
                            <div className="space-y-1 mt-2">
                                <NavLink to="/admin/db" className={navItemClass}>
                                    <Database size={16} /> Schema Console
                                </NavLink>
                                <NavLink to="/admin/health" className={navItemClass}>
                                    <Activity size={16} /> Health Monitor
                                </NavLink>
                                <NavLink to="/admin/logs" className={navItemClass}>
                                    <Terminal size={16} /> Kernel Logs
                                </NavLink>
                            </div>
                        )}
                    </div>
                </nav>

                <div className="p-4 border-t border-white/5 space-y-4">
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-white uppercase truncate">{user?.email}</p>
                            <p className="text-[8px] font-bold text-slate-600 uppercase">SuperAdmin</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => { signOut(); navigate('/'); }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-xs font-black text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest"
                    >
                        <LogOut size={16} /> Finalizar Sessão
                    </button>
                </div>
            </aside>

            {/* Main Surface */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {isGod && <GodModeBar />}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#020617] p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}