
import React, { useEffect, useRef, useState } from 'react';
import { AlphaTabApi } from '@coderline/alphatab';
import { Card } from '../ui/Card';
import { Loader2, Zap, Sparkles, Target, Crosshair } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ChunkEngine, Chunk } from './ChunkEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '../../lib/haptics';
import { uiSounds } from '../../lib/uiSounds';

interface TablatureViewProps {
    alphaTex?: string;
    isTvMode?: boolean;
    performanceStatus?: Record<string, 'hit' | 'miss'>;
    onNoteHighlight?: (note: any) => void;
    onReady?: (api: any) => void;
    onChunkMastered?: (chunk: Chunk) => void;
}

export const TablatureView: React.FC<TablatureViewProps> = ({ alphaTex, isTvMode, onNoteHighlight, onReady, onChunkMastered }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const apiRef = useRef<AlphaTabApi | null>(null);
    const [loading, setLoading] = useState(true);
    const [chunks, setChunks] = useState<Chunk[]>([]);
    const [activeChunk, setActiveChunk] = useState<Chunk | null>(null);
    const [showVictory, setShowVictory] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;
        const api = new AlphaTabApi(containerRef.current, {
            core: { engine: 'svg' },
            display: { layoutMode: 'horizontal', scale: isTvMode ? 2.5 : 1.2 }
        } as any);
        apiRef.current = api;

        api.renderFinished.on(() => {
            setLoading(false);
            // Auto-chunking: divide em pedaços de 4 compassos
            setChunks(ChunkEngine.generateChunks(16, 4));
            if (onReady) onReady(api);
        });

        api.tex(alphaTex || '');
        return () => api.destroy();
    }, [alphaTex, isTvMode]);

    const focusChunk = (chunk: Chunk) => {
        if (!apiRef.current) return;
        setActiveChunk(chunk);
        // Configura o loop no AlphaTab
        apiRef.current.playbackRange = {
            startTick: (chunk.startMeasure - 1) * 1920,
            endTick: chunk.endMeasure * 1920
        } as any;
        haptics.heavy();
        uiSounds.playClick();
    };

    const handleSimulateMastery = () => {
        if (!activeChunk) return;
        const { chunk, justMastered } = ChunkEngine.processAttempt(activeChunk, true);
        setActiveChunk(chunk);
        setChunks(prev => prev.map(c => c.id === chunk.id ? chunk : c));

        if (justMastered) {
            triggerMicroVictory();
            onChunkMastered?.(chunk);
        }
    };

    const triggerMicroVictory = () => {
        setShowVictory(true);
        uiSounds.playSuccess();
        haptics.success();
        setTimeout(() => setShowVictory(false), 2500);
    };

    return (
        <Card className="bg-slate-900 border-slate-800 rounded-[48px] overflow-hidden p-8 shadow-2xl relative border-t-4 border-t-sky-500">
            <AnimatePresence>
                {showVictory && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1.2 }}
                        exit={{ opacity: 0, scale: 2 }}
                        className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none bg-sky-500/10 backdrop-blur-sm"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <motion.div
                                animate={{ rotate: [0, 90, 180, 270, 360], scale: [1, 1.5, 1] }}
                                transition={{ duration: 0.5, repeat: 2 }}
                            >
                                <Sparkles size={120} className="text-yellow-400 fill-current drop-shadow-[0_0_20px_#facc15]" />
                            </motion.div>
                            <span className="text-5xl font-black text-white uppercase tracking-widest italic drop-shadow-lg">MICRO-VITÓRIA!</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-sky-500/10 rounded-3xl text-sky-400 shadow-inner">
                        <Crosshair size={28} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-widest">Motor de Micro-Tarefas</h3>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Foco Extremo: Módulo Micro-Dopamina</p>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    {chunks.map((c, i) => (
                        <button
                            key={c.id}
                            onClick={() => focusChunk(c)}
                            className={cn(
                                "h-16 px-6 rounded-2xl border-4 font-black text-lg transition-all flex flex-col items-center justify-center gap-1",
                                activeChunk?.id === c.id 
                                    ? "bg-sky-500 border-white text-white shadow-[0_0_20px_#0ea5e9] scale-110" 
                                    : c.isMastered 
                                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
                                        : "bg-slate-950 border-slate-800 text-slate-600 hover:border-sky-500/50"
                            )}
                        >
                            <span className="text-[10px] opacity-60">CHUNK</span>
                            {i + 1}
                        </button>
                    ))}
                </div>
            </header>

            <div className="bg-white rounded-[32px] p-8 min-h-[350px] border-[12px] border-slate-950 relative shadow-inner">
                {loading && <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10"><Loader2 className="animate-spin text-sky-500" size={48} /></div>}
                <div ref={containerRef} />
            </div>

            {activeChunk && (
                <div className="mt-8 flex justify-between items-center bg-slate-950 p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Progresso do Desafio:</span>
                            <div className="flex gap-2">
                                {[...Array(3)].map((_, i) => (
                                    <motion.div 
                                        key={i} 
                                        animate={activeChunk.repeatsDone > i ? { scale: [1, 1.4, 1], backgroundColor: '#10b981' } : {}}
                                        className={cn("w-4 h-4 rounded-full border-2 border-white/5", activeChunk.repeatsDone > i ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-slate-800")}
                                    />
                                ))}
                            </div>
                        </div>
                        {activeChunk.repeatsDone >= 3 && (
                            <div className="flex items-center gap-2 text-emerald-400 animate-pulse">
                                <Target size={16} />
                                <span className="text-[10px] font-black uppercase">Fase Dominada!</span>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={handleSimulateMastery}
                        className="text-[9px] font-black text-sky-500 uppercase hover:text-white transition-colors bg-sky-500/10 px-4 py-2 rounded-xl border border-sky-500/20"
                    >
                        Simular Acerto Perfeito
                    </button>
                </div>
            )}
        </Card>
    );
};
