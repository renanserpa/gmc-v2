
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eraser, Save, Layers, Music, Zap, Settings2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { haptics } from '../../../lib/haptics.ts';
import { cn } from '../../../lib/utils.ts';
import { getNoteName } from '../../../lib/theoryEngine.ts';

const M = motion as any;

const STRINGS_TUNING = [4, 11, 7, 2, 9, 4]; // E4, B3, G3, D3, A2, E2 (Top to Bottom)
const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'];

export default function Whiteboard() {
    const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
    const [activeTuning, setActiveTuning] = useState('E Standard');

    const toggleNote = (sIdx: number, fIdx: number) => {
        haptics.light();
        const key = `${sIdx}-${fIdx}`;
        const next = new Set(selectedNotes);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        setSelectedNotes(next);
    };

    const clearBoard = () => {
        haptics.heavy();
        setSelectedNotes(new Set());
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-32 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-900/40 p-10 rounded-[56px] border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-sky-400 mb-2">
                        <Layers size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Visual Theory Engine</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Lousa <span className="text-sky-500">Digital</span>
                    </h1>
                </div>
                <div className="flex gap-4 relative z-10">
                    <Button 
                        variant="outline" 
                        onClick={clearBoard}
                        className="h-16 px-10 rounded-[28px] border-white/10 hover:bg-white/5 text-[10px] font-black uppercase"
                        leftIcon={Eraser}
                    >
                        LIMPAR TUDO
                    </Button>
                    <Button className="h-16 px-10 rounded-[28px] bg-sky-600 shadow-xl text-[10px] font-black uppercase" leftIcon={Save}>
                        SALVAR PRESET
                    </Button>
                </div>
            </header>

            <Card className="bg-[#0a0f1d] border-white/5 rounded-[64px] p-12 overflow-x-auto shadow-2xl relative border-t-4 border-t-sky-500">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.02),transparent)] pointer-events-none" />
                
                <div className="min-w-[1000px] relative z-10 py-10">
                    <div className="flex flex-col gap-0">
                        {STRINGS_TUNING.map((rootNote, sIdx) => (
                            <div key={sIdx} className="h-16 flex items-center relative border-b border-slate-800/30 last:border-0 group">
                                {/* Nome da Corda */}
                                <div className="w-16 flex items-center justify-center font-black text-slate-700 text-sm border-r-2 border-slate-800 bg-slate-900/30 rounded-l-2xl">
                                    {STRING_LABELS[sIdx]}
                                </div>

                                {/* Casas (0 a 12) */}
                                {Array.from({ length: 13 }).map((_, fIdx) => {
                                    const isSelected = selectedNotes.has(`${sIdx}-${fIdx}`);
                                    const noteIdx = (rootNote + fIdx) % 12;

                                    return (
                                        <button
                                            key={fIdx}
                                            onClick={() => toggleNote(sIdx, fIdx)}
                                            className={cn(
                                                "flex-1 h-full border-r border-slate-800/50 flex items-center justify-center relative transition-all",
                                                fIdx === 0 ? "border-r-8 border-slate-700 bg-slate-900/20" : "hover:bg-white/[0.02]"
                                            )}
                                        >
                                            {/* Linha da Corda */}
                                            <div className="absolute w-full h-[2px] bg-slate-800 group-hover:bg-slate-700 transition-colors z-0" />
                                            
                                            {/* Nota Visual */}
                                            <AnimatePresence>
                                                {isSelected && (
                                                    <M.div
                                                        initial={{ scale: 0, rotate: -45 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        exit={{ scale: 0 }}
                                                        className="w-11 h-11 rounded-full bg-sky-500 border-4 border-white shadow-[0_0_20px_rgba(56,189,248,0.5)] flex items-center justify-center z-10"
                                                    >
                                                        <span className="text-[11px] font-black text-white">{getNoteName(noteIdx)}</span>
                                                    </M.div>
                                                )}
                                            </AnimatePresence>
                                            
                                            {/* Marcadores de Traste (Dots reais) */}
                                            {[3, 5, 7, 9].includes(fIdx) && sIdx === 2 && !isSelected && (
                                                <div className="w-2 h-2 rounded-full bg-slate-800/50" />
                                            )}
                                            {fIdx === 12 && (sIdx === 1 || sIdx === 3) && !isSelected && (
                                                <div className="w-2 h-2 rounded-full bg-slate-800/50" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                    
                    {/* Números das casas */}
                    <div className="flex pl-16 mt-4">
                        {Array.from({ length: 13 }).map((_, i) => (
                            <div key={i} className="flex-1 text-center text-[9px] font-black text-slate-700 uppercase tracking-widest">
                                {i === 0 ? "Solta" : i}
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-slate-900/40 p-8 rounded-[40px] border border-white/5 flex items-start gap-5">
                    <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500"><Settings2 size={24} /></div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase mb-2 tracking-tight">Afinação Customizada</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Atualmente em E-Standard. Em breve: Drop D, Open G e afinações personalizadas por instrumento.</p>
                    </div>
                </Card>
                <Card className="bg-slate-900/40 p-8 rounded-[40px] border border-white/5 flex items-start gap-5">
                    <div className="p-4 bg-sky-500/10 rounded-2xl text-sky-400"><Zap size={24} /></div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase mb-2 tracking-tight">Sincronia TV (Alpha)</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">As notas marcadas aqui são projetadas instantaneamente na TV da sala de aula através do canal de broadcast.</p>
                    </div>
                </Card>
                <Card className="bg-slate-900/40 p-8 rounded-[40px] border border-white/5 flex items-start gap-5">
                    <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400"><Music size={24} /></div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase mb-2 tracking-tight">Sandbox Mode</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Esta ferramenta funciona de forma independente do banco de dados, pronta para uso emergencial em aula.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
