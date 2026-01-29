
import React from 'react';
// FIX: Using any to bypass react-router-dom export errors
import * as RRD from 'react-router-dom';
const { Outlet, NavLink, useLocation } = RRD as any;
import { Home, Music, Sparkles, Gamepad2, Store, Settings, LogOut, GraduationCap, Shield } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { cn } from '../lib/utils.ts';
import { motion } from 'framer-motion';
import { uiSounds } from '../lib/uiSounds.ts';

// FIX: Casting motion components to any to bypass property errors
const M = motion as any;

/**
 * Main application layout that adapts based on user role and accessibility settings (Kids Mode).
 */
export default function Layout() {
  const { settings } = useAccessibility();
  const { role, signOut } = useAuth();
  const location = useLocation();
  const isKids = settings.uiMode === 'kids';

  const getNavLinks = (currentRole: string) => {
    // Configuração específica para Alunos (inclui Modo Kids)
    if (currentRole === 'student') {
        return [
            { path: '/student', label: 'Início', icon: Home, color: 'text-sky-400', bg: 'bg-sky-500/10' },
            { path: '/student/practice', label: 'Tocar', icon: Music, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { path: '/student/studio', label: 'Criar', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { path: '/student/arcade', label: 'Jogar', icon: Gamepad2, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { path: '/student/library', label: 'Aprender', icon: Store, color: 'text-pink-400', bg: 'bg-pink-500/10' },
        ];
    }
    
    // Configuração para Professor
    if (currentRole === 'professor') {
        return [
            { path: '/professor', label: 'Painel', icon: Home, color: 'text-sky-400', bg: 'bg-sky-500/10' },
            { path: '/professor/classroom', label: 'Sala de Aula', icon: GraduationCap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { path: '/professor/library', label: 'Biblioteca', icon: Store, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { path: '/professor/settings', label: 'Configurações', icon: Settings, color: 'text-slate-400', bg: 'bg-slate-500/10' },
        ];
    }

    // Configuração para Guardião
    if (currentRole === 'guardian') {
        return [
            { path: '/guardian', label: 'Visão Geral', icon: Shield, color: 'text-green-400', bg: 'bg-green-500/10' }
        ];
    }

    // Fallback Admin
    return [
        { path: '/admin', label: 'Admin', icon: Settings, color: 'text-red-400', bg: 'bg-red-500/10' }
    ];
  };

  const navLinks = getNavLinks(role || 'student');

  return (
    <div className={cn("min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden", isKids ? "flex-col-reverse md:flex-row" : "flex-col md:flex-row")}>
        
        {/* Navigation Sidebar / Bottom Bar */}
        <aside className={cn(
            "z-50 flex shrink-0 transition-all duration-300 border-slate-800 bg-slate-950/95 backdrop-blur-xl",
            isKids 
                ? "w-full h-24 md:w-32 md:h-screen border-t md:border-r md:border-t-0 justify-center items-center p-2" 
                : "w-full md:w-64 md:h-screen flex-col border-b md:border-r md:border-b-0"
        )}>
            
            {/* Logo Area (Hidden in Kids Mobile to save space, or simplified) */}
            {!isKids && (
                <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
                    <div className="w-8 h-8 bg-gradient-to-tr from-sky-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
                        OM
                    </div>
                    <span className="font-black text-lg tracking-tight text-white uppercase">Maestro</span>
                </div>
            )}

            {/* Links Container */}
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

                                {/* Kids Mode Active Indicator Dot */}
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

                {/* Spacer for non-kids */}
                {!isKids && <div className="flex-1" />}

                {/* Logout Button */}
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

        {/* Main Content Area */}
        <main className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden relative transition-all bg-slate-950",
            isKids ? "p-4 md:p-8 rounded-[48px] m-2 border-4 border-slate-900 shadow-inner" : "p-6"
        )}>
            <Outlet />
        </main>
    </div>
  );
}
