
import React from 'react';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;
import { useAuth } from '../contexts/AuthContext.tsx';
import { Card } from '../components/ui/Card.tsx';
import { 
    Terminal, Briefcase, Sparkles, LogOut, 
    ArrowRight, ShieldCheck, Database, LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { uiSounds } from '../lib/uiSounds.ts';
import { haptics } from '../lib/haptics.ts';
import LoadingScreen from '../components/ui/LoadingScreen.tsx';

const M = motion as any;

export default function ProfileSelector() {
    const { user, signOut, loading } = useAuth();
    const navigate = useNavigate();

    const isRoot = user?.email === 'serparenan@gmail.com';

    const handleAccess = (path: string, mode?: string) => {
        haptics.heavy();
        uiSounds.playSuccess();
        if (mode) localStorage.setItem('maestro_active_mode', mode);
        navigate(path);
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] p-6 relative overflow-hidden">
            {/* Background Estético Core */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-10"></div>
            
            <div className="max-w-5xl w-full space-y-16 relative z-10">
                <header className="text-center space-y-4">
                    <M.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4"
                    >
                        <ShieldCheck size={12} fill="currentColor" /> Identity Gatekeeper
                    </M.div>
                    <M.h1 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none italic"
                    >
                        Comando <span className="text-sky-500">Central</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.5em]">Bem-vindo, Mestre Renan.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* CARD GOD MODE */}
                    <M.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card 
                            onClick={() => handleAccess('/system/console', 'god')}
                            className="group bg-red-950/10 border-red-500/20 hover:border-red-500/50 hover:bg-red-950/20 cursor-pointer transition-all duration-500 rounded-[56px] p-12 relative overflow-hidden shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 p-32 bg-red-500/5 blur-[100px] pointer-events-none group-hover:bg-red-500/10 transition-colors" />
                            <div className="relative z-10 flex flex-col items-center text-center gap-8">
                                <div className="p-8 bg-red-600 rounded-[32px] text-white shadow-[0_0_50px_rgba(220,38,38,0.3)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                    <Terminal size={48} />
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Engine Console</h2>
                                    <p className="text-xs text-red-400/60 font-bold uppercase tracking-widest">Acesso Root & Infraestrutura</p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                                    Acessar Kernel <ArrowRight size={14} />
                                </div>
                            </div>
                        </Card>
                    </M.div>

                    {/* CARD BUSINESS MODE */}
                    <M.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card 
                            onClick={() => handleAccess('/admin/business', 'saas')}
                            className="group bg-sky-950/10 border-sky-500/20 hover:border-sky-500/50 hover:bg-sky-950/20 cursor-pointer transition-all duration-500 rounded-[56px] p-12 relative overflow-hidden shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none group-hover:bg-sky-500/10 transition-colors" />
                            <div className="relative z-10 flex flex-col items-center text-center gap-8">
                                <div className="p-8 bg-sky-600 rounded-[32px] text-white shadow-[0_0_50px_rgba(14,165,233,0.3)] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                                    <Briefcase size={48} />
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Business Core</h2>
                                    <p className="text-xs text-sky-400/60 font-bold uppercase tracking-widest">Gestão SaaS & Operações</p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-sky-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                                    Acessar Dashboard <ArrowRight size={14} />
                                </div>
                            </div>
                        </Card>
                    </M.div>
                </div>

                <footer className="text-center pt-12">
                    <button 
                        onClick={signOut} 
                        className="flex items-center gap-2 text-slate-600 hover:text-red-400 text-[10px] font-black uppercase tracking-[0.3em] transition-all mx-auto"
                    >
                        <LogOut size={12} /> Encerrar Sessão Mestre
                    </button>
                </footer>
            </div>
        </div>
    );
}
