
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useMetronome } from '../hooks/useMetronome.ts';
import { AttendanceStatus } from '../types.ts';
import { logger } from '../lib/logger.ts';
import { audioManager } from '../lib/audioManager.ts';

interface ActiveSession {
    classId: string | null;
    className: string | null;
    startTime: number | null;
    attendance: Record<string, AttendanceStatus>;
}

interface MaestroContextType {
    metronome: ReturnType<typeof useMetronome>;
    activeClassId: string | null;
    setActiveClassId: (id: string | null) => void;
    activeSession: ActiveSession;
    setActiveSession: React.Dispatch<React.SetStateAction<ActiveSession>>;
    activeClassroom: {
        id: string | null;
        isLocked: boolean;
        currentExerciseId: string | null;
    };
    setActiveClassroom: React.Dispatch<React.SetStateAction<any>>;
}

const MaestroContext = createContext<MaestroContextType | undefined>(undefined);

export const MaestroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const metronome = useMetronome();
    const [activeClassId, setActiveClassId] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const [activeSession, setActiveSession] = useState<ActiveSession>({
        classId: null,
        className: "Sessão Homologação (Sandbox)",
        startTime: Date.now(),
        attendance: {}
    });

    const [activeClassroom, setActiveClassroom] = useState({
        id: null,
        isLocked: false,
        currentExerciseId: null
    });

    // HOTFIX: Gerenciamento Seguro de Transições de Áudio
    useEffect(() => {
        abortControllerRef.current = new AbortController();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            
            const cleanupAudio = async () => {
                try {
                    // Se o metrônomo estiver pulsando, paramos antes de transicionar
                    if (metronome.isPlaying) {
                        metronome.toggle();
                    }
                    
                    const ctx = await audioManager.getContext();
                    if (ctx && ctx.state === 'running') {
                        // Suspendemos em vez de fechar para permitir reaproveitamento sem lag
                        await ctx.suspend();
                        console.debug("[Maestro Kernel] Thread de áudio suspensa com segurança.");
                    }
                } catch (e) {
                    logger.warn("Erro silencioso ao limpar thread de áudio na navegação.", e);
                }
            };
            cleanupAudio();
        };
    }, [metronome.isPlaying]);

    return (
        <MaestroContext.Provider value={{ 
            metronome, 
            activeClassId, 
            setActiveClassId, 
            activeSession,
            setActiveSession,
            activeClassroom, 
            setActiveClassroom 
        }}>
            {children}
        </MaestroContext.Provider>
    );
};

export const useMaestro = () => {
    const context = useContext(MaestroContext);
    if (!context) throw new Error('useMaestro deve ser usado dentro de um MaestroProvider');
    return context;
};
