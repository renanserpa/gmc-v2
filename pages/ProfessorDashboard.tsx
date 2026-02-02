
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, GraduationCap, Zap, TrendingUp, Sparkles, 
    Plus, Clock, AlertTriangle, ChevronRight,
    Brain, Play, Loader2, Fingerprint, Activity,
    History, Search, Building2, Star, FileText, Download
} from 'lucide-react';

import { useProfessorData } from '../hooks/useProfessorData';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { KPICard } from '../components/dashboard/KPICard';
import { AttendanceModal } from '../components/dashboard/AttendanceModal';
import { getStudentsByClass, getMonthlyBillingReport } from '../services/dataService';
import { cn } from '../lib/utils';
import { notify } from '../lib/notification';
import { haptics } from '../lib/haptics';

const M = motion as any;

export default function ProfessorDashboard() {
    usePageTitle("Maestro Center - Cockpit");
    const { user, schoolId } = useAuth();
    const { data, isLoading, error, refetch } = useProfessorData();
    
    const [selectedClass, setSelectedClass] = useState<any>(null);
    const [classStudents, setClassStudents] = useState<any[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [generatingReport, setGeneratingReport] = useState(false);

    const handleOpenClass = async (c: any) => {
        haptics.medium();
        setSelectedClass(c);
        setLoadingStudents(true);
        try {
            const students = await getStudentsByClass(c.id);
            setClassStudents(students);
        } catch (e) {
            notify.error("Falha ao sincronizar lista de presença.");
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleGenerateReport = async () => {
        if (!schoolId) return;
        setGeneratingReport(true);
        haptics.heavy();
        try {
            const now = new Date();
            const report = await getMonthlyBillingReport(user.id, schoolId, now.getMonth(), now.getFullYear());
            notify.success(`Extrato Gerado: ${report.totalHours} horas trabalhadas em ${report.sessionCount} sessões.`);
            // No futuro, aqui dispararia o PDF real
        } catch (e) {
            notify.error("Erro ao processar faturamento.");
        } finally {
            setGeneratingReport(false);
        }
    };

    if (error) return <div className="p-20 text-center text-red-500 font-black uppercase">Erro Crítico no Kernel Docente</div>;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-24 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Maestro <span className="text-sky-500">Center</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Unidade Ativa: {schoolId || 'Global Pool'}</p>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <Button 
                        onClick={handleGenerateReport} 
                        isLoading={generatingReport}
                        variant="outline" 
                        leftIcon={FileText} 
                        className="rounded-2xl px-8 border-white/10"
                    >
                        Extrato de Aula
                    </Button>
                    <Button leftIcon={Plus} className="rounded-2xl px-8 shadow-xl shadow-sky-900/20">Matricular Aluno</Button>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <KPICard title="Meus Alunos" value={isLoading ? undefined : data?.stats?.totalStudents} icon={Users} color="text-sky-400" border="border-sky-500" />
                <KPICard title="Horas Mês" value={isLoading ? undefined : '32.5h'} icon={Clock} color="text-purple-400" border="border-purple-500" />
                <KPICard title="Média Técnica" value={isLoading ? undefined : `${data?.stats?.avgXp} XP`} icon={Zap} color="text-amber-500" border="border-amber-500" />
                <KPICard title="Efetividade" value={isLoading ? undefined : '94%'} icon={Star} color="text-emerald-500" border="border-emerald-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <main className="lg:col-span-8 space-y-8">
                    <Card className="bg-slate-900 border-white/5 rounded-[48px] overflow-hidden shadow-2xl min-h-[500px]">
                        <CardHeader className="bg-slate-950/40 p-8 border-b border-white/5 flex items-center justify-between">
                            <CardTitle className="text-sm uppercase tracking-widest text-slate-500 flex items-center gap-3">
                                <GraduationCap size={18} /> Minha Grade Horária
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data?.classes?.map((c: any) => (
                                    <div 
                                        key={c.id} 
                                        onClick={() => handleOpenClass(c)}
                                        className="bg-slate-950/60 p-6 rounded-[32px] border border-white/5 flex items-center justify-between group hover:border-sky-500/30 transition-all cursor-pointer shadow-lg"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="p-4 bg-slate-900 rounded-2xl text-slate-500 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-inner">
                                                <Play size={20} fill="currentColor" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-white uppercase tracking-tight truncate max-w-[150px]">{c.name}</h4>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{c.day_of_week} • {c.start_time.slice(0, 5)}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-800 group-hover:text-sky-400 transition-all" />
                                    </div>
                                ))}
                                {data?.classes?.length === 0 && (
                                    <div className="col-span-2 py-20 text-center border-2 border-dashed border-slate-800 rounded-[40px] opacity-40">
                                        <p className="text-xs font-black uppercase tracking-widest">Nenhuma turma vinculada a você nesta unidade.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </main>

                <aside className="lg:col-span-4 space-y-6">
                    <Card className="bg-gradient-to-br from-sky-600 to-indigo-900 border-none rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-24 bg-white/10 blur-[80px] rounded-full group-hover:scale-125 transition-transform duration-1000" />
                        <div className="relative z-10 space-y-8">
                            <div className="p-4 bg-white/20 rounded-2xl w-fit shadow-xl"><Sparkles size={32} /></div>
                            <div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">Próxima <br /> Sessão</h3>
                                <p className="text-sky-100/70 text-xs mt-4 leading-relaxed font-medium">Sua aula na RedHouse começa em 15 minutos. Prepare os exercícios da Caminhada da Aranha.</p>
                            </div>
                            <Button className="w-full bg-white text-sky-600 hover:bg-sky-50 rounded-2xl font-black uppercase text-[10px] py-6 shadow-xl border-none">Sincronizar TV da Sala</Button>
                        </div>
                    </Card>
                    
                    <div className="p-8 bg-slate-900/60 border border-white/5 rounded-[40px] shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <History size={16} className="text-slate-500" />
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logs de Atividade Alunos</h4>
                        </div>
                        <div className="space-y-4">
                            {data?.auditLogs?.slice(0, 3).map((log: any) => (
                                <div key={log.id} className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-sky-500" />
                                    <p className="text-[10px] text-slate-400 font-medium truncate">
                                        <span className="text-white font-bold">{log.student_name}</span> ganhou {log.xp_amount} XP
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            {selectedClass && (
                <AttendanceModal 
                    isOpen={!!selectedClass} 
                    onClose={() => setSelectedClass(null)} 
                    musicClass={selectedClass} 
                    students={classStudents}
                    professorId={user.id}
                    onSuccess={() => refetch()}
                />
            )}
        </div>
    );
}
