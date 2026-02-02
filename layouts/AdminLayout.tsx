
import React from 'react';
import * as RRD from 'react-router-dom';
const { NavLink, Outlet, Navigate, useNavigate } = RRD as any;
import { 
    LayoutDashboard, Users, Building2, Terminal, 
    Activity, ShieldAlert, LogOut, Cpu, Settings,
    History, Search, Database, GraduationCap, Zap,
    FileCode, HardDrive
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { GodModeBar } from '../components/admin/GodModeBar.tsx';
import { SchoolSwitcher } from '../components/layout/SchoolSwitcher.tsx';
import { cn } from '../lib/utils.ts';
import { haptics } from '../lib/haptics.ts';

export default function AdminLayout() {
    const { user, role, signOut } = useAuth();
    const navigate = useNavigate();
    
    const isRoot = user?.email === 'serparenan@gmail.com' || role === 'super_admin';

    if (!isRoot) return <Navigate to="/" replace />;

    const navItemClass = ({ isActive }: { isActive: boolean }) => cn(
        "flex items-center gap-4 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all group relative overflow-hidden",
        isActive 
            ? "bg-sky-600 text-white shadow-2xl shadow-sky-900/40 translate-x-1" 
            : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
    );

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-300">
            <aside className="w-full md:w-80 bg-[#0a0f1d] border-r border-white/5 flex flex-col shrink-0 z-50 shadow-2xl">
                <div className="p-8 border-b border-white/5 space-y-6">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/admin')}>
                        <div className="w-12 h-12 bg-sky-600 rounded-[20px] flex items-center justify-center text-white shadow-2xl">
                            <Cpu size={24} />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-white uppercase tracking-tighter leading-none italic">
                                Maestro <span className="text-sky-500">Kernel</span>
                            </h1>
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1.5">Root Access v6.0</p>
                        </div>
                    </div>
                    <SchoolSwitcher />
                </div>

                <nav className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
                    {/* MONITORAMENTO */}
                    <section className="space-y-1">
                        <p className="px-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] mb-4">Monitoramento</p>
                        <NavLink to="/admin" end className={navItemClass}>
                            <Activity size={18} /> Telemetria Core
                        </NavLink>
                        <NavLink to="/admin/health" className={navItemClass}>
                            <ShieldAlert size={18} /> System Health
                        </NavLink>
                    </section>

                    {/* ECOSSISTEMA */}
                    <section className="space-y-1">
                        <p className="px-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] mb-4">Ecossistema</p>
                        <NavLink to="/admin/tenants" className={navItemClass}>
                            <Building2 size={18} /> Unidades (Tenants)
                        </NavLink>
                        <NavLink to="/admin/teachers" className={navItemClass}>
                            <GraduationCap size={18} /> Licenciados
                        </NavLink>
                        <NavLink to="/admin/users" className={navItemClass}>
                            <Users size={18} /> Diretório Neural
                        </NavLink>
                     section>

                    {/* DEV TOOLS */}
                    <section className="space-y-1">
                        <p className="px-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] mb-4">Dev Tools</p>
                        <NavLink to="/admin/explorer" className={navItemClass}>
                            <Database size={18} /> Explorer RLS
                        </NavLink>
                        <NavLink to="/admin/audit" className={navItemClass}>
                            <History size={18} /> Audit Logs
                        </NavLink>
                        <NavLink to="/admin/orchestrator" className={navItemClass}>
                            <Settings size={18} /> Config Globais
                        </NavLink>
                    </section>
                </nav>

                <div className="p-8 border-t border-white/5">
                    <button 
                        onClick={() => { haptics.heavy(); signOut(); navigate('/'); }} 
                        className="flex items-center gap-3 w-full text-[10px] font-black text-slate-600 hover:text-red-500 transition-all uppercase tracking-[0.2em]"
                    >
                        <LogOut size={16} /> Encerrar Núcleo
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <GodModeBar />
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#020617] p-8 md:p-12">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
