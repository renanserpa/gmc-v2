import React, { useState } from 'react';
import { 
    Search, Ban, Mail, Fingerprint, Calendar, 
    UserPlus, ShieldCheck, MailWarning, Loader2
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog.tsx';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { updateUserInfo, createAdminProfessor } from '../../services/dataService.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { formatDate } from '../../lib/date.ts';
import { motion, AnimatePresence } from 'framer-motion';

const M = motion as any;

export default function UserManager() {
    const [search, setSearch] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newProf, setNewProf] = useState({ full_name: '', email: '' });

    // ENGINE REALTIME: Estado puramente derivado do banco
    const { data: users, loading } = useRealtimeSync<any>(
        'profiles', 
        null, 
        { column: 'full_name', ascending: true }
    );

    const handleCreateProf = async () => {
        if (!newProf.full_name || !newProf.email) return;
        setIsSaving(true);
        haptics.heavy();
        try {
            await createAdminProfessor(newProf);
            notify.success(`Mestre ${newProf.full_name} provisionado com sucesso!`);
            setIsAddOpen(false);
            setNewProf({ full_name: '', email: '' });
        } catch (e) {
            notify.error("Erro ao provisionar mestre no Kernel.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleQuickAction = async (userId: string, updates: any) => {
        haptics.medium();
        try {
            await updateUserInfo(userId, updates);
            notify.success("Identidade sincronizada.");
        } catch (e) {
            notify.error("Falha na sincronização.");
        }
    };

    const filteredUsers = (users || []).filter(u => 
        (u.full_name?.toLowerCase().includes(search.toLowerCase())) || 
        (u.email?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">Identity <span className="text-purple-500">Manager</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Controle Reativo de Identidades Maestro</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} leftIcon={UserPlus} className="px-10 py-6 rounded-2xl bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-900/20 text-xs font-black uppercase tracking-widest">
                    Provisionar Professor
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <Card className="lg:col-span-3 bg-slate-900/40 border-white/5 p-2 rounded-3xl shadow-lg">
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                        <input 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            placeholder="Pesquisar por nome ou e-mail..." 
                            className="w-full bg-transparent border-none outline-none py-4 pl-14 pr-6 text-sm text-white placeholder:text-slate-700 font-mono" 
                        />
                    </div>
                </Card>
                <div className="bg-slate-900/40 border border-white/5 p-2 rounded-3xl flex items-center justify-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {loading ? 'Kernel Syncing...' : `${users.length} Identidades Online`}
                    </p>
                </div>
            </div>

            <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono">
                        <thead className="bg-slate-950/50 border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <tr>
                                <th className="px-10 py-6">Entidade</th>
                                <th className="px-10 py-6">Role Master</th>
                                <th className="px-10 py-6">Status Sincronia</th>
                                <th className="px-10 py-6 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs">
                            <AnimatePresence mode="popLayout">
                                {loading && users.length === 0 ? (
                                    [...Array(4)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={4} className="px-10 py-12 bg-white/[0.01]" /></tr>)
                                ) : (
                                    filteredUsers.map(u => (
                                        <M.tr key={u.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 shadow-inner">
                                                        <Fingerprint size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-white uppercase tracking-tight">{u.full_name || 'Anonymous Node'}</p>
                                                        <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1 mt-1 tracking-tight"><Mail size={10} /> {u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <select 
                                                    value={u.role} 
                                                    onChange={(e) => handleQuickAction(u.id, { role: e.target.value })} 
                                                    className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-sky-400 outline-none cursor-pointer hover:border-sky-500/50"
                                                >
                                                    <option value="student">Student</option>
                                                    <option value="professor">Professor</option>
                                                    <option value="manager">Manager</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck size={14} className="text-emerald-500" />
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secured</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <button className="p-3 bg-slate-950 border border-white/5 rounded-2xl text-slate-500 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 shadow-lg">
                                                    <Ban size={16}/>
                                                </button>
                                            </td>
                                        </M.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </Card>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 rounded-[40px] max-w-lg p-10 shadow-2xl">
                    <DialogHeader className="space-y-4">
                        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <UserPlus size={32} />
                        </div>
                        <DialogTitle className="text-2xl font-black text-white uppercase italic tracking-tighter">Novo Mestre</DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">Provisionamento imediato de nó docente no kernel.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-8">
                        <input 
                            value={newProf.full_name} 
                            onChange={e => setNewProf({...newProf, full_name: e.target.value})}
                            placeholder="Nome Completo" 
                            className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:ring-4 focus:ring-purple-600/20" 
                        />
                        <input 
                            value={newProf.email} 
                            onChange={e => setNewProf({...newProf, email: e.target.value})}
                            placeholder="E-mail de Acesso" 
                            className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:ring-4 focus:ring-purple-600/20" 
                        />
                    </div>

                    <DialogFooter className="gap-3 border-t border-white/5 pt-6">
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="text-[10px] font-black uppercase tracking-widest">Cancelar</Button>
                        <Button onClick={handleCreateProf} isLoading={isSaving} className="bg-purple-600 px-10 py-6 font-black uppercase text-[10px] tracking-widest">Provisionar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
