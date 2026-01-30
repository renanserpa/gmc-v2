
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, Circle, Trophy, Zap, 
    Plus, Clock, Target, Rocket, 
    AlertCircle, Loader2, Sparkles, Filter, Edit2, Trash2, X, Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useCurrentStudent } from '../hooks/useCurrentStudent.ts';
import { 
    getMissionsByStudent, 
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
import { supabase } from '../lib/supabaseClient.ts';

const M = motion as any;

export default function TaskManager() {
    const { user, role } = useAuth();
    const { student, refetch: refetchStudent } = useCurrentStudent();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('pending');
    
    // Modals
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingMission, setEditingMission] = useState<Mission | null>(null);
    
    // Forms
    const [newMission, setNewMission] = useState({ title: '', student_id: '', xp_reward: 30, description: '' });

    useEffect(() => {
        loadData();
    }, [user, role, student]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (role === 'student' && student) {
                const data = await getMissionsByStudent(student.id);
                setMissions(data);
            } else if (role === 'professor' && user) {
                const myStudents = await getStudentsByTeacher(user.id);
                setStudents(myStudents);
                
                // Fetch all missions created by this professor to allow management
                const { data: profMissions } = await supabase
                    .from('missions')
                    .select('*, students(name)')
                    .eq('professor_id', user.id)
                    .order('created_at', { ascending: false });
                
                if (profMissions) setMissions(profMissions);
            }
        } catch (e) {
            notify.error("Erro na sincronia das missões.");
        } finally {
            setLoading(false);
        }
    };

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
            loadData();
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
                status: MissionStatus.Pending,
                week_start: new Date().toISOString()
            });
            notify.success("Missão lançada para o aluno!");
            setIsAddOpen(false);
            setNewMission({ title: '', student_id: '', xp_reward: 30, description: '' });
            loadData();
        } catch (e) {
            notify.error("Erro ao criar missão.");
        }
    };

    const handleUpdateMission = async () => {
        if (!editingMission) return;
        try {
            await updateMission(editingMission.id, {
                title: editingMission.title,
                description: editingMission.description,
                xp_reward: editingMission.xp_reward
            });
            notify.success("Missão atualizada.");
            setEditingMission(null);
            loadData();
        } catch (e) {
            notify.error("Erro ao atualizar missão.");
        }
    };

    const handleDeleteMission = async (id: string) => {
        if (!confirm("Deseja realmente remover esta missão?")) return;
        try {
            await deleteMission(id);
            notify.info("Missão removida.");
            loadData();
        } catch (e) {
            notify.error("Erro ao deletar missão.");
        }
    };

    const filteredMissions = missions.filter(m => {
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
                            <Sparkles size={12} className="text-amber-500" /> {role === 'professor' ? 'Gestão da Sinfonia' : 'Transformando Prática em Progresso'}
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
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Sincronizando Jornada...</p>
                    </div>
                ) : filteredMissions.length === 0 ? (
                    <div className="py-24 text-center border-2 border-dashed border-slate-800 rounded-[48px] opacity-40">
                        <Target className="mx-auto mb-4" size={48} />
                        <p className="text-sm font-black uppercase tracking-widest">Nenhuma missão localizada nesta frequência.</p>
                    </div>
                ) : (
                    filteredMissions.map((mission: any, idx) => (
                        <M.div
                            key={mission.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
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
                                                    mission.status === MissionStatus.Done 
                                                        ? "bg-emerald-500 text-white" 
                                                        : "bg-slate-950 border border-white/10 text-slate-500 hover:border-sky-500 hover:text-sky-400"
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
                                            <h3 className={cn(
                                                "text-xl font-black uppercase tracking-tight transition-all",
                                                mission.status === MissionStatus.Done ? "text-emerald-400 line-through" : "text-white"
                                            )}>
                                                {mission.title}
                                            </h3>
                                            <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-md line-clamp-2">
                                                {mission.description || "Sem notas pedagógicas adicionadas."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Recompensa</p>
                                            <div className="flex items-center gap-2 text-sky-400 font-black text-xl mt-0.5">
                                                <Zap size={18} fill="currentColor" /> +{mission.xp_reward} XP
                                            </div>
                                        </div>
                                        
                                        <div className="hidden md:block w-px h-10 bg-white/5" />
                                        
                                        {role === 'professor' ? (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => setEditingMission(mission)}
                                                    className="p-3 bg-slate-950 border border-white/5 rounded-xl text-slate-500 hover:text-sky-400 hover:border-sky-500/30 transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteMission(mission.id)}
                                                    className="p-3 bg-slate-950 border border-white/5 rounded-xl text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ) : mission.status === MissionStatus.Pending ? (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => handleComplete(mission)}
                                                className="hidden md:flex text-[10px] font-black uppercase tracking-widest text-sky-500 hover:bg-sky-500/10 rounded-xl"
                                            >
                                                Marcar como Feito
                                            </Button>
                                        ) : (
                                            <div className="px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase">COMPLETO</div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </M.div>
                    ))
                )}
            </div>

            {/* Modal: Nova Missão */}
            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <M.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setIsAddOpen(false)} />
                        <M.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-slate-900 border border-white/10 rounded-[48px] p-10 max-w-lg w-full shadow-2xl overflow-hidden">
                            <div className="absolute top-0 right-0 p-16 bg-sky-500/5 blur-3xl pointer-events-none" />
                            
                            <div className="flex justify-between items-start mb-8">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                                    <Plus className="text-sky-500" /> Nova Missão
                                </h2>
                                <button onClick={() => setIsAddOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Aluno Destinatário</label>
                                    <select 
                                        value={newMission.student_id}
                                        onChange={e => setNewMission({...newMission, student_id: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm outline-none appearance-none"
                                    >
                                        <option value="">-- Selecione o Aluno --</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Título</label>
                                    <input 
                                        value={newMission.title}
                                        onChange={e => setNewMission({...newMission, title: e.target.value})}
                                        placeholder="Ex: Escala Pentatônica de Am"
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Instruções</label>
                                    <textarea 
                                        value={newMission.description}
                                        onChange={e => setNewMission({...newMission, description: e.target.value})}
                                        placeholder="Dicas extras..."
                                        rows={3}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm outline-none resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Recompensa (XP)</label>
                                    <input 
                                        type="number"
                                        value={newMission.xp_reward}
                                        onChange={e => setNewMission({...newMission, xp_reward: parseInt(e.target.value)})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-10 relative z-10">
                                <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="flex-1 rounded-2xl">Cancelar</Button>
                                <Button onClick={handleAddMission} className="flex-1 rounded-2xl py-6 bg-sky-600 hover:bg-sky-500 shadow-xl">Lançar Missão</Button>
                            </div>
                        </M.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Editar Missão */}
            <AnimatePresence>
                {editingMission && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <M.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setEditingMission(null)} />
                        <M.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-slate-900 border border-white/10 rounded-[48px] p-10 max-w-lg w-full shadow-2xl overflow-hidden">
                            <div className="flex justify-between items-start mb-8">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                                    <Edit2 className="text-amber-500" /> Editar Missão
                                </h2>
                                <button onClick={() => setEditingMission(null)} className="text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Título</label>
                                    <input 
                                        value={editingMission.title}
                                        onChange={e => setEditingMission({...editingMission, title: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Descrição</label>
                                    <textarea 
                                        value={editingMission.description || ''}
                                        onChange={e => setEditingMission({...editingMission, description: e.target.value})}
                                        rows={3}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm outline-none resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Recompensa (XP)</label>
                                    <input 
                                        type="number"
                                        value={editingMission.xp_reward}
                                        onChange={e => setEditingMission({...editingMission, xp_reward: parseInt(e.target.value)})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-10 relative z-10">
                                <Button variant="ghost" onClick={() => setEditingMission(null)} className="flex-1 rounded-2xl">Cancelar</Button>
                                <Button onClick={handleUpdateMission} className="flex-1 rounded-2xl py-6 bg-amber-600 hover:bg-amber-500 shadow-xl" leftIcon={Save}>Salvar Alterações</Button>
                            </div>
                        </M.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
