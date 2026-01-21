
import { LessonPlan, LessonStep } from '../types';

export interface ValidationWarning {
    stepId: string;
    message: string;
    suggestion: string;
    severity: 'low' | 'high';
}

export const lessonValidator = {
    /**
     * Valida se o plano de aula respeita a janela de atenção da faixa etária.
     * Baseado no Módulo 3: Regra dos 5 Minutos.
     */
    validate(plan: LessonPlan): ValidationWarning[] {
        const warnings: ValidationWarning[] = [];

        plan.steps.forEach(step => {
            // Regra Kids (4-6 anos)
            if (plan.age_group === '4-6') {
                if (step.duration_mins > 5 && step.type !== 'movement_break') {
                    warnings.push({
                        stepId: step.id,
                        severity: 'high',
                        message: `O bloco "${step.title}" excede 5 minutos.`,
                        suggestion: "A neurociência sugere trocar de atividade a cada 5 min para esta idade. Que tal inserir um 'Movement Break'?"
                    });
                }
            }

            // Regra Infanto-Juvenil (7-10 anos)
            if (plan.age_group === '7-10') {
                if (step.duration_mins > 10) {
                    warnings.push({
                        stepId: step.id,
                        severity: 'low',
                        message: `Bloco longo para crianças de 7-10 anos.`,
                        suggestion: "Considere dividir em micro-tarefas (Chunks) para manter a dopamina alta."
                    });
                }
            }
        });

        return warnings;
    }
};
