
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
    Shield, Target, Wand2, Search, Eye, Code2, Layers,
    Box, Globe, Microscope, Piano, Clock, Fingerprint, 
    Monitor, CreditCard, Landmark, FileCheck, Palette,
    Type, Component, Accessibility, Radio
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { cn } from '../lib/utils.ts';
import { haptics } from '../lib/haptics.ts';

interface SidebarGroupProps {
    id: string;
    title: string;
    icon: any;
    children?: React.ReactNode;
    colorClass?: string;
}

const SidebarGroup: React.FC<SidebarGroupProps> = ({ id, title, icon: Icon, children, colorClass }) => {
    const storageKey = `maestro_sidebar_group_${id}`;
    const [isExpanded, setIsExpanded] = useState(() => localStorage.getItem(storageKey) === 'true');

    const toggle = () => {
        const newState = !isExpanded;
        setIsExpanded(newState);
        localStorage.setItem(storageKey, String(newState));
        haptics.light();
    };

    return (
        <div className={cn(
            "mb-2 rounded-2xl transition-all duration-300 border border-transparent",
            isExpanded ? "bg-white/[0.02] border-white/5" : "hover:bg-white/[0.01]"
        )}>
            <button 
                onClick={toggle}
                className="w-full flex items-center justify-between px-4 py-3 text-slate-500 hover:text-white transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={cn("p-1.5 rounded-lg bg-slate-900 shadow-inner", colorClass)}>
                        <Icon size={14} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{title}</span>
                </div>
                <ChevronDown size={12} className={cn("transition-transform duration-500", isExpanded && "rotate-180")} />
            </button>
            {isExpanded && (
                <div className="space-y-0.5 pb-3 px-2 animate-in slide-in-from-top-1 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};

export default function AdminLayout({ mode }: { mode: 'god' | 'business' }) {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const isGodView = mode === 'god';

    const navItemClass = ({ isActive }: { isActive: boolean }) => cn(
        "flex items-center gap-3 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all group",
        isActive 
            ? (isGodView ? "text-cyan-400 bg-cyan-400/5 shadow-[inset_2px_0_0_#22d3ee]" : "text-sky-400 bg-sky-400/5 shadow-[inset_2px_0_0_#0ea5e9]") 
            : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
    );

    return (
        <div className={cn(
            "min-h-screen flex flex-col md:flex-row text-slate-300 font-sans transition-all duration-500",
            isGodView ? "bg-[#02040a] border-t-2 border-cyan-500" : "bg-[#020617]"
        )}>
            <aside className={cn(
                "w-full md:w-72 border-r border-white/5 flex flex-col shrink-0 z-50 shadow-2xl transition-colors duration-700",
                isGodView ? "bg-slate-950" : "bg-[#0a0f1d]"
            )}>
                {/* Brand Header */}
                <div className="p-6 border-b border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all duration-500 shadow-lg",
                            isGodView ? "bg-cyan-600 shadow-cyan-900/40" : "bg-sky-600 shadow-sky-900/40"
                        )}>
                            {isGodView ? <Terminal size={20} /> : <Briefcase size={20} />}
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-white uppercase tracking-tighter leading-none italic">
                                Maestro <span className={isGodView ? "text-cyan-400" : "text-sky-500"}>{isGodView ? "GOD" : "SaaS"}</span>
                            </h1>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className={cn("w-1 h-1 rounded-full animate-pulse", isGodView ? "bg-cyan-500" : "bg-sky-500")} />
                                <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.3em]">
                                    {isGodView ? "DEV MODE: KERNEL v7.6" : "BI: Operational Core"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            haptics.heavy();
                            navigate(isGodView ? '/admin/business' : '/system/console');
                        }}
                        className="w-full py-3 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-center gap-2 text-[8px] font-black text-slate-500 hover:text-white transition-all group"
                    >
                        <ArrowLeftRight size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                        {isGodView ? "MUDAR PARA BUSINESS" : "MUDAR PARA GOD MODE"}
                    </button>
                </div>

                {/* Clusters de Desenvolvimento (As 27 Páginas) */}
                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto custom-scrollbar">
                    
                    <SidebarGroup id="core" title="🚀 Core Engine" icon={Cpu} colorClass="text-cyan-400">
                        <NavLink to="/system/console" className={navItemClass}><LayoutDashboard size={12}/> Dashboard God</NavLink>
                        <NavLink to="/system/sql" className={navItemClass}><Code2 size={12}/> Database Lab (SQL)</NavLink>
                        <NavLink to="/system/audit" className={navItemClass}><History size={12}/> Audit Trail (CDC)</NavLink>
                        <NavLink to="/admin/architecture" className={navItemClass}><Layers size={12}/> Feature Flags</NavLink>
                    </SidebarGroup>

                    <SidebarGroup id="b2b" title="💰 B2B Manager" icon={Building2} colorClass="text-sky-500">
                        <NavLink to="/admin/tenants" className={navItemClass}><Building2 size={12}/> Unidades (Tenants)</NavLink>
                        <NavLink to="/admin/hr" className={navItemClass}><Users size={12}/> Staff RH Manager</NavLink>
                        <NavLink to="/admin/finance" className={navItemClass}><DollarSign size={12}/> Global Billing</NavLink>
                        <NavLink to="/admin/business" className={navItemClass}><Activity size={12}/> Revenue Analytics</NavLink>
                    </SidebarGroup>

                    <SidebarGroup id="professor" title="🎵 Maestro Suite" icon={Music} colorClass="text-purple-400">
                        <NavLink to="/teacher/classes" className={navItemClass}><Layers size={12}/> Minhas Turmas</NavLink>
                        <NavLink to="/system/dev/teacher/metronome" className={navItemClass}><Zap size={12}/> Metrônomo Pro</NavLink>
                        <NavLink to="/system/dev/teacher/tuner" className={navItemClass}><Activity size={12}/> Afinador Chrome</NavLink>
                        <NavLink to="/system/dev/teacher/planner" className={navItemClass}><Clock size={12}/> Lesson Planner</NavLink>
                        <NavLink to="/teacher/library" className={navItemClass}><Database size={12}/> Materials Lib</NavLink>
                    </SidebarGroup>

                    <SidebarGroup id="arcade" title="🎮 Arcade (Student)" icon={Gamepad2} colorClass="text-pink-500">
                        <NavLink to="/student/arcade" className={navItemClass}><Rocket size={12}/> Game Map Center</NavLink>
                        <NavLink to="/system/dev/student/missions" className={navItemClass}><Target size={12}/> Mission Lab</NavLink>
                        <NavLink to="/system/assets" className={navItemClass}><Wand2 size={12}/> Skins Shop</NavLink>
                        <NavLink to="/student/practice" className={navItemClass}><Music size={12}/> Practice Room</NavLink>
                    </SidebarGroup>

                    <SidebarGroup id="eco" title="👨‍👩‍👧‍👦 Ecosystem" icon={Globe} colorClass="text-emerald-400">
                        <NavLink to="/system/dev/parent/reports" className={navItemClass}><FileText size={12}/> Family Hub</NavLink>
                        <NavLink to="/system/dev/external/contracts" className={navItemClass}><Landmark size={12}/> Manager (B2B)</NavLink>
                        <NavLink to="/admin/broadcast" className={navItemClass}><Megaphone size={12}/> Broadcast Ops</NavLink>
                        <NavLink to="/admin/users" className={navItemClass}><Fingerprint size={12}/> Profile Selector</NavLink>
                        <NavLink to="/system/monitor" className={navItemClass}><Monitor size={12}/> Mirror Hub</NavLink>
                    </SidebarGroup>

                    <SidebarGroup id="design" title="🎨 UI/UX Design" icon={Palette} colorClass="text-amber-400">
                        <NavLink to="/system/dev/ui/components" className={navItemClass}><Component size={12}/> UI Library</NavLink>
                        <NavLink to="/system/dev/ui/theme" className={navItemClass}><Palette size={12}/> Theme Preview</NavLink>
                        <NavLink to="/system/dev/ui/fonts" className={navItemClass}><Type size={12}/> Font Tester</NavLink>
                        <NavLink to="/system/dev/ui/icons" className={navItemClass}><Search size={12}/> Icon Gallery</NavLink>
                        <NavLink to="/system/dev/ui/a11y" className={navItemClass}><Accessibility size={12}/> PECS/A11y</NavLink>
                    </SidebarGroup>

                </nav>

                {/* Footer Controls */}
                <div className="p-6 border-t border-white/5 bg-black/40">
                    <button onClick={signOut} className="flex items-center gap-3 w-full text-[9px] font-black text-slate-700 hover:text-red-500 transition-all uppercase tracking-[0.2em] group/out">
                        <div className="p-2 rounded-lg bg-slate-900 group-hover/out:bg-red-500/10 transition-colors">
                            <LogOut size={14} />
                        </div>
                        Sair do Kernel
                    </button>
                </div>
            </aside>

            {/* Content Mirror */}
            <main className="flex-1 overflow-y-auto p-8 bg-[#02040a] custom-scrollbar relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.02),transparent)] pointer-events-none" />
                <Outlet />
            </main>
        </div>
    );
}
