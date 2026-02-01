import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
// FIX: Added 'Users' to the lucide-react imports to resolve the missing name error
import { 
    Play, Pause, Zap, Brain, Sparkles, Plus, Clock, Target, 
    Flame, Star, Music, Monitor, Volume2, Settings, UserCheck, Activity, Users
} from 'lucide-react';
import { classroomService } from '../services/classroomService.ts';
import { useProfessorData } from '../hooks/useProfessorData.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { haptics } from '../lib/haptics.ts';
import { notify } from '../lib/notification.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils.ts';
import { UserAvatar } from '../components/ui/UserAvatar.tsx';

const M = motion as any;

export default function ClassroomRemote() {
    const [searchParams] = useSearchParams();
    const classId = searchParams.get('classId') || '11111111-2222-3333-4444-555555555555';
    const { data: profData, isLoading } = useProfessorData();
    const { schoolId } = useAuth();
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState(80);
    const [activeSection, setActiveSection] = useState<'roster' | 'remote' | 'gamify'>('roster');

    const sendCommand = (type: string, payload: any = {}) => {
        haptics.medium();
        classroomService.sendCommand(classId, { type, ...payload } as any);
        if (type === 'PLAY') setIsPlaying(true);
        if (type === 'PAUSE') setIsPlaying(false);
    };

    const triggerGamification = (effect: string, xp: number = 0) => {
        haptics.fever();
        notify.success(`Efeito ${effect.toUpperCase()} enviado para a TV!`);
        classroomService.sendCommand(classId, { 
            type: 'TRIGGER_CELEBRATION', 
            label: effect, 
            xpReward: xp 
        });
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 pb-32">
            {/* Top Bar - Status da Unidade */}
            <div className="h-16 bg-slate-900/80 border-b border-white/5 flex items-center px-6 justify-between backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                        <Monitor size={18} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Unidade Conectada</p>
                        <p className="text-xs font-black text-white uppercase truncate">RedHouse School Cuiabá</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black text-emerald-500 uppercase">TV Sync Active</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 space-y-8">
                {/* 1. SEÇÃO ACTIVE CLASS (ROSTER) */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-sky-400 flex items-center gap-2">
                            <Users size={16} /> Alunos na Frequência
                        </h3>
                        <span className="text-[10px] font-black text-slate-600 uppercase">{profData?.students?.length || 0} CONECTADOS</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profData?.students?.map((student: any) => (
                            <Card key={student.id} className="bg-slate-900/60 border-white/5 p-5 rounded-[32px] hover:border-sky-500/30 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <UserAvatar src={student.avatar_url} name={student.name} size="md" />
                                            <M.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity }} className="absolute inset-0 bg-sky-500/20 blur-xl rounded-full -z-10" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white uppercase truncate max-w-[120px]">{student.name.split(' ')[0]}</p>
                                            <p className="text-[8px] font-bold text-slate-500 uppercase">Precisão: 92%</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="h-1.5 w-24 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                            <M.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-sky-500" />
                                        </div>
                                        <span className="text-[7px] font-black text-slate-700 uppercase">Neural Stream</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* 2. TV REMOTE CONTROLS */}
                <Card className="bg-slate-900 border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                    <CardHeader className="bg-slate-950/40 p-8 border-b border-white/5 text-center">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 flex items-center justify-center gap-3">
                            <Zap size={16} className="text-sky-400" /> Command Central (Remote)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 space-y-12">
                        {/* Play/Pause Large Buttons */}
                        <div className="flex justify-center gap-8">
                            <button 
                                onClick={() => sendCommand(isPlaying ? 'PAUSE' : 'PLAY')}
                                className={cn(
                                    "w-32 h-32 rounded-[40px] flex items-center justify-center transition-all shadow-2xl",
                                    isPlaying ? "bg-red-600 text-white animate-pulse" : "bg-sky-600 text-white"
                                )}
                            >
                                {isPlaying ? <Pause size={48} /> : <Play size={48} fill="currentColor" className="ml-2" />}
                            </button>
                        </div>

                        {/* BPM Control */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center px-4">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Ajuste de Pulso (BPM)</span>
                                <span className="text-3xl font-black text-white font-mono">{bpm}</span>
                            </div>
                            <input 
                                type="range" min="40" max="180" step="2" value={bpm}
                                onChange={(e) => { 
                                    const val = parseInt(e.target.value);
                                    setBpm(val);
                                    sendCommand('SET_BPM', { bpm: val });
                                }}
                                className="w-full h-4 bg-slate-950 rounded-full appearance-none accent-sky-500 cursor-pointer"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button 
                                onClick={() => triggerGamification('LUCCA_TIP')} 
                                className="py-8 rounded-[32px] bg-slate-800 border-white/5 text-[10px] font-black uppercase tracking-widest"
                                leftIcon={Brain}
                            >
                                Lucca Oracle Tip
                            </Button>
                            <Button 
                                onClick={() => triggerGamification('FOCUS_MODE')} 
                                className="py-8 rounded-[32px] bg-slate-800 border-white/5 text-[10px] font-black uppercase tracking-widest"
                                leftIcon={Settings}
                            >
                                Focus Mode
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. GAMIFICATION TRIGGERS */}
                <section className="space-y-4 pb-12">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 flex items-center gap-2">
                        <Sparkles size={16} /> Gatilhos de Dopamina
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        <button 
                            onClick={() => triggerGamification('GOLDEN_STAR', 50)}
                            className="p-8 bg-slate-900 border border-amber-500/20 rounded-[40px] flex flex-col items-center gap-3 hover:bg-amber-500 hover:text-slate-950 transition-all group"
                        >
                            <Star size={32} className="text-amber-500 group-hover:text-slate-950" fill="currentColor" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Golden Star</span>
                        </button>
                        
                        <button 
                            onClick={() => triggerGamification('SPIDER_BONUS', 100)}
                            className="p-8 bg-slate-900 border border-emerald-500/20 rounded-[40px] flex flex-col items-center gap-3 hover:bg-emerald-500 hover:text-slate-950 transition-all group"
                        >
                            <Zap size={32} className="text-emerald-500 group-hover:text-slate-950" fill="currentColor" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Spider X2</span>
                        </button>

                        <button 
                            onClick={() => triggerGamification('PARTY_MODE')}
                            className="p-8 bg-slate-900 border border-purple-500/20 rounded-[40px] flex flex-col items-center gap-3 hover:bg-purple-600 hover:text-white transition-all group"
                        >
                            <Flame size={32} className="text-purple-500 group-hover:text-white" fill="currentColor" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Party Jam</span>
                        </button>
                    </div>
                </section>
            </div>

            {/* Bottom Floating Indicator */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none">
                 <div className="max-w-md mx-auto bg-slate-900/90 backdrop-blur-xl p-4 rounded-3xl border border-white/10 flex items-center justify-center gap-4 shadow-2xl pointer-events-auto">
                    <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400 animate-pulse">
                        <Activity size={18} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronia Rítmica em Tempo Real</span>
                 </div>
            </div>
        </div>
    );
}