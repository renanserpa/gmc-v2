import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card.tsx';
import { GraduationCap, Award, Brain, Sparkles, Target, Layers, Piano } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Button } from '../components/ui/Button.tsx';
import { cn } from '../lib/utils.ts';
import { haptics } from '../lib/haptics.ts';
import { uiSounds } from '../lib/uiSounds.ts';
import { supabase } from '../lib/supabaseClient.ts';

const COURSES: any[] = [
    {
        id: 'c_piano_tech',
        title: 'Tecnologia no Ensino de Piano',
        category: 'piano',
        description: 'Integração de USB MIDI e visualização de notas para acelerar a leitura de partitura.',
        xp_reward: 1500,
        badge: 'Maestro das Teclas',
        modules: [
            { id: 'p1', title: 'Configurando MIDI na Aula', content: 'Aprenda a conectar teclados digitais ao GCM para feedback instantâneo.' },
            { id: 'p2', title: 'Gamificação de Escalas', content: 'Transforme o treino de escalas em desafios rítmicos épicos.' }
        ]
    },
    {
        id: 'c_caged_1',
        title: 'Mestre do CAGED',
        category: 'theory',
        description: 'Domine a conexão visual de acordes e escalas em todo o braço do violão.',
        xp_reward: 1200,
        badge: 'Cartógrafo Harmônico',
        modules: [
            { id: 'm1', title: 'A Geometria dos 5 Shapes', content: 'Todo acorde maior pode ser tocado em 5 regiões diferentes.' }
        ]
    }
];

export default function TeacherAcademy() {
    usePageTitle("Maestro Academy");
    const { profile } = useAuth();
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [progress, setProgress] = useState<any[]>([]);

    useEffect(() => {
        if (profile?.id) loadProgress();
    }, [profile]);

    const loadProgress = async () => {
        const { data } = await supabase.from('teacher_progress').select('*').eq('professor_id', profile?.id);
        setProgress(data || []);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sky-400">
                        <GraduationCap size={24} />
                        <span className="text-xs font-black uppercase tracking-[0.4em]">Certificação Maestro</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">Maestro Academy</h1>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {!selectedCourse ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {COURSES.map(course => {
                            const isDone = progress.some(p => p.module_id === course.id);
                            return (
                                <Card key={course.id} className="bg-slate-900 border-white/5 rounded-[40px] overflow-hidden hover:border-sky-500/40 transition-all group">
                                    <CardContent className="p-8 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="p-4 rounded-2xl bg-sky-500/10 text-sky-400">
                                                {course.category === 'piano' ? <Piano size={28} /> : <Layers size={28} />}
                                            </div>
                                            {isDone && <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">Mestre</div>}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{course.title}</h3>
                                            <p className="text-slate-400 text-sm leading-relaxed mt-2">{course.description}</p>
                                        </div>
                                        <Button variant={isDone ? 'ghost' : 'primary'} onClick={() => setSelectedCourse(course)} className="w-full">
                                            {isDone ? 'Rever Teoria' : 'Iniciar Estudo'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-8">
                        <button onClick={() => setSelectedCourse(null)} className="text-slate-500 hover:text-white uppercase text-xs font-black">← Catálogo</button>
                        <Card className="bg-slate-900 p-10 rounded-[48px] border-white/10 shadow-2xl">
                             <h2 className="text-3xl font-black text-white uppercase mb-8">{selectedCourse.title}</h2>
                             <div className="space-y-10">
                                 {selectedCourse.modules.map((m: any, i: number) => (
                                     <div key={m.id} className="space-y-3">
                                         <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center font-black text-xs">{i+1}</div>
                                             <h4 className="text-sky-400 font-black uppercase text-sm tracking-widest">{m.title}</h4>
                                         </div>
                                         <p className="text-slate-300 leading-relaxed ml-11">{m.content}</p>
                                     </div>
                                 ))}
                             </div>
                             <Button onClick={() => setSelectedCourse(null)} className="w-full mt-10">Concluir</Button>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}