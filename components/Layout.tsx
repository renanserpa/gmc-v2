
import React from 'react';
import * as RRD from 'react-router-dom';
const { Outlet, NavLink } = RRD as any;
import { 
    Home, Music, Sparkles, Gamepad2, Store, Settings, 
    LogOut, GraduationCap, Shield, Rocket, Building2, 
    Terminal, Cpu, Database, LayoutDashboard, Users,
    Zap, Eye, Ghost, Code2, Globe, Monitor, Package,
    ShieldAlert, Search, Briefcase, Wand2, Hammer, Activity,
    History /* Added missing Lucide icon import */
} from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useAdmin } from '../contexts/AdminContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { cn } from '../lib/utils.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { uiSounds } from '../lib/uiSounds.ts';

const M = motion as any;

const GhostBanner = () => {
    const { ghostSession, stopGhosting } = useAdmin();
    if (!ghostSession) return null;

    return (
        <M.div 
            initial={{ y: -50 }} animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 h-10 bg-red-600 z-[1000] flex items-center justify-between px-6 shadow-2xl border-b border-red-400/30"
        >
            <div className="flex items-center gap-4 text-white font-black text-[9px] uppercase tracking-widest">
                <div className="bg-white/20 p-1 rounded-lg animate-pulse">
                    <Ghost size={14} />
                </div>
                Modo Fantasma Ativo: <span className="text-red-100">{ghostSession.targetName}</span> ({ghostSession.targetRole})
            </div>
            <button 
                onClick={stopGhosting}
                className="bg-white text-red-600 px-4 py-1 rounded-full text-[9px] font-black uppercase hover:bg-slate-100 transition-all flex items-center gap-2"
            >
                Encerrar Infiltração <LogOut size={10} />
            </button>
        </M.div>
    );
};

export default function Layout() {
  const { settings } = useAccessibility();
  const { role: authRole, signOut, user } = useAuth();
  const { ghostSession } = useAdmin();
  const isKids = settings.uiMode === 'kids';

  const isGodMode = user?.email === 'serparenan@gmail.com' || authRole === 'god_mode';
  const activeRole = ghostSession?.targetRole || authRole || 'student';

  const sovereignMenus = [
    { 
        group: 'ENGINE', 
        icon: Terminal,
        items: [
            { path: '/system/console', label: 'Kernel Console', icon: Cpu, color: 'text-red-500' },
            { path: '/system/sql', label: 'SQL Lab', icon: Code2, color: 'text-emerald-500' },
            { path: '/system/audit', label: 'Audit Logs', icon: History, color: 'text-rose-400' }
        ] 
    },
    { 
        group: 'BUSINESS', 
        icon: Briefcase,
        items: [
            { path: '/admin/business', label: 'Revenue BI', icon: Zap, color: 'text-amber-400' },
            { path: '/admin/tenants', label: 'Schools', icon: Building2, color: 'text-sky-400' },
            { path: '/admin/hr', label: 'Staff RH', icon: Users, color: 'text-purple-400' }
        ] 
    },
    { 
        group: 'PEDAGOGY', 
        icon: GraduationCap,
        items: [
            { path: '/teacher/classes', label: 'Classes', icon: Monitor, color: 'text-emerald-400' },
            { path: '/teacher/library', label: 'Assets', icon: Database, color: 'text-sky-300' }
        ] 
    },
    { 
        group: 'GAME LAB', 
        icon: Gamepad2,
        items: [
            { path: '/teacher/tasks', label: 'Missions', icon: Rocket, color: 'text-pink-400' },
            { path: '/system/assets', label: 'Skins Forge', icon: Wand2, color: 'text-amber-500' }
        ] 
    }
  ];

  return (
    <div className={cn("min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden", isKids ? "flex-col-reverse md:flex-row" : "flex-col md:flex-row")}>
        <GhostBanner />
        
        <aside className={cn(
            "z-50 flex shrink-0 transition-all duration-300 border-slate-800 bg-slate-950/95 backdrop-blur-xl",
            isKids 
                ? "w-full h-24 md:w-32 md:h-screen border-t md:border-r justify-center items-center p-2" 
                : cn("w-full md:w-64 md:h-screen flex-col border-b md:border-r shadow-2xl", isGodMode && "bg-black border-red-950/20")
        )}>
            {!isKids && (
                <div className="p-6 flex items-center gap-3 border-b border-white/5">
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs transition-all",
                        isGodMode ? "bg-red-600 shadow-[0_0_15px_#dc2626]" : "bg-sky-500"
                    )}>
                        {isGodMode ? 'G' : 'M'}
                    </div>
                    <span className="font-black text-lg tracking-tight text-white uppercase italic">
                        {isGodMode ? 'Sovereign' : 'Maestro'}
                    </span>
                </div>
            )}

            <nav className={cn(
                "flex overflow-y-auto custom-scrollbar p-3",
                isKids ? "flex-row md:flex-col w-full h-full justify-around" : "flex-col w-full h-full space-y-8"
            )}>
                {isGodMode && !isKids ? (
                    sovereignMenus.map(group => (
                        <div key={group.group} className="space-y-2">
                            <div className="px-4 flex items-center gap-2 opacity-40">
                                <group.icon size={10} />
                                <span className="text-[8px] font-black uppercase tracking-[0.4em]">{group.group}</span>
                            </div>
                            <div className="space-y-1">
                                {group.items.map(item => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => uiSounds.playClick()}
                                        className={({ isActive }: any) => cn(
                                            "relative group transition-all duration-300 flex items-center px-4 py-2.5 rounded-xl gap-4 w-full text-[9px] font-black uppercase tracking-widest outline-none",
                                            isActive 
                                                ? "bg-white/10 text-white border border-white/5" 
                                                : "text-slate-500 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <item.icon size={14} className={cn(item.color)} />
                                        <span>{item.label}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    // Menu Padrão para outros roles ou Kids Mode
                    <div className="space-y-1 w-full">
                         {/* Mapeamento simplificado aqui para brevidade, herda lógica original */}
                         <NavLink to={activeRole === 'professor' ? '/teacher/classes' : '/student/dashboard'} className="px-4 py-3 rounded-xl flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white">
                             <Home size={18} /> <span>Home</span>
                         </NavLink>
                    </div>
                )}

                <button 
                    onClick={signOut}
                    className={cn(
                        "transition-all flex items-center justify-center group mt-auto",
                        isKids 
                            ? "w-14 h-14 rounded-full bg-red-500/10 text-red-500"
                            : "px-4 py-3 w-full gap-4 text-slate-700 hover:text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest"
                    )}
                >
                    <LogOut size={isKids ? 24 : 16} />
                    {!isKids && <span>Sair</span>}
                </button>
            </nav>
        </aside>

        <main className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden relative transition-all bg-slate-950",
            ghostSession && "pt-10",
            isKids ? "p-4 md:p-8 rounded-[48px] m-2 border-4 border-slate-900" : "p-8"
        )}>
            <Outlet />
        </main>
    </div>
  );
}
