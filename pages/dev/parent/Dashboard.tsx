
import React from 'react';
import { Shield, Star, Calendar, CreditCard } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card.tsx';

export default function ParentDashboard() {
    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
            <header>
                <div className="flex items-center gap-2 text-emerald-500 mb-2">
                    <Shield size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Guardian Hub</span>
                </div>
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Acompanhamento <span className="text-emerald-500">Familiar</span></h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-[#0a0f1d] border-white/5 rounded-[40px] p-10 shadow-2xl">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-emerald-500" />
                        <div>
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Jornada do Lucca</h3>
                            <p className="text-slate-500 text-xs font-bold mt-1">Violão Kids • RedHouse</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 uppercase font-black tracking-widest">Assiduidade</span>
                            <span className="text-emerald-400 font-black">94%</span>
                        </div>
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full w-[94%] bg-emerald-500" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-[#0a0f1d] border-white/5 rounded-[40px] p-10 shadow-2xl flex flex-col justify-center gap-4">
                    <div className="flex items-center gap-4 text-amber-500">
                        <Star size={24} fill="currentColor" />
                        <span className="text-xs font-black uppercase tracking-widest text-white">Último Feedback</span>
                    </div>
                    <p className="text-lg font-medium text-slate-300 italic">"O Lucca evoluiu muito no ritmo do elefante esta semana!"</p>
                </Card>
            </div>
        </div>
    );
}
