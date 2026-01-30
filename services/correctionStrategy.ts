export interface NoteEvent {
    noteIdx: number;
    measure: number;
    isCorrect: boolean;
    timestamp: number;
    timingOffset: number;
}

export type FlowStatus = 'ideal' | 'frustrated' | 'struggling';

export interface PedagogicalState {
    flow_status: FlowStatus;
    consecutive_errors: number;
    recommendation: string;
    action?: 'ADJUST_BPM' | 'MAESTRO_ZEN';
    bpm_delta?: number;
}

const FRUSTRATION_THRESHOLD = 5; // notas erradas por segundo
const CONSECUTIVE_ERRORS_LIMIT = 3;

/**
 * DNA OLIE: Motor de Biofeedback Pedagógico.
 * Analisa a neuroplasticidade e o estado emocional do aluno em tempo real.
 */
export const correctionStrategy = {
    analyzeFlow(history: NoteEvent[], currentState: PedagogicalState): PedagogicalState {
        if (history.length === 0) return currentState;

        const latest = history[history.length - 1];
        const recentErrors = history.slice(-10).filter(n => !n.isCorrect);
        
        let newConsecutiveErrors = latest.isCorrect ? 0 : currentState.consecutive_errors + 1;
        let flow: FlowStatus = 'ideal';
        let action: PedagogicalState['action'] = undefined;
        let bpmDelta = 0;
        let msg = "Groove estável!";

        // 1. Regra da Zona de Fluxo (Struggling)
        if (newConsecutiveErrors >= CONSECUTIVE_ERRORS_LIMIT) {
            flow = 'struggling';
            action = 'ADJUST_BPM';
            bpmDelta = -0.20;
            msg = "O elefante está pesado. Reduzindo 20% do BPM para facilitar.";
        }

        // 2. Lógica de Frustração (Frustrated)
        const timeSpan = history.length > 5 
            ? (history[history.length - 1].timestamp - history[history.length - 5].timestamp) / 1000 
            : 0;
        
        const errorVelocity = timeSpan > 0 ? recentErrors.length / timeSpan : 0;

        if (errorVelocity > FRUSTRATION_THRESHOLD) {
            flow = 'frustrated';
            action = 'MAESTRO_ZEN';
            msg = "Muitas tentativas rápidas! Maestro Zen sugere respirar por 5 segundos.";
        }

        return {
            flow_status: flow,
            consecutive_errors: newConsecutiveErrors,
            recommendation: msg,
            action,
            bpm_delta: bpmDelta
        };
    },

    countConsecutiveErrors(events: NoteEvent[]): number {
        let count = 0;
        for (let i = events.length - 1; i >= 0; i--) {
            if (!events[i].isCorrect) count++;
            else break;
        }
        return count;
    }
};
