
import React from 'react';
import { Building2, BarChart3, Users, DollarSign, TrendingUp } from 'lucide-react';
import { Card } from '../../../components/ui/Card.tsx';

export default function ManagerDashboard() {
    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
            <header>
                <div className="flex items-center gap-2 text-orange-500 mb-2">
                    <Building2 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Unidade Admin</span>
                </div>
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Gestão <span className="text-orange-500">Operacional</span></h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-[#0a0f1d] border-white/5 p-8 rounded-[48px] shadow-2xl flex flex-col items-center justify-center gap-4 border-b-4 border-orange-500">
                    <DollarSign className="text-orange-500" size={32} />
                    <div className="text-center">
                        <p className="text-4xl font-black text-white tracking-tighter">R$ 14.250</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Receita Unidade</p>
                    </div>
                </Card>
                <Card className="bg-[#0a0f1d] border-white/5 p-8 rounded-[48px] shadow-2xl flex flex-col items-center justify-center gap-4">
                    <Users className="text-sky-500" size={32} />
                    <div className="text-center">
                        <p className="text-4xl font-black text-white tracking-tighter">64</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Total de Alunos</p>
                    </div>
                </Card>
                <Card className="bg-[#0a0f1d] border-white/5 p-8 rounded-[48px] shadow-2xl flex flex-col items-center justify-center gap-4">
                    <TrendingUp className="text-emerald-500" size={32} />
                    <div className="text-center">
                        <p className="text-4xl font-black text-white tracking-tighter">+12%</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Crescimento Mês</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
