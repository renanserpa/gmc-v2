
import React, { useState } from 'react';
import { Plus, Clock, CalendarDays, Save, X } from 'lucide-react';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog.tsx';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync.ts';
import { supabase } from '../../../lib/supabaseClient.ts';
import { notify } from '../../../lib/notification.ts';
import { haptics } from '../../../lib/haptics.ts';

const PILOT_SCHOOL_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0851';
const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export default function Classes() {
    const { user } = useAuth();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        day_of_week: 'Segunda',
        start_time: '16:00',
        capacity: 5
    });

    const { data: classes, loading } = useRealtimeSync<any>('music_classes', `school_id=eq.${PILOT_SCHOOL_ID}`);

    const handleCreateClass = async () => {
        if (!formData.name) {
            notify.warning("Defina um nome para a turma.");
            return;
        }

        setIsSaving(true);
        haptics.heavy();

        try {
            const { error } = await supabase.from('music_classes').insert([{
                name: formData.name,
                day_of_week: formData.day_of_week,
                start_time: formData.start_time,
                capacity: formData.capacity,
                school_id: PILOT_SCHOOL_ID, // FORÇADO
                professor_id: user?.id,
                created_at: new Date().toISOString()
            }]);

            if (error) {
                console.error("ERRO SUPABASE (Classes):", error);
                alert(`Erro ao salvar turma: ${error.message}`);
                throw error;
            }

            notify.success(`Turma ${formData.name} agendada!`);
            setIsAddOpen(false);
            setFormData({ name: '', day_of_week: 'Segunda', start_time: '16:00', capacity: 5 });
        } catch (e: any) {
            console.error("FAIL TO SAVE CLASS:", e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/60 p-10 rounded-[56px] border border-white/5">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Grade <span className="text-sky-500">Horária</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Unidade RedHouse Cuiabá</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="rounded-2xl h-16 px-10 bg-sky-600 shadow-xl" leftIcon={Plus}>
                    Novo Horário
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((c: any) => (
                    <Card key={c.id} className="bg-[#0a0f1d] border-white/5 rounded-[40px] p-8 hover:border-sky-500/20 transition-all shadow-2xl">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight italic truncate mb-4">{c.name}</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <CalendarDays size={14} className="text-sky-500" /> {c.day_of_week}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <Clock size={14} className="text-sky-500" /> Início: {c.start_time.slice(0, 5)}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-950 border-slate-800 rounded-[56px] p-10 max-w-lg shadow-2xl">
                    <DialogHeader className="text-center mb-8">
                        <DialogTitle className="text-3xl font-black text-white uppercase italic">Novo Horário</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nome da Turma</label>
                            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Dia</label>
                                <select value={formData.day_of_week} onChange={e => setFormData({...formData, day_of_week: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white">
                                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Início</label>
                                <input type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white" />
                            </div>
                        </div>
                        <Button onClick={handleCreateClass} isLoading={isSaving} className="w-full py-8 rounded-[32px] bg-sky-600 font-black uppercase tracking-widest shadow-2xl" leftIcon={Save}>
                            Confirmar Agendamento
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
