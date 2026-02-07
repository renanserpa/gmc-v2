
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, Star, Calendar, MessageSquare, 
    Headphones, Zap, TrendingUp, Sparkles,
    CheckCircle2, Camera, Play, Award, Heart,
    ChevronRight, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { useCurrentStudent } from '../../../hooks/useCurrentStudent.ts';
import { getStudentBpmHistory, getLatestFamilyReport } from '../../../services/dataService.ts';
import { BpmChart } from '../../../components/family/BpmChart.tsx';
import { UserAvatar } from '../../../components/ui/UserAvatar.tsx';
import { cn } from '../../../lib/utils.ts';
import { haptics } from '../../../lib/haptics.ts';

const M = motion as any;

export default function FamilyDashboard() {
    const { student } = useCurrentStudent();
    const { user } = useAuth();
    const [bpmData, setBpmData] = useState<any[]>([]);
    const [lastReport, setLastReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (student?.id) {
            loadFamilyData();
        }
    }, [student?.id]);

    const loadFamilyData = async () => {
        setLoading(true);
        try {
            const [history, report] = await Promise.all([
                getStudentBpmHistory(student!.id),
                getLatestFamilyReport(student!.id)
            ]);
            setBpmData(history);
            setLastReport(report);
        } catch (e) {
            console.error("Erro no Portal da Família:", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !student) return <div className="p-20 text-center animate-pulse text-emerald-500 font-black tracking-widest uppercase">Sincronizando Family Hub...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700">
            {/* Guardian Welcome Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-slate-900/40 p-10 rounded-[56px] border border-emerald-500/20 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 blur-[100px] pointer-events-none" />
                 
                 <div className="relative z-10 flex items-center gap-6">
                    <div className="p-4 bg-emerald-600 rounded-[28px] text-white shadow-xl shadow-emerald-900/30">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Guardian <span className="text-emerald-400">Hub</span></h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase mt-3 tracking-[0.3em] flex items-center gap-2">
                             <CheckCircle2 size={12} className="text-emerald-500" /> Monitoramento Pedagógico Ativo
                        </p>
                    </div>
                </div>

                <div className="flex bg-slate-950 p-2 rounded-3xl border border-white/10 relative z-10 shadow-inner group">
                    <UserAvatar src={student.avatar_url} name={student.name} size="md" className="border-2 border-emerald-500/30" />
                    <div className="flex flex-col px-4 justify-center">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Aluno Monitorado</span>
                        <span className="text-xs font-black text-white uppercase">{student.name}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Lado Esquerdo: Evolução Técnica */}
                <main className="lg:col-span-8 space-y-8">
                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Performance Técnica</h2>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Sincronia de Ritmo (BPM Máximo por Sessão)</p>
                            </div>
                            <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                                <TrendingUp size={24} />
                            </div>
                        </div>

                        <BpmChart data={bpmData} className="h-64" />

                        <div className="mt-10 p-6 bg-slate-950/60 rounded-[32px] border border-white/5 flex items-start gap-4">
                            <Sparkles className="text-amber-500 shrink-0 mt-1" size={20} />
                            <p className="text-sm text-slate-400 leading-relaxed font-medium italic">
                                "O progresso em BPM mostra que a memória muscular está sendo consolidada. Um aumento constante de 5-10 BPM por mês é o sinal de uma técnica saudável."
                            </p>
                        </div>
                    </Card>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                             <MessageSquare size={18} className="text-emerald-500" />
                             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Mural de Feedbacks</h3>
                        </div>

                        {lastReport ? (
                            <Card className="bg-slate-900 border-emerald-500/20 rounded-[48px] p-10 shadow-xl relative overflow-hidden">
                                <div className="absolute top-4 right-4 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase">
                                    Nota do Mestre
                                </div>
                                <div className="flex gap-8 items-start">
                                     <div className="w-20 h-20 bg-slate-950 rounded-full border-2 border-emerald-500 p-1 shrink-0">
                                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Lucca`} className="w-full h-full rounded-full" />
                                     </div>
                                     <div className="space-y-4">
                                         <p className="text-2xl font-black text-white uppercase italic tracking-tighter leading-tight">
                                            "{lastReport.report_text}"
                                         </p>
                                         <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                             <Calendar size={14} className="text-emerald-500" /> {new Date(lastReport.sent_at).toLocaleDateString()} • Maestro Renan Serpa
                                         </div>
                                     </div>
                                </div>
                            </Card>
                        ) : (
                            <div className="py-20 text-center border-2 border-dashed border-slate-900 rounded-[48px] opacity-30 italic text-slate-600">
                                Aguardando o próximo relatório de missão...
                            </div>
                        )}
                    </section>
                </main>

                {/* Lado Direito: KPIs & Recompensas */}
                <aside className="lg:col-span-4 space-y-6">
                    <Card className="bg-gradient-to-br from-purple-900/20 to-slate-900 border-white/5 rounded-[48px] p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-16 bg-purple-500/5 blur-[80px] pointer-events-none" />
                        <div className="flex flex-col items-center text-center gap-6 relative z-10">
                            <div className="w-24 h-24 bg-purple-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-purple-900/40 animate-bounce">
                                <Award size={48} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Próxima Conquista</h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Faltam 50 XP para o Nível {student.current_level + 1}</p>
                            </div>
                            <Button className="w-full py-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-xs font-black uppercase tracking-widest" rightIcon={ChevronRight}>
                                Ver Journey Map
                            </Button>
                        </div>
                    </Card>

                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] p-8 shadow-xl">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <Calendar size={14} className="text-sky-400" /> Próxima Aula
                        </h4>
                        <div className="p-6 bg-slate-950 rounded-3xl border border-white/5 space-y-4">
                             <div className="flex justify-between items-center">
                                 <span className="text-2xl font-black text-white font-mono">16:00</span>
                                 <span className="text-[10px] font-black text-sky-400 uppercase bg-sky-400/10 px-2 py-0.5 rounded">Confirmada</span>
                             </div>
                             <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Segunda-feira • RedHouse Unidade 1</p>
                        </div>
                    </Card>

                    <div className="p-8 bg-sky-500/5 border border-sky-500/10 rounded-[40px] flex items-start gap-4">
                         <Heart className="text-rose-500 shrink-0" size={20} fill="currentColor" />
                         <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                            <strong>Dica para a Família:</strong> Elogie o progresso técnico do seu filho. O reconhecimento fora da aula aumenta em 30% a motivação do treino em casa.
                         </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
