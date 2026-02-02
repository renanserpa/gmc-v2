
import React, { useState } from 'react';
import { Search, Mail, Fingerprint, UserPlus, ShieldCheck, Star, Building2, Send, CheckCircle2, UserCog, Loader2 } from 'lucide-react';
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
    const { schoolId } = useAuth();
    const [search, setSearch] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newMember, setNewMember] = useState({ full_name: '', email: '', role: 'professor' });

    // ENGINE REALTIME: Diretório Global Maestro
    const { data: users, loading } = useRealtimeSync<any>('profiles');

    const handleProvision = async () => {
        if (!newMember.email.trim()) return;
        setIsSaving(true);
        haptics.heavy();
        
        try {
            // LÓGICA DE INTEGRAÇÃO OLIE: 
            // Usamos UPSERT baseado no email para não criar perfis duplicados se o usuário já veio do portal de vendas.
            const { error } = await supabase.from('profiles').upsert({
                full_name: newMember.full_name,
                email: newMember.email.toLowerCase().trim(),
                role: newMember.role,
                school_id: schoolId || null // Se houver escola no switcher, vincula na hora
            }, { onConflict: 'email' });

            if (error) throw error;

            notify.success(`Professor ${newMember.email} ativado no Ecossistema!`);
            setIsAddOpen(false);
            setNewMember({ full_name: '', email: '', role: 'professor' });
        } catch (e: any) {
            notify.error("Falha no provisionamento: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredUsers = users.filter(u => 
        u.email?.toLowerCase().includes(search.toLowerCase()) || 
        u.full_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Diretório <span className="text-sky-500">Neural</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Sincronizado com OlieMusic Central</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} leftIcon={UserPlus} className="rounded-2xl px-10 h-16 bg-sky-600 font-black uppercase text-xs shadow-xl shadow-sky-900/30">Ativar Novo Licenciado</Button>
            </header>

            <Card className="bg-slate-900 border-white/5 p-2 rounded-3xl shadow-lg">
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        placeholder="Buscar usuário por e-mail ou identidade..." 
                        className="w-full bg-transparent border-none outline-none py-5 pl-14 pr-6 text-sm text-white font-mono" 
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    [...Array(3)].map((_, i) => <div key={i} className="h-48 bg-slate-900/40 rounded-[40px] animate-pulse" />)
                ) : filteredUsers.map(u => (
                    <Card key={u.id} className="bg-[#0a0f1d] border-white/5 rounded-[40px] p-8 group relative overflow-hidden transition-all hover:border-sky-500/30 shadow-2xl">
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-4 bg-slate-900 rounded-2xl text-sky-400 group-hover:scale-110 transition-transform shadow-inner"><Fingerprint size={28} /></div>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-lg",
                                u.role === 'professor' ? "bg-sky-500/10 text-sky-400 border-sky-500/20" : "bg-slate-900 text-slate-500 border-white/5"
                            )}>
                                {u.role}
                            </span>
                        </div>
                        <h4 className="text-lg font-black text-white uppercase truncate tracking-tight">{u.full_name || 'N/A'}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase truncate mt-1 italic">{u.email}</p>
                        
                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Building2 size={12} className="text-slate-600" />
                                <span className="text-[8px] font-black text-slate-600 uppercase truncate max-w-[120px]">
                                    {u.school_id ? 'Tenant Linked' : 'No School'}
                                </span>
                            </div>
                            <button className="text-[8px] font-black text-sky-500 uppercase tracking-widest hover:underline">Configurar</button>
                        </div>
                    </Card>
                ))}
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-[#0a0f1d] border-slate-800 rounded-[56px] p-12 max-w-xl shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                    <DialogHeader className="text-center mb-10 space-y-4">
                        <div className="w-20 h-20 bg-sky-600 rounded-3xl flex items-center justify-center mx-auto text-white shadow-xl shadow-sky-900/40"><UserCog size={40} /></div>
                        <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">Ativar Licenciado</DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs font-bold uppercase leading-relaxed">
                            O Maestro verificará se este e-mail já existe na base OlieMusic para preservar a integridade do perfil único.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                        <input value={newMember.full_name} onChange={e => setNewMember({...newMember, full_name: e.target.value})} placeholder="Nome Completo do Mestre" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-4 focus:ring-sky-500/20" />
                        <input value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} placeholder="E-mail (Chave Única Olie)" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-4 focus:ring-sky-500/20 font-mono" />
                    </div>

                    <DialogFooter className="mt-12 flex flex-col gap-4">
                        <Button onClick={handleProvision} isLoading={isSaving} className="w-full py-8 rounded-3xl bg-sky-600 text-white font-black uppercase tracking-widest shadow-2xl">Lançar no Ecossistema</Button>
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="text-[10px] font-black uppercase text-slate-500">Cancelar Operação</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
