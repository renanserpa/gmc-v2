
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Plus, Clock, Users, Trash2, Zap, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';

const M = motion as any;
const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export default function ClassManager() {
    const { schoolId } = useAuth();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newClass, setNewClass] = useState({ name: '', day_of_week: 'Segunda', start_time: '16:00', capacity: 5 });

    // ENGINE REALTIME: Filtra turmas pelo Tenant selecionado no Switcher
    const { data: classes, loading } = useRealtimeSync<any>(
        'music_classes', 
        schoolId ? `school_id=eq.${schoolId}` : undefined, 
        { column: 'start_time', ascending: true }
    );

    const { data: enrollments } = useRealtimeSync<any>('enrollments');

    const classesWithStats = useMemo(() => {
        return classes.map(c => ({
            ...c,
            occupied: enrollments.filter(e => e.class_id === c.id).length
        }));
    }, [classes, enrollments]);

    const handleCreateClass = async () => {
        if (!newClass.name || !schoolId) return;
        setIsSaving(true);
        try {
            const { error } = await supabase.from('music_classes').insert([{
                ...newClass,
                school_id: schoolId
            }]);
            if (error) throw error;
            notify.success("Horário cadastrado!");
            setIsAddOpen(false);
            setNewClass({ name: '', day_of_week: 'Segunda', start_time: '16:00', capacity: 5 });
        } catch (e) { notify.error("Erro ao salvar."); }
        finally { setIsSaving(false); }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic leading-none">Grade <span className="text-sky-500">Horária</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Configuração Semanal da Unidade</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} disabled={!schoolId} leftIcon={Plus} className="rounded-2xl px-8 h-14 bg-sky-600 font-black uppercase text-xs">Nova Turma</Button>
            </header>

            {!schoolId ? (
                <div className="p-20 text-center border-2 border-dashed border-slate-800 rounded-[40px] opacity-50">
                    <AlertCircle className="mx-auto mb-4 text-slate-600" size={48} />
                    <p className="text-sm font-black uppercase text-slate-500 tracking-widest">Selecione uma unidade no Switcher lateral</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {DAYS.slice(0, 5).map(day => (
                        <div key={day} className="space-y-4">
                            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 text-center">
                                <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">{day}</span>
                            </div>
                            <div className="space-y-3">
                                {classesWithStats.filter(c => c.day_of_week === day).map(c => (
                                    <M.div layout key={c.id} className="bg-slate-950 border border-white/10 p-5 rounded-3xl group relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-mono font-bold text-sky-400">{c.start_time.slice(0, 5)}</span>
                                            <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full", c.occupied >= c.capacity ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400")}>
                                                {c.occupied}/{c.capacity}
                                            </span>
                                        </div>
                                        <h4 className="text-xs font-black text-white uppercase truncate">{c.name}</h4>
                                    </M.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 rounded-[40px] p-10">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-white uppercase italic">Adicionar Horário</DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs font-bold uppercase">Define um slot fixo para aulas nesta unidade.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                        <input value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} placeholder="Identificador (Ex: Guitarra Kids A)" className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white" />
                        <div className="grid grid-cols-2 gap-4">
                            <select value={newClass.day_of_week} onChange={e => setNewClass({...newClass, day_of_week: e.target.value})} className="bg-slate-950 border border-white/5 rounded-2xl p-4 text-white">
                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <input type="time" value={newClass.start_time} onChange={e => setNewClass({...newClass, start_time: e.target.value})} className="bg-slate-950 border border-white/5 rounded-2xl p-4 text-white" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateClass} isLoading={isSaving} className="w-full py-8 rounded-3xl bg-sky-600 font-black uppercase tracking-widest shadow-xl">Confirmar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
