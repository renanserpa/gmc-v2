

import React from 'react';
// FIX: CardDescription is now exported
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { KPICard } from '../../components/dashboard/KPICard';
import { 
    Users, TrendingUp, AlertTriangle, CalendarCheck, 
    ArrowUpRight, ArrowDownRight, Clock, MessageCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function SchoolDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <header>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Panorama Institucional</h1>
            <p className="text-slate-500">Métricas consolidadas de alunos, professores e saúde do negócio.</p>
        </header>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl"><Users size={24} /></div>
                    <span className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                        <ArrowUpRight size={14} /> +12%
                    </span>
                </div>
                <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Alunos</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">142</h3>
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><CalendarCheck size={24} /></div>
                    <span className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                        Estável
                    </span>
                </div>
                <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Taxa de Presença</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">88.4%</h3>
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 ring-2 ring-amber-500/20">
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><AlertTriangle size={24} /></div>
                    <span className="flex items-center gap-1 text-amber-600 text-xs font-bold bg-amber-50 px-2 py-1 rounded-lg">
                        Urgente
                    </span>
                </div>
                <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Alerta de Churn</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">14 Alunos</h3>
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><TrendingUp size={24} /></div>
                    <span className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                        +R$ 2.4k
                    </span>
                </div>
                <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Previsão Mensal</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">R$ 28.5k</h3>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Gráfico de Crescimento (Mock) */}
            <Card className="lg:col-span-8 bg-white border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-slate-900">Crescimento de Alunos</CardTitle>
                    <CardDescription>Média de novas matrículas nos últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-end gap-4 pb-8 pt-4">
                    {[40, 65, 55, 80, 70, 95].map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${val}%` }}
                                className="w-full bg-slate-100 rounded-xl group-hover:bg-sky-500 transition-colors relative"
                            >
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black opacity-0 group-hover:opacity-100">{val}</span>
                            </motion.div>
                            <span className="text-[10px] font-black text-slate-400 uppercase">Mês 0{i+1}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Lista de Risco (Churn) */}
            <Card className="lg:col-span-4 bg-white border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-slate-900 text-sm flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-500" /> Alunos em Risco
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        {[
                            { name: 'João Victor', days: 18, teacher: 'Renan' },
                            { name: 'Mariana Costa', days: 22, teacher: 'Ana' },
                            { name: 'Pedro Silva', days: 15, teacher: 'Renan' },
                        ].map((student, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300" />
                                    <div>
                                        <p className="text-xs font-black text-slate-900 uppercase">{student.name}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Prof: {student.teacher}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-red-500">{student.days} dias off</p>
                                    <button className="text-[9px] font-black text-sky-500 uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Notificar Pais</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}