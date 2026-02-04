
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.tsx';
import { LessonStep } from '../../types.ts';
import { Button } from '../ui/Button.tsx';
import { Play, SkipForward, ListOrdered, Timer, Music, Activity, Brain } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import { cn } from '../../lib/utils.ts';
import { haptics } from '../../lib/haptics.ts';

interface LessonPlannerProps {
    classId: string;
    onStepChange: (step: LessonStep) => void;
}

export const LessonPlanner: React.FC<LessonPlannerProps> = ({ classId, onStepChange }) => {
    const [steps, setSteps] = useState<LessonStep[]>([
        { id: '1', title: 'Aquecimento Rítmico', type: 'theory', duration_mins: 5 },
        { id: '2', title: 'Escala Pentatônica Am', type: 'exercise', duration_mins: 10 },
        { id: '3', title: 'Música: Sweet Child', type: 'song', duration_mins: 20 },
    ]);
    const [currentIdx, setCurrentIdx] = useState(0);

    const handleNext = () => {
        if (currentIdx < steps.length - 1) {
            const nextIdx = currentIdx + 1;
            setCurrentIdx(nextIdx);
            onStepChange(steps[nextIdx]);
            haptics.heavy();
        }
    };

    const typeIcons = {
        theory: Brain,
        exercise: Activity,
        song: Music
    };

    return (
        <Card className="bg-slate-900 border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
            <CardHeader className="bg-slate-950/50 p-6 flex flex-row items-center justify-between">
                <CardTitle className="text-sm uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                    <ListOrdered size={16} /> Roteiro da Aula
                </CardTitle>
                <div className="bg-sky-500/10 text-sky-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    Ao Vivo
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <Reorder.Group axis="y" values={steps} onReorder={setSteps} className="space-y-3">
                    {steps.map((step, idx) => {
                        const Icon = typeIcons[step.type];
                        const isCurrent = idx === currentIdx;
                        const isDone = idx < currentIdx;

                        return (
                            <Reorder.Item 
                                key={step.id} 
                                value={step}
                                className={cn(
                                    "p-4 rounded-2xl border transition-all flex items-center gap-4",
                                    isCurrent ? "bg-sky-600 border-white shadow-xl scale-105" : 
                                    isDone ? "bg-slate-950 border-emerald-500/20 opacity-60" : "bg-slate-800 border-slate-700"
                                )}
                            >
                                <div className={cn("p-2 rounded-xl", isCurrent ? "bg-white text-sky-600" : "bg-slate-900 text-slate-500")}>
                                    <Icon size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className={cn("text-xs font-black uppercase tracking-tight", isCurrent ? "text-white" : "text-slate-300")}>{step.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Timer size={10} className="text-slate-500" />
                                        <span className="text-[9px] font-bold text-slate-500">{step.duration_mins} MIN</span>
                                    </div>
                                </div>
                            </Reorder.Item>
                        );
                    })}
                </Reorder.Group>

                <Button onClick={handleNext} disabled={currentIdx === steps.length -1} className="w-full py-6 rounded-[24px] text-xs font-black uppercase tracking-widest" leftIcon={SkipForward}>
                    Avançar para Próxima Atividade
                </Button>
            </CardContent>
        </Card>
    );
};
