
import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { 
    Users, Search, Mail, Building2, 
    ShieldCheck, UserCheck, Clock, ShieldAlert,
    XCircle, MoreVertical, Ban, Sparkles
} from 'lucide-react';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { formatDate } from '../../lib/date.ts';
import { cn } from '../../lib/utils.ts';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';

export default function StaffDirectory() {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
    const { data: profiles, loading } = useRealtimeSync<any>('profiles');

    // Lógica de Ativação Olie:
    // teacher_owner com reputation_points === 0 são considerados "Pendentes de Ativação"
    const staffList = (profiles || []).filter((p: any) => {
        const isTeacher = p.role === 'teacher_owner';
        const matchesSearch = p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase());
        
        if (activeTab === 'pending') return isTeacher && p.reputation_points === 0 && matchesSearch;
        return isTeacher && matchesSearch;
    });

    const handleGrantLicense = async (id: string) => {
        haptics.success();
        // Ativação mudando reputation_points para 100 (flag de licenciado)
        const { error } = await supabase.from('profiles').update({ reputation_points: 100 }).eq('id', id);
        
        if (error) notify.error("Erro ao conceder licença.");
        else notify.success("Licença Maestro Concedida! Dashboard liberado para o mestre.");
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Gestão <span className="text-sky-500">Docente</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase mt-3 tracking-widest">Controle de Licenciados e Novos Mestres</p>
                </div>
                <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                    <button 
                        onClick={() => setActiveTab('all')} 
                        className={cn("px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all", activeTab === 'all' ? "bg-sky-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}
                    >
                        Todos Mestres
                    </button>
                    <button 
                        onClick={() => setActiveTab('pending')} 
                        className={cn("px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all relative", activeTab === 'pending' ? "bg-amber-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}
                    >
                        Pendentes
                        {profiles?.filter((p: any) => p.role === 'teacher_owner' && p.reputation_points === 0).length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center animate-bounce">!</span>
                        )}
                    </button>
                </div>
            </header>

            <div className="relative max-w-2xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                <input 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder="Filtrar mestres por nome ou email corporativo..." 
                    className="w-full bg-slate-900 border border-white/10 rounded-[32px] py-6 pl-16 pr-8 text-white outline-none focus:ring-4 focus:ring-sky-500/10 transition-all font-mono text-sm" 
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [...Array(3)].map((_, i) => <div key={i} className="h-64 bg-slate-900/40 rounded-[48px] animate-pulse" />)
                ) : staffList.map((member: any) => (
                    <Card key={member.id} className={cn(
                        "bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden group transition-all hover:border-sky-500/30 shadow-2xl",
                        member.reputation_points === 0 && "border-amber-500/20"
                    )}>
                        <CardContent className="p-10 space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="w-20 h-20 bg-slate-900 rounded-[28px] border-2 border-white/10 flex items-center justify-center text-sky-400 text-3xl font-black shadow-inner">
                                    {member.full_name?.charAt(0)}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="px-3 py-1 bg-slate-950 text-slate-500 text-[8px] font-black uppercase rounded-lg border border-white/5 tracking-widest">{member.role}</span>
                                    {member.reputation_points === 0 && (
                                        <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[7px] font-black uppercase rounded border border-amber-500/20">Aguardando RH</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-black text-white uppercase truncate tracking-tight">{member.full_name || 'Mestre Sem Nome'}</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase truncate mt-1 italic leading-none">{member.email}</p>
                            </div>

                            {member.reputation_points === 0 ? (
                                <div className="pt-6 border-t border-white/5 flex gap-2">
                                    <button 
                                        onClick={() => handleGrantLicense(member.id)}
                                        className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-900/20"
                                    >
                                        <UserCheck size={14} /> Conceder Licença
                                    </button>
                                    <button className="p-4 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                                        <Ban size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button className="w-full py-4 bg-slate-950 border border-white/5 rounded-2xl text-[9px] font-black text-slate-600 hover:text-sky-400 hover:border-sky-400 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                                    <Clock size={12} /> Ver Histórico de Acesso
                                </button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
