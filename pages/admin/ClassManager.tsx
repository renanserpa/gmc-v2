
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CalendarDays, Plus, Clock, Users, Trash2, 
    Zap, AlertCircle, CheckCircle2, UserPlus, 
    X, Save, Loader2, Search, UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';
import { UserAvatar } from '../../components/ui/UserAvatar.tsx';

const M = motion as any;
const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export default function ClassManager() {
    const { schoolId, user } = useAuth();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchStudent, setSearchStudent] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        day_of_week: 'Segunda',
        start_time: '16:00',
        capacity: 5,
        selectedStudents: [] as string[]
    });

    // ENGINE REALTIME: Monitora turmas e matrículas do Tenant
    const { data: classes, loading: loadingClasses } = useRealtimeSync<any>(
        'music_classes', 
        schoolId ? `school_id=eq.${schoolId}` : undefined, 
        { column: 'start_time', ascending: true }
    );

    const { data: enrollments } = useRealtimeSync<any>('enrollments', schoolId ? `school_id=eq.${schoolId}` : undefined);
    const { data: students } = useRealtimeSync<any>('profiles', `role=eq.student,school_id=eq.${schoolId}`);

    const classesWithStats = useMemo(() => {
        return classes.map(c => ({
            ...c,
            occupied: enrollments.filter(e => e.class_id === c.id).length
        }));
    }, [classes, enrollments]);

    const filteredStudents = useMemo(() => {
        return students.filter(s => 
            s.full_name?.toLowerCase().includes(searchStudent.toLowerCase()) || 
            s.email?.toLowerCase().includes(searchStudent.toLowerCase())
        );
    }, [students, searchStudent]);

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
            notify.error("O manifesto da turma exige um nome e uma unidade ativa.");
            return;
        }
        
        setIsSaving(true);
        haptics.heavy();

        try {
            // 1. Criar a Turma
            const { data: newClass, error: classError } = await supabase.from('music_classes').insert([{
                name: formData.name,
                day_of_week: formData.day_of_week,
                start_time: formData.start_time,
                capacity: formData.capacity,
                school_id: schoolId,
                professor_id: user?.id
            }]).select().single();

            if (classError) throw classError;

            // 2. Se houver alunos selecionados, criar matrículas
            if (formData.selectedStudents.length > 0) {
                const enrollRecords = formData.selectedStudents.map(sid => ({
                    class_id: newClass.id,
                    student_id: sid,
                    school_id: schoolId
                }));
                const { error: enrollError } = await supabase.from('enrollments').insert(enrollRecords);
                if (enrollError) throw enrollError;
            }

            notify.success(`Turma ${formData.name} sincronizada com sucesso!`);
            setIsAddOpen(false);
            setFormData({ name: '', day_of_week: 'Segunda', start_time: '16:00', capacity: 5, selectedStudents: [] });
        } catch (e: any) {
            notify.error("Erro na propagação de dados: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[56px] border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Grade <span className="text-sky-500">Maestro</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Sincronia de Horários & Ocupação de Vagas</p>
                </div>
                <Button 
                    onClick={() => setIsAddOpen(true)} 
                    disabled={!schoolId} 
                    leftIcon={Plus} 
                    className="rounded-[32px] h-16 px-10 bg-sky-600 hover:bg-sky-500 font-black uppercase text-xs shadow-xl relative z-10"
                >
                    Novo Horário
                </Button>
            </header>

            {!schoolId ? (
                <div className="p-32 text-center border-4 border-dashed border-slate-900 rounded-[80px] opacity-40">
                    <AlertCircle className="mx-auto mb-6 text-slate-700" size={64} />
                    <p className="text-lg font-black uppercase text-slate-500 tracking-[0.4em]">Selecione uma Unidade Maestro no menu lateral</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {DAYS.slice(0, 6).map(day => {
                        const dayClasses = classesWithStats.filter(c => c.day_of_week === day);
                        return (
                            <div key={day} className="space-y-4">
                                <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 text-center shadow-inner">
                                    <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em]">{day}</span>
                                </div>
                                <div className="space-y-3">
                                    {dayClasses.map(c => (
                                        <M.div layout key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                            <Card className={cn(
                                                "bg-[#0a0f1d] border rounded-[32px] p-6 transition-all group relative overflow-hidden",
                                                c.occupied >= c.capacity ? "border-red-500/40 bg-red-500/[0.02]" : "border-white/5 hover:border-sky-500/30 shadow-xl"
                                            )}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="p-2 bg-slate-900 rounded-xl text-sky-400 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                                                        <Clock size={16} />
                                                    </div>
                                                    <div className={cn(
                                                        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                                        c.occupied >= c.capacity ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    )}>
                                                        {c.occupied} / {c.capacity} VAGAS
                                                    </div>
                                                </div>
                                                <h4 className="text-sm font-black text-white uppercase truncate tracking-tight">{c.name}</h4>
                                                <p className="text-[10px] font-mono font-bold text-slate-500 mt-1 uppercase italic">{c.start_time.slice(0, 5)} H</p>
                                            </Card>
                                        </M.div>
                                    ))}
                                    {dayClasses.length === 0 && (
                                        <div className="py-10 border-2 border-dashed border-slate-900 rounded-[32px] opacity-10 flex items-center justify-center">
                                            <CalendarDays size={20} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-5xl bg-slate-950 border-slate-800 rounded-[64px] p-0 overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-12 h-full min-h-[600px]">
                        {/* Coluna 1: Manifesto da Turma */}
                        <div className="md:col-span-5 bg-slate-900 p-12 space-y-10 border-r border-white/5 flex flex-col justify-between">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 rounded-full border border-sky-500/20 text-[9px] font-black text-sky-400 uppercase tracking-widest">
                                        <Zap size={10} fill="currentColor" /> Nova Orquestração
                                    </div>
                                    <DialogTitle className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Nova <br/> <span className="text-sky-500">Turma</span></DialogTitle>
                                    <DialogDescription className="text-slate-500 text-xs font-bold leading-relaxed">Defina os parâmetros de slot e capacidade para o agrupamento pedagógico.</DialogDescription>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Identificador da Turma</label>
                                        <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Segunda 16h - Kids" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-4 focus:ring-sky-500/10" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Dia</label>
                                            <select value={formData.day_of_week} onChange={e => setFormData({...formData, day_of_week: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white appearance-none">
                                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Início</label>
                                            <input type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white font-mono" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Capacidade Máxima (Vagas)</label>
                                        <input type="number" min="1" max="20" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white font-mono" />
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleCreateClass} isLoading={isSaving} className="w-full py-10 rounded-[40px] bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-[0.3em] shadow-2xl" leftIcon={Save}>
                                Arquivar Turma
                            </Button>
                        </div>

                        {/* Coluna 2: Seletor de Músicos */}
                        <div className="md:col-span-7 bg-slate-950 p-12 flex flex-col">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
                                        <UserCheck className="text-sky-500" size={24} /> Matricular Alunos
                                    </h3>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">Vincule músicos ativos a esta turma</p>
                                </div>
                                <span className="bg-slate-900 px-4 py-2 rounded-2xl border border-white/5 text-[10px] font-black text-white">
                                    {formData.selectedStudents.length} / {formData.capacity}
                                </span>
                            </div>

                            <div className="mb-6 relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-sky-500 transition-colors" size={18} />
                                <input 
                                    value={searchStudent}
                                    onChange={e => setSearchStudent(e.target.value)}
                                    placeholder="Localizar músico por nome ou e-mail..." 
                                    className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white outline-none focus:border-sky-500/30 transition-all" 
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-4">
                                {filteredStudents.map(s => {
                                    const isSelected = formData.selectedStudents.includes(s.id);
                                    return (
                                        <button 
                                            key={s.id}
                                            onClick={() => handleToggleStudent(s.id)}
                                            className={cn(
                                                "w-full p-4 rounded-[28px] border transition-all flex items-center justify-between group",
                                                isSelected ? "bg-sky-600 border-white shadow-xl" : "bg-slate-900 border-white/5 hover:border-white/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <UserAvatar src={s.avatar_url} name={s.full_name} size="sm" className={isSelected ? "border-white" : ""} />
                                                <div className="text-left min-w-0">
                                                    <p className={cn("text-xs font-black uppercase truncate", isSelected ? "text-white" : "text-slate-300")}>{s.full_name}</p>
                                                    <p className={cn("text-[8px] font-bold uppercase", isSelected ? "text-sky-200" : "text-slate-600")}>{s.instrument || 'Novo Talento'}</p>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all",
                                                isSelected ? "bg-white border-white text-sky-600" : "bg-slate-800 border-white/10"
                                            )}>
                                                {isSelected && <CheckCircle2 size={16} strokeWidth={3} />}
                                            </div>
                                        </button>
                                    );
                                })}
                                {filteredStudents.length === 0 && (
                                    <div className="py-20 text-center opacity-20 italic">Nenhum músico localizado</div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
