
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { CAGED_SHAPES, NOTES_CHROMATIC } from '../../lib/theoryEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Layers, Info, ChevronRight, Zap } from 'lucide-react';
import { haptics } from '../../lib/haptics';
import { cn } from '../../lib/utils';

interface CAGEDVisualizerProps {
    onShapeSelect?: (notes: { s: number, f: number }[]) => void;
}

export const CAGEDVisualizer: React.FC<CAGEDVisualizerProps> = ({ onShapeSelect }) => {
    const [selectedRoot, setSelectedRoot] = useState('C');
    const [activeShape, setActiveShape] = useState<keyof typeof CAGED_SHAPES>('C');

    const shapes = Object.keys(CAGED_SHAPES) as (keyof typeof CAGED_SHAPES)[];

    const currentShapeData = useMemo(() => {
        const rootIdx = NOTES_CHROMATIC.indexOf(selectedRoot);
        const shape = CAGED_SHAPES[activeShape];
        
        // No sistema CAGED, cada shape tem uma distância fixa da tônica absoluta
        // Ex: Shape de E para tônica C começa na casa 8.
        const shapeOffsets: Record<string, number> = { C: 0, A: 3, G: 5, E: 8, D: 10 };
        const baseFret = (rootIdx + shapeOffsets[activeShape]) % 12;

        return shape.strings.map(s => ({
            s: s.s,
            f: s.f + baseFret
        }));
    }, [selectedRoot, activeShape]);

    const handleSelect = (shape: keyof typeof CAGED_SHAPES) => {
        setActiveShape(shape);
        haptics.medium();
        if (onShapeSelect) onShapeSelect(currentShapeData);
    };

    return (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[120px] pointer-events-none" />
            
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-sky-400 flex items-center gap-2">
                        <Layers size={20} /> CAGED Shape Connector
                    </CardTitle>
                    <CardDescription>Visualize os 5 desenhos fundamentais em todo o braço.</CardDescription>
                </div>
                <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/5">
                    {['C', 'G', 'D', 'A', 'E'].map(root => (
                        <button 
                            key={root}
                            onClick={() => { setSelectedRoot(root); haptics.light(); }}
                            className={cn(
                                "w-10 h-10 rounded-xl font-black text-xs transition-all",
                                selectedRoot === root ? "bg-sky-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                            )}
                        >
                            {root}
                        </button>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {shapes.map(s => (
                        <button
                            key={s}
                            onClick={() => handleSelect(s)}
                            className={cn(
                                "p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 group",
                                activeShape === s 
                                    ? "bg-sky-600 border-white text-white shadow-2xl scale-105" 
                                    : "bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-900 hover:border-sky-500/30"
                            )}
                        >
                            <span className="text-3xl font-black">{s}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Shape</span>
                        </button>
                    ))}
                </div>

                <div className="bg-slate-950/80 p-6 rounded-[32px] border border-white/5 flex items-start gap-5">
                    <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500">
                        <Info size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">Dica de Visualização</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            O Shape de <strong className="text-white">{activeShape}</strong> para o tom de <strong className="text-white">{selectedRoot}</strong> começa na casa <strong className="text-sky-400">{currentShapeData[0].f}</strong>. Use este desenho para solar ou encontrar extensões de acordes ricas sem mudar de posição.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
