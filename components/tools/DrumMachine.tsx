
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Play, Square, Settings2, Trash2, Zap, Drum } from 'lucide-react';
import { studioEngine } from '../../lib/studioEngine';
import { cn } from '../../lib/utils';
import { haptics } from '../../lib/haptics';
import { motion } from 'framer-motion';

const INSTRUMENTS = [
    { id: 0, label: 'Kick', color: 'bg-red-500', shadow: 'shadow-red-500/50' },
    { id: 1, label: 'Snare', color: 'bg-yellow-400', shadow: 'shadow-yellow-400/50' },
    { id: 2, label: 'Hi-Hat', color: 'bg-sky-400', shadow: 'shadow-sky-400/50' },
    { id: 3, label: 'Tom', color: 'bg-purple-500', shadow: 'shadow-purple-500/50' }
];

const PRESETS = {
    'House': [
        [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // Kick
        [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
        [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], // HiHat
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]  // Tom
    ],
    'Rock': [
        [true, false, false, false, false, false, true, false, true, false, false, false, false, false, false, false], // Kick
        [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
        [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false], // HiHat
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]  // Tom
    ]
};

export const DrumMachine: React.FC = () => {
    // 4 instrumentos x 16 steps
    const [grid, setGrid] = useState<boolean[][]>(
        Array(4).fill(null).map(() => Array(16).fill(false))
    );
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1);
    const [bpm, setBpm] = useState(120);

    // Efeito para limpar o step ao desmontar
    useEffect(() => {
        return () => {
            studioEngine.stop();
        };
    }, []);

    const toggleStep = (row: number, col: number) => {
        const newGrid = [...grid];
        newGrid[row][col] = !newGrid[row][col];
        setGrid(newGrid);
        haptics.tick();
        
        // Se estiver tocando, reinicia para aplicar mudanças (ou engine poderia suportar hot-swap)
        if (isPlaying) {
            studioEngine.startDrumPattern(newGrid, bpm, (step) => setCurrentStep(step));
        }
    };

    const handlePlay = async () => {
        await studioEngine.startTransport();
        setIsPlaying(true);
        studioEngine.startDrumPattern(grid, bpm, (step) => setCurrentStep(step));
        haptics.medium();
    };

    const handleStop = () => {
        studioEngine.stop();
        setIsPlaying(false);
        setCurrentStep(-1);
        haptics.light();
    };

    const clearGrid = () => {
        setGrid(Array(4).fill(null).map(() => Array(16).fill(false)));
        if (isPlaying) handleStop();
        haptics.heavy();
    };

    const loadPreset = (name: keyof typeof PRESETS) => {
        setGrid(PRESETS[name]);
        if (isPlaying) {
            studioEngine.startDrumPattern(PRESETS[name], bpm, (step) => setCurrentStep(step));
        }
        haptics.medium();
    };

    return (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 p-32 bg-amber-500/5 blur-[100px] pointer-events-none" />
            
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-amber-400 flex items-center gap-2">
                        <Drum size={24} /> Maestro Groovebox
                    </CardTitle>
                    <CardDescription>Sequenciador de Bateria de 16 Passos</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-white/5">
                        <span className="text-[10px] font-black text-slate-500 uppercase px-1">BPM</span>
                        <input 
                            type="number" 
                            value={bpm}
                            onChange={(e) => setBpm(Number(e.target.value))}
                            className="w-12 bg-transparent text-white font-mono font-bold text-center outline-none"
                        />
                    </div>
                    <Button 
                        onClick={isPlaying ? handleStop : handlePlay}
                        className={cn("w-12 h-12 rounded-xl p-0", isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600")}
                    >
                        {isPlaying ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Presets */}
                <div className="flex gap-2 pb-2">
                    <button onClick={clearGrid} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-[10px] font-black uppercase flex items-center gap-1 transition-all">
                        <Trash2 size={12} /> Limpar
                    </button>
                    {Object.keys(PRESETS).map(name => (
                        <button 
                            key={name}
                            onClick={() => loadPreset(name as any)}
                            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/5 hover:border-amber-500/50 text-slate-400 hover:text-amber-400 text-[10px] font-black uppercase transition-all"
                        >
                            {name}
                        </button>
                    ))}
                </div>

                {/* The Grid */}
                <div className="bg-slate-950 p-6 rounded-[32px] border border-white/5 overflow-x-auto custom-scrollbar">
                    <div className="min-w-[600px] space-y-3">
                        {INSTRUMENTS.map((inst, rowIdx) => (
                            <div key={inst.id} className="flex items-center gap-4">
                                <div className="w-16 flex items-center gap-2">
                                    <div className={cn("w-2 h-8 rounded-full", inst.color)} />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{inst.label}</span>
                                </div>
                                <div className="flex-1 grid grid-cols-16 gap-1.5">
                                    {grid[rowIdx].map((isActive, stepIdx) => {
                                        const isCurrent = currentStep === stepIdx;
                                        return (
                                            <motion.button
                                                key={stepIdx}
                                                onMouseDown={() => toggleStep(rowIdx, stepIdx)}
                                                whileTap={{ scale: 0.9 }}
                                                animate={{ 
                                                    scale: isCurrent ? 1.1 : 1,
                                                    filter: isCurrent ? 'brightness(1.5)' : 'brightness(1)'
                                                }}
                                                className={cn(
                                                    "aspect-[2/3] rounded-lg transition-all relative overflow-hidden",
                                                    isActive 
                                                        ? `${inst.color} ${inst.shadow}` 
                                                        : "bg-slate-900 hover:bg-slate-800",
                                                    stepIdx % 4 === 0 && !isActive ? "bg-slate-800/80" : "" // Marcador de tempo forte
                                                )}
                                            >
                                                {isCurrent && (
                                                    <div className="absolute inset-0 bg-white/40" />
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Step Indicators */}
                    <div className="mt-2 flex pl-20 gap-1.5 min-w-[600px]">
                        {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className="flex-1 flex justify-center">
                                <div className={cn(
                                    "w-1 h-1 rounded-full transition-colors",
                                    currentStep === i ? "bg-white" : i % 4 === 0 ? "bg-slate-700" : "bg-slate-900"
                                )} />
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
