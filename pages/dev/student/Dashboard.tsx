
import React from 'react';
import { Trophy, Star, Coins, Zap, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card.tsx';

export default function StudentDashboard() {
    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-end gap-6 bg-indigo-950/20 p-10 rounded-[56px] border border-indigo-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-pink-500/5 blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-pink-500 mb-2">
                        <Star size={14} fill="currentColor" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Player Profile</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Meu <span className="text-pink-500">Progresso</span>
                    </h1>
                </div>
                <div className="bg-slate-950/80 px-8 py-4 rounded-[32px] border border-white/5 flex items-center gap-6 relative z-10">
                    <div className="text-center border-r border-white/10 pr-6">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Nível</p>
                        <p className="text-3xl font-black text-white italic">04</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">XP Atual</p>
                        <p className="text-3xl font-black text-pink-500 italic">1.250</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-3 bg-[#0a0f1d] border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group hover:border-pink-500/30 transition-all">
                     <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-transparent pointer-events-none" />
                     <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="p-5 bg-pink-600 rounded-3xl text-white shadow-xl"><Target size={32} /></div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Missão Lendária</h3>
                                <p className="text-slate-500 text-sm font-medium mt-1">Conclua a Caminhada da Aranha a 100 BPM</p>
                            </div>
                        </div>
                        <button className="bg-white text-slate-950 px-8 py-4 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl">Aceitar</button>
                     </div>
                </Card>
                <Card className="bg-[#0a0f1d] border-white/5 rounded-[40px] p-8 shadow-2xl flex flex-col items-center justify-center gap-3">
                    <Coins className="text-yellow-500" size={32} fill="currentColor" />
                    <span className="text-4xl font-black text-white tracking-tighter">450</span>
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Olie Moedas</span>
                </Card>
            </div>
        </div>
    );
}
