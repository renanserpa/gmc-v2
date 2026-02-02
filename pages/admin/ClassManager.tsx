
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CalendarDays, Plus, Clock, Users, Trash2, 
    Save, Loader2, Sparkles, Filter, MoreVertical,
    Target, Zap, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog.tsx';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';

const M = motion as any;

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export default function ClassManager() {
    const { schoolId } = useAuth();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newClass, setNewClass] = useState({
        name: '',
        day_of_week: 'Segunda',
        start_time: '14:00',
        capacity: 5
    });

    // ENGINE REALTIME: Turmas do Tenant selecionado
    const { data: classes, loading } = useRealtimeSync<any>('music_classes', schoolId ? `school_id=eq.${schoolId}` : undefined, { column: 'start_time', ascending: true });
    
    // Engine de Ocupação (Mock para o sprint atual, será integrado com a tabela enrollments no próximo)
    const getOccupancy = (classId: string) => Math.floor(Math.random() * 5); 

    const handleCreateClass = async () => {
        if (!newClass.name.trim() || !schoolId) return;
        setIsSaving(true);
        haptics.heavy();

        try {
            const { error } = await supabase.from('music_classes').insert([{
                ...newClass,
                school_id: schoolId
            }]);

            if (error) throw error;
            notify.success("Slot de horário provisionado!");
            setIsAddOpen(false);
            setNewClass({ name: '', day_of_week: 'Segunda', start_time: '14:00', capacity: 5 });
        } catch (e: any) {
            notify.error("Falha ao criar turma.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remover este horário permanentemente?")) return;
        haptics.medium();
        await supabase.from('music_classes').delete().eq('id', id);
        notify.info("Horário removido da grade.");
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto px-4">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-purple-500/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3 leading-none">
                        Time <span className="text-sky-500">Scheduler</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
                        <CalendarDays size={12} className="text-sky-500" /> Grade de Horários • Unidade Ativa
                    </p>
                </div>
                <Button 
                    onClick={() => { setIsAddOpen(true); haptics.light(); }} 
                    disabled={!schoolId}
                    leftIcon={Plus} 
                    className="rounded-2xl px-10 py-7 bg-sky-600 hover:bg-sky-50 shadow-xl shadow-sky-900/20 text-xs font-black uppercase tracking-widest"
                >
                    Criar Novo Horário
                </Button>
            </header>

            {!schoolId && (
                <Card className="bg-amber-500/10 border-amber-500/20 p-10 rounded-[48px] text-center">
                    <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-white uppercase italic">Contexto Global Ativo</h3>
                    <p className="text-slate-400 mt-2">Selecione uma Unidade (Tenant) no menu lateral para gerenciar os horários específicos.</p>
                </Card>
            )}

            {schoolId && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                         [...Array(6)].map((_, i) => <div key={i} className="h-48 bg-slate-900/50 rounded-[40px] animate-pulse" />)
                    ) : classes.map((c: any) => {
                        const occupied = getOccupancy(c.id);
                        const progress = (occupied / c.capacity) * 100;

                        return (
                            <Card key={c.id} className="bg-[#0a0f1d] border-white/5 rounded-[40px] overflow-hidden group hover:border-sky-500/30 transition-all shadow-xl relative flex flex-col">
                                <div className="p-8 space-y-6 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-slate-900 rounded-xl text-sky-400 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-inner">
                                            <Clock size={20} />
                                        </div>
                                        <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-700 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div>
                                        <span className="text-[9px] font-black text-sky-500 uppercase tracking-[0.2em]">{c.day_of_week} • {c.start_time.slice(0,5)}h</span>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">{c.name}</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-slate-500 uppercase">Ocupação</span>
                                            <span className="text-[10px] font-black text-white">{occupied} / {c.capacity} Vagas</span>
                                        </div>
                                        <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                            <M.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                className={cn(
                                                    "h-full transition-all duration-1000",
                                                    progress > 80 ? "bg-amber-500" : "bg-sky-500"
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* MODAL: NOVA TURMA */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 rounded-[48px] p-10 max-w-lg shadow-2xl">
                    <DialogHeader className="text-center space-y-4">
                        <div className="w-16 h-16 bg-sky-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl shadow-sky-900/20">
                            <CalendarDays size={32} />
                        </div>
                        <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter italic">Provisionar Horário</DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs font-bold uppercase tracking-widest">Este slot ficará disponível para matrículas na Unidade Selecionada.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Identificação da Turma</label>
                            <input 
                                value={newClass.name}
                                onChange={e => setNewClass({...newClass, name: e.target.value})}
                                placeholder="Ex: Guitarra Iniciante A"
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white outline-none focus:ring-4 focus:ring-sky-500/20"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Dia</label>
                                <select 
                                    value={newClass.day_of_week}
                                    onChange={e => setNewClass({...newClass, day_of_week: e.target.value})}
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white outline-none appearance-none"
                                >
                                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Horário</label>
                                <input 
                                    type="time"
                                    value={newClass.start_time}
                                    onChange={e => setNewClass({...newClass, start_time: e.target.value})}
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Capacidade Máxima (Alunos)</label>
                            <input 
                                type="number"
                                value={newClass.capacity}
                                onChange={e => setNewClass({...newClass, capacity: parseInt(e.target.value)})}
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white outline-none"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={handleCreateClass} isLoading={isSaving} className="w-full py-8 rounded-3xl bg-sky-600 text-white font-black uppercase tracking-widest shadow-xl">Confirmar Slot</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
