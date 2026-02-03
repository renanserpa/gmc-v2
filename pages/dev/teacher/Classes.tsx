
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Layers, Plus, Users, Clock, 
    CalendarDays, Trash2, Check, 
    ArrowRight, Sparkles, UserCheck, Loader2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog.tsx';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync.ts';
import { supabase } from '../../../lib/supabaseClient.ts';
import { notify } from '../../../lib/notification.ts';
import { haptics } from '../../../lib/haptics.ts';
import { cn } from '../../../lib/utils.ts';
import { UserAvatar } from '../../../components/ui/UserAvatar.tsx';

const M = motion as any;
const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export default function Classes() {
    const { schoolId, user } = useAuth();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        day_of_week: 'Segunda',
        start_time: '16:00',
        capacity: 5,
        selectedStudents: [] as string[]
    });

    const { data: classes, loading: loadingClasses } = useRealtimeSync<any>('music_classes', `school_id=eq.${schoolId}`);
    const { data: students } = useRealtimeSync<any>('profiles', `role=eq.student,school_id=eq.${schoolId}`);
    const { data: enrollments } = useRealtimeSync<any>('enrollments');

    const handleToggleStudent = (id: string) => {
        setFormData(prev => ({
            ...prev,
            selectedStudents: prev.selectedStudents.includes(id)
                ? prev.selectedStudents.filter(sid => sid !== id)
                : [...prev.selectedStudents, id]
        }));
        haptics.light();
    };

    const handleCreateClass = async () => {
        if (!formData.name || !schoolId) {
            notify.warning("Defina o nome da turma.");
            return;
        }

        setIsSaving(true);
        haptics.heavy();

        try {
            // 1. Criar a Turma
            const { data: musicClass, error: classErr } = await supabase.from('music_classes').insert([{
                name: formData.name,
                day_of_week: formData.day_of_week,
                start_time: formData.start_time,
                capacity: formData.capacity,
                school_id: schoolId,
                professor_id: user.id
            }]).select().single();

            if (classErr) throw classErr;

            // 2. Matricular os Alunos em Enrollments
            if (formData.selectedStudents.length > 0) {
                const enrollmentPayload = formData.selectedStudents.map(sid => ({
                    class_id: musicClass.id,
                    student_id: sid,
                    school_id: schoolId
                }));
                const { error: enrolErr } = await supabase.from('enrollments').insert(enrollmentPayload);
                if (enrolErr) throw enrolErr;
            }

            notify.success(`Turma ${formData.name} arquitetada com sucesso!`);
            setIsAddOpen(false);
            setFormData({ name: '', day_of_week: 'Segunda', start_time: '16:00', capacity: 5, selectedStudents: [] });
        } catch (e: any) {
            notify.error("Erro na orquestração: " + (e.message || "Erro de banco de dados"));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Orquestra de <span className="text-sky-500">Grupos</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Arquitetura de Slots e Matrículas</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="rounded-2xl h-14 px-8 bg-sky-600 shadow-xl" leftIcon={Plus}>
                    Arquitetar Turma
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loadingClasses ? (
                    [...Array(3)].map((_, i) => <div key={i} className="h-64 bg-slate-900/40 rounded-[48px] animate-pulse border border-white/5" />)
                ) : classes.map((c, idx) => {
                    const pupilCount = enrollments.filter(e => e.class_id === c.id).length;
                    return (
                        <M.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                            <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl group hover:border-sky-500/30 transition-all">
                                <CardHeader className="p-8 border-b border-white/5 bg-slate-950/40 relative overflow-hidden">
                                    <div className="flex justify-between items-center relative z-10">
                                        <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400">
                                            <CalendarDays size={20} />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{c.day_of_week}</span>
                                    </div>
                                    <CardTitle className="text-2xl font-black text-white uppercase tracking-tight italic mt-6 relative z-10">{c.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Clock size={16} className="text-slate-600" />
                                            <span className="text-sm font-black text-white font-mono">{c.start_time.slice(0, 5)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-slate-900 px-3 py-1 rounded-full">
                                            <Users size={14} className="text-slate-600" />
                                            <span className="text-[10px] font-black text-white">{pupilCount} / {c.capacity}</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full rounded-2xl py-4 border-white/10 text-[9px] font-black uppercase tracking-widest">
                                        Gerenciar Músicos
                                    </Button>
                                </CardContent>
                            </Card>
                        </M.div>
                    );
                })}
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-950 border-slate-800 rounded-[56px] p-0 max-w-4xl overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
                        <div className="md:col-span-5 bg-slate-900 p-12 space-y-8 border-r border-white/5 relative">
                            <div className="relative z-10 space-y-2">
                                <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">Nova Orquestra</DialogTitle>
                                <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest">Definição de Slot & Capacidade</p>
                            </div>
                            
                            <div className="relative z-10 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Nome da Turma</label>
                                    <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Iniciantes RedHouse" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-4 focus:ring-sky-500/10" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Dia</label>
                                        <select value={formData.day_of_week} onChange={e => setFormData({...formData, day_of_week: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white">
                                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Início</label>
                                        <input type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white font-mono" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 relative z-10">
                                <Button onClick={handleCreateClass} isLoading={isSaving} className="w-full py-8 rounded-[32px] bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-widest">
                                    Finalizar Registro
                                </Button>
                            </div>
                        </div>

                        <div className="md:col-span-7 p-12 bg-slate-950 flex flex-col">
                            <div className="mb-8">
                                <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
                                    <UserCheck className="text-sky-500" size={20} /> Matricular Músicos
                                </h3>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Selecione os participantes do grupo</p>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-4">
                                {students.map(s => {
                                    const isSelected = formData.selectedStudents.includes(s.id);
                                    return (
                                        <button 
                                            key={s.id}
                                            onClick={() => handleToggleStudent(s.id)}
                                            className={cn(
                                                "w-full p-4 rounded-2xl border transition-all flex items-center justify-between group",
                                                isSelected ? "bg-sky-600 border-white shadow-lg" : "bg-slate-900 border-white/5 hover:border-white/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <UserAvatar src={s.avatar_url} name={s.full_name} size="sm" className={isSelected ? "border-white" : ""} />
                                                <div className="text-left">
                                                    <p className={cn("text-xs font-black uppercase", isSelected ? "text-white" : "text-slate-400")}>{s.full_name}</p>
                                                    <p className={cn("text-[8px] font-bold uppercase", isSelected ? "text-sky-200" : "text-slate-600")}>{s.instrument}</p>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                                isSelected ? "bg-white border-white text-sky-600" : "bg-slate-800 border-white/10"
                                            )}>
                                                {isSelected && <Check size={14} strokeWidth={4} />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
