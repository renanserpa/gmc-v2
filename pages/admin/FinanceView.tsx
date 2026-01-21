

import React from 'react';
// FIX: CardDescription is now exported
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DollarSign, Search, Filter, Download, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function FinanceView() {
    const students = [
        { id: '1', name: 'Lucas Eduardo', fee: 250, status: 'ok', due: '05/03' },
        { id: '2', name: 'Beatriz Santos', fee: 250, status: 'late', due: '01/03' },
        { id: '3', name: 'Felipe Melo', fee: 250, status: 'pending', due: '10/03' },
        { id: '4', name: 'Julia Paiva', fee: 320, status: 'ok', due: '05/03' },
    ];

    const stats = {
        totalDue: 'R$ 12.450',
        received: 'R$ 8.900',
        overdue: 'R$ 3.550'
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Receita & Mensalidades</h1>
                    <p className="text-slate-500 mt-1">Monitore o fluxo de caixa pedagógico da sua escola.</p>
                </div>
                <div className="flex gap-3">
                    {/* @ts-ignore */}
                    <Button variant="outline" leftIcon={Download}>Exportar Relatório</Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border-b-4 border-sky-500 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total à Receber (Mês)</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalDue}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border-b-4 border-emerald-500 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Já Recebido</p>
                    <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.received}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border-b-4 border-red-500 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inadimplência</p>
                    <h3 className="text-2xl font-black text-red-600 mt-1">{stats.overdue}</h3>
                </div>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-slate-900">Listagem de Alunos</CardTitle>
                    <div className="flex gap-2">
                        {/* @ts-ignore */}
                        <Button size="sm" variant="ghost" leftIcon={Filter}>Filtros</Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Aluno</th>
                                <th className="px-6 py-4">Vencimento</th>
                                <th className="px-6 py-4">Valor</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-black text-slate-900 uppercase">{s.name}</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{s.due}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-900">R$ {s.fee}</td>
                                    <td className="px-6 py-4">
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight w-fit",
                                            s.status === 'ok' ? "bg-emerald-50 text-emerald-600" :
                                            s.status === 'late' ? "bg-red-50 text-red-600" :
                                            "bg-amber-50 text-amber-600"
                                        )}>
                                            {s.status === 'ok' ? <CheckCircle2 size={12} /> :
                                             s.status === 'late' ? <AlertCircle size={12} /> :
                                             <Clock size={12} />}
                                            {s.status === 'ok' ? 'Pago' : s.status === 'late' ? 'Atrasado' : 'Pendente'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-[10px] font-black text-sky-500 uppercase hover:underline">Detalhes</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}