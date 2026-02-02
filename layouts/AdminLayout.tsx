
import React from 'react';
import * as RRD from 'react-router-dom';
const { NavLink, Outlet, useNavigate, useLocation } = RRD as any;
import { 
    LayoutDashboard, Building2, Terminal, 
    Activity, ShieldAlert, LogOut, Cpu,
    History, Database, UserPlus, Briefcase, 
    DollarSign, Users, ArrowLeftRight, Settings,
    FileText, HeartPulse, Megaphone, GraduationCap,
    Zap, Rocket
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { cn } from '../lib/utils.ts';
import { haptics } from '../lib/haptics.ts';

interface AdminLayoutProps {
    mode: 'god' | 'business';
}

export default function AdminLayout({ mode }: AdminLayoutProps) {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const isRoot = user?.email === 'serparenan@gmail.com';
    const isGodView = location.pathname.startsWith('/system');

    const navItemClass = ({ isActive }: { isActive: boolean }) => cn(
        "flex items-center gap-4 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group",
        isActive 
            ? (isGodView ? "bg-red-600 text-white shadow-xl" : "bg-sky-600 text-white shadow-xl") 
            : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
    );

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-300">
            <aside className={cn(
                "w-full md:w-80 border-r border-white/5 flex flex-col shrink-0 z-50 shadow-2xl transition-colors duration-500",
                isGodView ? "bg-[#0c0303]" : "bg-[#0a0f1d]"
            )}>
                <div className="p-8 border-b border-white/5 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-[20px] flex items-center justify-center text-white shadow-2xl transition-all",
                            isGodView ? "bg-red-600 rotate-12 shadow-red-900/40" : "bg-sky-600 shadow-sky-900/40"
                        )}>
                            {isGodView ? <Terminal size={24} /> : <Briefcase size={24} />}
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-white uppercase tracking-tighter leading-none italic">
                                Maestro <span className={isGodView ? "text-red-500" : "text-sky-500"}>{isGodView ? "GOD" : "SaaS"}</span>
                            </h1>
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1.5">
                                {isGodView ? "System Sovereign" : "Business Intelligence"}
                            </p>
                        </div>
                    </div>

                    {isRoot && (
                        <button 
                            onClick={() => {
                                haptics.heavy();
                                navigate(isGodView ? '/admin/business' : '/system/console');
                            }}
                            className="w-full py-3 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-center gap-3 text-[9px] font-black text-slate-400 hover:text-white transition-all group"
                        >
                            <ArrowLeftRight size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                            {isGodView ? "VISÃO NEGÓCIOS" : "VISÃO SISTEMA"}
                        </button>
                    )}
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
                    {/* SEÇÃO KERNEL (SEMPRE VISÍVEL PARA GOD) */}
                    {(isGodView || isRoot) && (
                        <div className="pb-6">
                            <p className="px-6 text-[8px] font-black text-red-900 uppercase tracking-[0.5em] mb-4">Core Engine</p>
                            <NavLink to="/system/console" className={navItemClass}><Cpu size={16} /> Console</NavLink>
                            <NavLink to="/system/broadcast" className={navItemClass}><Megaphone size={16} /> Broadcast</NavLink>
                            <NavLink to="/system/audit" className={navItemClass}><History size={16} /> Audit Logs</NavLink>
                        </div>
                    )}

                    {/* SEÇÃO OPERAÇÕES */}
                    <div className="pb-6">
                        <p className="px-6 text-[8px] font-black text-slate-700 uppercase tracking-[0.5em] mb-4">Operations</p>
                        <NavLink to="/admin/business" className={navItemClass}><LayoutDashboard size={16} /> Dashboard</NavLink>
                        <NavLink to="/admin/tenants" className={navItemClass}><Building2 size={16} /> Unidades</NavLink>
                        <NavLink to="/admin/hr" className={navItemClass}><Users size={16} /> RH: Mestres</NavLink>
                    </div>

                    {/* SEÇÃO PEDAGÓGICO (VISÍVEL PARA TESTES DO GOD) */}
                    {isRoot && (
                        <div>
                            <p className="px-6 text-[8px] font-black text-emerald-900 uppercase tracking-[0.5em] mb-4">Live Lab</p>
                            <NavLink to="/teacher/classes" className={navItemClass}><GraduationCap size={16} /> Minhas Turmas</NavLink>
                            <NavLink to="/teacher/tasks" className={navItemClass}><Rocket size={16} /> Game Lab</NavLink>
                            <NavLink to="/teacher/library" className={navItemClass}><Database size={16} /> Assets</NavLink>
                        </div>
                    )}
                </nav>

                <div className="p-8 border-t border-white/5 bg-black/20">
                    <button onClick={signOut} className="flex items-center gap-3 w-full text-[10px] font-black text-slate-700 hover:text-red-500 transition-all uppercase tracking-[0.2em]">
                        <LogOut size={16} /> Terminar Sessão
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-8 md:p-12 bg-slate-950">
                <Outlet />
            </main>
        </div>
    );
}
