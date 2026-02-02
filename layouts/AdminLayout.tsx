
import React from 'react';
import * as RRD from 'react-router-dom';
const { NavLink, Outlet, useNavigate } = RRD as any;
import { 
    LayoutDashboard, Building2, Terminal, 
    Activity, ShieldAlert, LogOut, Cpu,
    History, Database, UserPlus, Briefcase, 
    DollarSign, Users, ArrowLeftRight, Settings
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
    
    const isRoot = user?.email === 'serparenan@gmail.com';
    const isGod = mode === 'god';

    const navItemClass = ({ isActive }: { isActive: boolean }) => cn(
        "flex items-center gap-4 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all group",
        isActive 
            ? (isGod ? "bg-red-600 text-white shadow-xl" : "bg-sky-600 text-white shadow-xl") 
            : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
    );

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-300">
            <aside className={cn(
                "w-full md:w-80 border-r border-white/5 flex flex-col shrink-0 z-50 shadow-2xl transition-colors duration-500",
                isGod ? "bg-[#0c0303]" : "bg-[#0a0f1d]"
            )}>
                <div className="p-8 border-b border-white/5 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-[20px] flex items-center justify-center text-white shadow-2xl transition-all",
                            isGod ? "bg-red-600 rotate-12" : "bg-sky-600"
                        )}>
                            {isGod ? <Terminal size={24} /> : <Briefcase size={24} />}
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-white uppercase tracking-tighter leading-none italic">
                                Maestro <span className={isGod ? "text-red-500" : "text-sky-500"}>{isGod ? "GOD" : "SaaS"}</span>
                            </h1>
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1.5">
                                {isGod ? "Kernel Dev Mode" : "Business Manager"}
                            </p>
                        </div>
                    </div>

                    {isRoot && (
                        <button 
                            onClick={() => {
                                haptics.heavy();
                                navigate(isGod ? '/admin/business' : '/system/console');
                            }}
                            className="w-full py-3 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-center gap-3 text-[9px] font-black text-slate-400 hover:text-white transition-all group"
                        >
                            <ArrowLeftRight size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                            {isGod ? "MUDAR PARA BUSINESS" : "MUDAR PARA GOD MODE"}
                        </button>
                    )}
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    {isGod ? (
                        <>
                            <p className="px-6 text-[9px] font-black text-red-900 uppercase tracking-[0.5em] mb-4">Kernel & Infra</p>
                            <NavLink to="/system/console" className={navItemClass}><Cpu size={18} /> Dashboard Infra</NavLink>
                            <NavLink to="/system/staff" className={navItemClass}><UserPlus size={18} /> Staff Creator</NavLink>
                            <NavLink to="/system/audit" className={navItemClass}><History size={18} /> Audit Logs</NavLink>
                            <NavLink to="/system/explorer" className={navItemClass}><Database size={18} /> RLS Explorer</NavLink>
                        </>
                    ) : (
                        <>
                            <p className="px-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] mb-4">Negócios</p>
                            <NavLink to="/admin/business" className={navItemClass}><LayoutDashboard size={18} /> Dashboard</NavLink>
                            <NavLink to="/admin/tenants" className={navItemClass}><Building2 size={18} /> Unidades (Schools)</NavLink>
                            <NavLink to="/admin/hr" className={navItemClass}><Users size={18} /> RH: Professores</NavLink>
                            <NavLink to="/admin/finance" className={navItemClass}><DollarSign size={18} /> Financeiro</NavLink>
                        </>
                    )}
                </nav>

                <div className="p-8 border-t border-white/5 bg-black/20">
                    <button onClick={signOut} className="flex items-center gap-3 w-full text-[10px] font-black text-slate-600 hover:text-red-500 transition-all uppercase tracking-[0.2em]">
                        <LogOut size={16} /> Encerrar Sessão
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-8 md:p-12 bg-slate-950">
                <Outlet />
            </main>
        </div>
    );
}
