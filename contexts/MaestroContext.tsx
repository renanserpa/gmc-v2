
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMetronome } from '../hooks/useMetronome.ts';
import { AttendanceStatus } from '../types.ts';
import { logger } from '../lib/logger.ts';

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
    const [activeSession, setActiveSession] = useState<ActiveSession>({
        classId: null,
        className: null,
        startTime: null,
        attendance: {}
    });
    const [activeClassroom, setActiveClassroom] = useState({
        id: null,
        isLocked: false,
        currentExerciseId: null
    });

    // Hotfix: Garantir que o áudio seja silenciado ao desmontar componentes pesados
    useEffect(() => {
        return () => {
            try {
                if (metronome.isPlaying) metronome.toggle();
            } catch (e) {
                logger.error("Falha ao silenciar contexto de áudio global", e);
            }
        };
    }, [metronome]);

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
    if (!context) throw new Error('useMaestro must be used within MaestroProvider');
    return context;
};
