
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Monitor, ShieldAlert, Lock, Unlock, 
    Activity, Users, Zap, RefreshCw,
    Play, Search, Building2, Terminal
} from 'lucide-react';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

export default function ClassroomMonitor() {
    const { data: classes, loading: loadingClasses } = useRealtimeSync<any>('classes', undefined, { column: 'name', ascending: true });
    const { data: orchestration } = useRealtimeSync<any>('classroom_orchestration');
    const [search, setSearch] = useState('');

    const handleToggleLockdown = async (classId: string, currentStatus: boolean) => {
        haptics.heavy();
        try {
            const { error } = await supabase
                .from('classroom_orchestration')
                .upsert({ class_id: classId, is_locked: !currentStatus, updated_at: new Date().toISOString() });
            
            if (error) throw error;
            notify.warning(!currentStatus ? "LOCKDOWN ATIVADO: Telas travadas para pedagogia." : "LOCKDOWN ENCERRADO: Controle devolvido aos alunos.");
        } catch (e) {
            notify.error("Falha ao propagar comando de orquestração.");
        }
    };

    const filtered = (classes || []).filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-sky-950/10 p-10 rounded-[56px] border border-sky-500/20 backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-sky-500 rounded-3xl text-slate-950 shadow-xl shadow-sky-900/40">
                        <Monitor size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Classroom <span className="text-sky-500">Monitor</span></h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase mt-3 tracking-[0.4em]">Pedagogical Lockdown & Live Control</p>
                    </div>
                </div>
            </header>

            <Card className="bg-slate-900 border-white/5 p-2 rounded-3xl shadow-lg">
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Pesquisar turmas em tempo real..." 
                        className="w-full bg-transparent border-none outline-none py-5 pl-14 pr-6 text-sm text-white font-mono" 
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map(c => {
                    const status = orchestration?.find(o => o.class_id === c.id);
                    const isLocked = status?.is_locked || false;

                    return (
                        <Card key={c.id} className={cn(
                            "bg-[#0a0f1d] border rounded-[48px] p-8 transition-all group overflow-hidden relative",
                            isLocked ? "border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.1)]" : "border-white/5"
                        )}>
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                        isLocked ? "bg-red-600 text-white" : "bg-slate-900 text-slate-500 group-hover:text-sky-400"
                                    )}>
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-white uppercase tracking-tight italic">{c.name}</h4>
                                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">Tenant ID: {c.school_id}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleToggleLockdown(c.id, isLocked)}
                                    className={cn(
                                        "p-4 rounded-2xl transition-all shadow-xl",
                                        isLocked ? "bg-red-600 text-white" : "bg-slate-900 text-slate-500 hover:text-white"
                                    )}
                                >
                                    {isLocked ? <Lock size={24} /> : <Unlock size={24} />}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Status de Aula</p>
                                    <span className={cn("text-[10px] font-black uppercase", isLocked ? "text-red-500" : "text-emerald-500")}>
                                        {isLocked ? 'LOCKDOWN ACTIVE' : 'OPEN SYNC'}
                                    </span>
                                </div>
                                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Last Command</p>
                                    <span className="text-[10px] font-black text-white uppercase font-mono">
                                        {status ? new Date(status.updated_at).toLocaleTimeString() : '--:--:--'}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
