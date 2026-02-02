
import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { 
    Users, Search, Mail, Building2, 
    Calendar, MoreVertical, ShieldCheck,
    /* Added 'Ban' to imports to resolve the 'Cannot find name Ban' error */
    UserCheck, Clock, ShieldAlert, CheckCircle2,
    XCircle, Ban
} from 'lucide-react';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { formatDate } from '../../lib/date.ts';
import { cn } from '../../lib/utils.ts';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';

export default function StaffDirectory() {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved');
    const { data: profiles, loading } = useRealtimeSync<any>('profiles');

    const staffList = (profiles || []).filter((p: any) => {
        const matchesSearch = p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase());
        const isTeacher = p.role === 'professor' || p.role === 'teacher_owner';
        
        // Simulação de status pendente baseada no campo 'reputation_points' se o status real não existir
        const isPending = p.reputation_points === 0 && p.role === 'teacher_owner';
        
        if (activeTab === 'pending') return isTeacher && isPending && matchesSearch;
        return isTeacher && !isPending && matchesSearch;
    });

    const handleApprove = async (id: string) => {
        haptics.success();
        const { error } = await supabase.from('profiles').update({ reputation_points: 100 }).eq('id', id);
        if (error) notify.error("Erro na aprovação.");
        else notify.success("Acesso liberado para o novo mestre!");
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Gestão <span className="text-sky-500">Docente</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase mt-3 tracking-widest">Controle de Licenciados e Novos Ingresso</p>
                </div>
                <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                    <button onClick={() => setActiveTab('approved')} className={cn("px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all", activeTab === 'approved' ? "bg-sky-600 text-white" : "text-slate-500")}>Ativos</button>
                    <button onClick={() => setActiveTab('pending')} className={cn("px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all relative", activeTab === 'pending' ? "bg-amber-600 text-white" : "text-slate-500")}>
                        Pendentes 
                        {profiles?.filter((p: any) => p.reputation_points === 0 && p.role === 'teacher_owner').length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center animate-bounce">!</span>
                        )}
                    </button>
                </div>
            </header>

            <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filtrar mestres..." className="w-full bg-slate-900 border border-white/10 rounded-[32px] py-6 pl-16 pr-8 text-white outline-none focus:ring-4 focus:ring-sky-500/10 transition-all" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {staffList.map((member: any) => (
                    <Card key={member.id} className="bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden group transition-all hover:border-sky-500/30">
                        <CardContent className="p-10 space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="w-20 h-20 bg-slate-900 rounded-[28px] border-2 border-white/10 flex items-center justify-center text-sky-400 text-3xl font-black uppercase shadow-inner">
                                    {member.full_name?.charAt(0)}
                                </div>
                                <span className="px-3 py-1 bg-slate-950 text-slate-500 text-[8px] font-black uppercase rounded-lg border border-white/5 tracking-widest">{member.role}</span>
                            </div>

                            <div>
                                <h3 className="text-xl font-black text-white uppercase truncate tracking-tight">{member.full_name}</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase truncate mt-1 italic">{member.email}</p>
                            </div>

                            {activeTab === 'pending' ? (
                                <div className="pt-6 border-t border-white/5 flex gap-2">
                                    <button onClick={() => handleApprove(member.id)} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-xl">
                                        <UserCheck size={14} /> Aprovar Mestre
                                    </button>
                                    <button className="p-4 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                                        {/* Fix: Added Ban icon from lucide-react */}
                                        <Ban size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button className="w-full py-4 bg-slate-950 border border-white/5 rounded-2xl text-[9px] font-black text-slate-500 hover:text-white hover:bg-sky-600 transition-all uppercase tracking-widest">
                                    Ver Dossiê Maestro
                                </button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
