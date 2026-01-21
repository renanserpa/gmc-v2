export interface NoteEvent {
    noteIdx: number;
    measure: number;
    isCorrect: boolean;
    timestamp: number;
    timingOffset: number; // segundos
}

export type CorrectionAction = 
    | 'TRIGGER_SMART_LOOP' 
    | 'SUGGEST_SLOW_DOWN' 
    | 'ENCOURAGE_GROOVE' 
    | 'POSTURE_CHECK';

export interface PerformanceRecommendation {
    action: CorrectionAction;
    message: string;
    payload?: any;
}

/**
 * Motor de Estratégia Pedagógica Digital.
 * Analisa o "log" de notas para intervir na aula de forma humana.
 */
export const correctionStrategy = {
    analyzePerformance(history: NoteEvent[]): PerformanceRecommendation | null {
        if (history.length < 8) return null;

        const recent = history.slice(-12);
        const errorCount = recent.filter(n => !n.isCorrect).length;
        const precision = (recent.filter(n => n.isCorrect).length / recent.length) * 100;

        // 1. Detecção de Loop Inteligente (Mesmo erro no mesmo lugar)
        const errorMeasures = recent.filter(n => !n.isCorrect).map(n => n.measure);
        const measureFreq: Record<number, number> = {};
        errorMeasures.forEach(m => measureFreq[m] = (measureFreq[m] || 0) + 1);
        
        const criticalMeasure = Object.entries(measureFreq).find(([_, count]) => count >= 3);
        
        if (criticalMeasure) {
            return {
                action: 'TRIGGER_SMART_LOOP',
                message: "Lucca notou: Esse trecho está desafiador! Vamos repetir apenas esse compasso?",
                payload: { measure: parseInt(criticalMeasure[0]) }
            };
        }

        // 2. Fadiga ou Dificuldade de BPM
        if (precision < 60) {
            return {
                action: 'SUGGEST_SLOW_DOWN',
                message: "Maestro diz: A pressa é inimiga da perfeição. Que tal reduzir a velocidade em 10%?",
                payload: { reductionFactor: 0.1 }
            };
        }

        // 3. Erros de Timing (Atraso constante)
        const avgOffset = recent.reduce((acc, n) => acc + n.timingOffset, 0) / recent.length;
        if (avgOffset > 0.15) { // Média de 150ms de atraso
            return {
                action: 'ENCOURAGE_GROOVE',
                message: "Sinta o pulso do Elefante! Você está ficando um pouco atrás do ritmo."
            };
        }

        // 4. Feedback Positivo (Alta performance)
        if (precision > 95 && recent.length >= 12) {
            return {
                action: 'POSTURE_CHECK',
                message: "Performance Impecável! Mantenha a ponta dos dedos firme.",
            };
        }

        return null;
    }
};
