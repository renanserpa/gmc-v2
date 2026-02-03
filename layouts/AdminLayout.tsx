
import React, { useState } from 'react';
import * as RRD from 'react-router-dom';
const { NavLink, Outlet, useNavigate, useLocation } = RRD as any;
import { 
    LayoutDashboard, Building2, Terminal, 
    Activity, ShieldAlert, LogOut, Cpu,
    History, Database, UserPlus, Briefcase, 
    DollarSign, Users, ArrowLeftRight, Settings,
    FileText, HeartPulse, Megaphone, GraduationCap,
    Zap, Rocket, ChevronDown, Music, Gamepad2, Heart,
    Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { cn } from '../lib/utils.ts';
import { haptics } from '../lib/haptics.ts';

const M = (RRD as any).motion || { div: 'div' }; // Fallback simples se necessário

interface SidebarGroupProps {
    title: string;
    icon: any;
    children: React.ReactNode;
    isDev?: boolean;
}

const SidebarGroup = ({ title, icon: Icon, children, isDev }: SidebarGroupProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div className={cn("mb-2 rounded-2xl transition-all", isDev && "bg-amber-500/[0.03] border-l-2 border-amber-500/20")}>
            <button 
                onClick={() => { setIsExpanded(!isExpanded); haptics.light(); }}
                className="w-full flex items-center justify-between px-6 py-3 text-slate-500 hover:text-white transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Icon size={14} className={cn(isDev ? "text-amber-500" : "text-slate-600")} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{title}</span>
                </div>
                <ChevronDown size={12} className={cn("transition-transform duration-300", isExpanded && "rotate-180")} />
            </button>
            {isExpanded && <div className="space-y-1 pb-4 animate-in slide-in-from-top-1 duration-200">{children}</div>}
        </div>
    );
};

export default function AdminLayout({ mode }: { mode: 'god' | 'business' }) {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const isRoot = user?.email === 'serparenan@gmail.com';
    const isGodView = location.pathname.startsWith('/system');

    const navItemClass = ({ isActive }: { isActive: boolean }) => cn(
        "flex items-center gap-4 px-8 py-2.5 text-[9px] font-bold uppercase tracking-widest transition-all",
        isActive 
            ? (isGodView ? "text-red-500 border-r-2 border-red-500 bg-red-500/5" : "text-sky-400 border-r-2 border-sky-400 bg-sky-400/5") 
            : "text-slate-500 hover:text-slate-200"
    );

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-300 font-sans">
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

                <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                    {isGodView && (
                        <>
                            <div className="px-6 mb-4">
                                <p className="text-[8px] font-black text-red-900 uppercase tracking-[0.5em] mb-4">Core Infrastructure</p>
                                <NavLink to="/system/console" className={navItemClass}><Cpu size={14} /> Dashboard Kernel</NavLink>
                                <NavLink to="/system/audit" className={navItemClass}><History size={14} /> Audit Trail</NavLink>
                            </div>

                            <div className="px-2">
                                <SidebarGroup title="Lab: Professor" icon={Music} isDev>
                                    <NavLink to="/system/dev/teacher/metronome" className={navItemClass}>Metrônomo</NavLink>
                                    <NavLink to="/system/dev/teacher/tuner" className={navItemClass}>Afinador</NavLink>
                                    <NavLink to="/system/dev/teacher/planner" className={navItemClass}>Planejamento</NavLink>
                                </SidebarGroup>

                                <SidebarGroup title="Lab: Aluno" icon={Gamepad2} isDev>
                                    <NavLink to="/system/dev/student/missions" className={navItemClass}>Missões</NavLink>
                                    <NavLink to="/system/dev/student/arcade" className={navItemClass}>Arcade</NavLink>
                                </SidebarGroup>

                                <SidebarGroup title="Lab: Família" icon={Heart} isDev>
                                    <NavLink to="/system/dev/parent/insights" className={navItemClass}>Insights</NavLink>
                                    <NavLink to="/system/dev/parent/finance" className={navItemClass}>Financeiro</NavLink>
                                </SidebarGroup>

                                <SidebarGroup title="Lab: Gestão" icon={Shield} isDev>
                                    <NavLink to="/system/dev/manager/units" className={navItemClass}>Unidades</NavLink>
                                    <NavLink to="/system/dev/manager/analytics" className={navItemClass}>BI Global</NavLink>
                                </SidebarGroup>
                            </div>
                        </>
                    )}

                    {!isGodView && (
                        <div className="px-6">
                            <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.5em] mb-4">Operations</p>
                            <NavLink to="/admin/business" className={navItemClass}><LayoutDashboard size={14} /> BI Overview</NavLink>
                            <NavLink to="/admin/tenants" className={navItemClass}><Building2 size={14} /> Tenants</NavLink>
                            <NavLink to="/admin/hr" className={navItemClass}><Users size={14} /> HR Manager</NavLink>
                        </div>
                    )}
                </nav>

                <div className="p-8 border-t border-white/5 bg-black/20">
                    <button onClick={signOut} className="flex items-center gap-3 w-full text-[10px] font-black text-slate-700 hover:text-red-500 transition-all uppercase tracking-[0.2em]">
                        <LogOut size={16} /> Terminar Sessão
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-8 md:p-12 bg-slate-950 custom-scrollbar">
                <Outlet />
            </main>
        </div>
    );
}
