
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trophy, Star, Coins, Zap, Target, 
    Heart, Shield, Gamepad2, Play, 
    MessageSquare, Music, ArrowRight,
    Gamepad, Sparkles, User, Bell, FileText,
    TrendingUp, ExternalLink, PlayCircle, Guitar, Palette
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { UserAvatar } from '../../../components/ui/UserAvatar.tsx';
import { useCurrentStudent } from '../../../hooks/useCurrentStudent.ts';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { JourneyMap } from '../../../components/dashboard/JourneyMap.tsx';
import { getLatestFamilyReport, getActiveLessonMaterial } from '../../../services/dataService.ts';
import { getAvatarAssets } from '../../../services/storeService.ts';
import { supabase } from '../../../lib/supabaseClient.ts';
import { cn } from '../../../lib/utils.ts';
import { haptics } from '../../../lib/haptics.ts';
import { notify } from '../../../lib/notification.ts';
import { uiSounds } from '../../../lib/uiSounds.ts';
import confetti from 'canvas-confetti';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;

const M = motion as any;

export default function StudentDashboard() {
    const { student, loading, refetch } = useCurrentStudent();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [lastReport, setLastReport] = useState<any>(null);
    const [activeMaterial, setActiveMaterial] = useState<any>(null);
    const [showReward, setShowReward] = useState<any>(null);
    const [equippedSkin, setEquippedSkin] = useState<any>(null);

    // Carregar informações da Skin Ativa
    useEffect(() => {
        const skinId = student?.metadata?.equipped_skin_id;
        if (skinId) {
            getAvatarAssets().then(assets => {
                const found = assets.find((a: any) => a.id === skinId);
                setEquippedSkin(found);
            });
        } else {
            setEquippedSkin(null);
        }
    }, [student?.metadata?.equipped_skin_id]);

    useEffect(() => {
        if (!student?.id) return;

        const profileSub = supabase
            .channel(`student_rewards_${student.id}`)
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'profiles', 
                filter: `id=eq.${student.id}` 
            }, (payload) => {
                const oldXp = student.xp;
                const newXp = payload.new.xp;
                const earned = newXp - oldXp;

                if (earned > 0) {
                    haptics.success();
                    uiSounds.playSuccess();
                    setShowReward({ amount: earned, type: 'XP' });
                    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
                    refetch();
                    setTimeout(() => setShowReward(null), 4000);
                }
            })
            .subscribe();

        const { data: enrollment } = supabase.from('enrollments').select('class_id').eq('student_id', student.id).maybeSingle() as any;
        
        if (enrollment?.class_id) {
            getActiveLessonMaterial(enrollment.class_id).then(setActiveMaterial);
            
            const orchestrationSub = supabase
                .channel(`class_updates_${enrollment.class_id}`)
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'classroom_orchestration', 
                    filter: `class_id=eq.${enrollment.class_id}` 
                }, (payload) => {
                    getActiveLessonMaterial(enrollment.class_id).then(setActiveMaterial);
                    notify.info("O Mestre mudou o conteúdo da aula!");
                })
                .subscribe();
                
            return () => {
                supabase.removeChannel(orchestrationSub);
                supabase.removeChannel(profileSub);
            };
        }

        return () => supabase.removeChannel(profileSub);
    }, [student?.id, refetch]);

    const dynamicLessons = useMemo(() => {
        const completedCount = student?.completed_content_ids?.length || 0;
        return [
            { id: 'l1', title: 'O Toque da Aranha', status: completedCount >= 1 ? 'completed' : 'current' },
            { id: 'l2', title: 'Ritmo do Elefante', status: completedCount >= 2 ? 'completed' : (completedCount === 1 ? 'current' : 'locked') },
            { id: 'l3', title: 'Acordes Amigos', status: completedCount >= 3 ? 'completed' : (completedCount === 2 ? 'current' : 'locked') },
            { id: 'l4', title: 'Escala de Luz', status: completedCount >= 4 ? 'completed' : (completedCount === 3 ? 'current' : 'locked') },
            { id: 'l5', title: 'Power Chords Ninja', status: completedCount >= 5 ? 'completed' : (completedCount === 4 ? 'current' : 'locked') },
        ] as any[];
    }, [student?.completed_content_ids]);

    if (loading || !student) return <div className="p-20 text-center animate-pulse text-sky-500 font-black tracking-widest">SINCRONIZANDO ARCADE...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
            
            <AnimatePresence>
                {showReward && (
                    <M.div 
                        initial={{ opacity: 0, y: 50, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.5)] border-2 border-white flex items-center gap-3 font-black uppercase italic"
                    >
                        <Zap size={24} fill="currentColor" />
                        RECOMPENSA DO MESTRE: +{showReward.amount} {showReward.type}!
                    </M.div>
                )}
            </AnimatePresence>

            <M.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-purple-600 text-white py-3 px-8 rounded-full border-2 border-white shadow-[0_0_30px_#a855f7] flex items-center justify-center gap-4 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Zap size={20} fill="white" className="animate-pulse" />
                <span className="font-black uppercase tracking-[0.4em] text-xs">MODO ARCADE ATIVO - BEM-VINDO, ALUNO!</span>
                <Sparkles size={20} fill="white" />
            </M.div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
                <M.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative group shrink-0"
                >
                    <div className="absolute -inset-4 bg-sky-500/20 rounded-full blur-2xl animate-pulse" />
                    <div className="w-32 h-32 rounded-[40px] bg-slate-900 border-4 border-sky-500 p-1 shadow-2xl relative z-10 overflow-hidden">
                        <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Lucca&backgroundColor=b6e3f4`} 
                            className="w-full h-full object-cover rounded-[32px]"
                        />
                    </div>
                </M.div>

                <M.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/95 p-6 rounded-[32px] rounded-tl-none shadow-2xl border-4 border-sky-500/30 max-w-lg relative"
                >
                    <div className="absolute -left-3 top-0 w-4 h-4 bg-white rotate-45" />
                    <p className="text-slate-900 font-black text-xl italic leading-tight uppercase tracking-tighter">
                        "E aí, Rockstar! Pronto para a missão de hoje? Vamos fazer barulho!"
                    </p>
                </M.div>
            </div>
            
            <header className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 bg-[#0a0f1d] border border-white/5 p-8 rounded-[48px] shadow-2xl relative overflow-hidden flex items-center gap-8">
                    <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none" />
                    
                    <div className="relative group">
                        <UserAvatar src={student.avatar_url} name={student.name} size="xl" className="border-4 border-sky-500 shadow-2xl" />
                        
                        {/* REFLEXO VISUAL DA SKIN EQUIPADA */}
                        {equippedSkin && (
                            <motion.div 
                                initial={{ scale: 0 }} 
                                animate={{ scale: 1 }}
                                className="absolute -top-3 -left-3 bg-purple-600 text-white p-2 rounded-2xl shadow-xl border-4 border-[#0a0f1d] z-20"
                                title={`Equipado: ${equippedSkin.name}`}
                            >
                                {equippedSkin.category === 'instrument' ? <Guitar size={18} /> : <Sparkles size={18} />}
                            </motion.div>
                        )}

                        <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-2xl shadow-xl border-4 border-[#0a0f1d]">
                            <Trophy size={16} fill="currentColor" />
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-end">
                            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                                {student.name.split(' ')[0]} <span className="text-sky-500 text-lg ml-2">LVL {student.current_level}</span>
                            </h1>
                            <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Maestro Pro Player</span>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">
                                <span>XP Progress</span>
                                <span>{student.xp} / {student.xpToNextLevel}</span>
                            </div>
                            <div className="h-4 bg-slate-950 rounded-full border border-white/10 p-0.5 overflow-hidden shadow-inner">
                                <M.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(student.xp / (student.xpToNextLevel || 100)) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-sky-600 to-purple-500 rounded-full relative"
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                </M.div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4">
                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[40px] p-6 flex flex-col items-center justify-center gap-2 shadow-xl border-b-4 border-amber-500">
                        <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500"><Coins size={24} fill="currentColor" /></div>
                        <span className="text-3xl font-black text-white tracking-tighter">{student.coins}</span>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Olie Coins</span>
                    </Card>
                    <button 
                        onClick={() => { haptics.medium(); navigate('/student/practice'); }}
                        className="bg-sky-600 hover:bg-sky-500 p-6 rounded-[40px] flex flex-col items-center justify-center gap-2 shadow-2xl transition-all hover:scale-105 active:scale-95 group"
                    >
                        <div className="p-3 bg-white/20 rounded-2xl text-white group-hover:rotate-12 transition-transform"><Gamepad size={24} /></div>
                        <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Play Solo</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <aside className="lg:col-span-4 space-y-6">
                    <Card className="bg-[#0a0f1d] border-2 border-sky-500/30 rounded-[48px] overflow-hidden shadow-2xl relative group">
                        <div className="p-8 bg-sky-600 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText size={18} className="text-white" />
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Atividade da Semana</h3>
                            </div>
                            <div className="px-2 py-1 rounded bg-white/20 text-[8px] font-black text-white uppercase">Apostila Digital</div>
                        </div>
                        <div className="p-8 space-y-6">
                            {activeMaterial ? (
                                <>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-black text-white uppercase italic truncate">{activeMaterial.title}</h4>
                                        <p className="text-slate-500 text-xs font-medium">Material projetado no HDMI da última aula.</p>
                                    </div>
                                    <Button 
                                        onClick={() => window.open(activeMaterial.url, '_blank')}
                                        className="w-full py-6 rounded-2xl bg-slate-900 border border-white/10 text-sky-400 font-black uppercase tracking-widest text-[10px]"
                                        leftIcon={ExternalLink}
                                    >
                                        ABRIR MATERIAL AGORA
                                    </Button>
                                </>
                            ) : (
                                <p className="text-slate-600 text-xs italic text-center py-4">O Mestre ainda não lançou o material desta aula...</p>
                            )}
                            
                            <div className="pt-6 border-t border-white/5">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-800 p-0.5 overflow-hidden border-2 border-sky-500">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Lucca`} className="w-full h-full" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed italic">
                                        "Aqui está o material que usamos hoje! Treine 15 min por dia para o bônus!"
                                    </p>
                                </div>
                                <div className="flex justify-between items-center text-[9px] font-black text-slate-600 uppercase mb-2">
                                    <span>Meta de Treino</span>
                                    <span>{student.metadata?.weekly_practice_minutes || 0}/15 MIN</span>
                                </div>
                                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                    <M.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(((student.metadata?.weekly_practice_minutes || 0) / 15) * 100, 100)}%` }}
                                        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <button 
                        onClick={() => navigate('/student/shop')}
                        className="w-full group"
                    >
                        <Card className="bg-gradient-to-br from-purple-600 to-indigo-900 border-none rounded-[48px] p-8 shadow-2xl transition-all group-hover:scale-105 group-hover:rotate-1 group-active:scale-95">
                             <div className="flex items-center justify-between">
                                <div className="space-y-2 text-left">
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Skins Shop</h3>
                                    <p className="text-white/60 text-[9px] font-black uppercase tracking-widest">Customização Pro</p>
                                </div>
                                <div className="p-4 bg-white/20 rounded-3xl text-white"><ArrowRight size={24} /></div>
                             </div>
                        </Card>
                    </button>
                </aside>

                <main className="lg:col-span-8">
                    <Card className="bg-[#050505] border-white/5 rounded-[64px] min-h-[700px] shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
                        </div>
                        
                        <div className="p-12 border-b border-white/5 flex justify-between items-center relative z-10 bg-black/40">
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Olie <span className="text-sky-500">Journey</span></h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Mapa de Evolução • RedHouse School</p>
                            </div>
                            <div className="p-4 bg-sky-600 rounded-3xl text-white shadow-xl shadow-sky-900/30 animate-bounce">
                                <Music size={24} />
                            </div>
                        </div>

                        <div className="relative z-10 custom-scrollbar overflow-y-auto max-h-[600px]">
                            <JourneyMap 
                                lessons={dynamicLessons} 
                                onSelect={(l) => notify.info(`Entrando no desafio: ${l.title}`)} 
                            />
                        </div>
                    </Card>
                </main>
            </div>
        </div>
    );
}
