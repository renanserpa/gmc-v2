

import React, { useMemo, useState, useEffect } from 'react';
// @ts-ignore - Resolving environment-specific export errors for react-router-dom
import { useNavigate } from 'react-router-dom';
// FIX: CardDescription is now exported from ../components/ui/Card
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { 
  BadgeCheck, Award, TrendingUp, AlertTriangle, ShieldCheck, 
  Music, CheckCircle2, History, Zap, ClipboardList, Calendar, 
  Clock, PlayCircle, Library, Headphones, Star, Target, Trophy,
  ArrowUpRight, Activity, CalendarCheck, BarChart3, ClipboardCheck
} from 'lucide-react';
import { useGuardianData } from '../hooks/useGuardianData';
import { usePageTitle } from '../hooks/usePageTitle';
import { formatDate } from '../lib/date';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

export default function GuardianDashboard() {
  usePageTitle("Painel do Responsável");
  const { data, isLoading, error } = useGuardianData();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'repertoire'>('overview');

  if (isLoading) return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;

  if (error || !data) return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-4">
          <AlertTriangle size={48} className="text-red-500 opacity-20"/>
          <h2 className="text-xl font-bold text-slate-300">Nenhum aluno vinculado.</h2>
          {/* FIX: The 'variant' prop is now supported by the updated Button component */}
          <Button variant="outline" onClick={() => navigate('/guardian/setup')}>Vincular Dependente</Button>
      </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
            <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Cockpit do Responsável</h1>
                <p className="text-slate-500 text-sm">Acompanhando a jornada de <span className="text-sky-400 font-bold">{data.studentName}</span></p>
            </div>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button onClick={() => setActiveTab('overview')} className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2", activeTab === 'overview' ? "bg-sky-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}>
                    <ShieldCheck size={14} /> Progresso
                </button>
                <button onClick={() => setActiveTab('repertoire')} className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2", activeTab === 'repertoire' ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}>
                    <Library size={14} /> Repertório
                </button>
            </div>
        </header>

        <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
                /* Use any to bypass Framer Motion properties error */
                <motion.div key="overview" initial={{ opacity: 0, y: 10 } as any} animate={{ opacity: 1, y: 0 } as any} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-slate-900/50 border-slate-800/60 hover:border-sky-500/30 transition-all">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl"><ClipboardCheck size={20} /></div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Frequência</p>
                                    <p className="text-sm font-bold text-white">{data.attendanceRate}% de Assiduidade</p>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Outros KPIs mantidos */}
                        <Card className="bg-slate-900/50 border-slate-800/60 hover:border-sky-500/30 transition-all">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="p-3 bg-sky-400/10 text-sky-400 rounded-2xl"><Activity size={20} /></div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ritmo</p>
                                    <p className="text-sm font-bold text-white">{data.streak} Dias</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}