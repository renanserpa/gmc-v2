
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    UserPlus, Search, Mail, Music, Star, 
    Download, Trash2, Edit2, ShieldCheck, 
    Filter, GraduationCap, ArrowRight, Loader2
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card.tsx';
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

export default function Students() {
    const { schoolId, user } = useAuth();
    const [search, setSearch] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        instrument: 'Violão',
        level: 1
    });

    const { data: students, loading } = useRealtimeSync<any>(
        'profiles', 
        `role=eq.student,school_id=eq.${schoolId}`
    );

    const handleCreateStudent = async () => {
        if (!formData.name || !formData.email) {
            notify.warning("Preencha os campos obrigatórios.");
            return;
        }

        if (!schoolId) {
            haptics.error();
            notify.error("Erro: Escola não identificada no seu perfil.");
            return;
        }

        setIsSaving(true);
        haptics.heavy();

        try {
            // Hotfix: Alunos são registros na tabela Profiles com role='student'
            const { error } = await supabase.from('profiles').insert([{
                full_name: formData.name,
                email: formData.email.toLowerCase().trim(),
                role: 'student',
                school_id: schoolId,
                xp: 0,
                coins: 0,
                current_level: formData.level,
                instrument: formData.instrument,
                professor_id: user?.id,
                created_at: new Date().toISOString()
            }]);

            if (error) throw error;

            notify.success(`Músico ${formData.name} persistido no banco!`);
            setIsAddOpen(false);
            setFormData({ name: '', email: '', instrument: 'Violão', level: 1 });
        } catch (e: any) {
            notify.error("Falha na persistência: " + (e.message || "Erro desconhecido"));
        } finally {
            setIsSaving(false);
        }
    };

    const filtered = students.filter(s => 
        s.full_name?.toLowerCase().includes(search.toLowerCase()) || 
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Meus <span className="text-sky-500">Músicos</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Gestão de Talentos da Unidade</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-2xl border-white/5 bg-white/5 text-[10px] font-black uppercase" leftIcon={Download}>
                        Importar Lista
                    </Button>
                    <Button onClick={() => setIsAddOpen(true)} className="rounded-2xl h-14 px-8 bg-sky-600 shadow-xl shadow-sky-900/20" leftIcon={UserPlus}>
                        Matricular Aluno
                    </Button>
                </div>
            </header>

            <Card className="bg-slate-900/50 border-white/5 p-2 rounded-3xl shadow-lg backdrop-blur-xl">
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        placeholder="Localizar músico por nome ou e-mail..." 
                        className="w-full bg-transparent border-none outline-none py-5 pl-14 pr-6 text-sm text-white font-mono placeholder:text-slate-700" 
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [...Array(6)].map((_, i) => <div key={i} className="h-48 bg-slate-900/40 rounded-[48px] animate-pulse border border-white/5" />)
                    ) : filtered.map((s, idx) => (
                        <M.div key={s.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                            <Card className="bg-[#0a0f1d] border-white/5 rounded-[40px] p-8 group hover:border-sky-500/30 transition-all shadow-xl relative overflow-hidden">
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <UserAvatar src={s.avatar_url} name={s.full_name} size="lg" className="border-2 border-white/10" />
                                    <div className="px-3 py-1 bg-slate-900 rounded-full border border-white/5">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Rank N{s.current_level || 1}</span>
                                    </div>
                                </div>

                                <div className="space-y-1 relative z-10">
                                    <h4 className="text-xl font-black text-white uppercase truncate tracking-tight">{s.full_name}</h4>
                                    <div className="flex items-center gap-2">
                                        <Music size={12} className="text-sky-500" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.instrument || 'Novo Talento'}</span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-700 uppercase">Experiência</span>
                                        <span className="text-xs font-black text-white">{s.xp || 0} XP</span>
                                    </div>
                                    <button className="p-3 bg-slate-900 rounded-2xl text-slate-500 hover:text-white transition-colors">
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </Card>
                        </M.div>
                    ))}
                </AnimatePresence>
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-950 border-slate-800 rounded-[56px] p-12 max-w-lg shadow-2xl">
                    <DialogHeader className="text-center space-y-4 mb-8">
                        <div className="mx-auto w-16 h-16 bg-sky-600 rounded-3xl flex items-center justify-center text-white shadow-xl">
                            <UserPlus size={32} />
                        </div>
                        <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Matricular Aluno</DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                            O aluno será vinculado à sua unidade: {schoolId?.slice(0,8)}...
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nome Completo</label>
                            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nome do Músico" className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-4 focus:ring-sky-500/10" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">E-mail para Login</label>
                            <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="aluno@email.com" className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white outline-none font-mono" />
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
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nível Inicial</label>
                                <input type="number" min="1" max="10" value={formData.level} onChange={e => setFormData({...formData, level: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-10">
                        <Button onClick={handleCreateStudent} isLoading={isSaving} className="w-full py-8 rounded-[32px] bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-widest shadow-2xl" leftIcon={ShieldCheck}>
                            Salvar Perfil Mestre
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
