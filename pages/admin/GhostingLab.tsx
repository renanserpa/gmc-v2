
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Ghost, Search, Mail, Eye, 
    ShieldAlert, User, GraduationCap, 
    LayoutDashboard, ArrowRight, ShieldCheck,
    Fingerprint, Terminal
} from 'lucide-react';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { useAdmin } from '../../contexts/AdminContext.tsx';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { cn } from '../../lib/utils.ts';
import { haptics } from '../../lib/haptics.ts';

const M = motion as any;

export default function GhostingLab() {
    const { startGhosting } = useAdmin();
    const { data: profiles, loading } = useRealtimeSync<any>('profiles', undefined, { column: 'full_name', ascending: true });
    const [search, setSearch] = useState('');

    const filtered = (profiles || []).filter(p => 
        p.full_name?.toLowerCase().includes(search.toLowerCase()) || 
        p.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-purple-950/10 p-10 rounded-[56px] border border-purple-500/20 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-purple-500/5 blur-[100px] pointer-events-none" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-4 bg-purple-600 rounded-[28px] text-white shadow-xl shadow-purple-900/40">
                        <Ghost size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Ghosting <span className="text-purple-500">Lab</span></h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase mt-3 tracking-[0.4em]">Cross-Context Identity Infiltration</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-6">
                    <Card className="bg-slate-900 border-white/5 p-2 rounded-3xl shadow-lg">
                        <div className="relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                            <input 
                                value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Localizar identidade por nome ou e-mail corporativo..." 
                                className="w-full bg-transparent border-none outline-none py-5 pl-14 pr-6 text-sm text-white font-mono" 
                            />
                        </div>
                    </Card>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="p-20 text-center animate-pulse text-purple-900 uppercase font-black text-xs">Sincronizando Fluxo de Almas...</div>
                        ) : filtered.map(p => (
                            <Card key={p.id} className="bg-[#0a0f1d] border-white/5 rounded-[32px] p-6 group hover:border-purple-500/40 transition-all flex items-center justify-between shadow-xl">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center font-black text-slate-500 group-hover:text-purple-400 group-hover:bg-purple-900/20 transition-all">
                                        {p.full_name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight">{p.full_name || 'Anonymous Entity'}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-0.5"><Mail size={10} /> {p.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-slate-900 text-slate-500 border border-white/5 tracking-widest">{p.role}</span>
                                    </div>
                                    <button 
                                        onClick={() => startGhosting(p.id, p.full_name, p.role)}
                                        className="p-4 bg-slate-900 border border-white/5 rounded-2xl text-slate-600 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-2xl"
                                    >
                                        <Eye size={20} />
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                <aside className="lg:col-span-4 space-y-6">
                    <Card className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-[40px] shadow-xl">
                        <div className="flex items-start gap-4">
                            <ShieldAlert className="text-amber-500 shrink-0" size={24} />
                            <div className="space-y-3">
                                <h5 className="text-[11px] font-black text-white uppercase tracking-widest leading-none">Aviso de Segurança Root</h5>
                                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                    Ao entrar no Modo Fantasma, sua sessão original de Soberano será suspensa. Todas as ações realizadas como o usuário infiltrado serão registradas vinculadas ao seu Identity original (Audit Trail).
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="p-8 bg-slate-900/60 border border-white/5 rounded-[40px] space-y-6 shadow-inner">
                        <div className="flex items-center gap-3">
                             <Fingerprint size={16} className="text-sky-500" />
                             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocolo Invisibility</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic">
                            O Modo Fantasma ignora Row Level Security (RLS) para permitir suporte técnico total sem requisição de senha.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
