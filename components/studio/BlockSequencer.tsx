import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Wand2, Save, Trash2, Music, Sparkles } from 'lucide-react';
import { ChordBlock } from '../../types.ts';
import { studioEngine } from '../../lib/studioEngine.ts';
import { getCreativeLyrics } from '../../services/aiService.ts';
import { haptics } from '../../lib/haptics.ts';
import { Button } from '../ui/Button.tsx';
import { cn } from '../../lib/utils.ts';
import { notify } from '../../lib/notification.ts';

const PALETTE: ChordBlock[] = [
    { id: 'I', degree: 'I', label: 'C (Feliz)', color: 'bg-yellow-400', notes: ['C3', 'E3', 'G3'] },
    { id: 'ii', degree: 'ii', label: 'Dm (Sério)', color: 'bg-purple-500', notes: ['D3', 'F3', 'A3'] },
    { id: 'IV', degree: 'IV', label: 'F (Longe)', color: 'bg-sky-400', notes: ['F3', 'A3', 'C4'] },
    { id: 'V', degree: 'V', label: 'G (Energia)', color: 'bg-orange-500', notes: ['G3', 'B3', 'D4'] },
    { id: 'vi', degree: 'vi', label: 'Am (Triste)', color: 'bg-indigo-600', notes: ['A3', 'C4', 'E4'] },
];

export const BlockSequencer: React.FC = () => {
    const [sequence, setSequence] = useState<ChordBlock[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [lyrics, setLyrics] = useState<string | null>(null);
    const [loadingLyrics, setLoadingLyrics] = useState(false);

    const addBlock = (block: ChordBlock) => {
        if (sequence.length >= 8) return;
        setSequence([...sequence, { ...block, id: `${block.id}-${Date.now()}` }]);
        haptics.light();
        
        const degrees = [...sequence, block].map(b => b.degree);
        const lastFour = degrees.slice(-4).join('-');
        if (lastFour === 'I-V-vi-IV') {
            notify.success("✨ FÓRMULA MÁGICA! Você descobriu a sequência secreta do Pop!");
        }
    };

    const handlePlay = async () => {
        if (sequence.length === 0) return;
        await studioEngine.startTransport();
        studioEngine.playSequence(sequence, 100, 'Rock');
        setIsPlaying(true);
    };

    const handleStop = () => {
        studioEngine.stop();
        setIsPlaying(false);
    };

    const generateLyrics = async () => {
        if (sequence.length === 0) return;
        setLoadingLyrics(true);
        const text = await getCreativeLyrics(sequence.map(s => s.degree));
        setLyrics(text);
        setLoadingLyrics(false);
        haptics.success();
    };

    return (
        <div className="space-y-10 p-4">
            <div className="bg-slate-900/60 p-10 rounded-[64px] border-4 border-dashed border-white/5 min-h-[220px] relative overflow-hidden flex items-center gap-4">
                <AnimatePresence>
                    {sequence.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-700 font-black uppercase tracking-widest pointer-events-none">
                            Arraste os blocos coloridos para criar sua música
                        </div>
                    )}
                    {sequence.map((block, idx) => (
                        <motion.div
                            key={block.id}
                            initial={{ scale: 0, x: -50 }}
                            animate={{ scale: 1, x: 0 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className={cn(
                                "w-32 h-32 rounded-3xl flex flex-col items-center justify-center text-white shadow-2xl relative group",
                                block.color
                            )}
                        >
                            <span className="text-2xl font-black">{block.degree}</span>
                            <span className="text-[8px] font-bold uppercase mt-1">{block.label.split(' ')[0]}</span>
                            <button 
                                onClick={() => setSequence(prev => prev.filter((_, i) => i !== idx))}
                                className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={12} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
                {PALETTE.map(block => (
                    <button
                        key={block.degree}
                        onClick={() => addBlock(block)}
                        className={cn(
                            "px-8 py-4 rounded-2xl font-black text-white shadow-lg hover:scale-105 transition-all active:scale-95",
                            block.color
                        )}
                    >
                        {block.degree}
                    </button>
                ))}
            </div>

            <div className="flex justify-center items-center gap-6">
                <button
                    onClick={isPlaying ? handleStop : handlePlay}
                    className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all",
                        isPlaying ? "bg-red-600 text-white" : "bg-sky-500 text-white"
                    )}
                >
                    {isPlaying ? <Square size={32} /> : <Play size={32} fill="currentColor" />}
                </button>

                <Button 
                    onClick={generateLyrics} 
                    isLoading={loadingLyrics}
                    leftIcon={Wand2}
                    className="px-10 py-5 rounded-[32px] bg-purple-600 hover:bg-purple-500"
                >
                    Gerar Letra IA
                </Button>
            </div>

            <AnimatePresence>
                {lyrics && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 border border-purple-500/30 p-10 rounded-[48px] text-center relative overflow-hidden"
                    >
                        <Sparkles className="absolute top-4 right-6 text-purple-500/20" size={48} />
                        <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4">Letra Composta para Você</h4>
                        <p className="text-xl text-slate-200 font-medium whitespace-pre-wrap leading-relaxed italic">
                            "{lyrics}"
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
