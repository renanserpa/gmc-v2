
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { identifyChord, NOTES_CHROMATIC, getNoteName, getNoteTemperatureColor } from '../../lib/theoryEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RotateCcw, Info, Zap, Music } from 'lucide-react';
import { haptics } from '../../lib/haptics';
import { cn } from '../../lib/utils';

const STRINGS = [4, 11, 7, 2, 9, 4]; // E, B, G, D, A, E

export const ReverseChordFinder: React.FC = () => {
    const [selectedNotes, setSelectedNotes] = useState<{ s: number, f: number }[]>([]);

    const chordResult = useMemo(() => {
        const noteIndices = selectedNotes.map(n => (STRINGS[n.s] + n.f) % 12);
        // Ordena por string (mais grave primeiro para o algoritmo de baixo)
        const sortedNotes = [...selectedNotes].sort((a, b) => b.s - a.s);
        const physicalIndices = sortedNotes.map(n => (STRINGS[n.s] + n.f) % 12);
        return identifyChord(physicalIndices);
    }, [selectedNotes]);

    const toggleNote = (s: number, f: number) => {
        haptics.light();
        setSelectedNotes(prev => {
            const exists = prev.find(n => n.s === s && n.f === f);
            if (exists) return prev.filter(n => !(n.s === s && n.f === f));
            // Regra: Apenas uma nota por corda para simplificar visualização harmônica
            return [...prev.filter(n => n.s !== s), { s, f }];
        });
    };

    const clear = () => {
        setSelectedNotes([]);
        haptics.medium();
    };

    return (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[120px] pointer-events-none" />
            
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-sky-400 flex items-center gap-2">
                        <Search size={20} /> Reverse Chord Finder
                    </CardTitle>
                    <CardDescription>Selecione as notas no braço para descobrir o acorde.</CardDescription>
                </div>
                <button onClick={clear} className="p-2 text-slate-500 hover:text-white transition-colors">
                    <RotateCcw size={18} />
                </button>
            </CardHeader>

            <CardContent className="space-y-10">
                {/* Result Display */}
                <div className="h-32 flex flex-col items-center justify-center bg-slate-950/50 rounded-[40px] border border-white/5 shadow-inner relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {chordResult ? (
                            <motion.div 
                                key={chordResult.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-center"
                            >
                                <p className="text-5xl font-black text-white tracking-tighter uppercase">{chordResult.name}</p>
                                <div className="flex items-center justify-center gap-3 mt-2">
                                    <span className="text-[10px] font-black text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 uppercase tracking-widest">
                                        Fórmula: {chordResult.formula}
                                    </span>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="text-center opacity-30">
                                <Music size={32} className="mx-auto mb-2 text-slate-500" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Aguardando notas...</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Fretboard Selector */}
                <div className="overflow-x-auto pb-4 custom-scrollbar">
                    <div className="min-w-[800px] bg-slate-950 p-8 rounded-[32px] border border-white/5 relative">
                        <div className="grid grid-rows-6 gap-0">
                            {STRINGS.map((sRoot, sIdx) => (
                                <div key={sIdx} className="h-10 flex relative border-b border-slate-800 last:border-0">
                                    <div className="w-12 flex items-center justify-center font-black text-slate-700 text-xs border-r border-slate-800 bg-slate-900/50">{getNoteName(sRoot)}</div>
                                    {Array.from({ length: 13 }).map((_, fIdx) => {
                                        const noteIdx = (sRoot + fIdx) % 12;
                                        const isSelected = selectedNotes.find(n => n.s === sIdx && n.f === fIdx);
                                        const interval = chordResult ? (noteIdx - NOTES_CHROMATIC.indexOf(chordResult.root) + 12) % 12 : 0;
                                        const thermalColor = getNoteTemperatureColor(interval);

                                        return (
                                            <button
                                                key={fIdx}
                                                onClick={() => toggleNote(sIdx, fIdx)}
                                                className={cn(
                                                    "flex-1 border-r border-slate-800 flex items-center justify-center relative transition-all group",
                                                    fIdx === 0 && "border-r-4 border-slate-700 bg-slate-900/30"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-all",
                                                    isSelected 
                                                        ? "text-white scale-110 shadow-lg border-2 border-white" 
                                                        : "text-slate-700 hover:text-slate-400 opacity-20 hover:opacity-100"
                                                )}
                                                style={{ 
                                                    backgroundColor: isSelected ? thermalColor : 'transparent',
                                                    boxShadow: isSelected ? `0 0 15px ${thermalColor}66` : 'none'
                                                }}>
                                                    {getNoteName(noteIdx)}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-950/50 p-6 rounded-[24px] border border-white/5 flex items-start gap-4">
                    <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
                        <Info size={16} />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Toque nas casas para selecionar as notas. O sistema analisa intervalos de terça, quinta e sétima para sugerir o nome mais provável. Inversões são detectadas quando a nota mais grave selecionada não é a tônica do acorde.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
