
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, ShieldCheck, Database, RefreshCw, Loader2, Terminal, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { audioManager } from '../lib/audioManager.ts';

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
    const { loading: authLoading, user } = useAuth();
    const [fatalError, setFatalError] = useState<any>(null);
    const [stepIdx, setStepIdx] = useState(0);
    const [showContent, setShowContent] = useState(false);

    // Sistema de Auto-Resumo de Áudio
    const resumeAudioEngine = useCallback(async () => {
        try {
            const ctx = await audioManager.getContext();
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }
            ['click', 'keydown', 'touchstart'].forEach(evt => 
                window.removeEventListener(evt, resumeAudioEngine)
            );
        } catch (e) {}
    }, []);

    useEffect(() => {
        ['click', 'keydown', 'touchstart'].forEach(evt => 
            window.addEventListener(evt, resumeAudioEngine, { passive: true })
        );

        // Safety Gate: Timeout de Emergência para liberar a tela
        const safetyTimeout = setTimeout(() => {
            if (authLoading && user) {
                console.warn("[AppLoader] SAFETY BYPASS: O sistema demorou muito para responder. Liberando UI.");
                setShowContent(true);
            }
        }, 8000);

        const errorChecker = setInterval(() => {
            const globalErrors = (window as any).__maestro_errors;
            if (globalErrors && globalErrors.length > 0) {
                setFatalError(globalErrors[0]);
                clearInterval(errorChecker);
            }
        }, 500);

        return () => {
            clearInterval(errorChecker);
            clearTimeout(safetyTimeout);
            ['click', 'keydown', 'touchstart'].forEach(evt => 
                window.removeEventListener(evt, resumeAudioEngine)
            );
        };
    }, [resumeAudioEngine, authLoading, user]);

    useEffect(() => {
        if (!authLoading) {
            setShowContent(true);
        } else {
            const stepInterval = setInterval(() => {
                setStepIdx(prev => (prev + 1) % STEPS.length);
            }, 600);
            return () => clearInterval(stepInterval);
        }
    }, [authLoading]);

    const handleHardReset = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
    };

    if (fatalError) {
        return (
            <div className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center p-8 text-center font-mono">
                <div className="bg-red-500/10 p-6 rounded-[40px] border border-red-500/20 mb-8">
                    <AlertCircle size={48} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 italic">Kernel Panic</h1>
                <p className="text-slate-500 text-sm max-w-md mb-8">
                    Ocorreu um erro crítico durante a inicialização dos módulos neurais.
                </p>
                <button 
                    onClick={handleHardReset}
                    className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
                >
                    <RefreshCw size={18} /> Limpeza de Cache e Reinício
                </button>
            </div>
        );
    }

    return (
        <>
            <AnimatePresence mode="wait">
                {!showContent && (
                    <motion.div 
                        key="loader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9998] bg-[#020617] flex flex-col items-center justify-center p-6"
                    >
                        <div className="relative flex flex-col items-center gap-10 max-w-sm w-full">
                            <div className="relative bg-slate-900 p-6 rounded-[32px] border border-white/5 shadow-2xl">
                                <Loader2 className="animate-spin text-sky-400" size={40} />
                            </div>
                            <div className="text-center space-y-3">
                                <h2 className="text-white font-black uppercase tracking-widest text-xs h-4">{STEPS[stepIdx].label}</h2>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className={showContent ? "contents" : "hidden"}>
                {children}
            </div>
        </>
    );
};
