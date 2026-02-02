
import React from 'react';
import * as RRD from 'react-router-dom';
const { Outlet, NavLink, useLocation } = RRD as any;
import { 
    Home, Music, Sparkles, Gamepad2, Store, Settings, 
    LogOut, GraduationCap, Shield, Rocket, Building2, 
    Terminal, Cpu, Database, LayoutDashboard, Users,
    CreditCard, Zap
} from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useAdmin } from '../contexts/AdminContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { cn } from '../lib/utils.ts';
import { motion } from 'framer-motion';
import { uiSounds } from '../lib/uiSounds.ts';

const M = motion as any;

export default function Layout() {
  const { settings } = useAccessibility();
  const { role: authRole, signOut, user, profile } = useAuth();
  const { impersonatedRole } = useAdmin();
  const { activeSchool } = useTheme();
  const isKids = settings.uiMode === 'kids';

  const activeRole = impersonatedRole || authRole || 'student';
  const isRoot = user?.email === 'serparenan@gmail.com';

  const isModuleEnabled = (modKey: string) => {
    // Admin Global ignora travas
    if (isRoot) return true;
    // Se não houver escola vinculada, assume o básico
    if (!activeSchool) return true;
    return activeSchool.enabled_modules?.[modKey] !== false;
  };

  const getNavLinks = (currentRole: string) => {
    // LINKS DO ALUNO
    const studentLinks = [
        { path: '/student/dashboard', label: 'Jornada', icon: Home, color: 'text-sky-400', module: 'gamification' },
        { path: '/student/practice', label: 'Tocar', icon: Music, color: 'text-emerald-400' },
        { path: '/student/arcade', label: 'Arcade', icon: Gamepad2, color: 'text-amber-400', module: 'gamification' },
    ];

    // LINKS DO PROFESSOR
    const teacherLinks = [
        { path: '/teacher/classes', label: 'Maestro', icon: GraduationCap, color: 'text-purple-400' },
        { path: '/teacher/tasks', label: 'Missões', icon: Rocket, color: 'text-pink-400', module: 'gamification' },
        { path: '/teacher/library', label: 'Biblioteca', icon: Store, color: 'text-pink-400', module: 'library' },
    ];

    // LINKS DE ADMIN/ROOT
    const adminLinks = [
        { path: '/admin/business', label: 'SaaS Business', icon: Building2, color: 'text-orange-400' },
        { path: '/system/console', label: 'Kernel Console', icon: Cpu, color: 'text-red-500' },
    ];

    if (isRoot) return [...studentLinks, ...teacherLinks, ...adminLinks];
    
    let baseLinks: any[] = [];
    if (currentRole === 'student') baseLinks = studentLinks;
    else if (currentRole === 'professor' || currentRole === 'teacher_owner') baseLinks = teacherLinks;
    else baseLinks = adminLinks;

    // Filtra por módulo ativo no contrato
    return baseLinks.filter(link => !link.module || isModuleEnabled(link.module));
  };

  const navLinks = getNavLinks(activeRole);

  return (
    <div className={cn("min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden", isKids ? "flex-col-reverse md:flex-row" : "flex-col md:flex-row")}>
        <aside className={cn(
            "z-50 flex shrink-0 transition-all duration-300 border-slate-800 bg-slate-950/95 backdrop-blur-xl",
            isKids 
                ? "w-full h-24 md:w-32 md:h-screen border-t md:border-r md:border-t-0 justify-center items-center p-2" 
                : "w-full md:w-64 md:h-screen flex-col border-b md:border-r md:border-b-0 shadow-2xl"
        )}>
            {!isKids && (
                <div className="p-6 flex items-center gap-3 border-b border-white/5">
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs",
                        isRoot ? "bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" : "bg-gradient-to-tr from-sky-500 to-purple-600"
                    )}>
                        {isRoot ? 'G' : 'OM'}
                    </div>
                    <span className="font-black text-lg tracking-tight text-white uppercase italic">
                        {isRoot ? 'Sovereign' : 'Maestro'}
                    </span>
                </div>
            )}

            <nav className={cn(
                "flex gap-2 overflow-y-auto custom-scrollbar",
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
                                : "px-4 py-3.5 rounded-2xl gap-4 w-full text-[10px] font-black uppercase tracking-widest",
                            isActive 
                                ? (isKids ? "bg-white text-slate-900 shadow-2xl scale-110" : "bg-white/10 text-white shadow-xl border border-white/5") 
                                : "text-slate-500 hover:text-white hover:bg-white/5"
                        )}
                    >
                        {({ isActive }: { isActive: boolean }) => (
                            <>
                                <link.icon size={isKids ? 36 : 18} className={cn(!isKids && isActive ? link.color : "")} />
                                {!isKids && <span>{link.label}</span>}
                            </>
                        )}
                    </NavLink>
                ))}

                <button 
                    onClick={signOut}
                    className={cn(
                        "transition-all flex items-center justify-center group mt-auto",
                        isKids 
                            ? "w-12 h-12 rounded-full bg-red-500/10 text-red-400"
                            : "px-4 py-3.5 w-full gap-4 text-slate-700 hover:text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                    )}
                >
                    <LogOut size={isKids ? 24 : 18} />
                    {!isKids && <span>Sair</span>}
                </button>
            </nav>
        </aside>

        <main className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden relative transition-all bg-slate-950",
            isKids ? "p-4 md:p-8 rounded-[48px] m-2 border-4 border-slate-900 shadow-inner" : "p-8"
        )}>
            <Outlet />
        </main>
    </div>
  );
}
