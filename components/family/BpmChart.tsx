
import React from 'react';
import { motion } from 'framer-motion';
import { StudentStats } from '../../types.ts';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

interface BpmChartProps {
    data: StudentStats[];
    className?: string;
}

export const BpmChart: React.FC<BpmChartProps> = ({ data, className }) => {
    if (data.length === 0) return (
        <div className="h-48 bg-slate-900/50 rounded-3xl flex items-center justify-center border border-dashed border-slate-800">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Aguardando telemetria técnica...</p>
        </div>
    );

    const width = 500;
    const height = 200;
    const padding = 40;

    const maxBpm = Math.max(...data.map(d => d.max_bpm), 120);
    const minBpm = Math.min(...data.map(d => d.max_bpm), 40);
    const range = maxBpm - minBpm || 10;

    const points = data.map((d, i) => {
        const x = padding + (i * (width - 2 * padding)) / (data.length - 1 || 1);
        const y = height - padding - ((d.max_bpm - minBpm) * (height - 2 * padding)) / range;
        return { x, y, val: d.max_bpm };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
        <div className={cn("relative bg-slate-950 p-6 rounded-[40px] border border-white/5 shadow-inner", className)}>
            <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Evolução de Técnica (BPM)
                </span>
                <span className="text-2xl font-black text-white font-mono">{maxBpm} <span className="text-[10px] text-slate-600">MAX</span></span>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                {/* Linhas de Grade */}
                <line x1={padding} y1={padding} x2={width-padding} y2={padding} stroke="rgba(255,255,255,0.05)" />
                <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="rgba(255,255,255,0.1)" />
                
                {/* Caminho da Evolução */}
                <M.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    d={pathData}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Pontos de Dados */}
                {points.map((p, i) => (
                    <g key={i}>
                        <M.circle
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.1 + 1 }}
                            cx={p.x} cy={p.y} r="6"
                            className="fill-slate-950 stroke-emerald-500"
                            strokeWidth="3"
                        />
                        {i === points.length - 1 && (
                            <M.circle 
                                cx={p.x} cy={p.y} r="12"
                                className="fill-emerald-500/20"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            />
                        )}
                    </g>
                ))}
            </svg>

            <div className="mt-4 flex justify-between px-2">
                <span className="text-[8px] font-bold text-slate-700 uppercase">Início da Jornada</span>
                <span className="text-[8px] font-bold text-sky-500 uppercase">Recorde Atual</span>
            </div>
        </div>
    );
};
