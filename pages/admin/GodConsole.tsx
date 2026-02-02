
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Cpu, ShieldAlert, Power, Building2, 
    Search, Activity, Radio, Database, 
    Zap, AlertTriangle, RefreshCw, Ban,
    Globe, Server, ShieldCheck
} from 'lucide-react';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { cn } from '../../lib/utils.ts';
import { KPICard } from '../../components/dashboard/KPICard.tsx';

const M = motion as any;

export default function GodConsole() {
    const { data: schools, loading: loadingSchools } = useRealtimeSync<any>('schools', undefined, { column: 'name', ascending: true });
    const [search, setSearch] = useState('');

    const handleToggleMaintenance = async (school: any) => {
        const nextState = !school.maintenance_mode;
        haptics.heavy();
        
        try {
            const { error } = await supabase
                .from('schools')
                .update({ maintenance_mode: nextState })
                .eq('id', school.id);
            
            if (error) throw error;
            notify.error(nextState ? `UNIT FREEZE: ${school.name} está em manutenção.` : `UNIT THAW: ${school.name} reativada.`);
        } catch (e) {
            notify.error("Falha ao propagar Kill Switch.");
        }
    };

    const filteredSchools = (schools || []).filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-red-950/10 p-10 rounded-[56px] border border-red-500/20 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-red-500/5 blur-[100px] pointer-events-none" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-4 bg-red-600 rounded-[28px] text-white shadow-xl shadow-red-900/40">
                        <Cpu size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">System <span className="text-red-500">Console</span></h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Governance & Infrastructure Kill-Switch</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="Units Online" value={schools.filter(s => !s.maintenance_mode).length} icon={Globe} color="text-sky-400" border="border-sky-500" />
                <KPICard title="Schema Health" value="STABLE" icon={Database} color="text-emerald-400" border="border-emerald-500" />
                <KPICard title="Security Layer" value="HARDENED" icon={ShieldCheck} color="text-red-400" border="border-red-500" />
            </div>

            <Card className="bg-slate-900 border-white/5 p-2 rounded-3xl shadow-lg">
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Pesquisar unidades por nome ou tenant ID..." 
                        className="w-full bg-transparent border-none outline-none py-5 pl-14 pr-6 text-sm text-white font-mono" 
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-4">
                {filteredSchools.map(school => (
                    <Card key={school.id} className={cn(
                        "bg-[#0a0f1d] border-white/5 rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 group transition-all",
                        school.maintenance_mode && "border-red-600/40 bg-red-950/10"
                    )}>
                        <div className="flex items-center gap-6">
                            <div className={cn(
                                "p-5 rounded-3xl transition-all shadow-inner",
                                school.maintenance_mode ? "bg-red-600 text-white" : "bg-slate-900 text-sky-400"
                            )}>
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase italic">{school.name}</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Tenant ID: <span className="text-slate-400">{school.id}</span></p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                             <div className="text-right">
                                <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Status do Core</p>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase border",
                                    school.maintenance_mode ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                )}>
                                    {school.maintenance_mode ? 'SESSÃO BLOQUEADA' : 'OPERACIONAL'}
                                </span>
                             </div>

                             <button 
                                onClick={() => handleToggleMaintenance(school)}
                                className={cn(
                                    "flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase transition-all shadow-xl",
                                    school.maintenance_mode 
                                        ? "bg-emerald-600 text-white hover:bg-emerald-500" 
                                        : "bg-red-600 text-white hover:bg-red-500"
                                )}
                             >
                                <Ban size={16} /> {school.maintenance_mode ? 'Reativar Unidade' : 'Congelar Unidade'}
                             </button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
