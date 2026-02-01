import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { UserPlus, Mail, ShieldCheck, Search, MoreVertical, GraduationCap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { cn } from '../../lib/utils.ts';
import { haptics } from '../../lib/haptics.ts';

const M = motion as any;

export default function TeacherManager() {
    const [search, setSearch] = useState('');
    
    // ENGINE REALTIME: Filtra perfis com role professor diretamente do stream
    const { data: profiles, loading } = useRealtimeSync<any>(
        'profiles', 
        null, 
        { column: 'full_name', ascending: true }
    );

    const teachers = (profiles || []).filter(u => 
        u.role === 'professor' && 
        (!search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none italic">Corpo <span className="text-sky-500">Docente</span></h1>
                    <p className="text-slate-500 mt-2 text-[10px] font-black uppercase tracking-[0.3em]">Gestão Reativa de Mestres e Autoridade</p>
                </div>
                <Button 
                    leftIcon={UserPlus} 
                    onClick={() => haptics.medium()}
                    className="px-8 py-6 rounded-2xl bg-sky-600 hover:bg-sky-500 shadow-xl shadow-sky-900/20 text-xs font-black uppercase tracking-widest"
                >
                    Convidar Professor
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <Card className="lg:col-span-3 bg-slate-900/40 border-white/5 p-2 rounded-3xl shadow-lg">
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                        <input 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            placeholder="Filtrar mestres..." 
                            className="w-full bg-transparent border-none outline-none py-4 pl-14 pr-6 text-sm text-white font-mono" 
                        />
                    </div>
                </Card>
                <div className="bg-slate-900/40 border border-white/5 p-2 rounded-3xl flex items-center justify-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {loading ? 'Sincronizando...' : `${teachers.length} Mestres Online`}
                    </p>
                </div>
            </div>

            <Card className="bg-[#0a0f1d] border-white/5 shadow-2xl overflow-hidden rounded-[48px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <tr>
                                <th className="px-10 py-6">Mestre</th>
                                <th className="px-10 py-6">ID Neural</th>
                                <th className="px-10 py-6">Status Sincronia</th>
                                <th className="px-10 py-6 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {loading && profiles.length === 0 ? (
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
                                        <td className="px-10 py-8 font-mono text-[10px] text-slate-600">{t.id.substring(0, 18)}...</td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                                                <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">Ativo no Kernel</span>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <M.div whileHover={{ y: -8 }} className="bg-sky-600 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden group cursor-pointer">
                    <div className="absolute top-0 right-0 p-16 bg-white/10 blur-3xl rounded-full" />
                    <GraduationCap className="mb-6 opacity-40" size={48} />
                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none italic">Academy Sync</h3>
                    <p className="text-sky-100 text-sm mt-4 leading-relaxed font-medium">Sincronização pedagógica em tempo real para todos os mestres OlieMusic.</p>
                </M.div>
                
                <div className="bg-slate-900/60 border border-white/5 p-10 rounded-[48px] flex flex-col justify-between shadow-xl backdrop-blur-md">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Qualidade de Rede</p>
                        <h4 className="text-4xl font-black text-white italic tracking-tighter">Live CDC</h4>
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">Conexão WebSocket estável via Maestro Kernel.</p>
                </div>
            </div>
        </div>
    );
}