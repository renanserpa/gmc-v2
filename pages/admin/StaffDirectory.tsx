
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { 
    Users, Search, Mail, Building2, 
    Calendar, MoreVertical, ShieldCheck,
    GraduationCap
} from 'lucide-react';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { formatDate } from '../../lib/date.ts';
import { cn } from '../../lib/utils.ts';

export default function StaffDirectory() {
    const [search, setSearch] = useState('');
    const { data: profiles, loading } = useRealtimeSync<any>('profiles');
    const { data: schools } = useRealtimeSync<any>('schools');

    const staff = profiles.filter((p: any) => 
        (p.role === 'professor' || p.role === 'teacher_owner') &&
        (p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header>
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                    Diretório <span className="text-sky-500">Docente</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Recursos Humanos & Licenciados</p>
            </header>

            <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                <input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Pesquisar por nome, e-mail ou especialidade..."
                    className="w-full bg-slate-900 border border-white/10 rounded-[32px] py-6 pl-16 pr-8 text-white outline-none focus:ring-4 focus:ring-sky-500/10 transition-all"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {staff.map((member: any) => {
                    const school = schools.find((s: any) => s.id === member.school_id);
                    return (
                        <Card key={member.id} className="bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl group transition-all hover:border-sky-500/30">
                            <CardContent className="p-10 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-slate-900 rounded-[28px] border-2 border-white/10 overflow-hidden flex items-center justify-center text-sky-400 text-3xl font-black uppercase">
                                            {member.avatar_url ? <img src={member.avatar_url} className="w-full h-full object-cover" /> : member.full_name?.charAt(0)}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-xl shadow-xl">
                                            <ShieldCheck size={16} className="text-white" />
                                        </div>
                                    </div>
                                    <button className="text-slate-700 hover:text-white transition-colors"><MoreVertical /></button>
                                </div>

                                <div>
                                    <h3 className="text-xl font-black text-white uppercase truncate">{member.full_name}</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-2 mt-1">
                                        <Mail size={12} /> {member.email}
                                    </p>
                                </div>

                                <div className="space-y-3 pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Building2 size={14} className="text-sky-500" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase">{school?.name || 'AUTÔNOMO / INDEPENDENTE'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar size={14} className="text-slate-600" />
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Desde {formatDate(member.created_at, 'MMM yyyy')}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
