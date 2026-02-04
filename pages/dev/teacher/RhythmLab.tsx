
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Drum, Zap, Square, Play, Trash2, 
    Settings2, Save, Layers, Music, Activity 
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { haptics } from '../../../lib/haptics.ts';
import { cn } from '../../../lib/utils.ts';
import { useMaestro } from '../../../contexts/MaestroContext.tsx';

const M = motion as any;

const INSTRUMENTS = [
    { id: 'kick', label: 'Bumbo (Elefante)', color: 'bg-red-500' },
    { id: 'snare', label: 'Caixa', color: 'bg-sky-400' },
    { id: 'hihat', label: 'Prato (Passarinho)', color: 'bg-amber-400' },
    { id: 'wood', label: 'Bloco', color: 'bg-emerald-500' }
];

export default function RhythmLab() {
    const { metronome } = useMaestro();
    const [grid, setGrid] = useState<Record<string, boolean[]>>({
        kick: Array(16).fill(false),
        snare: Array(16).fill(false),
        hihat: Array(16).fill(false),
        wood: Array(16).fill(false),
    });

    const [currentStep, setCurrentStep] = useState(0);

    // Efeito de loop visual sincronizado com o metrônomo (Simulação)
    useEffect(() => {
        if (!metronome.isPlaying) {
            setCurrentStep(-1);
            return;
        }

        const interval = (60 / metronome.bpm) * 1000 / 4; // 16th notes
        const timer = setInterval(() => {
            setCurrentStep(prev => (prev + 1) % 16);
        }, interval);

        return () => clearInterval(timer);
    }, [metronome.isPlaying, metronome.bpm]);

    const toggleStep = (instId: string, stepIdx: number) => {
        haptics.light();
        setGrid(prev => ({
            ...prev,
            [instId]: prev[instId].map((v, i) => i === stepIdx ? !v : v)
        }));
    };

    const clearGrid = () => {
        haptics.heavy();
        setGrid({
            kick: Array(16).fill(false),
            snare: Array(16).fill(false),
            hihat: Array(16).fill(false),
            wood: Array(16).fill(false),
        });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-32 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-900/40 p-10 rounded-[56px] border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-amber-500/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-amber-500 mb-2">
                        <Drum size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Rhythmic Pattern Engine</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Groove <span className="text-amber-500">Studio</span>
                    </h1>
                </div>
                <div className="flex gap-4 relative z-10 items-center">
                    <div className="px-6 py-3 bg-slate-950 border border-white/10 rounded-2xl flex flex-col items-end">
                        <span className="text-[8px] font-black text-slate-500 uppercase">Tempo Master</span>
                        <span className="text-2xl font-black text-sky-400 font-mono">{metronome.bpm} BPM</span>
                    </div>
                    <Button 
                        onClick={metronome.toggle}
                        className={cn(
                            "h-16 px-10 rounded-[28px] font-black uppercase shadow-xl",
                            metronome.isPlaying ? "bg-red-600 hover:bg-red-500" : "bg-sky-600 hover:bg-sky-500"
                        )}
                        leftIcon={metronome.isPlaying ? Square : Play}
                    >
                        {metronome.isPlaying ? "PARAR" : "INICIAR LOOP"}
                    </Button>
                </div>
            </header>

            <Card className="bg-[#0a0f1d] border-white/5 rounded-[64px] p-12 overflow-x-auto shadow-2xl relative border-t-4 border-t-amber-500">
                <div className="min-w-[900px] space-y-8">
                    {INSTRUMENTS.map((inst) => (
                        <div key={inst.id} className="flex items-center gap-8 group">
                            <div className="w-48">
                                <h4 className="text-xs font-black text-white uppercase tracking-widest">{inst.label}</h4>
                                <div className={cn("h-1 w-8 rounded-full mt-1", inst.color)} />
                            </div>
                            <div className="flex-1 grid grid-cols-16 gap-2">
                                {grid[inst.id].map((isActive, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => toggleStep(inst.id, idx)}
                                        className={cn(
                                            "h-14 rounded-xl border-2 transition-all relative overflow-hidden",
                                            isActive 
                                                ? `${inst.color} border-white shadow-lg shadow-${inst.color}/20` 
                                                : "bg-slate-900 border-white/5 hover:border-white/10",
                                            currentStep === idx && "ring-4 ring-white/20 scale-110 z-10",
                                            idx % 4 === 0 && !isActive && "bg-slate-800"
                                        )}
                                    >
                                        {currentStep === idx && (
                                            <div className="absolute inset-0 bg-white/20 animate-ping" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex justify-between items-center border-t border-white/5 pt-8">
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={clearGrid} leftIcon={Trash2} className="rounded-2xl border-white/10">Limpar Grid</Button>
                        <Button variant="ghost" leftIcon={Settings2} className="rounded-2xl text-slate-500 hover:text-white">Opções de Sample</Button>
                    </div>
                    <Button className="bg-amber-600 rounded-2xl px-8" leftIcon={Save}>Salvar Pattern</Button>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-slate-900/40 p-8 rounded-[40px] border border-white/5 flex items-start gap-5">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400"><Activity size={24} /></div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase mb-2 tracking-tight">Sync Master</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">O sequenciador utiliza o clock central do GCM Maestro, garantindo que acompanhamentos rítmicos estejam sempre cravados.</p>
                    </div>
                </Card>
                <Card className="bg-slate-900/40 p-8 rounded-[40px] border border-white/5 flex items-start gap-5">
                    <div className="p-4 bg-sky-500/10 rounded-2xl text-sky-400"><Layers size={24} /></div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase mb-2 tracking-tight">Camadas Poly</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Crie polirritmias complexas para treinar a independência rítmica de alunos avançados.</p>
                    </div>
                </Card>
                <Card className="bg-slate-900/40 p-8 rounded-[40px] border border-white/5 flex items-start gap-5">
                    <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400"><Music size={24} /></div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase mb-2 tracking-tight">Ready to TV</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">O visual reativo permite que os alunos acompanhem o "bouncing ball" visual diretamente no telão.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
