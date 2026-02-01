import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { 
    GraduationCap, Mail, ShieldCheck, Search, 
    MoreVertical, Building2, Save, Loader2 
} from 'lucide-react';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { updateUserInfo, getAdminSchools } from '../../services/dataService.ts';
import { School } from '../../types.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

export default function TeacherManager() {
    const [search, setSearch] = useState('');
    const [schools, setSchools] = useState<School[]>([]);
    const [isSaving, setIsSaving] = useState<string | null>(null);
    
    const { data: profiles, loading } = useRealtimeSync<any>('profiles');

    useEffect(() => {
        getAdminSchools().then(setSchools);
    }, []);

    const handleAssignSchool = async (userId: string, schoolId: string) => {
        setIsSaving(userId);
        haptics.medium();
        try {
            await updateUserInfo(userId, { school_id: schoolId === 'null' ? null : schoolId });
            notify.success("Vínculo institucional atualizado.");
        } catch (e) {
            notify.error("Falha ao persistir vínculo.");
        } finally {
            setIsSaving(null);
        }
    };

    const teachers = (profiles || []).filter(u => 
        u.role === 'professor' && 
        (!search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none italic">Corpo <span className="text-sky-500">Docente</span></h1>
                    <p className="text-slate-500 mt-2 text-[10px] font-black uppercase tracking-[0.3em]">Gestão de Autoridade e Isolamento de Tenants</p>
                </div>
            </header>

            <Card className="bg-slate-900 border-white/5 p-2 rounded-3xl shadow-lg">
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        placeholder="Filtrar mestres por nome ou email..." 
                        className="w-full bg-transparent border-none outline-none py-4 pl-14 pr-6 text-sm text-white font-mono" 
                    />
                </div>
            </Card>

            <Card className="bg-[#0a0f1d] border-white/5 shadow-2xl overflow-hidden rounded-[48px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <tr>
                                <th className="px-10 py-6">Mestre</th>
                                <th className="px-10 py-6">Unidade Vinculada</th>
                                <th className="px-10 py-6">Status RLS</th>
                                <th className="px-10 py-6 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    [...Array(3)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={4} className="px-10 py-12 bg-white/[0.01]" /></tr>)
                                ) : teachers.map(t => (
                                    <M.tr key={t.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center font-black text-sky-500 shadow-inner">
                                                    {t.full_name?.charAt(0) || 'M'}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-black text-white uppercase block tracking-tight">{t.full_name}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-0.5"><Mail size={10} /> {t.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="relative max-w-[200px]">
                                                <select 
                                                    disabled={isSaving === t.id}
                                                    value={t.school_id || 'null'}
                                                    onChange={(e) => handleAssignSchool(t.id, e.target.value)}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-sky-400 outline-none appearance-none cursor-pointer hover:border-sky-500/50"
                                                >
                                                    <option value="null">Autônomo (B2C)</option>
                                                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                                {isSaving === t.id && <Loader2 className="absolute right-3 top-2.5 animate-spin text-sky-500" size={14} />}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", t.school_id ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-amber-500")} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{t.school_id ? 'ISOLADO' : 'GLOBAL'}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button className="p-3 bg-slate-950 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-xl">
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </M.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
