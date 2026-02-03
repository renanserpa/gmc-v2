
import React from 'react';
import { Activity, Mic } from 'lucide-react';
import { Tuner as TunerTool } from '../../../components/tools/Tuner.tsx';

export default function Tuner() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            <header className="space-y-2">
                <div className="flex items-center gap-2 text-amber-500">
                    <Activity size={18} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Maestro Suite / Live Tools</span>
                </div>
                <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">Afinador <span className="text-amber-500">Cromático</span></h1>
            </header>

            <div className="bg-slate-900/40 p-1 rounded-[48px] border border-amber-500/20 shadow-2xl overflow-hidden">
                <TunerTool />
            </div>
            
            <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-[40px] flex items-start gap-4">
                <div className="p-3 bg-amber-500 rounded-2xl text-slate-950 shadow-lg"><Mic size={24} /></div>
                <div>
                    <h4 className="text-sm font-black text-white uppercase mb-1">Dica do Maestro</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium italic">"A afinação é a alma do instrumento. Use o modo referência para treinar seu ouvido ou o modo live para precisão digital."</p>
                </div>
            </div>
        </div>
    );
}
