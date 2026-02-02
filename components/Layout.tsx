
import React from 'react';
import * as RRD from 'react-router-dom';
const { Outlet, NavLink } = RRD as any;
import { 
    Home, Music, Sparkles, Gamepad2, Store, Settings, 
    LogOut, GraduationCap, Shield, Rocket, Building2, 
    Terminal, Cpu, Database, LayoutDashboard, Users,
    Zap, Eye, Ghost, Code2, Globe, Monitor, Package,
    ShieldAlert, Search
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
            className="fixed top-0 left-0 right-0 h-12 bg-red-600 z-[1000] flex items-center justify-between px-6 shadow-2xl border-b border-red-400/30"
        >
            <div className="flex items-center gap-4 text-white font-black text-[10px] uppercase tracking-widest">
                <div className="bg-white/20 p-1.5 rounded-lg animate-pulse">
                    <Ghost size={16} />
                </div>
                Modo Fantasma Ativo: <span className="text-red-100">{ghostSession.targetName}</span> ({ghostSession.targetRole})
            </div>
            <button 
                onClick={stopGhosting}
                className="bg-white text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase hover:bg-slate-100 transition-all flex items-center gap-2 shadow-lg"
            >
                Retornar ao Soberano <LogOut size={12} />
            </button>
        </M.div>
    );
};

export default function Layout() {
  const { settings } = useAccessibility();
  const { role: authRole, signOut, user } = useAuth();
  const { impersonatedRole, ghostSession } = useAdmin();
  const isKids = settings.uiMode === 'kids';

  const isGodMode = authRole === 'god_mode' || user?.email === 'serparenan@gmail.com';
  const activeRole = ghostSession?.targetRole || impersonatedRole || authRole || 'student';

  const getNavLinks = () => {
    // LINKS GOD MODE (KITCHEN SINK)
    const godLinks = [
        { path: '/system/console', label: 'System Console', icon: Cpu, color: 'text-red-500' },
        { path: '/system/monitor', label: 'Class Monitor', icon: Monitor, color: 'text-sky-400' },
        { path: '/system/assets', label: 'Asset Factory', icon: Package, color: 'text-amber-500' },
        { path: '/system/ghosting', label: 'Ghosting Lab', icon: Ghost, color: 'text-purple-500' },
        { path: '/system/sql', label: 'SQL Lab', icon: Code2, color: 'text-emerald-500' },
    ];

    // LINKS SAAS BUSINESS
    const businessLinks = [
        { path: '/admin/business', label: 'SaaS BI', icon: LayoutDashboard, color: 'text-orange-400' },
        { path: '/admin/tenants', label: 'Unidades', icon: Building2, color: 'text-sky-500' },
    ];

    // LINKS PEDAGÓGICOS
    const teacherLinks = [
        { path: '/teacher/classes', label: 'Maestro', icon: GraduationCap, color: 'text-purple-400' },
        { path: '/teacher/tasks', label: 'Mural Missões', icon: Rocket, color: 'text-pink-400' },
    ];

    // LINKS ALUNO
    const studentLinks = [
        { path: '/student/dashboard', label: 'Jornada', icon: Music, color: 'text-sky-400' },
        { path: '/student/arcade', label: 'Arcade', icon: Gamepad2, color: 'text-amber-400' },
    ];

    // LÓGICA DE EXIBIÇÃO UNIFICADA (GOD MODE VÊ TUDO)
    if (isGodMode && !ghostSession) {
        return [...godLinks, ...businessLinks, ...teacherLinks, ...studentLinks];
    }
    
    // VISÃO DE PERSONIFICAÇÃO OU ROLE COMUM
    if (activeRole === 'student') return studentLinks;
    if (activeRole === 'professor' || activeRole === 'teacher_owner') return teacherLinks;
    if (activeRole === 'super_admin' || activeRole === 'admin') return [...godLinks, ...businessLinks];
    
    return studentLinks;
  };

  const navLinks = getNavLinks();

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
                "flex gap-1.5 overflow-y-auto custom-scrollbar p-3",
                isKids ? "flex-row md:flex-col w-full h-full justify-around" : "flex-col w-full h-full"
            )}>
                {navLinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={() => uiSounds.playClick()}
                        className={({ isActive }: any) => cn(
                            "relative group transition-all duration-300 flex items-center outline-none",
                            isKids 
                                ? "justify-center p-0 rounded-[32px] aspect-square w-16 h-16 md:w-20 md:h-20" 
                                : "px-4 py-3 rounded-xl gap-4 w-full text-[10px] font-black uppercase tracking-widest",
                            isActive 
                                ? (isKids ? "bg-white text-slate-900 shadow-2xl scale-110" : "bg-white/10 text-white border border-white/5") 
                                : "text-slate-500 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <link.icon size={isKids ? 36 : 18} className={cn(!isKids && "transition-colors", link.color)} />
                        {!isKids && <span>{link.label}</span>}
                    </NavLink>
                ))}

                <button 
                    onClick={signOut}
                    className={cn(
                        "transition-all flex items-center justify-center group mt-auto",
                        isKids 
                            ? "w-14 h-14 rounded-full bg-red-500/10 text-red-500"
                            : "px-4 py-3 w-full gap-4 text-slate-700 hover:text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest"
                    )}
                >
                    <LogOut size={isKids ? 24 : 18} />
                    {!isKids && <span>Terminar</span>}
                </button>
            </nav>
        </aside>

        <main className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden relative transition-all bg-slate-950",
            ghostSession && "pt-12",
            isKids ? "p-4 md:p-8 rounded-[48px] m-2 border-4 border-slate-900" : "p-8"
        )}>
            <Outlet />
        </main>
    </div>
  );
}
