
import React, { useState, useEffect } from 'react';
import { 
    Users, Search, Shield, ShieldAlert, Key, 
    Ban, CheckCircle2, MoreVertical, Filter,
    UserPlus, Mail, Fingerprint, Calendar, Loader2, Building2, Plus, X,
    ArrowRightLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/Dialog.tsx';
import { supabase } from '../../lib/supabaseClient.ts';
import { getAdminSchools, createAdminProfessor, updateUserInfo } from '../../services/dataService.ts';
import { notify } from '../../lib/notification.ts';
import { cn } from '../../lib/utils.ts';
import { haptics } from '../../lib/haptics.ts';
import { formatDate } from '../../lib/date.ts';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserManager() {
    const [users, setUsers] = useState<any[]>([]);
    const [schools, setSchools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newProf, setNewProf] = useState({ full_name: '', email: '', school_id: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersRes, schoolsRes] = await Promise.all([
                supabase.from('profiles').select('*').order('created_at', { ascending: false }),
                getAdminSchools()
            ]);
            setUsers(usersRes.data || []);
            setSchools(schoolsRes || []);
        } catch (e) {
            notify.error("Erro na sincronia do Kernel de Usuários.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProf = async () => {
        if (!newProf.full_name || !newProf.email) return;
        setIsSaving(true);
        try {
            await createAdminProfessor(newProf);
            notify.success(`Professor ${newProf.full_name} provisionado!`);
            setIsAddOpen(false);
            setNewProf({ full_name: '', email: '', school_id: '' });
            loadData();
        } catch (e: any) {
            notify.error("Erro ao provisionar mestre.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleQuickAction = async (userId: string, updates: any) => {
        haptics.medium();
        try {
            await updateUserInfo(userId, updates);
            notify.success("Perfil atualizado em tempo real.");
            loadData();
        } catch (e) {
            notify.error("Falha na atualização.");
        }
    };

    const filteredUsers = users.filter(u => 
        (u.full_name?.toLowerCase().includes(search.toLowerCase())) || 
        (u.email?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Identity <span className="text-purple-500">Manager</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Provisionamento de Contas e Gestão de Roles</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} leftIcon={UserPlus} className="px-10 py-6 rounded-2xl bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-900/20 text-xs font-black uppercase tracking-widest">
                    Criar Novo Professor
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <Card className="lg:col-span-3 bg-slate-900/40 border-white/5 p-2 rounded-3xl">
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar por nome ou email..." className="w-full bg-transparent border-none outline-none py-4 pl-14 pr-6 text-sm text-white placeholder:text-slate-700" />
                    </div>
                </Card>
                <div className="bg-slate-900/40 border border-white/5 p-2 rounded-3xl flex items-center justify-center">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total: {users.length} Identidades</p>
                </div>
            </div>

            <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950/50 border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-10 py-6">Entidade</th>
                                    <th className="px-10 py-6">Role</th>
                                    <th className="px-10 py-6">Escola / Alocação</th>
                                    <th className="px-10 py-6">Acesso</th>
                                    <th className="px-10 py-6 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    [...Array(5)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-10 py-10 bg-white/[0.01]" /></tr>)
                                ) : filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 shadow-inner">
                                                    <Fingerprint size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white uppercase tracking-tight">{u.full_name || 'Músico'}</p>
                                                    <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1 mt-0.5 tracking-tight"><Mail size={10} /> {u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <select value={u.role} onChange={(e) => handleQuickAction(u.id, { role: e.target.value })} className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-sky-400 outline-none cursor-pointer">
                                                <option value="student">Student</option>
                                                <option value="professor">Professor</option>
                                                <option value="manager">Manager</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-10 py-8">
                                            <select value={u.school_id || ''} onChange={(e) => handleQuickAction(u.id, { school_id: e.target.value || null })} className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-slate-400 outline-none cursor-pointer max-w-[180px]">
                                                <option value="">Sem Unidade</option>
                                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-[10px] font-black text-slate-600 uppercase flex items-center gap-2">
                                                <Calendar size={12} /> {formatDate(u.created_at, 'dd/MM/yy')}
                                            </p>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                <button className="p-3 rounded-2xl bg-slate-900 border border-white/5 text-slate-500 hover:text-red-500 transition-all"><Ban size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 rounded-[40px] max-w-lg p-10 shadow-2xl">
                    <DialogHeader className="space-y-4">
                        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <UserPlus size={32} />
                        </div>
                        <DialogTitle className="text-2xl font-black text-white uppercase italic">Provisionar Mestre</DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Criação de perfil para gestão de turmas.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nome do Professor</label>
                            <input value={newProf.full_name} onChange={e => setNewProf({...newProf, full_name: e.target.value})} placeholder="Ex: Renan Serpa" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:ring-4 focus:ring-sky-600/20 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">E-mail de Acesso</label>
                            <input value={newProf.email} onChange={e => setNewProf({...newProf, email: e.target.value})} placeholder="professor@oliemusic.com" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:ring-4 focus:ring-sky-600/20 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 flex items-center gap-2">
                                <Building2 size={12} /> Alocar em Escola (Tenant)
                            </label>
                            <select value={newProf.school_id} onChange={e => setNewProf({...newProf, school_id: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none appearance-none">
                                <option value="">Sem Escola Atribuída</option>
                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <DialogFooter className="gap-3 border-t border-white/5 pt-6">
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="text-[10px] font-black uppercase">Cancelar</Button>
                        <Button onClick={handleCreateProf} isLoading={isSaving} className="bg-sky-600 hover:bg-sky-500 text-white px-10 py-6 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">Confirmar Provisionamento</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
