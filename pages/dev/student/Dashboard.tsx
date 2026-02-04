
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trophy, Star, Coins, Zap, Target, 
    Heart, Shield, Gamepad2, Play, 
    MessageSquare, Music, ArrowRight,
    Gamepad
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { UserAvatar } from '../../../components/ui/UserAvatar.tsx';
import { useCurrentStudent } from '../../../hooks/useCurrentStudent.ts';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { JourneyMap } from '../../../components/dashboard/JourneyMap.tsx';
import { getLatestFamilyReport } from '../../../services/dataService.ts';
import { cn } from '../../../lib/utils.ts';
import { haptics } from '../../../lib/haptics.ts';
// Added missing notify import to fix line 173 error
import { notify } from '../../../lib/notification.ts';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;

const M = motion as any;

const MOCK_LESSONS = [
    { id: 'l1', title: 'O Toque da Aranha', status: 'completed' as const },
    { id: 'l2', title: 'Ritmo do Elefante', status: 'completed' as const },
    { id: 'l3', title: 'Acordes Amigos', status: 'current' as const },
    { id: 'l4', title: 'Escala de Luz', status: 'locked' as const },
    { id: 'l5', title: 'Power Chords Ninja', status: 'locked' as const },
];

export default function StudentDashboard() {
    const { student, loading } = useCurrentStudent();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [lastReport, setLastReport] = useState<any>(null);

    useEffect(() => {
        if (student?.id) {
            getLatestFamilyReport(student.id).then(setLastReport);
        }
    }, [student?.id]);

    if (loading || !student) return <div className="p-20 text-center animate-pulse text-sky-500 font-black">ENTRANDO NO ARCADE...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
            
            {/* Header Gamer HUD */}
            <header className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 bg-[#0a0f1d] border border-white/5 p-8 rounded-[48px] shadow-2xl relative overflow-hidden flex items-center gap-8">
                    <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none" />
                    <div className="relative group">
                        <UserAvatar src={student.avatar_url} name={student.name} size="xl" className="border-4 border-sky-500 shadow-2xl" />
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
                        
                        {/* XP Bar */}
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

                        {/* HP Bar (Attendance Sim) */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">
                                <span className="flex items-center gap-1"><Heart size={10} className="text-rose-500" fill="currentColor" /> Life (Attendance)</span>
                                <span className="text-rose-500">92%</span>
                            </div>
                            <div className="h-2 bg-slate-950 rounded-full border border-white/5 overflow-hidden">
                                <div className="h-full w-[92%] bg-rose-600" />
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
                {/* Lateral: Quests & Shop */}
                <aside className="lg:col-span-4 space-y-6">
                    <Card className="bg-[#0a0f1d] border-white/10 rounded-[48px] overflow-hidden shadow-2xl relative group">
                        <div className="p-8 bg-slate-950/50 border-b border-white/5 flex items-center gap-3">
                            <MessageSquare size={18} className="text-sky-400" />
                            h3 className="text-[10px] font-black text-white uppercase tracking-widest">Oracle Feedback</h3>
                        </div>
                        <div className="p-8 space-y-4">
                            {lastReport ? (
                                <>
                                    <p className="text-slate-300 italic font-medium leading-relaxed">"{lastReport.report_text}"</p>
                                    <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Target size={14} /></div>
                                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Dever de casa ativo</span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-slate-600 text-xs italic">Aguardando novo feedback do mestre...</p>
                            )}
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

                {/* Main: World Map Journey */}
                <main className="lg:col-span-8">
                    <Card className="bg-[#050505] border-white/5 rounded-[64px] min-h-[700px] shadow-2xl relative overflow-hidden">
                        {/* Grid Background Effect */}
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
                                lessons={MOCK_LESSONS} 
                                onSelect={(l) => notify.info(`Entrando no desafio: ${l.title}`)} 
                            />
                        </div>
                        
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-xl px-6 py-2 rounded-full border border-white/10 flex items-center gap-4 z-20">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="text-[8px] font-black text-slate-500 uppercase">Finalizado</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                                <span className="text-[8px] font-black text-slate-500 uppercase">Objetivo</span>
                            </div>
                        </div>
                    </Card>
                </main>
            </div>
        </div>
    );
}
