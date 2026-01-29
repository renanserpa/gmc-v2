import React, { useState, useEffect } from 'react';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;
import { useCurrentStudent } from '../hooks/useCurrentStudent.ts';
import { getStudentMilestones, getPracticeTrends, getLatestPracticeStats } from '../services/dataService.ts';
import { getMaestroStudyPlan, getCrucibleChallenge } from '../services/aiService.ts';
import StudentHud from '../components/StudentHud.tsx';
import { ModuleMap } from '../components/dashboard/ModuleMap.tsx';
import { Leaderboard } from '../components/Leaderboard.tsx';
import { EvolutionCard } from '../components/EvolutionCard.tsx';
import { ConcertHall } from '../components/ConcertHall.tsx';
import { MilestoneTimeline } from '../components/dashboard/MilestoneTimeline.tsx';
import { MaestroAIChat } from '../components/MaestroAIChat.tsx';
import { NoticeBoardWidget } from '../components/NoticeBoardWidget.tsx';
import { AIRecommendationCard } from '../components/dashboard/AIRecommendationCard.tsx';
import { AccuracyHeatmap } from '../components/dashboard/AccuracyHeatmap.tsx';
import { PracticeInsights } from '../components/dashboard/PracticeInsights.tsx';
import { CrucibleCard } from '../components/dashboard/CrucibleCard.tsx';
import { DashboardSkeleton } from '../components/ui/Skeleton.tsx';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/Dialog.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Zap, Map as MapIcon, Flag, Play, Sparkles, AlertCircle } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle.ts';
import { haptics } from '../lib/haptics.ts';

export default function StudentDashboard() {
    usePageTitle("Minha Jornada Epic");
    const { student, loading, error } = useCurrentStudent();
    const navigate = useNavigate();
    const [milestones, setMilestones] = useState<any[]>([]);
    const [trends, setTrends] = useState<any[]>([]);
    const [latestStats, setLatestStats] = useState<any>(null);
    const [recommendation, setRecommendation] = useState<any>(null);
    const [crucible, setCrucible] = useState<any>(null);
    const [selectedModule, setSelectedModule] = useState<any>(null);

    useEffect(() => {
        if (student) {
            loadDashboardData();
        }
    }, [student]);

    async function loadDashboardData() {
        try {
            const [ms, tr, stats] = await Promise.all([
                getStudentMilestones(student!.id),
                getPracticeTrends(student!.id),
                getLatestPracticeStats(student!.id)
            ]);
            setMilestones(ms);
            setTrends(tr);
            setLatestStats(stats);
            
            const plan = await getMaestroStudyPlan(student!.name, tr);
            setRecommendation(plan);
            
            if (tr.length > 0 || stats) {
                const challenge = await getCrucibleChallenge(student!.name, stats || tr[0]);
                setCrucible(challenge);
            }
        } catch (e) {
            console.error("Dashboard data sync failed", e);
        }
    }

    const handleModuleSelect = (mod: any) => {
        haptics.heavy();
        setSelectedModule(mod);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Bom dia";
        if (hour < 18) return "Boa tarde";
        return "Boa noite";
    };

    if (loading) return <DashboardSkeleton />;
    
    // Tratamento para erro de permissão ou aluno não vinculado
    if (error || !student) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in">
            <div className="p-10 text-center bg-slate-900/60 rounded-[48px] border border-white/5 max-w-md shadow-2xl backdrop-blur-xl">
                <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                    <AlertCircle className="text-amber-500" size={40} />
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Sincronia Necessária</h2>
                <p className="mt-4 text-slate-400 text-sm leading-relaxed">
                    Seu perfil de músico ainda não foi detectado no Kernel Maestro. 
                    Verifique se você utilizou o código de vínculo fornecido pelo seu professor.
                </p>
                <div className="flex flex-col gap-3 mt-8">
                    <Button onClick={() => navigate('/student/link')} className="w-full py-6 rounded-2xl">
                        Vincular Jornada Agora
                    </Button>
                    <Button variant="ghost" onClick={() => window.location.reload()} className="text-slate-500 text-[10px] font-black uppercase">
                        Tentar Re-Sincronizar
                    </Button>
                </div>
            </div>
        </div>
    );

    const MOCK_MODULES = [
        { id: 'mod-1', trail_id: '1', title: 'Fundamentos do Elefante', description: 'Notas graves e postura inicial.', order_index: 0, icon_type: 'theory', xp_reward: 100, required_missions: [] },
        { id: 'mod-2', trail_id: '1', title: 'O Voo do Passarinho', description: 'Notas agudas e leveza no toque.', order_index: 1, icon_type: 'technique', xp_reward: 150, required_missions: [] },
        { id: 'mod-3', trail_id: '1', title: 'Primeiros Riffs', description: 'Músicas simples com 2 acordes.', order_index: 2, icon_type: 'repertoire', xp_reward: 200, required_missions: [] },
        { id: 'mod-4', trail_id: '1', title: 'O Guardião das Cordas', description: 'Desafio final do módulo 1.', order_index: 3, icon_type: 'boss', xp_reward: 500, required_missions: [] },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-24 px-4">
            <div className="flex items-center gap-2 mb-2 px-1">
                <Sparkles size={16} className="text-sky-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                    {getGreeting()}, {student.name.split(' ')[0]}! Sincronia Estável.
                </span>
            </div>

            <NoticeBoardWidget studentId={student.id} />
            
            <StudentHud student={student} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    {recommendation && (
                        <AIRecommendationCard 
                            recommendation={recommendation} 
                            onAction={() => navigate('/student/practice')} 
                        />
                    )}

                    {recommendation?.maestroInsight && (
                        <PracticeInsights 
                            insight={recommendation.maestroInsight} 
                            focusArea={recommendation.focusArea as any} 
                        />
                    )}

                    <Card className="bg-slate-900 border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                        <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between bg-slate-950/20">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2 uppercase tracking-widest italic text-white">
                                    <MapIcon className="text-sky-500" /> Mapa da Jornada
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ModuleMap 
                                modules={MOCK_MODULES as any} 
                                completedIds={student.completed_module_ids || []}
                                onSelectModule={handleModuleSelect}
                                avatarUrl={student.avatar_url}
                                studentName={student.name}
                            />
                        </CardContent>
                    </Card>

                    {latestStats?.noteHeatmap ? (
                        <AccuracyHeatmap heatmap={latestStats.noteHeatmap} />
                    ) : (
                        <div className="p-12 text-center bg-slate-900/40 rounded-[32px] border border-dashed border-slate-800">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Toque sua primeira nota para mapear sua precisão!</p>
                        </div>
                    )}

                    {crucible && (
                        <CrucibleCard 
                            challenge={crucible} 
                            onStart={() => navigate('/student/practice')} 
                        />
                    )}
                </div>

                <aside className="lg:col-span-4 space-y-8">
                    <EvolutionCard studentId={student.id} />
                    
                    <Card className="bg-slate-900 border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                        <CardHeader className="bg-slate-950/40 p-6 border-b border-white/5">
                            <CardTitle className="text-xs uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                                <Zap size={14} className="text-amber-500" /> Ranking da Turma
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Leaderboard professorId={student.professor_id} currentStudentId={student.id} />
                        </CardContent>
                    </Card>

                    <ConcertHall professorId={student.professor_id} />
                    
                    <Card className="bg-slate-900 border-white/5 rounded-[32px] overflow-hidden">
                        <CardHeader className="bg-slate-950/40 p-6 border-b border-white/5">
                            <CardTitle className="text-xs uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                                <Flag size={14} className="text-sky-500" /> Próximos Passos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <MilestoneTimeline milestones={milestones} />
                        </CardContent>
                    </Card>
                </aside>
            </div>

            <MaestroAIChat student={student} />

            <Dialog open={!!selectedModule} onOpenChange={() => setSelectedModule(null)}>
                <DialogContent className="bg-slate-900 border-slate-800 rounded-[40px] max-w-md shadow-2xl">
                    {selectedModule && (
                        <div className="space-y-6 text-center p-4">
                            <div className="w-20 h-20 bg-sky-500/10 rounded-3xl flex items-center justify-center mx-auto border border-sky-500/20">
                                <Zap size={32} className="text-sky-400" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
                                    {selectedModule.title}
                                </DialogTitle>
                                <p className="text-slate-400 mt-2 font-medium">
                                    {selectedModule.description}
                                </p>
                            </div>
                            <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-600 uppercase">Recompensa</p>
                                    <p className="text-xl font-black text-white">+{selectedModule.xp_reward} XP</p>
                                </div>
                                <Button onClick={() => { setSelectedModule(null); navigate('/student/practice'); }} leftIcon={Play}>Explorar</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}