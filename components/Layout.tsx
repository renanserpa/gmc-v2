import React from 'react';
import * as RRD from 'react-router-dom';
const { Outlet, NavLink, useLocation } = RRD as any;
import { Home, Music, Sparkles, Gamepad2, Store, Settings, LogOut, GraduationCap, Shield, Rocket } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useAdmin } from '../contexts/AdminContext.tsx';
import { cn } from '../lib/utils.ts';
import { motion } from 'framer-motion';
import { uiSounds } from '../lib/uiSounds.ts';

const M = motion as any;

export default function Layout() {
  const { settings } = useAccessibility();
  const { role: authRole, signOut } = useAuth();
  const { impersonatedRole } = useAdmin();
  const location = useLocation();
  const isKids = settings.uiMode === 'kids';

  // PRIORIDADE: Role Impersonada (Admin) > Role Autenticada
  const activeRole = impersonatedRole || authRole || 'student';

  const getNavLinks = (currentRole: string) => {
    if (currentRole === 'student') {
        return [
            { path: '/student/arcade', label: 'Jogar', icon: Gamepad2, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { path: '/student/dashboard', label: 'Jornada', icon: Home, color: 'text-sky-400', bg: 'bg-sky-500/10' },
            { path: '/student/practice', label: 'Tocar', icon: Music, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { path: '/student/tasks', label: 'Missões', icon: Rocket, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { path: '/student/library', label: 'Aprender', icon: Store, color: 'text-pink-400', bg: 'bg-pink-500/10' },
        ];
    }
    
    if (currentRole === 'professor') {
        return [
            { path: '/teacher/classes', label: 'Painel', icon: Home, color: 'text-sky-400', bg: 'bg-sky-500/10' },
            { path: '/teacher/classroom', label: 'Sala de Aula', icon: GraduationCap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { path: '/teacher/tasks', label: 'Missões', icon: Rocket, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { path: '/teacher/library', label: 'Biblioteca', icon: Store, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ];
    }

    if (currentRole === 'guardian') {
        return [
            { path: '/guardian/insights', label: 'Visão Geral', icon: Shield, color: 'text-green-400', bg: 'bg-green-500/10' }
        ];
    }

    return [
        { path: '/admin', label: 'Admin', icon: Settings, color: 'text-red-400', bg: 'bg-red-500/10' }
    ];
  };

  const navLinks = getNavLinks(activeRole);

  return (
    <div className={cn("min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden", isKids ? "flex-col-reverse md:flex-row" : "flex-col md:flex-row")}>
        
        <aside className={cn(
            "z-50 flex shrink-0 transition-all duration-300 border-slate-800 bg-slate-950/95 backdrop-blur-xl",
            isKids 
                ? "w-full h-24 md:w-32 md:h-screen border-t md:border-r md:border-t-0 justify-center items-center p-2" 
                : "w-full md:w-64 md:h-screen flex-col border-b md:border-r md:border-b-0"
        )}>
            
            {!isKids && (
                <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
                    <div className="w-8 h-8 bg-gradient-to-tr from-sky-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
                        OM
                    </div>
                    <span className="font-black text-lg tracking-tight text-white uppercase">Maestro</span>
                    {impersonatedRole && (
                      <div className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Impersonation Active" />
                    )}
                </div>
            )}

            <nav className={cn(
                "flex gap-2 overflow-x-auto no-scrollbar",
                isKids 
                    ? "flex-row md:flex-col w-full h-full justify-around md:justify-center items-center px-2" 
                    : "flex-row md:flex-col p-4 w-full h-full"
            )}>
                {navLinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={() => uiSounds.playClick()}
                        className={({ isActive }) => cn(
                            "relative group transition-all duration-300 flex items-center outline-none",
                            isKids 
                                ? "justify-center p-0 rounded-[32px] aspect-square w-16 h-16 md:w-20 md:h-20" 
                                : "px-4 py-3 rounded-xl gap-3 w-full",
                            isActive 
                                ? (isKids ? "bg-white text-slate-900 shadow-[0_0_30px_rgba(255,255,255,0.3)] scale-110 -translate-y-2 md:translate-y-0 md:translate-x-2" : "bg-slate-800 text-white shadow-lg") 
                                : "text-slate-500 hover:text-white hover:bg-white/5"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <M.div 
                                    animate={isActive && isKids ? { rotate: [0, -10, 10, 0], scale: 1.1 } : {}}
                                    transition={{ duration: 0.5 }}
                                    className={cn("relative z-10", isKids && isActive ? "text-slate-900" : link.color)}
                                >
                                    <link.icon size={isKids ? 36 : 20} strokeWidth={isKids ? 2.5 : 2} />
                                </M.div>
                                
                                {!isKids && (
                                    <span className="text-sm font-bold tracking-wide">{link.label}</span>
                                )}

                                {isKids && isActive && (
                                    <M.div 
                                        layoutId="kids-nav-dot"
                                        className="absolute -bottom-2 md:bottom-auto md:-left-2 w-1.5 h-1.5 rounded-full bg-sky-400"
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}

                {!isKids && <div className="flex-1" />}

                <button 
                    onClick={signOut}
                    className={cn(
                        "transition-all flex items-center justify-center group",
                        isKids 
                            ? "w-12 h-12 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
                            : "mt-auto px-4 py-3 w-full gap-3 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl"
                    )}
                    title="Sair"
                >
                    <LogOut size={isKids ? 24 : 20} />
                    {!isKids && <span className="text-sm font-bold">Sair</span>}
                </button>
            </nav>
        </aside>

        <main className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden relative transition-all bg-slate-950",
            isKids ? "p-4 md:p-8 rounded-[48px] m-2 border-4 border-slate-900 shadow-inner" : "p-6"
        )}>
            <Outlet />
        </main>
    </div>
  );
}