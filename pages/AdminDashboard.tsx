
import React, { useEffect, useState } from 'react';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;
import { KPICard } from '../components/dashboard/KPICard.tsx';
import { getSystemStats } from '../services/dataService.ts';
import { UserRole } from '../types.ts';
import { 
    Users, ShoppingBag, LayoutDashboard, ShieldAlert, Loader2, 
    Music, BarChart3, Activity, Terminal, ChevronRight, 
    Zap, Cpu, Globe, ShieldCheck, Database, RefreshCw, Megaphone, Fingerprint
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalStudents: 0, totalProfs: 0, totalContent: 0 });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    setLoading(true);
    try {
      const [sysStats, eventsRes] = await Promise.all([
        getSystemStats(),
        supabase.from('xp_events')
          .select('*, students(name)')
          .order('created_at', { ascending: false })
          .limit(6)
      ]);
      setStats(sysStats);
      setRecentEvents(eventsRes.data || []);
    } catch (e) { 
        notify.error("Falha na sincronia do Kernel."); 
    } finally { 
        setLoading(false); 
    }
  }

  const QUICK_TOOLS = [
    { id: 'users', label: 'Identity', icon: Fingerprint, color: 'text-purple-400', path: '/admin/users', desc: 'Controle de Acesso' },
    { id: 'broadcast', label: 'Alerts', icon: Megaphone, color: 'text-red-400', path: '/admin/broadcast', desc: 'Avisos Globais' },
    { id: 'orchestrator', label: 'Ops', icon: Activity, color: 'text-sky-400', path: '/admin/orchestrator', desc: 'Módulos Ativos' },
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
            <Cpu size={12} className="text-sky-500" /> Kernel Maestro v4.2 Alpha • Terminal Ativo
          </p>
        </div>
        
        <div className="flex gap-4 relative z-10">
          <Button 
            variant="outline" 
            onClick={() => { haptics.medium(); navigate('/admin/health'); }} 
            leftIcon={Activity}
            className="rounded-2xl border-white/5 bg-slate-950/50 text-[10px] uppercase font-black px-6"
          >
            Health Monitor
          </Button>
          <Button 
            onClick={loadAdminData}
            isLoading={loading}
            variant="primary"
            className="rounded-2xl px-6 text-[10px] uppercase font-black"
            leftIcon={RefreshCw}
          >
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
            <Card className="bg-slate-900 border-white/5 rounded-[48px] p-10 overflow-hidden relative group border-l-8 border-l-sky-500 shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none group-hover:bg-sky-500/10 transition-colors duration-700" />
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-8">
                        <div className="p-6 bg-sky-600 rounded-[32px] text-white shadow-2xl shadow-sky-900/40 group-hover:rotate-6 transition-transform">
                            <Terminal size={40} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-widest leading-none">Console de Infraestrutura</h3>
                            <p className="text-slate-500 text-sm mt-3 font-medium max-w-md">Diagnóstico de tabelas, purga de cache e gerenciamento de políticas RLS em tempo real.</p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => navigate('/admin/explorer')}
                        className="rounded-2xl px-12 py-8 text-xs font-black uppercase tracking-widest shadow-xl"
                        rightIcon={ChevronRight}
                    >
                        Abrir Kernel
                    </Button>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {QUICK_TOOLS.map(tool => (
                    <Card key={tool.id} className="bg-[#0a0f1d] border-white/5 rounded-[40px] p-8 hover:border-sky-500/30 transition-all cursor-pointer group" onClick={() => navigate(tool.path)}>
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
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-2">
                    <Activity size={14} className="text-sky-500" /> Pulse de Atividade
                </h3>
                <span className="text-[8px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Live</span>
            </div>

            <div className="space-y-3">
                <AnimatePresence>
                    {recentEvents.map((event, idx) => (
                        <M.div 
                            key={event.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-slate-900/40 border border-white/5 p-4 rounded-[24px] flex items-center justify-between group hover:bg-slate-900 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_#0ea5e9]" />
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase truncate max-w-[120px]">{event.students?.name || 'User'}</p>
                                    <p className="text-[8px] font-bold text-slate-600 uppercase mt-0.5">{event.event_type}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-sky-400">+{event.xp_amount} XP</p>
                                <p className="text-[7px] text-slate-700 font-mono mt-0.5">{formatDate(event.created_at, 'HH:mm:ss')}</p>
                            </div>
                        </M.div>
                    ))}
                </AnimatePresence>
                
                {recentEvents.length === 0 && (
                    <div className="py-20 text-center opacity-20 italic text-xs">Nenhum pulso detectado...</div>
                )}
            </div>

            <Card className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-16 bg-white/5 blur-3xl rounded-full" />
                <div className="relative z-10">
                    <div className="p-3 bg-white/10 rounded-2xl w-fit mb-4"><Database size={24} className="text-sky-300" /></div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Backup Cloud</h4>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Snapshot diário concluído com sucesso. Proteção de dados pedagógicos ativa.</p>
                </div>
            </Card>
          </aside>
      </div>
    </div>
  );
}
