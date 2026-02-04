
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, Circle, Trophy, Zap, 
    Plus, Clock, Target, Rocket, 
    AlertCircle, Loader2, Sparkles, Filter, Edit2, Trash2, X, Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
// Added missing Dialog imports from Radix wrapper to resolve "Cannot find name 'Dialog'" errors
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/Dialog.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useCurrentStudent } from '../hooks/useCurrentStudent.ts';
import { useRealtimeSync } from '../hooks/useRealtimeSync.ts';
import { 
    updateMissionStatus, 
    createMission, 
    getStudentsByTeacher,
    updateMission,
    deleteMission
} from '../services/dataService.ts';
import { Mission, MissionStatus, Student } from '../types.ts';
import { notify } from '../lib/notification.ts';
import { haptics } from '../lib/haptics.ts';
import { cn } from '../lib/utils.ts';
import { uiSounds } from '../lib/uiSounds.ts';
import confetti from 'canvas-confetti';

const M = motion as any;

export default function TaskManager() {
    const { user, profile, role } = useAuth();
    const { student, refetch: refetchStudent } = useCurrentStudent();
    // FIX: Using any[] for students state to accommodate mapping from Profiles to UI-ready objects
    const [students, setStudents] = useState<any[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('pending');
    
    // ENGINE REALTIME: Sincronismo automático
    // Para professor, usamos o ID da escola dele. Para aluno, também.
    const schoolId = profile?.school_id || student?.school_id || null;
    const { data: missions, loading } = useRealtimeSync<any>('missions', schoolId);

    // Modals & Forms
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingMission, setEditingMission] = useState<Mission | null>(null);
    const [newMission, setNewMission] = useState({ title: '', student_id: '', xp_reward: 30, description: '' });

    useEffect(() => {
        if (role === 'professor' && user) {
            // FIX: Mapping Profile fields to UI-expected property names (full_name -> name)
            getStudentsByTeacher(user.id).then(res => {
                setStudents(res.map(p => ({ ...p, name: p.full_name })));
            });
        }
    }, [user, role]);

    const handleComplete = async (mission: Mission) => {
        if (mission.status === MissionStatus.Done) return;
        
        haptics.heavy();
        uiSounds.playSuccess();
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#38bdf8', '#a78bfa', '#facc15']
        });

        try {
            await updateMissionStatus(mission.id, student!.id, MissionStatus.Done, mission.xp_reward);
            notify.success(`Missão Masterizada! +${mission.xp_reward} XP`);
            refetchStudent();
        } catch (e) {
            notify.error("Falha ao computar vitória.");
        }
    };

    const handleAddMission = async () => {
        if (!newMission.title || !newMission.student_id) return;
        try {
            await createMission({
                ...newMission,
                professor_id: user!.id,
                school_id: schoolId,
                status: MissionStatus.Pending,
                week_start: new Date().toISOString()
            });
            notify.success("Missão lançada para o aluno!");
            setIsAddOpen(false);
            setNewMission({ title: '', student_id: '', xp_reward: 30, description: '' });
        } catch (e) {
            notify.error("Erro ao criar missão.");
        }
    };

    const filteredMissions = (missions || []).filter(m => {
        // Se for aluno, vê apenas as suas
        if (role === 'student' && student && m.student_id !== student.id) return false;
        // Se for professor, vê apenas as que ele criou
        if (role === 'professor' && m.professor_id !== user?.id) return false;
        
        if (filter === 'all') return true;
        return m.status === filter;
    });

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[48px] border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none" />
                
                <div className="relative z-10 flex items-center gap-6">
                    <div className="p-4 bg-sky-600 rounded-[32px] text-white shadow-xl shadow-sky-900/20">
                        <Rocket size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Quadro de <span className="text-sky-500">Missões</span></h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                            <Sparkles size={12} className="text-amber-500" /> Realtime Sincronizado
                        </p>
                    </div>
                </div>

                <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/5 relative z-10 shadow-inner">
                    {['pending', 'done', 'all'].map((f) => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                filter === f ? "bg-sky-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                            )}
                        >
                            {f === 'pending' ? 'Ativas' : f === 'done' ? 'Concluídas' : 'Tudo'}
                        </button>
                    ))}
                </div>
            </header>

            {role === 'professor' && (
                <div className="flex justify-end">
                    <Button onClick={() => setIsAddOpen(true)} leftIcon={Plus} className="rounded-2xl px-8 shadow-xl shadow-sky-900/20">Lançar Nova Missão</Button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 text-center space-y-4">
                        <Loader2 className="animate-spin mx-auto text-sky-500" size={48} />
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Acessando Kernel das Missões...</p>
                    </div>
                ) : filteredMissions.length === 0 ? (
                    <div className="py-24 text-center border-2 border-dashed border-slate-800 rounded-[48px] opacity-40">
                        <Target className="mx-auto mb-4" size={48} />
                        <p className="text-sm font-black uppercase tracking-widest">Nenhuma missão localizada nesta frequência.</p>
                    </div>
                ) : (
                    filteredMissions.map((mission: any, idx) => (
                        <M.div key={mission.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                            <Card className={cn(
                                "bg-slate-900/60 border border-white/5 hover:border-sky-500/30 transition-all rounded-[32px] overflow-hidden group",
                                mission.status === MissionStatus.Done && "opacity-60 grayscale-[0.5] border-emerald-500/20"
                            )}>
                                <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        {role === 'student' ? (
                                            <button 
                                                onClick={() => handleComplete(mission)}
                                                disabled={mission.status === MissionStatus.Done}
                                                className={cn(
                                                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                                                    mission.status === MissionStatus.Done ? "bg-emerald-500 text-white" : "bg-slate-950 border border-white/10 text-slate-500 hover:border-sky-500 hover:text-sky-400"
                                                )}
                                            >
                                                {mission.status === MissionStatus.Done ? <CheckCircle2 size={28} /> : <Circle size={24} />}
                                            </button>
                                        ) : (
                                            <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-sky-500 border border-white/5">
                                                <Target size={28} />
                                            </div>
                                        )}
                                        <div>
                                            {role === 'professor' && (
                                                <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest mb-1">ALUNO: {mission.students?.name || 'N/A'}</p>
                                            )}
                                            <h3 className={cn("text-xl font-black uppercase tracking-tight", mission.status === MissionStatus.Done ? "text-emerald-400 line-through" : "text-white")}>{mission.title}</h3>
                                            <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-md line-clamp-2">{mission.description || "Sem notas pedagógicas adicionadas."}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Recompensa</p>
                                            <div className="flex items-center gap-2 text-sky-400 font-black text-xl mt-0.5"><Zap size={18} fill="currentColor" /> +{mission.xp_reward} XP</div>
                                        </div>
                                        {role === 'professor' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => setEditingMission(mission)} className="p-3 bg-slate-950 border border-white/5 rounded-xl text-slate-500 hover:text-sky-400"><Edit2 size={16}/></button>
                                                <button onClick={() => deleteMission(mission.id)} className="p-3 bg-slate-950 border border-white/5 rounded-xl text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </M.div>
                    ))
                )}
            </div>

            {/* Modal: Adicionar Missão */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 rounded-[40px] max-w-lg p-10 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle>Lançar Missão</DialogTitle>
                        <DialogDescription>Crie um novo desafio pedagógico para o aluno e defina a recompensa.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <select onChange={e => setNewMission({...newMission, student_id: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white outline-none">
                            <option value="">Selecione o Aluno</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <input onChange={e => setNewMission({...newMission, title: e.target.value})} placeholder="Título da Missão" className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white outline-none" />
                        <Button onClick={handleAddMission} className="w-full py-6 rounded-2xl font-black uppercase tracking-widest">Confirmar Missão</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
