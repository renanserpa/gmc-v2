
import React from 'react';
import { Timer, Zap } from 'lucide-react';
import { Metronome as MetronomeTool } from '../../../components/tools/Metronome.tsx';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card.tsx';

export default function Metronome() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            <header className="space-y-2">
                <div className="flex items-center gap-2 text-sky-500">
                    <Timer size={18} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Maestro Suite / Live Tools</span>
                </div>
                <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">Metrônomo <span className="text-sky-500">Pro</span></h1>
            </header>

            <div className="bg-slate-900/40 p-1 rounded-[48px] border border-white/5 shadow-2xl overflow-hidden">
                <MetronomeTool />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-900 border-white/5 p-6 rounded-[32px]">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Specs Técnicas</h4>
                    <ul className="space-y-2 text-xs text-slate-400 font-medium">
                        <li className="flex items-center gap-2"><Zap size={12} className="text-sky-500"/> AudioContext Scheduler (0.0ms delay)</li>
                        <li className="flex items-center gap-2"><Zap size={12} className="text-sky-500"/> Persistent Engine em Contexto</li>
                    </ul>
                </Card>
            </div>
        </div>
    );
}
