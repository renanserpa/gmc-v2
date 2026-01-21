
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { NOTES_CHROMATIC, CAGED_SHAPES } from '../../lib/theoryEngine';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { haptics } from '../../lib/haptics';

interface CAGEDLayerProps {
    rootNote: string;
    currentShape: string;
    onShapeChange: (shape: string) => void;
}

const SHAPES = ['C', 'A', 'G', 'E', 'D'];

export const CAGEDLayer: React.FC<CAGEDLayerProps> = ({ rootNote, currentShape, onShapeChange }) => {
    const rootIdx = NOTES_CHROMATIC.indexOf(rootNote.replace('b', '#'));
    
    // Cálculos de posição baseados no Fretboard.tsx (62px por casa, 40px por corda)
    const getPos = (s: number, f: number) => ({
        x: f * 62 + 50,
        y: s * 40 + 20
    });

    const shapeData = useMemo(() => {
        const baseShape = CAGED_SHAPES[currentShape as keyof typeof CAGED_SHAPES];
        const offsets: any = { C: 0, A: 3, G: 5, E: 8, D: 10 };
        const baseFret = (rootIdx + offsets[currentShape]) % 12;
        
        return baseShape.strings.map(s => ({
            s: s.s,
            f: s.f + baseFret,
            ...getPos(s.s, s.f + baseFret)
        }));
    }, [rootNote, currentShape, rootIdx]);

    const navigate = (dir: number) => {
        const idx = SHAPES.indexOf(currentShape);
        const next = SHAPES[(idx + dir + SHAPES.length) % SHAPES.length];
        onShapeChange(next);
        haptics.medium();
    };

    return (
        <div className="absolute inset-0 pointer-events-none z-30">
            <svg className="w-full h-full overflow-visible">
                {/* Polígono translúcido do Shape */}
                <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    d={`M ${shapeData.map(p => `${p.x},${p.y}`).join(' L ')} Z`}
                    fill="rgba(56, 189, 248, 0.15)"
                    stroke="rgba(56, 189, 248, 0.4)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                />

                {/* Notas do Shape */}
                {shapeData.map((p, i) => (
                    <motion.circle
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        cx={p.x} cy={p.y} r="14"
                        className="fill-sky-500/20 stroke-sky-400"
                        strokeWidth="2"
                    />
                ))}
            </svg>

            {/* Controles de Navegação */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-slate-900/80 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 pointer-events-auto shadow-2xl">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex flex-col items-center min-w-[100px]">
                    <span className="text-[8px] font-black text-sky-500 uppercase tracking-[0.3em]">Shape Ativo</span>
                    <span className="text-xl font-black text-white">{currentShape}-Shape</span>
                </div>
                <button onClick={() => navigate(1)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};
