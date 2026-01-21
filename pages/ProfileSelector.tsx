import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../types.ts';
import { Users, Music, Shield, LayoutDashboard, ArrowRight, Building2, Sparkles, LogOut, Code2, Terminal, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { uiSounds } from '../lib/uiSounds.ts';
import { cn } from '../lib/utils.ts';
import { notify } from '../lib/notification.ts';
import { haptics } from '../lib/haptics.ts';

const profiles = [
    { role: UserRole.Professor, path: '/professor', label: 'Sou Professor', description: 'Gestão de turmas e cockpit de aula', icon: Users, color: 'text-sky-400', glow: 'bg-sky-500/10' },
    { role: UserRole.Student, path: '/student', label: 'Sou Aluno', description: 'Minhas missões e jornada musical', icon: Music, color: 'text-purple-400', glow: 'bg-purple-500/10' },
    { role: UserRole.Guardian, path: '/guardian', label: 'Sou Responsável', description: 'Acompanhamento pedagógico do filho', icon: Shield, color: 'text-green-400', glow: 'bg-green-500/10' },
    { role: UserRole.Manager, path: '/manager', label: 'Sou Gestor', description: 'Dashboard da Unidade de Ensino', icon: Building2, color: 'text-orange-400', glow: 'bg-orange-500/10' },
    { role: UserRole.Admin, path: '/admin', label: 'Sou Admin', description: 'Controle Global e God Mode', icon: LayoutDashboard, color: 'text-red-400', glow: 'bg-red-500/10' }
];

export default function ProfileSelector() {
    const { user, role, loading, signOut, devLogin } = useAuth();
    const navigate = useNavigate();
    const [showDevTools, setShowDevTools] = useState(false);

    useEffect(() => {
        if (!loading && user && role) {
            const targetPath = role === 'manager' ? '/manager' : `/${role}`;
            navigate(targetPath, { replace: true });
        }
    }, [user, role, loading, navigate]);

    const handleDevLogin = async (roleTarget: string) => {
        uiSounds.playSuccess();
        const mockId = `dev-${roleTarget}-id`;
        await devLogin(mockId, roleTarget);
        notify.info(`Modo Dev Ativado: ${roleTarget.toUpperCase()}`);
    };

    const handleQuickReset = () => {
        haptics.heavy();
        if (confirm("🚨 ATENÇÃO: Deseja limpar permanentemente todos os dados locais (Cache, Banco de Áudio, Sessão e Credenciais) e reiniciar o Kernel?")) {
            // Limpa síncronos
            localStorage.clear();
            sessionStorage.clear();
            
            // Limpa IndexedDB
            try {
                indexedDB.deleteDatabase('OlieMusicCache');
            } catch (e) {}

            notify.warning("Purgando ecossistema... Reiniciando.");
            
            setTimeout(() => {
                window.location.href = '/';
            }, 500);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-10"></div>
            
            {/* Botão Superior: Limpar Ambiente (Kernel Reset) */}
            <div className="absolute top-0 right-0 z-50 p-6">
                <motion.button 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleQuickReset}
                    className="bg-slate-900/40 hover:bg-red-600/20 text-slate-500 hover:text-red-400 border border-white/5 hover:border-red-500/30 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-3 backdrop-blur-xl shadow-2xl"
                >
                    <RefreshCw size={14} /> Limpar Ambiente (Factory Reset)
                </motion.button>
            </div>

            {/* Botão Flutuante DevMode */}
            <div className="fixed bottom-6 right-6 z-[200]">
                <button 
                    onClick={() => setShowDevTools(!showDevTools)}
                    className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-2xl border-4",
                        showDevTools 
                            ? "bg-purple-600 border-white text-white" 
                            : "bg-slate-900 border-purple-500/50 text-purple-400 hover:scale-110"
                    )}
                >
                    <Code2 size={24} />
                </button>
            </div>

            {/* Painel Dev Flutuante */}
            <AnimatePresence>
                {showDevTools && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-24 right-6 w-64 bg-slate-900 border-2 border-purple-500/30 rounded-[40px] shadow-2xl z-[200] p-6 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-purple-500/5 pointer-events-none" />
                        <div className="relative space-y-4">
                            <p className="text-[10px] font-black uppercase text-purple-400 tracking-widest flex items-center gap-2">
                                <Terminal size={12} /> Maestro Dev Tool
                            </p>
                            <div className="space-y-2">
                                <button onClick={() => handleDevLogin('student')} className="w-full p-3 bg-slate-950 rounded-2xl border border-white/5 text-[10px] font-black uppercase text-slate-300 hover:bg-purple-600 hover:text-white transition-all flex items-center gap-3">
                                    <Music size={14} /> Sou Aluno (Dev)
                                </button>
                                <button onClick={() => handleDevLogin('professor')} className="w-full p-3 bg-slate-950 rounded-2xl border border-white/5 text-[10px] font-black uppercase text-slate-300 hover:bg-purple-600 hover:text-white transition-all flex items-center gap-3">
                                    <Users size={14} /> Sou Professor (Dev)
                                </button>
                                <button onClick={() => handleDevLogin('manager')} className="w-full p-3 bg-slate-950 rounded-2xl border border-white/5 text-[10px] font-black uppercase text-slate-300 hover:bg-purple-600 hover:text-white transition-all flex items-center gap-3">
                                    <Building2 size={14} /> Sou Gestor (Dev)
                                </button>
                                <button onClick={() => handleDevLogin('admin')} className="w-full p-3 bg-slate-950 rounded-2xl border border-white/5 text-[10px] font-black uppercase text-slate-300 hover:bg-purple-600 hover:text-white transition-all flex items-center gap-3">
                                    <Shield size={14} /> Sou Admin (Dev)
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl w-full space-y-16 relative z-10">
                <header className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                        <Sparkles size={12} fill="currentColor" /> Maestro Control Center
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight uppercase leading-none italic">
                        Olie<span className="text-sky-500">Music</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium tracking-tight leading-relaxed">
                        Escolha como você deseja participar da orquestra hoje.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {profiles.map(({ role: profileRole, path, label, description, icon: Icon, color, glow }, idx) => (
                        <motion.div 
                            key={path}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Link 
                                to={user ? path : "/login"} 
                                className="group block h-full"
                                onClick={() => uiSounds.playClick()}
                            >
                                <Card className="h-full bg-slate-900/40 backdrop-blur-xl border-white/5 hover:border-white/20 hover:bg-slate-800/60 transition-all duration-500 relative overflow-hidden rounded-[40px] shadow-2xl group-hover:-translate-y-2">
                                    <div className={cn("absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity", color.replace('text', 'bg'))}></div>
                                    <CardContent className="p-10 flex flex-col items-center text-center h-full justify-between">
                                        <div className="space-y-8 w-full">
                                            <div className={cn("p-6 rounded-[32px] shadow-inner inline-flex transition-all duration-500 group-hover:scale-110", glow)}>
                                                <Icon className={cn("w-12 h-12", color)} />
                                            </div>
                                            <div className="space-y-3">
                                                <h2 className="text-xl font-black text-white uppercase tracking-tighter">{label}</h2>
                                                <p className="text-xs text-slate-500 leading-relaxed font-medium px-2">{description}</p>
                                            </div>
                                        </div>
                                        <div className="mt-10 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 text-sky-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                                            {user ? "Acessar Painel" : "Fazer Login"} <ArrowRight size={14} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <footer className="text-center pt-8 space-y-8">
                    {!user ? (
                        <Link to="/login" className="text-slate-600 hover:text-sky-400 text-xs font-black uppercase tracking-[0.3em] transition-all border-b border-transparent hover:border-sky-500/50 pb-1">
                            Já possui conta Maestro? Sincronizar Agora
                        </Link>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Logado como: <span className="text-slate-300 ml-1">{user.email}</span>
                            </p>
                            <button onClick={signOut} className="flex items-center gap-2 text-red-500/60 hover:text-red-400 text-[10px] font-black uppercase tracking-[0.3em] transition-all">
                                <LogOut size={12} /> Sair da conta
                            </button>
                        </div>
                    )}
                </footer>
            </div>
        </div>
    );
}