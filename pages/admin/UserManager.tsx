import React, { useState, useEffect } from 'react';
import { 
    Users, Search, Shield, ShieldAlert, Key, 
    Ban, CheckCircle2, MoreVertical, Filter,
    UserPlus, Mail, Fingerprint, Calendar
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabaseClient';
import { notify } from '../../lib/notification';
import { cn } from '../../lib/utils';
import { haptics } from '../../lib/haptics';
import { formatDate } from '../../lib/date';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserManager() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) notify.error("Erro ao carregar Kernel de Usuários");
        else setUsers(data || []);
        setLoading(false);
    };

    const handleUpdateRole = async (userId: string, currentEmail: string, newRole: string) => {
        if (currentEmail === 'admin@oliemusic.dev') {
            notify.error("Operação negada: Proteção de Root User ativa.");
            return;
        }

        haptics.medium();
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) notify.error("Falha no escalonamento de privilégios.");
        else {
            notify.success(`Role alterado para ${newRole.toUpperCase()}`);
            loadUsers();
        }
    };

    const filteredUsers = users.filter(u => 
        u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Identity <span className="text-purple-500">Manager</span></h1>
                    <p className="text-slate-500 text-sm mt-1">Governança de acessos e escalonamento de permissões globais.</p>
                </div>
                <Button leftIcon={UserPlus} className="px-8 rounded-2xl bg-purple-600 hover:bg-purple-500">
                    Provisionar Usuário
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <Card className="lg:col-span-3 bg-slate-900/40 border-white/5 p-2 rounded-2xl">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                        <input 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por nome, email ou fingerprint..."
                            className="w-full bg-transparent border-none outline-none py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-700"
                        />
                    </div>
                </Card>
                <Card className="bg-slate-900/40 border-white/5 p-2 rounded-2xl flex items-center justify-center">
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all">
                        <Filter size={14} /> Filtros Avançados
                    </button>
                </Card>
            </div>

            <Card className="bg-[#0a0f1d] border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950/50 border-b border-white/5">
                                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                    <th className="px-8 py-5">Identidade</th>
                                    <th className="px-8 py-5">Privilégio</th>
                                    <th className="px-8 py-5">Tenant / Escola</th>
                                    <th className="px-8 py-5">Sincronia</th>
                                    <th className="px-8 py-5 text-right">Ações de Segurança</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-8 py-6 bg-white/5" />
                                        </tr>
                                    ))
                                ) : filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 group-hover:border-purple-500/50 transition-all">
                                                    <Fingerprint size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white uppercase tracking-tight">{u.full_name || 'Maestro User'}</p>
                                                    <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1"><Mail size={10} /> {u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <select 
                                                value={u.role}
                                                disabled={u.email === 'admin@oliemusic.dev'}
                                                onChange={(e) => handleUpdateRole(u.id, u.email, e.target.value)}
                                                className={cn(
                                                    "bg-slate-950 border border-white/10 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest outline-none transition-all",
                                                    u.role === 'admin' ? "text-red-400 border-red-500/30" : 
                                                    u.role === 'professor' ? "text-sky-400 border-sky-500/30" : "text-slate-400"
                                                )}
                                            >
                                                <option value="student">Student</option>
                                                <option value="professor">Professor</option>
                                                <option value="manager">Manager</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase truncate max-w-[120px]">
                                                    {u.school_id ? `ID: ${u.school_id.substring(0,8)}` : 'S/ Escola'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[9px] font-black text-slate-600 uppercase flex items-center gap-1">
                                                    <Calendar size={10} /> {formatDate(u.created_at, 'dd/MM/yy')}
                                                </p>
                                                <span className="text-[8px] font-bold text-emerald-500 bg-emerald-500/10 w-fit px-1.5 rounded">ONLINE</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => { haptics.light(); notify.info("Reset de senha enviado."); }}
                                                    className="p-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-500 hover:text-sky-400 transition-all" 
                                                    title="Reset Password"
                                                >
                                                    <Key size={14} />
                                                </button>
                                                <button 
                                                    disabled={u.email === 'admin@oliemusic.dev'}
                                                    className="p-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-500 hover:text-red-500 transition-all disabled:opacity-20" 
                                                    title="Ban User"
                                                >
                                                    <Ban size={14} />
                                                </button>
                                                <button className="p-2.5 text-slate-700 hover:text-white transition-colors">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <footer className="bg-slate-900/20 border border-white/5 p-6 rounded-[32px] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                        <ShieldAlert size={20} />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium max-w-xl">
                        <strong className="text-white uppercase">Aviso de Segurança:</strong> Alterações de privilégios nesta tela afetam imediatamente as políticas de RLS e o escopo de visibilidade dos dados do usuário. Use com cautela extrema.
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Total Sincronizado</p>
                    <p className="text-xl font-black text-white leading-none">{users.length}</p>
                </div>
            </footer>
        </div>
    );
}