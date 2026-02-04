
import React, { useState } from 'react';
import { Search, UserPlus, Music, ArrowRight, Save, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog.tsx';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync.ts';
import { supabase } from '../../../lib/supabaseClient.ts';
import { notify } from '../../../lib/notification.ts';
import { haptics } from '../../../lib/haptics.ts';
import { UserAvatar } from '../../../components/ui/UserAvatar.tsx';

const PILOT_SCHOOL_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0851';

export default function Students() {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        instrument: 'Violão',
        class_id: ''
    });

    const { data: students, loading } = useRealtimeSync<any>('profiles', `role=eq.student,school_id=eq.${PILOT_SCHOOL_ID}`);
    const { data: classes } = useRealtimeSync<any>('music_classes', `school_id=eq.${PILOT_SCHOOL_ID}`);

    const handleCreateStudent = async () => {
        if (!formData.name || !formData.email) {
            notify.warning("Preencha o nome e e-mail do aluno.");
            return;
        }

        setIsSaving(true);
        haptics.heavy();

        try {
            const mockId = crypto.randomUUID();
            const { error: pErr } = await supabase.from('profiles').insert([{
                id: mockId,
                full_name: formData.name,
                email: formData.email.toLowerCase().trim(),
                role: 'student',
                school_id: PILOT_SCHOOL_ID, // FORÇADO PARA REDHOUSE
                instrument: formData.instrument,
                professor_id: user?.id,
                created_at: new Date().toISOString()
            }]);

            if (pErr) {
                console.error("ERRO SUPABASE (Profiles):", pErr);
                alert(`Erro ao salvar perfil: ${pErr.message}`);
                throw pErr;
            }

            if (formData.class_id) {
                const { error: eErr } = await supabase.from('enrollments').insert([{
                    student_id: mockId,
                    class_id: formData.class_id,
                    school_id: PILOT_SCHOOL_ID
                }]);
                if (eErr) {
                    console.error("ERRO SUPABASE (Enrollments):", eErr);
                    alert(`Erro ao matricular: ${eErr.message}`);
                }
            }

            notify.success(`Aluno ${formData.name} matriculado!`);
            setIsAddOpen(false);
            setFormData({ name: '', email: '', instrument: 'Violão', class_id: '' });
        } catch (e: any) {
            console.error("CRITICAL PERSISTENCE FAIL:", e);
        } finally {
            setIsSaving(false);
        }
    };

    const filtered = students.filter((s: any) => 
        s.full_name?.toLowerCase().includes(search.toLowerCase()) || 
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/60 p-10 rounded-[48px] border border-white/5">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                        Meus <span className="text-sky-400">Músicos</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Base de Dados RedHouse Cuiabá</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="rounded-2xl h-16 px-10 bg-sky-600 shadow-xl" leftIcon={UserPlus}>
                    Novo Aluno
                </Button>
            </header>

            <div className="bg-slate-900 border-white/5 p-2 rounded-3xl">
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                        value={search} onChange={e => setSearch(e.target.value)} 
                        placeholder="Pesquisar por nome ou e-mail..." 
                        className="w-full bg-transparent border-none outline-none py-5 pl-14 pr-6 text-sm text-white font-mono" 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((s: any) => (
                    <Card key={s.id} className="bg-[#0a0f1d] border-white/5 rounded-[40px] p-8 group hover:border-sky-500/30 transition-all shadow-xl">
                        <div className="flex justify-between items-start mb-6">
                            <UserAvatar src={s.avatar_url} name={s.full_name} size="lg" className="border-2 border-white/10" />
                            <div className="px-3 py-1 bg-slate-900 rounded-full border border-white/5">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Nível {s.current_level || 1}</span>
                            </div>
                        </div>
                        <h4 className="text-xl font-black text-white uppercase truncate tracking-tight mb-2">{s.full_name}</h4>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Music size={12} className="text-sky-500" /> {s.instrument || 'Novo Talento'}
                        </p>
                    </Card>
                ))}
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-950 border-slate-800 rounded-[56px] p-12 max-w-lg shadow-2xl">
                    <DialogHeader className="text-center mb-8">
                        <DialogTitle className="text-3xl font-black text-white uppercase italic">Nova Matrícula</DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs font-bold uppercase tracking-widest">Unidade: RedHouse Cuiabá</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nome Completo</label>
                            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-4 focus:ring-sky-500/10" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">E-mail (Login)</label>
                            <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white outline-none font-mono" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Instrumento</label>
                                <select value={formData.instrument} onChange={e => setFormData({...formData, instrument: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white appearance-none">
                                    <option>Violão</option>
                                    <option>Guitarra</option>
                                    <option>Ukulele</option>
                                    <option>Canto</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Vincular Turma</label>
                                <select value={formData.class_id} onChange={e => setFormData({...formData, class_id: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white appearance-none">
                                    <option value="">Individual</option>
                                    {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <Button onClick={handleCreateStudent} isLoading={isSaving} className="w-full py-8 rounded-[32px] bg-sky-600 font-black uppercase tracking-widest shadow-2xl" leftIcon={Save}>
                            Confirmar Matrícula
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
