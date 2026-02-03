
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Cpu, Ghost, ShieldAlert, Power, Building2, 
    Search, Activity, Radio, Database, 
    Zap, AlertTriangle, RefreshCw, Ban,
    Globe, Server, ShieldCheck, Mail, Eye,
    ArrowRight, UserCheck, Terminal
} from 'lucide-react';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { useAdmin } from '../../contexts/AdminContext.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { cn } from '../../lib/utils.ts';
import { KPICard } from '../../components/dashboard/KPICard.tsx';
import { formatDate } from '../../lib/date.ts';

const M = motion as any;

export default function GodConsole() {
    const { startGhosting } = useAdmin();
    const [searchUser, setSearchUser] = useState('');
    const [searchSchool, setSearchSchool] = useState('');

    const { data: schools, loading: loadingSchools } = useRealtimeSync<any>('schools', undefined, { column: 'name', ascending: true });
    const { data: profiles, loading: loadingProfiles } = useRealtimeSync<any>('profiles', undefined, { column: 'full_name', ascending: true });
    const { data: auditLogs } = useRealtimeSync<any>('audit_logs', undefined, { column: 'created_at', ascending: false });

    const handleToggleMaintenance = async (school: any) => {
        const nextState = !school.maintenance_mode;
        haptics.heavy();
        
        try {
            const { error } = await supabase
                .from('schools')
                .update({ maintenance_mode: nextState })
                .eq('id', school.id);
            
            if (error) throw error;
            notify.error(nextState ? `SISTEMA CONGELADO: ${school.name}` : `SISTEMA ATIVO: ${school.name}`);
        } catch (e) {
            notify.error("Falha ao propagar comando de infraestrutura.");
        }
    };

    const filteredUsers = (profiles || []).filter(p => 
        p.full_name?.toLowerCase().includes(searchUser.toLowerCase()) || 
        p.email?.toLowerCase().includes(searchUser.toLowerCase())
    );

    const filteredSchools = (schools || []).filter(s => 
        s.name.toLowerCase().includes(searchSchool.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-red-950/10 p-10 rounded-[56px] border border-red-500/20 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-red-500/5 blur-[100px] pointer-events-none" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-4 bg-red-600 rounded-[28px] text-white shadow-xl shadow-red-900/40">
                        <Terminal size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Sovereign <span className="text-red-500">Command</span></h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Governance v7.5 • God Mode Activated</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-black/40 px-6 py-3 rounded-2xl border border-red-500/20 shadow-xl">
                    <ShieldCheck className="text-emerald-500" size={20} />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Root Authority Verified</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="Units Status" value={schools.filter(s => !s.maintenance_mode).length + "/" + schools.length} icon={Globe} color="text-sky-400" border="border-sky-500" />
                <KPICard title="Sovereign Shield" value="ACTIVE" icon={ShieldAlert} color="text-red-500" border="border-red-500" />
                <KPICard title="Database Pulse" value="STABLE" icon={Database} color="text-emerald-400" border="border-emerald-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* GHOSTING LAB */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-2">
                            <Ghost size={14} className="text-purple-500" /> Infiltration Directory
                        </h4>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" size={12} />
                            <input 
                                value={searchUser} onChange={e => setSearchUser(e.target.value)}
                                placeholder="Buscar Identidade..." 
                                className="w-full bg-slate-900 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-[10px] text-white outline-none focus:border-purple-500/50" 
                            />
                        </div>
                    </div>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                        {loadingProfiles ? (
                            <div className="p-10 text-center animate-pulse text-slate-700 uppercase font-black text-xs">Acessando Fluxo de Almas...</div>
                        ) : filteredUsers.map(p => (
                            <Card key={p.id} className="bg-[#0a0f1d] border-white/5 rounded-3xl p-5 group hover:border-purple-500/30 transition-all flex items-center justify-between shadow-lg">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-slate-600 group-hover:bg-purple-900/20 group-hover:text-purple-400 transition-all">
                                        {p.full_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-tight">{p.full_name}</p>
                                        <p className="text-[9px] text-slate-600 font-bold uppercase">{p.role} • {p.email}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => startGhosting(p.id, p.full_name, p.role as any)}
                                    className="p-3 bg-slate-950 border border-white/10 rounded-xl text-slate-600 hover:bg-purple-600 hover:text-white transition-all shadow-xl"
                                >
                                    <Ghost size={16} />
                                </button>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* KILL SWITCH & AUDIT */}
                <div className="lg:col-span-5 space-y-8">
                    <section className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-2">Unit Kill-Switches</h4>
                        <div className="space-y-2">
                            {filteredSchools.map(school => (
                                <div key={school.id} className={cn(
                                    "p-4 rounded-2xl border transition-all flex items-center justify-between",
                                    school.maintenance_mode ? "bg-red-600/10 border-red-600/40" : "bg-slate-900/60 border-white/5"
                                )}>
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase">{school.name}</p>
                                        <span className={cn("text-[8px] font-black uppercase", school.maintenance_mode ? "text-red-500" : "text-emerald-500")}>
                                            {school.maintenance_mode ? 'MANUTENÇÃO ATIVA' : 'SISTEMA OPERACIONAL'}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => handleToggleMaintenance(school)}
                                        className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                            school.maintenance_mode ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                                        )}
                                    >
                                        {school.maintenance_mode ? <RefreshCw size={16} /> : <Ban size={16} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <Card className="bg-slate-950 border-white/5 rounded-[32px] overflow-hidden flex flex-col h-[280px]">
                        <div className="p-4 bg-slate-900 border-b border-white/5 flex items-center gap-3">
                            <Activity size={14} className="text-sky-500" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Realtime Audit Feed</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 font-mono text-[9px]">
                            {auditLogs?.slice(0, 10).map((log: any) => (
                                <div key={log.id} className="mb-2 flex gap-2 border-l border-white/5 pl-2">
                                    <span className="text-slate-700">[{formatDate(log.created_at, 'HH:mm')}]</span>
                                    <span className="text-red-500 font-bold">{log.action}:</span>
                                    <span className="text-slate-400 truncate">{log.table_name}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
