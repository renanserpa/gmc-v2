
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, GraduationCap, Zap, TrendingUp, Sparkles, 
    Plus, Clock, AlertTriangle, ChevronRight,
    Brain, Play, Loader2, Fingerprint, Activity,
    History, Search, Building2, Star
} from 'lucide-react';

import { useProfessorData } from '../hooks/useProfessorData';
import { useGlobalSettings } from '../hooks/useGlobalSettings';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { UserAvatar } from '../components/ui/UserAvatar';
import { KPICard } from '../components/dashboard/KPICard';
import { cn } from '../lib/utils';
import { formatDate } from '../lib/date';

const M = motion as any;

export default function ProfessorDashboard() {
    usePageTitle("Maestro Center - Cockpit");
    
    const { user, profile } = useAuth();
    const { data, isLoading, error } = useProfessorData();
    const [activeTab, setActiveTab] = useState<'sessions' | 'audit'>('sessions');

    // REGRA DE NEGÓCIO: O Professor não vê métricas financeiras (Royalties)
    // Essas métricas só aparecem no AdminDashboard exclusivo do Super Admin.

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center p-12 bg-red-500/5 border border-red-500/20 rounded-[48px] max-w-md shadow-2xl">
                    <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
                    <h2 className="text-xl font-black text-white uppercase italic">Falha de Autoridade</h2>
                    <p className="text-slate-400 mt-2 text-sm font-medium">Você não possui autorização para acessar esta unidade escolar.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-24 relative animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Maestro <span className="text-sky-500">Center</span>
                    </h1>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Sincronia Ativa
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <Button leftIcon={Plus} className="rounded-2xl px-8 py-6 shadow-xl shadow-sky-900/20">Matricular Aluno</Button>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <KPICard title="Alunos na Unidade" value={isLoading ? undefined : data?.stats?.totalStudents} icon={Users} color="text-sky-400" border="border-sky-500" />
                <KPICard title="Média Técnica" value={isLoading ? undefined : `${data?.stats?.avgXp} XP`} icon={Activity} color="text-purple-400" border="border-purple-500" />
                <KPICard title="Presença Semanal" value={isLoading ? undefined : '92%'} icon={Zap} color="text-amber-500" border="border-amber-500" />
                <KPICard title="Meta Batida" value={isLoading ? undefined : '14/20'} icon={Star} color="text-emerald-500" border="border-emerald-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <main className="lg:col-span-8 space-y-8">
                    <Card className="bg-slate-900 border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                        <CardHeader className="bg-slate-950/40 p-8 border-b border-white/5 flex flex-row items-center justify-between">
                            <div className="flex gap-6">
                                <button onClick={() => setActiveTab('sessions')} className={cn("text-xs font-black uppercase tracking-widest transition-all", activeTab === 'sessions' ? "text-sky-400" : "text-slate-500")}>Minhas Turmas</button>
                                <button onClick={() => setActiveTab('audit')} className={cn("text-xs font-black uppercase tracking-widest transition-all", activeTab === 'audit' ? "text-purple-400" : "text-slate-500")}>Log Pedagógico</button>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="p-8">
                            <AnimatePresence mode="wait">
                                {activeTab === 'sessions' ? (
                                    <M.div key="sessions" className="space-y-4">
                                        {data?.classes?.map((c: any) => (
                                            <div key={c.id} className="bg-slate-950/60 p-6 rounded-[32px] border border-white/5 flex items-center justify-between group hover:border-sky-500/30 transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className="p-4 bg-slate-900 rounded-2xl text-slate-500 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-inner">
                                                        <Play size={20} fill="currentColor" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-white uppercase tracking-tight">{c.name}</h4>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{c.start_time} • Sincronia Estável</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" rightIcon={ChevronRight} className="text-[10px] uppercase font-black">Abrir Sala</Button>
                                            </div>
                                        ))}
                                    </M.div>
                                ) : (
                                    <div className="py-12 text-center text-slate-700 font-black uppercase tracking-widest text-[10px]">Aguardando telemetria dos alunos...</div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </main>

                <aside className="lg:col-span-4 space-y-8">
                    <Card className="bg-gradient-to-br from-sky-600 to-blue-900 border-none rounded-[48px] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-24 bg-white/10 blur-[80px] rounded-full group-hover:scale-110 transition-transform" />
                        <div className="relative z-10 space-y-6">
                            <div className="p-3 bg-white/20 rounded-2xl w-fit shadow-xl"><Zap size={32} /></div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Próxima Aula</h3>
                                <p className="text-sky-100 text-xs mt-3 leading-relaxed font-medium">RedHouse Cuiabá - Grupo B (16:00). Prepare os exercícios de rítmica Dalcroze.</p>
                            </div>
                            <Button className="w-full bg-white text-blue-700 hover:bg-sky-50 rounded-2xl font-black uppercase text-[10px] py-4 shadow-xl">Ativar Sala de Aula</Button>
                        </div>
                    </Card>
                </aside>
            </div>
        </div>
    );
}
