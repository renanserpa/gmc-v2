
import React from 'react';
import { motion } from 'framer-motion';
import { 
    Terminal, Briefcase, GraduationCap, 
    Zap, Shield, Building2, Ghost 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { cn } from '../../lib/utils.ts';
import { haptics } from '../../lib/haptics.ts';
import { notify } from '../../lib/notification.ts';
// FIX: Using wildcard import for react-router-dom to bypass environment-specific export resolution errors
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;

const M = motion as any;

const PERSONAS = [
    { id: 'god_mode', label: 'GOD', icon: Terminal, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { id: 'saas_admin_global', label: 'SAAS', icon: Briefcase, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { id: 'professor', label: 'MAESTRO', icon: GraduationCap, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'student', label: 'ALUNO', icon: Zap, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { id: 'guardian', label: 'FAMÍLIA', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'school_manager', label: 'GESTOR', icon: Building2, color: 'text-orange-400', bg: 'bg-orange-500/10' },
];

export const PersonaSwitcher: React.FC = () => {
    const { user, actingRole, setActingRole, getDashboardPath } = useAuth();
    const navigate = useNavigate();

    if (user?.email !== 'serparenan@gmail.com') return null;

    const handleSwitch = (roleId: string) => {
        haptics.heavy();
        setActingRole(roleId);
        notify.info(`Teleporte de Persona: Agora emulando ${roleId.toUpperCase()}`);
        navigate(getDashboardPath(roleId));
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2">
            <div className="flex bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-2xl ring-1 ring-white/5">
                <div className="flex items-center gap-1 px-3 border-r border-white/10">
                    <Ghost size={14} className="text-white/40" />
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Oracle Switch</span>
                </div>
                <div className="flex gap-1 pl-2">
                    {PERSONAS.map((p) => (
                        <M.button
                            key={p.id}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSwitch(p.id)}
                            className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                                actingRole === p.id 
                                    ? cn(p.bg, p.color, "ring-2 ring-white/20 shadow-lg scale-110") 
                                    : "text-slate-600 hover:text-white"
                            )}
                            title={p.label}
                        >
                            <p.icon size={16} />
                        </M.button>
                    ))}
                </div>
            </div>
        </div>
    );
};
