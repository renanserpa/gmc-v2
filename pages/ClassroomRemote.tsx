
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
    Play, Pause, Zap, Brain, AlertTriangle, Sparkles, Plus, Clock, Target
} from 'lucide-react';
import { classroomService } from '../services/classroomService';
import { lessonValidator, ValidationWarning } from '../services/lessonValidator';
import { haptics } from '../lib/haptics';
import { notify } from '../lib/notification';
import { LessonPlan, LessonStep } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClassroomRemote() {
    const [searchParams] = useSearchParams();
    const classId = searchParams.get('classId') || 'demo-class';
    
    const [currentPlan, setCurrentPlan] = useState<LessonPlan>({
        id: 'new',
        professor_id: '',
        title: 'Aula de Hoje',
        age_group: '4-6', // Default para testar o validador
        steps: [
            { id: 's1', title: 'A Aranha Lucca', type: 'exercise', duration_mins: 8 },
            { id: 's2', title: 'Ritmo Elefante', type: 'theory', duration_mins: 4 }
        ],
        created_at: new Date().toISOString()
    });

    const [warnings, setWarnings] = useState<ValidationWarning[]>([]);

    useEffect(() => {
        const v = lessonValidator.validate(currentPlan);
        setWarnings(v);
        if (v.some(w => w.severity === 'high')) {
            haptics.heavy();
        }
    }, [currentPlan]);

    const addStep = (type: any) => {
        const newStep: LessonStep = {
            id: `s_${Date.now()}`,
            title: type === 'movement_break' ? 'Movement Break 🕺' : 'Nova Atividade',
            type: type,
            duration_mins: type === 'movement_break' ? 1 : 5
        };
        setCurrentPlan(prev => ({ ...prev, steps: [...prev.steps, newStep] }));
        haptics.medium();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-32 pt-4 px-4">
            <header className="flex justify-between items-center bg-slate-900/50 p-6 rounded-[32px] border border-white/5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-sky-600 rounded-2xl shadow-lg shadow-sky-900/40">
                        <Brain size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Co-piloto Pedagógico</h1>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Maestro Inteligente v2.0</p>
                    </div>
                </div>
                <select 
                    value={currentPlan.age_group}
                    onChange={(e) => setCurrentPlan(prev => ({ ...prev, age_group: e.target.value as any }))}
                    className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-sky-400 outline-none"
                >
                    <option value="4-6">KIDS (4-6 ANOS)</option>
                    <option value="7-10">JUNIOR (7-10 ANOS)</option>
                    <option value="adult">ADULTO</option>
                </select>
            </header>

            {/* Neuroscience Warnings Area */}
            <AnimatePresence>
                {warnings.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <Card className="bg-amber-500/10 border-amber-500/30 p-6 rounded-[32px] border-l-8 border-l-amber-500">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-amber-500 rounded-xl text-slate-900 animate-pulse">
                                    <AlertTriangle size={20} />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Atenção Pedagógica: Janela de Atenção</p>
                                        <div className="space-y-2">
                                            {warnings.map((w, i) => (
                                                <div key={i} className="text-sm text-slate-200 font-medium">
                                                    <p>• {w.message}</p>
                                                    <p className="text-slate-500 text-xs italic mt-1">{w.suggestion}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => addStep('movement_break')}
                                        className="text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white"
                                    >
                                        Inserir Movement Break Agora
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-900 border-white/5 p-8 rounded-[48px] shadow-2xl flex flex-col items-center justify-center text-center gap-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Fluxo de Aula</p>
                    <div className="flex gap-4">
                        <button onClick={() => classroomService.sendCommand(classId, { type: 'PLAY' })} className="w-24 h-24 rounded-3xl bg-sky-600 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all">
                            <Play size={40} fill="currentColor" />
                        </button>
                        <button onClick={() => classroomService.sendCommand(classId, { type: 'PAUSE' })} className="w-24 h-24 rounded-3xl bg-slate-800 text-slate-400 flex items-center justify-center border border-white/5 hover:bg-slate-750 transition-all">
                            <Pause size={40} fill="currentColor" />
                        </button>
                    </div>
                </Card>

                <Card className="bg-slate-900 border-white/5 p-8 rounded-[48px] shadow-2xl flex flex-col items-center justify-center text-center gap-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Engajamento IA</p>
                    <button onClick={() => {
                        classroomService.sendCommand(classId, { type: 'QUICK_FEEDBACK', message: 'Elogie o polegar firme dele hoje!' });
                        notify.info("Dica enviada para o painel do professor!");
                    }} className="w-full py-6 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                        <Sparkles size={24} /> Gerar Praise Tip
                    </button>
                </Card>
            </div>
        </div>
    );
}
