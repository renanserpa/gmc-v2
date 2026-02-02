
import React, { useState } from 'react';
import { Search, Mail, Fingerprint, UserPlus, ShieldCheck, Star, Building2, Send, CheckCircle2, UserCog } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog.tsx';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { cn } from '../../lib/utils.ts';

export default function UserManager() {
    const { schoolId, user } = useAuth();
    const [search, setSearch] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newMember, setNewMember] = useState({ full_name: '', email: '', role: 'professor' });

    // ENGINE REALTIME: Perfis filtrados pela unidade ativa
    const filter = schoolId ? `school_id=eq.${schoolId}` : undefined;
    const { data: users, loading } = useRealtimeSync<any>('profiles', filter);

    const handleInvite = async () => {
        if (!newMember.email) return;
        setIsSaving(true);
        haptics.heavy();
        try {
            // Provisiona os metadados do Perfil. 
            // IMPORTANTE: O usuário deve se cadastrar via Auth para o ID bater.
            const { error } = await supabase.from('profiles').upsert({
                full_name: newMember.full_name,
                email: newMember.email.toLowerCase().trim(),
                role: newMember.role,
                school_id: schoolId
            }, { onConflict: 'email' });

            if (error) throw error;
            notify.success("Perfil provisionado! Solicite o cadastro no Auth.");
            setIsAddOpen(false);
            setNewMember({ full_name: '', email: '', role: 'professor' });
        } catch (e) { notify.error("Erro ao salvar perfil."); }
        finally { setIsSaving(false); }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic leading-none">Time <span className="text-sky-500">Maestro</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
                        {schoolId ? 'Membros da Unidade Ativa' : 'Visão Global de Usuários'}
                    </p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} leftIcon={UserPlus} className="rounded-2xl px-8 h-14 bg-sky-600 font-black uppercase text-xs">Provisionar Mestre</Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {users.map(u => (
                    <Card key={u.id} className="bg-[#0a0f1d] border-white/5 rounded-3xl p-6 group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-slate-900 rounded-2xl text-sky-400 border border-white/5"><Fingerprint size={24} /></div>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                u.role === 'professor' ? "bg-sky-500/10 text-sky-400 border-sky-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            )}>
                                {u.role}
                            </span>
                        </div>
                        <h4 className="text-lg font-black text-white uppercase truncate">{u.full_name || 'Membro Externo'}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase truncate italic">{u.email}</p>
                    </Card>
                ))}
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 rounded-[40px] p-10">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-white uppercase italic">Provisionar Membro</DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs font-bold uppercase">
                            Provisionar um Professor-Owner permite que ele gerencie seus próprios Tenants.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                        <input value={newMember.full_name} onChange={e => setNewMember({...newMember, full_name: e.target.value})} placeholder="Nome Completo" className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white" />
                        <input value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} placeholder="E-mail" className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white" />
                        <select value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white appearance-none">
                            <option value="professor">Professor (Master/Owner)</option>
                            <option value="manager">Gestor de Unidade</option>
                            <option value="guardian">Responsável</option>
                        </select>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleInvite} isLoading={isSaving} className="w-full py-8 rounded-3xl bg-sky-600 font-black uppercase tracking-widest shadow-xl">Confirmar Provisionamento</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
