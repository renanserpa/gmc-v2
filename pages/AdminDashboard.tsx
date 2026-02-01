import React, { useEffect, useState } from 'react';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;
import { KPICard } from '../components/dashboard/KPICard.tsx';
import { getSystemStats } from '../services/dataService.ts';
import { BacklogStatus, BacklogItem } from '../types.ts';
import { 
    Users, ShoppingBag, ShieldAlert, Loader2, 
    Music, BarChart3, Activity, Terminal, ChevronRight, 
    Zap, Cpu, Globe, RefreshCw, Megaphone, Fingerprint,
    Coins, Gavel, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.tsx';
import { notify } from '../lib/notification.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils.ts';
import { supabase } from '../lib/supabaseClient.ts';
import { formatDate } from '../lib/date.ts';
import { Button } from '../components/ui/Button.tsx';
import { haptics } from '../lib/haptics.ts';

const M = motion as any;

const KERNEL_BACKLOG: BacklogItem[] = [
    { id: '1', title: 'Tenant Kill Switch', description: 'Capacidade de derrubar sessões de uma escola inteira em caso de inadimplência.', status: BacklogStatus.Planned, type: 'tenants' },
    { id: '2', title: 'Ledger Econômico', description: 'Auditoria transacional de cada OlieCoin gerada por XP.', status: BacklogStatus.InProgress, type: 'economy' },
    { id: '3', title: 'Broadcast Analytics', description: 'Track de quantos alunos/pais abriram os avisos globais.', status: BacklogStatus.Idea, type: 'broadcast' },
    { id: '4', title: 'Latência por Região', description: 'Monitorar ping dos alunos para prever falhas no modo Live.', status: BacklogStatus.InProgress, type: 'health' },
    { id: '5', title: 'Provisionamento B2B', description: 'Interface para criação de sub-domínios para escolas franqueadas.', status: BacklogStatus.Done, type: 'tenants' }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalStudents: 0, totalProfs: 0, totalContent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    setLoading(true);
    try {
      const sysStats = await getSystemStats();
      setStats(sysStats);
    } catch (e) { 
        notify.error("Falha na sincronia do Kernel."); 
    } finally { 
        setLoading(false); 
    }
  }

  const QUICK_TOOLS = [
    { id: 'users', label: 'Identity', icon: Fingerprint, color: 'text-purple-400', path: '/admin/users', desc: 'Controle de Acesso' },
    { id: 'tenants', label: 'Tenants', icon: Globe, color: 'text-sky-400', path: '/admin/tenants', desc: 'Gerenciar Escolas' },
    { id: 'broadcast', label: 'Alerts', icon: Megaphone, color: 'text-red-400', path: '/admin/broadcast', desc: 'Avisos Globais' },
    { id: 'economy', label: 'Economy', icon: Coins, color: 'text-amber-400', path: '/admin/economy', desc: 'OlieCoins & XP' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[120px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white flex items-center gap-4 italic uppercase tracking-tighter">
            <div className="p-3 bg-orange-500 rounded-2xl shadow-lg shadow-orange-900/20">
                <ShieldAlert size={28} className="text-white" />
            </div>
            God <span className="text-sky-500">Mode</span>
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
            <Cpu size={12} className="text-sky-500" /> Kernel Maestro v4.2 • Backlog de Engenharia Ativo
          </p>
        </div>
        
        <div className="flex gap-4 relative z-10">
          <Button variant="outline" onClick={() => { haptics.medium(); navigate('/admin/health'); }} leftIcon={Activity} className="rounded-2xl border-white/5 bg-slate-950/50 text-[10px] uppercase font-black px-6">
            Health Monitor
          </Button>
          <Button onClick={loadAdminData} isLoading={loading} variant="primary" className="rounded-2xl px-6 text-[10px] uppercase font-black" leftIcon={RefreshCw}>
            Sync Core
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard title="Nós de Alunos" value={stats.totalStudents} icon={Users} color="text-sky-400" border="border-sky-500" />
          <KPICard title="Mestres Ativos" value={stats.totalProfs} icon={Music} color="text-purple-400" border="border-purple-500" />
          <KPICard title="OlieCoins Circulantes" value="142.5k" icon={ShoppingBag} color="text-amber-400" border="border-amber-500" />
          <KPICard title="Uptime Global" value="99.9%" icon={Globe} color="text-emerald-400" border="border-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {QUICK_TOOLS.map(tool => (
                    <Card key={tool.id} className="bg-[#0a0f1d] border-white/5 rounded-[40px] p-8 hover:border-sky-500/30 transition-all cursor-pointer group" onClick={() => { haptics.medium(); navigate(tool.path); }}>
                        <div className="flex justify-between items-start mb-6">
                            <div className={cn("p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform", tool.color)}>
                                <tool.icon size={24} />
                            </div>
                            <ChevronRight size={20} className="text-slate-700" />
                        </div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tight">{tool.label}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{tool.desc}</p>
                    </Card>
                ))}
            </div>

            <Card className="bg-slate-900 border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                <CardHeader className="p-8 border-b border-white/5 bg-slate-950/20">
                    <CardTitle className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                        <Terminal size={18} className="text-sky-500" /> Kernel Roadmap & Sanity Check
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-white/5">
                        {KERNEL_BACKLOG.map(item => (
                            <div key={item.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        item.status === BacklogStatus.Done ? "bg-emerald-500" :
                                        item.status === BacklogStatus.InProgress ? "bg-sky-500 animate-pulse" :
                                        item.status === BacklogStatus.Planned ? "bg-amber-500" : "bg-slate-700"
                                    )} />
                                    <div>
                                        <p className="text-sm font-black text-white uppercase tracking-tight">{item.title}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">{item.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[8px] font-black uppercase text-slate-600 bg-slate-950 px-2 py-1 rounded border border-white/5">
                                        {item.status}
                                    </span>
                                    <button className="p-2 text-slate-700 group-hover:text-sky-500 transition-colors">
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border-white/5 p-8 rounded-[40px] space-y-6 shadow-2xl">
                <div className="flex items-center gap-3 text-sky-400">
                    <AlertCircle size={20} />
                    <h4 className="text-xs font-black uppercase tracking-widest">Alertas de Integridade</h4>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase">Supabase Sync</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-500">Online</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <Clock size={16} className="text-amber-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase">Cron Jobs</span>
                            <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1 rounded uppercase">Delayed</span>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-16 bg-white/5 blur-3xl rounded-full" />
                <div className="relative z-10">
                    <div className="p-3 bg-white/10 rounded-2xl w-fit mb-4"><Gavel size={24} className="text-sky-300" /></div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Compliance & LGPD</h4>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Criptografia de dados de menores ativa. Purga de logs órfãos agendada para 24h.</p>
                </div>
            </Card>
          </aside>
      </div>
    </div>
  );
}