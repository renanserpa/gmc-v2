import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, ShieldCheck, Database, RefreshCw, Loader2, AlertCircle, LogOut, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { audioManager } from '../lib/audioManager.ts';
import { Button } from './ui/Button.tsx';

interface AppLoaderProps {
    children: React.ReactNode;
}

const STEPS = [
    { label: "Neural Audio Booting", icon: Music },
    { label: "Maestro Central Sync", icon: RefreshCw },
    { label: "RLS Permission Validating", icon: ShieldCheck },
    { label: "Database Tuning", icon: Database }
];

export const AppLoader: React.FC<AppLoaderProps> = ({ children }) => {
    const { loading: authLoading, signOut } = useAuth();
    const [stepIdx, setStepIdx] = useState(0);
    const [showRescue, setShowRescue] = useState(false);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            const timer = setTimeout(() => setShowContent(true), 200);
            return () => clearTimeout(timer);
        } else {
            setShowContent(false);
            const stepInterval = setInterval(() => {
                setStepIdx(prev => (prev + 1) % STEPS.length);
            }, 800);

            // Reduzido para 4 segundos para melhor UX
            const rescueTimer = setTimeout(() => {
                setShowRescue(true);
            }, 4000);

            return () => {
                clearInterval(stepInterval);
                clearTimeout(rescueTimer);
            };
        }
    }, [authLoading]);

    if (!showContent) {
        return (
            <div className="fixed inset-0 z-[9998] bg-[#020617] flex flex-col items-center justify-center p-6">
                <div className="relative flex flex-col items-center gap-10 max-w-sm w-full">
                    <motion.div 
                        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="relative bg-slate-900 p-10 rounded-[48px] border border-white/10 shadow-[0_0_50px_rgba(56,189,248,0.1)]"
                    >
                        <Loader2 className="animate-spin text-sky-400" size={56} />
                    </motion.div>
                    
                    <div className="text-center space-y-4">
                        <h2 className="text-white font-black uppercase tracking-[0.3em] text-xs h-4">
                            {STEPS[stepIdx].label}
                        </h2>
                        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest animate-pulse">Sincronizando com Maestro Core...</p>
                    </div>

                    <AnimatePresence>
                        {showRescue && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col gap-3 w-full pt-8"
                            >
                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-2 flex items-start gap-3">
                                    <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-amber-200/60 leading-relaxed font-medium">O Kernel está demorando para responder. Deseja forçar a entrada ou limpar a sessão?</p>
                                </div>
                                <Button 
                                    variant="primary" 
                                    onClick={() => setShowContent(true)}
                                    className="w-full py-6 rounded-2xl text-[10px] font-black uppercase shadow-xl"
                                    leftIcon={Home}
                                >
                                    Forçar Entrada (Bypass)
                                </Button>
                                <button 
                                    onClick={() => signOut()}
                                    className="w-full py-2 text-[10px] font-black uppercase text-slate-500 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogOut size={12} /> Limpar Cache de Login
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
