import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentStudent } from '../hooks/useCurrentStudent.ts';
import { getStudentMilestones, getPracticeTrends } from '../services/dataService.ts';
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
import { DashboardSkeleton, Skeleton } from '../components/ui/Skeleton.tsx';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/Dialog.tsx';
import { LearningModule } from '../types.ts';
import { Zap, Shield, Map as MapIcon, Flag, Target, Play } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button.tsx';
import { haptics } from '../lib/haptics.ts';
import { cn } from '../lib/utils.ts';

export default function StudentDashboard() {
  usePageTitle("Minha Jornada Epic");
  const { student, loading: studentLoading } = useCurrentStudent();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('journey');
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<any | null>(null);
  const [crucible, setCrucible] = useState<any | null>(null);
  const [lastStats, setLastStats] = useState<any | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const modules: LearningModule[] = [
      { id: 'mod_1', trail_id: 't1', title: "Anatomia e Sons", description: "Conheça seu instrumento e a diferença sagrada entre Elefante e Passarinho.", order_index: 1, icon_type: 'theory', xp_reward: 50, required_missions: [] },
      { id: 'mod_2', trail_id: 't1', title: "A Mão do Ritmo", description: "Domine o PIMA e a palhetada alternada básica para desbloquear o poder rítmico.", order_index: 2, icon_type: 'technique', xp_reward: 80, required_missions: [] },
      { id: 'mod_3', trail_id: 't1', title: "Primeira Canção", description: "Toque 'We Will Rock You' usando o acorde Em e prove seu valor no palco.", order_index: 3, icon_type: 'repertoire', xp_reward: 100, required_missions: [] },
      { id: 'mod_boss', trail_id: 't1', title: "O Desafio de Harry", description: "Enfrente o Mestre apresentando o Riff de Harry Potter. Vitória garantida?", order_index: 4, icon_type: 'boss', xp_reward: 250, required_missions: [] },
  ];

  useEffect(() => {
    const initAI = async () => {
        if (!student?.id) return;
        getStudentMilestones(student.id).then(setMilestones).catch(() => {});
        setLoadingAI(true);
        try {
            const trends = await getPracticeTrends(student.id, 5);
            setLastStats(trends[0] || null);
            if (trends.length > 0) {
                const [plan, boss] = await Promise.all([
                    getMaestroStudyPlan(student.name, trends),
                    getCrucibleChallenge(student.name, trends[0])
                ]);
                setAiRecommendation(plan);
                setCrucible(boss);
            } else {
                setAiRecommendation({
                    title: "O Despertar do Maestro",
                    description: "Realize sua primeira prática para que eu possa traçar seu perfil técnico.",
                    focusArea: "technique",
                    xpReward: 50,
                    maestroInsight: "O primeiro passo é o mais importante da sinfonia."
                });
            }
        } catch (e) {
            console.error("AI Recommendation Failure:", e);
        } finally {
            setLoadingAI(false);
        }
    };
    initAI();
  }, [student?.id, student?.name]);

  if (studentLoading || !student) return <DashboardSkeleton />;

  const handleStartModule = () => {
      if (!selectedModule) return;
      haptics.heavy();
      navigate('/student/practice');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 animate-in fade-in duration-700">
      <StudentHud student={student} />
      <div className="relative">
          <AnimatePresence mode="wait">
            {loadingAI ? (
                <div className="bg-slate-900/40 border-2 border-slate-800 rounded-[32px] p-8 flex items-center gap-6 animate-pulse">
                     <div className="w-16 h-16 bg-slate-800 rounded-2xl" />
                     <div className="flex-1 space-y-3">
                         <Skeleton className="h-4 w-32" />
                         <Skeleton className="h-6 w-3/4" />
                     </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {crucible && (
                        <CrucibleCard 
                            challenge={crucible} 
                            onStart={() => navigate('/student/practice', { state: { crucible: true, targetNotes: crucible.targetNotes } })} 
                        />
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <PracticeInsights 
                            insight={aiRecommendation?.maestroInsight} 
                            focusArea={aiRecommendation?.focusArea || 'technique'} 
                        />
                        <AIRecommendationCard 
                            recommendation={aiRecommendation} 
                            onAction={() => navigate('/student/practice', { state: { focusArea: aiRecommendation.focusArea } })} 
                        />
                    </div>
                    {lastStats?.noteHeatmap && (
                        <AccuracyHeatmap heatmap={lastStats.noteHeatmap} />
                    )}
                </div>
            )}
          </AnimatePresence>
      </div>
      <NoticeBoardWidget studentId={student.id} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
              <EvolutionCard studentId={student.id} />
              <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                      <Flag size={14} className="text-sky-400" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Marcos da Jornada</h3>
                  </div>
                  <MilestoneTimeline milestones={milestones} />
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2 border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-900 rounded-2xl border border-white/10 text-sky-400">
                          <MapIcon size={24} />
                      </div>
                      <div>
                          <h3 className="text-xl font-black text-white uppercase tracking-tighter">Mundo Musical</h3>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Explore a Trilha do Maestro</p>
                      </div>
                  </div>
                  <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
                    <button onClick={() => { setActiveTab('journey'); haptics.light(); }} className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative", activeTab === 'journey' ? "bg-sky-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}>
                        Mapa Mundi
                    </button>
                    <button onClick={() => { setActiveTab('badges'); haptics.light(); }} className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative", activeTab === 'badges' ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}>
                        Conquistas
                    </button>
                  </div>
              </div>
              <AnimatePresence mode="wait">
                  {activeTab === 'journey' ? (
                      <ModuleMap 
                        key="map"
                        modules={modules} 
                        completedIds={student.completed_module_ids || []} 
                        onSelectModule={setSelectedModule} 
                        avatarUrl={student.avatar_url}
                        studentName={student.name}
                      />
                  ) : (
                      <div className="py-32 flex flex-col items-center justify-center gap-6 border-2 border-dashed border-slate-800 rounded-[64px] bg-slate-900/20">
                          <Shield size={64} className="text-slate-700 animate-pulse" />
                          <div className="text-center">
                              <p className="text-slate-300 font-black uppercase tracking-[0.3em]">Hall da Fama</p>
                              <p className="text-slate-600 text-xs mt-2 uppercase font-bold tracking-widest">Complete desafios para ver badges aqui!</p>
                          </div>
                      </div>
                  )}
              </AnimatePresence>
          </div>
          <div className="lg:col-span-4 space-y-10">
              <ConcertHall professorId={student.professor_id} />
              <Leaderboard professorId={student.professor_id} currentStudentId={student.id} />
          </div>
      </div>
      <Dialog open={!!selectedModule} onOpenChange={() => setSelectedModule(null)}>
          <DialogContent className="max-w-md bg-slate-950 border-slate-800 rounded-[40px] p-0 overflow-hidden shadow-2xl ring-1 ring-white/10">
              {selectedModule && (
                  <div className="relative">
                      <div className="h-56 bg-gradient-to-br from-sky-600 to-indigo-800 flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                          <motion.div initial={{ scale: 0.5, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} className="bg-white/10 p-10 rounded-full backdrop-blur-xl border border-white/20 shadow-2xl">
                              <Target size={80} className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" />
                          </motion.div>
                      </div>
                      <div className="p-10 space-y-8">
                          <div className="space-y-3">
                              <span className="text-[10px] font-black uppercase text-sky-500 tracking-[0.5em] flex items-center gap-2">
                                  <Zap size={14} fill="currentColor" /> Novo Território Descoberto
                              </span>
                              <DialogTitle className="text-4xl font-black text-white uppercase tracking-tighter leading-none">{selectedModule.title}</DialogTitle>
                          </div>
                          <p className="text-slate-400 text-base leading-relaxed font-medium">"{selectedModule.description}"</p>
                          <div className="bg-slate-900/80 p-6 rounded-[32px] border border-white/5 flex items-center justify-between shadow-inner">
                              <div className="space-y-1">
                                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Tesouro Garantido</p>
                                  <p className="text-2xl font-black text-amber-500 flex items-center gap-2">+{selectedModule.xp_reward} <span className="text-xs uppercase text-slate-600">XP</span></p>
                              </div>
                              <Button onClick={handleStartModule} className="px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest" leftIcon={Play}>Entrar na Fase</Button>
                          </div>
                      </div>
                  </div>
              )}
          </DialogContent>
      </Dialog>
      <MaestroAIChat student={student} />
    </div>
  );
}