
import { LessonPlan, LessonStep } from '../types.ts';

export interface ValidationWarning {
    stepId: string;
    message: string;
    suggestion: string;
    severity: 'low' | 'high';
}

/**
 * Validador Maestro V3.0 - Alinhado com a Metodologia Renan Serpa.
 * Focado em janelas de atenção, metadados rítmicos e transição sensorial.
 */
export const lessonValidator = {
    validate(plan: LessonPlan): ValidationWarning[] {
        const warnings: ValidationWarning[] = [];

        plan.steps.forEach(step => {
            // 1. Regra de Janela de Atenção (4-6 anos)
            if (plan.age_group === '4-6') {
                if (step.duration_mins > 5 && step.type !== 'movement_break') {
                    warnings.push({
                        stepId: step.id,
                        severity: 'high',
                        message: `O bloco "${step.title}" excede o limite cognitivo de 5 minutos.`,
                        suggestion: "Alunos Kids perdem foco após 5 min de técnica pura. Insira um 'Movement Break' ou mude o timbre."
                    });
                }
            }

            // 2. Validação "Caminhada da Aranha" (Apostila V3.0)
            const isSpiderWalk = step.title.toLowerCase().includes('aranha') || step.title.toLowerCase().includes('spider');
            
            if (isSpiderWalk) {
                const metadata = (step as any).metadata || {};
                
                // BPM Target Check
                if (!metadata.bpm_target) {
                    warnings.push({
                        stepId: step.id,
                        severity: 'high',
                        message: "Spider Walk: Faltando Metadado BPM Alvo",
                        suggestion: "A 'Caminhada da Aranha' v3.0 requer um BPM alvo (ex: 60bpm) para telemetria correta."
                    });
                }

                // Fret Range Check (1-4 é o padrão da apostila)
                if (!metadata.fret_range || metadata.fret_range[0] !== 1 || metadata.fret_range[1] !== 4) {
                    warnings.push({
                        stepId: step.id,
                        severity: 'low',
                        message: "Spider Walk: Range de Casas não-padrão",
                        suggestion: "A Apostila V3.0 recomenda casas [1, 4] para este nível."
                    });
                }

                // Accuracy Threshold Check
                if (!metadata.required_accuracy || metadata.required_accuracy < 0.85) {
                    warnings.push({
                        stepId: step.id,
                        severity: 'high',
                        message: "Spider Walk: Limiar de Precisão Insuficiente",
                        suggestion: "A meta técnica para homologação é 85% de precisão (accuracy: 0.85)."
                    });
                }

                // String Count Check
                if (!metadata.strings_count || metadata.strings_count !== 6) {
                    warnings.push({
                        stepId: step.id,
                        severity: 'low',
                        message: "Spider Walk: Contagem de cordas inválida",
                        suggestion: "O exercício padrão utiliza as 6 cordas do violão."
                    });
                }

                if (!metadata.finger_colors_map) {
                    warnings.push({
                        stepId: step.id,
                        severity: 'low',
                        message: "Spider Walk: Faltando Guia Visual de Dedos",
                        suggestion: "Ative o 'Color Map' (1=Verde, 2=Amarelo...) para auxiliar a visão periférica do aluno."
                    });
                }
            }

            // 3. Diversidade Sensorial
            const theoryCount = plan.steps.filter(s => s.type === 'theory').length;
            if (theoryCount > 2) {
                warnings.push({
                    stepId: 'global',
                    severity: 'low',
                    message: "Excesso de blocos teóricos seguidos.",
                    suggestion: "Intercale teoria com 'Play-Along' para manter a dopamina do aluno elevada."
                });
            }
        });

        return warnings;
    }
};
