
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useMetronome } from '../hooks/useMetronome.ts';
import { AttendanceStatus, LessonStep, ClassroomCommand, StudentStats } from '../types.ts';
import { audioManager } from '../lib/audioManager.ts';
import { classroomService } from '../services/classroomService.ts';
import { NOTES_CHROMATIC } from '../lib/theoryEngine.ts';
import { saveStudentSessionStats } from '../services/dataService.ts';

interface ActiveSession {
    classId: string | null;
    className: string | null;
    startTime: number | null;
    attendance: Record<string, AttendanceStatus>;
    maxBpmReached: number;
    notesMastered: number;
}

interface MaestroContextType {
    metronome: ReturnType<typeof useMetronome>;
    activeClassId: string | null;
    setActiveClassId: (id: string | null) => void;
    activeSession: ActiveSession;
    setActiveSession: React.Dispatch<React.SetStateAction<ActiveSession>>;
    lessonScript: LessonStep[];
    currentStepIdx: number;
    nextStep: () => void;
    prevStep: () => void;
    sendTVCommand: (cmd: ClassroomCommand) => void;
    resetLesson: () => void;
    persistTelemetry: (studentId: string, tip?: string) => Promise<void>;
}

const MOCK_SCRIPT: LessonStep[] = [
    { 
        id: '1', 
        title: 'Intro do Lucca: A Missão', 
        type: 'video', 
        config: { 
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
            description: 'Assista com atenção à introdução rítmica.',
            bpm: 60
        } 
    },
    { 
        id: '2', 
        title: 'Página 04: Teoria das Cores', 
        type: 'book_page', 
        config: { 
            bookPage: 4, 
            bookImageUrl: 'https://images.unsplash.com/photo-1514525253361-bee8718a300a?w=1200&q=80',
            description: 'Identifique as notas no braço do violão.'
        } 
    },
    { 
        id: '3', 
        title: 'Aquecimento: Aranha Kids', 
        type: 'metronome', 
        config: { 
            bpm: 60, 
            scale: 'C', 
            description: 'Caminhada da Aranha (Apostila p. 8)' 
        } 
    },
    { 
        id: '4', 
        title: 'Lousa: Escala Pentatônica', 
        type: 'whiteboard', 
        config: { 
            scale: 'Am', 
            instrument: 'guitar', 
            targetNotes: ['A', 'C', 'D', 'E', 'G'],
            bpm: 85
        } 
    }
];

const MaestroContext = createContext<MaestroContextType>(undefined!);

export const MaestroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeClassId, setActiveClassId] = useState<string | null>(null);
    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const [lessonScript] = useState<LessonStep[]>(MOCK_SCRIPT);

    const [activeSession, setActiveSession] = useState<ActiveSession>({
        classId: null,
        className: null,
        startTime: null,
        attendance: {},
        maxBpmReached: 60,
        notesMastered: 0
    });

    const sendTVCommand = (cmd: ClassroomCommand) => {
        if (activeSession.classId) {
            classroomService.sendCommand(activeSession.classId, cmd);
        }
    };

    const metronome = useMetronome((measure) => {
        sendTVCommand({
            type: 'MEASURE_TICK',
            payload: { measure, beat1: true }
        });
    });

    // Tracking do maior BPM
    useEffect(() => {
        if (metronome.bpm > activeSession.maxBpmReached) {
            setActiveSession(prev => ({ ...prev, maxBpmReached: metronome.bpm }));
        }
    }, [metronome.bpm]);

    const persistTelemetry = async (studentId: string, tip?: string) => {
        try {
            await saveStudentSessionStats({
                student_id: studentId,
                max_bpm: activeSession.maxBpmReached,
                notes_mastered: activeSession.notesMastered,
                master_tip: tip,
                recorded_at: new Date().toISOString()
            });
        } catch (e) {
            console.error("[Maestro] Falha na telemetria:", e);
        }
    };

    const applyStepConfig = (step: LessonStep) => {
        // 1. Preset de BPM
        if (step.config?.bpm) {
            metronome.setBpm(step.config.bpm);
        }
        
        // 2. Comandos Reativos para a TV
        switch (step.type) {
            case 'video':
                sendTVCommand({ type: 'VIDEO_FOCUS', payload: { url: step.config?.url } });
                break;
            case 'book_page':
                sendTVCommand({ 
                    type: 'BOOK_PAGE_VIEW', 
                    payload: { url: step.config?.bookImageUrl, page: step.config?.bookPage } 
                });
                break;
            case 'whiteboard':
                sendTVCommand({ 
                    type: step.config?.instrument === 'guitar' ? 'FRETBOARD_UPDATE' : 'PIANO_UPDATE',
                    payload: { notes: step.config?.targetNotes }
                });
                break;
            default:
                sendTVCommand({ type: 'EXIT_VIDEO' });
                break;
        }
    };

    const nextStep = () => {
        if (currentStepIdx < lessonScript.length - 1) {
            const nextIdx = currentStepIdx + 1;
            setCurrentStepIdx(nextIdx);
            applyStepConfig(lessonScript[nextIdx]);
        }
    };

    const prevStep = () => {
        if (currentStepIdx > 0) {
            const nextIdx = currentStepIdx - 1;
            setCurrentStepIdx(nextIdx);
            applyStepConfig(lessonScript[nextIdx]);
        }
    };

    const resetLesson = () => {
        setCurrentStepIdx(0);
        setActiveSession({
            classId: null,
            className: null,
            startTime: null,
            attendance: {},
            maxBpmReached: 60,
            notesMastered: 0
        });
    };

    return (
        <MaestroContext.Provider value={{ 
            metronome, 
            activeClassId, 
            setActiveClassId, 
            activeSession,
            setActiveSession,
            lessonScript,
            currentStepIdx,
            nextStep,
            prevStep,
            sendTVCommand,
            resetLesson,
            persistTelemetry
        }}>
            {children}
        </MaestroContext.Provider>
    );
};

export const useMaestro = () => useContext(MaestroContext);
