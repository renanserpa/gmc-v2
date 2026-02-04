
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card.tsx';
import { 
    GraduationCap, Award, Brain, Sparkles, 
    Target, Layers, Piano, CheckCircle2, 
    Users, ChevronDown, BarChart3, Clock,
    Trophy, Zap, Star
} from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Button } from '../components/ui/Button.tsx';
import { cn } from '../lib/utils.ts';
import { haptics } from '../lib/haptics.ts';
import { uiSounds } from '../lib/uiSounds.ts';
import { useRealtimeSync } from '../hooks/useRealtimeSync.ts';

const M = motion as any;

// Definição dos Cursos GCM para Professores
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
            { id: 'p2', title: 'Gamificação de Escalas', content: 'Transforme o treino de escalas em desafios rítmicos épicos.' },
            { id: 'p3', title: 'Leitura à Primeira Vista', content: 'Dinâmicas para acelerar o reconhecimento de intervalos no pentagrama.' }
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
            { id: 'm1', title: 'A Geometria dos 5 Shapes', content: 'Todo acorde maior pode ser tocado em 5 regiões diferentes.' },
            { id: 'm2', title: 'Conectando Escalas', content: 'Como transitar entre os shapes sem perder o fraseado.' },
            { id: 'm3', title: 'Improvisação em Camadas', content: 'Utilizando o sistema CAGED como mapa mental para solos melódicos.' }
        ]
    }
];

export default function TeacherAcademy() {
    usePageTitle("Maestro Academy");
    const { user } = useAuth();
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [selectedClassId, setSelectedClassId] = useState<string>('all');
    
    // ENGINE REALTIME: Monitoramento de Turmas e Status de Módulos
    const { data: classes } = useRealtimeSync<any>('music_classes', `professor_id=eq.${user?.id}`);
    const { data: teacherProgress } = useRealtimeSync<any>('teacher_progress', `professor_id=eq.${user?.id}`);

    /**
     * Lógica de Cálculo de Progresso Visual
     * Se "Ver Meu Progresso" estiver ativo, busca na tabela teacher_progress.
     * Se uma turma estiver selecionada, simula o progresso médio dos alunos (Alpha Engine).
     */
    const getModuleProgress = (courseId: string) => {
        if (selectedClassId === 'all') {
            const isDone = teacherProgress.some(p => p.module_id === courseId);
            return isDone ? 100 : 35; // Mock: 35% default para efeito de UI
        }
        
        // Simulação Pedagógica: Progresso médio da turma selecionada
        const seed = courseId.length + (selectedClassId?.length || 0);
        return (seed * 11) % 101; 
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
            {/* Header com Contexto de Monitoramento */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-slate-900/40 p-10 rounded-[56px] border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none" />
                
                <div className="relative z-10 flex items-center gap-6">
                    <div className="p-4 bg-sky-600 rounded-3xl text-white shadow-xl shadow-sky-900/40">
                        <GraduationCap size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                            Maestro <span className="text-sky-500">Academy</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Soberania & Treinamento Pedagógico</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-[28px] border border-white/10 relative z-10 shadow-2xl group">
                    <div className="p-3 rounded-2xl bg-slate-900 text-slate-500 group-hover:text-sky-400 transition-colors">
                        <Users size={20} />
                    </div>
                    <div className="flex flex-col pr-6">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Visão de Progresso</span>
                        <select 
                            value={selectedClassId}
                            onChange={(e) => { setSelectedClassId(e.target.value); haptics.light(); }}
                            className="bg-transparent text-white font-black text-[11px] uppercase tracking-widest outline-none cursor-pointer hover:text-sky-400 transition-colors"
                        >
                            <option value="all">MEU AVANÇO PESSOAL</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id} className="bg-slate-900">TURMA: {c.name.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {!selectedCourse ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {COURSES.map(course => {
                            const progressValue = getModuleProgress(course.id);
                            const isDone = progressValue >= 100;

                            return (
                                <Card key={course.id} className="bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden hover:border-sky-500/40 transition-all group shadow-2xl relative">
                                    <CardContent className="p-10 space-y-8 relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div className="p-5 rounded-[28px] bg-slate-950 text-sky-400 shadow-inner group-hover:scale-110 transition-transform border border-white/5">
                                                {course.category === 'piano' ? <Piano size={32} /> : <Layers size={32} />}
                                            </div>
                                            {isDone ? (
                                                <div className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2 shadow-lg animate-in zoom-in duration-500">
                                                    <CheckCircle2 size={14} strokeWidth={3} /> Mestre Certificado
                                                </div>
                                            ) : (
                                                <div className="bg-slate-950 text-slate-500 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5 flex items-center gap-2">
                                                    <BarChart3 size={14} className="text-sky-400" /> {progressValue}% Concluído
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tight italic leading-none">{course.title}</h3>
                                            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 font-medium opacity-80">{course.description}</p>
                                        </div>

                                        {/* Barra de Progresso Phygital */}
                                        <div className="space-y-3 pt-2">
                                            <div className="flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                                                <span className="flex items-center gap-2">
                                                    <Zap size={12} className={isDone ? "text-emerald-500" : "text-sky-500"} fill="currentColor" />
                                                    {selectedClassId === 'all' ? 'Seu Status Neural' : 'Status da Turma'}
                                                </span>
                                                <span className={isDone ? "text-emerald-500" : "text-sky-400"}>{progressValue}%</span>
                                            </div>
                                            <div className="h-3 bg-slate-950 rounded-full border border-white/5 overflow-hidden p-0.5 shadow-inner relative">
                                                <M.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progressValue}%` }}
                                                    transition={{ duration: 1.5, ease: "circOut" }}
                                                    className={cn(
                                                        "h-full rounded-full relative transition-colors duration-1000