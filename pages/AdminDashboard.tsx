import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KPICard } from '../components/dashboard/KPICard';
import { getSystemStats } from '../services/dataService';
import { Profile, UserRole } from '../types';
// Adicionado ChevronRight para corrigir erro de importação
import { Users, ShoppingBag, LayoutDashboard, ShieldAlert, Loader2, Music, BarChart3, Activity, Terminal, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { notify } from '../lib/notification';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabaseClient';
import { formatDate } from '../lib/date';
import { Button } from '../components/ui/Button';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'audit'>('overview');
  const [stats, setStats] = useState({ totalStudents: 0, activeMissions: 0, totalContent: 0 });
  const [teachers, setTeachers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    setLoading(true);
    try {
      const [sysStats, recentUsers, storeOrders] = await Promise.all([
        getSystemStats(),
        supabase.from('profiles').select('*').eq('role', UserRole.Professor),
        supabase.from('store_orders').select('*, store_items(name, price_coins), students(name)').order('created_at', { ascending: false }).limit(20)
      ]);
      setStats(sysStats);
      setTeachers(recentUsers.data || []);
      setOrders(storeOrders.data || []);
    } catch (e) { notify.error("Erro God Mode."); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto mb-4" /> Acessando Nucleo...</div>;

  return (
    <div className="space-y-8 animate-in fade-in max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 italic uppercase tracking-tighter">
            <ShieldAlert className="text-orange-500" /> Admin <span className="text-sky-500">God Mode</span>
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Controle Central Maestro v3.0</p>
        </div>
        <div className="flex gap-3">
          {/* FIX: The 'variant' and 'leftIcon' props are now supported by the updated Button component */}
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/health')} 
            leftIcon={Activity}
            className="rounded-2xl border-sky-500/30 text-sky-400 hover:bg-sky-500/10 text-[10px]"
          >
            System Health
          </Button>
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-white/5 shadow-inner">
            {[
              { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
              { id: 'teachers', label: 'Professores', icon: Music },
              { id: 'audit', label: 'Auditoria', icon: ShoppingBag }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)} 
                className={cn(
                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2", 
                    activeTab === tab.id ? "bg-orange-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                )}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KPICard title="Total Alunos" value={stats.totalStudents} icon={Users} color="text-sky-500" border="border-sky-500" />
              <KPICard title="Professores" value={teachers.length} icon={Music} color="text-orange-500" border="border-orange-500" />
              <KPICard title="Itens na Loja" value={stats.totalContent} icon={ShoppingBag} color="text-yellow-500" border="border-yellow-500" />
            </div>

            <Card className="bg-slate-900 border-white/5 rounded-[40px] p-8 border-l-8 border-l-sky-500 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-16 bg-sky-500/5 blur-3xl rounded-full group-hover:scale-110 transition-transform" />
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-sky-600 rounded-3xl text-white shadow-lg">
                            <Terminal size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-widest leading-none">Console de Engenharia</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Diagnóstico de Infraestrutura e Purga de Cache</p>
                        </div>
                    </div>
                    {/* FIX: The 'rightIcon' prop is now supported by the updated Button component */}
                    <Button 
                        onClick={() => navigate('/admin/health')}
                        className="rounded-2xl px-10 py-4 text-xs font-black uppercase tracking-widest"
                        rightIcon={ChevronRight}
                    >
                        Abrir Kernel
                    </Button>
                </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'teachers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.map(t => (
                    <Card key={t.id} className="bg-slate-900 border-white/5 rounded-[32px] overflow-hidden group hover:border-orange-500/30 transition-all">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-5 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500 font-black text-xl shadow-inner border border-orange-500/20">
                                    {t.full_name?.substring(0,1)}
                                </div>
                                <div>
                                    <h4 className="font-black text-white uppercase tracking-tight">{t.full_name}</h4>
                                    <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{t.email}</p>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Acesso Maestro</span>
                                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg uppercase border border-emerald-500/20">Ativo</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}

        {activeTab === 'audit' && (
            <Card className="bg-slate-900 border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                <CardHeader className="bg-slate-950/40 p-8 border-b border-white/5">
                    <CardTitle className="text-xl flex items-center gap-3 uppercase tracking-tighter italic">
                        <BarChart3 size={24} className="text-yellow-500" /> Transações Recentes
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950/80 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-5">Timestamp</th>
                                    <th className="px-8 py-5">Estudante</th>
                                    <th className="px-8 py-5">Item Adquirido</th>
                                    <th className="px-8 py-5 text-right">Custo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {orders.map(o => (
                                    <tr key={o.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-5 text-slate-500 font-mono text-[11px] uppercase tracking-tighter">{formatDate(o.created_at, 'dd/MM HH:mm')}</td>
                                        <td className="px-8 py-5 font-black text-slate-200 group-hover:text-white transition-colors">{o.students?.name || 'N/A'}</td>
                                        <td className="px-8 py-5 text-sky-400 font-black uppercase tracking-tight">{o.store_items?.name}</td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-xl font-black border border-yellow-500/20 text-xs">
                                                <ShoppingBag size={12} /> {o.store_items?.price_coins} <span className="opacity-40 text-[9px]">OC</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        )}
      </AnimatePresence>
    </div>
  );
}