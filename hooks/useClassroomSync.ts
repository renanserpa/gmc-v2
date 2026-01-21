import { useState, useEffect, useCallback } from 'react';
import { classroomService, ClassroomCommand } from '../services/classroomService';
import { LessonStep } from '../types';

interface ClassroomState {
    isPlaying: boolean;
    bpm: number;
    currentStepId: string;
    focusMode: boolean;
}

export function useClassroomSync(classId: string, initialSteps: LessonStep[], isTeacher: boolean = false) {
    const [state, setState] = useState<ClassroomState>({
        isPlaying: false,
        bpm: 120,
        currentStepId: initialSteps[0]?.id || '',
        focusMode: false
    });
    
    const [onlineStudents, setOnlineStudents] = useState<any[]>([]);
    const [telemetry, setTelemetry] = useState<Record<string, number>>({});

    useEffect(() => {
        const unsubscribe = classroomService.subscribeToCommands(classId, (cmd) => {
            handleCommand(cmd);
        });

        // FIX: The unsubscribe function returns a promise, which is not a valid useEffect cleanup. Wrap it to ignore the return value.
        return () => { unsubscribe(); };
    }, [classId]);

    const handleCommand = useCallback((cmd: ClassroomCommand) => {
        switch (cmd.type) {
            case 'PLAY': setState(s => ({ ...s, isPlaying: true })); break;
            case 'PAUSE': setState(s => ({ ...s, isPlaying: false })); break;
            case 'SET_BPM': if (cmd.bpm) setState(s => ({ ...s, bpm: cmd.bpm })); break;
            case 'CHANGE_STEP': if (cmd.stepId) setState(s => ({ ...s, currentStepId: cmd.stepId })); break;
            case 'FOCUS_MODE': if (cmd.active !== undefined) setState(s => ({ ...s, focusMode: cmd.active })); break;
            case 'SYNC_STATE': if (cmd.state) setState(s => ({ ...s, ...cmd.state })); break;
            case 'TELEMETRY_HIT': 
                if (cmd.studentId) {
                    setTelemetry(prev => ({
                        ...prev,
                        [cmd.studentId!]: (prev[cmd.studentId!] || 0) + 1
                    }));
                }
                break;
        }
    }, []);

    // FIX: Added 'resonance' parameter and passed it to sendCommand to satisfy ClassroomCommand type
    const sendHit = (studentId: string, noteId: string, precision: 'perfect' | 'good' | 'late' = 'good', resonance: number = 0) => {
        classroomService.sendCommand(classId, { type: 'TELEMETRY_HIT', studentId, noteId, precision, resonance });
    };

    return {
        ...state,
        onlineStudents,
        telemetry,
        sendHit,
        handleCommand // Para permitir override local se necessário
    };
}