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
    const { loading: authLoading } = useAuth();
    const [fatalError, setFatalError] = useState<any>(null);
    const [stepIdx, setStepIdx] = useState(0);
    const [showContent, setShowContent] = useState(false);

    // Sistema de Auto-Resumo de Áudio otimizado
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

        const errorChecker = setInterval(() => {
            const globalErrors = (window as any).__maestro_errors;
            if (globalErrors && globalErrors.length > 0) {
                setFatalError(globalErrors[0]);
                clearInterval(errorChecker);
            }
        }, 500);

        return () => {
            clearInterval(errorChecker);
            ['click', 'keydown', 'touchstart'].forEach(evt => 
                window.removeEventListener(evt, resumeAudioEngine)
            );
        };
    }, [resumeAudioEngine]);

    // Otimização: transição imediata assim que a autenticação é resolvida
    useEffect(() => {
        if (!authLoading) {
            setShowContent(true);
        } else {
            const stepInterval = setInterval(() => {
                setStepIdx(prev => (prev + 1) % STEPS.length);
            }, 600); // Ciclo um pouco mais rápido para percepção de agilidade
            return () => clearInterval(stepInterval);
        }
    }, [authLoading]);

    const handleHardReset = () => {
        // Limpeza Total para recuperação de estado catastrófico
        localStorage.clear();
        sessionStorage.clear();
        try {
            indexedDB.deleteDatabase('OlieMusicCache');
        } catch (e) {}
        
        // Reinício forçado
        window.location.href = '/';
    };

    if (fatalError) {
        return (
            <div className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center p-8 text-center font-mono">
                <div className="bg-red-500/10 p-6 rounded-[40px] border border-red-500/20 mb-8">
                    <AlertCircle size={48} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 italic">Kernel Panic</h1>
                <p className="text-slate-500 text-sm max-w-md mb-8 font-medium">
                    Ocorreu um erro crítico durante a inicialização dos módulos neurais.
                </p>
                <div className="w-full max-w-xl bg-black/40 border border-white/5 rounded-[32px] p-6 text-left font-mono text-[10px] space-y-2 overflow-auto max-h-48 mb-8 shadow-inner">
                    <p className="text-red-400 font-bold flex items-center gap-2"><Terminal size={12} /> STACK_TRACE:</p>
                    <p className="text-slate-400 leading-relaxed">{fatalError.msg || "Erro de resolução de módulo em tempo de execução."}</p>
                </div>
                <button 
                    onClick={handleHardReset}
                    className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                    <RefreshCw size={18} /> Limpeza Profunda e Reinício
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
                        exit={{ opacity: 0, transition: { duration: 0.3, ease: "easeOut" } }}
                        className="fixed inset-0 z-[9998] bg-[#020617] flex flex-col items-center justify-center p-6"
                    >
                        <div className="relative flex flex-col items-center gap-10 max-w-sm w-full">
                            <div className="relative">
                                <motion.div 
                                    animate={{ 
                                        scale: [1, 1.2, 1],
                                        opacity: [0.3, 0.6, 0.3]
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute -inset-8 bg-sky-500/20 blur-[60px] rounded-full" 
                                />
                                <div className="relative bg-slate-900 p-6 rounded-[32px] border border-white/5 shadow-2xl">
                                    <Loader2 className="animate-spin text-sky-400" size={40} />
                                </div>
                            </div>
                            <div className="text-center space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
                                    <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.3em]">Maestro Engine</p>
                                </div>
                                <h2 className="text-white font-black uppercase tracking-widest text-xs h-4">{STEPS[stepIdx].label}</h2>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <motion.div
                initial={false}
                animate={{ opacity: showContent ? 1 : 0 }}
                transition={{ duration: 0.4, ease: "easeIn" }}
                className={cn("contents", !showContent && "pointer-events-none")}
            >
                {children}
            </motion.div>
        </>
    );
};

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}