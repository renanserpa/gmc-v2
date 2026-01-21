
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { getHarmonicField, NOTES_CHROMATIC } from '../../lib/theoryEngine';
import { motion } from 'framer-motion';
import { Globe, Music, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { haptics } from '../../lib/haptics';
import { cn } from '../../lib/utils';
import { notify } from '../../lib/notification';

export const HarmonicFieldExplorer: React.FC = () => {
    const [selectedKey, setSelectedKey] = useState('C');
    const field = useMemo(() => getHarmonicField(selectedKey), [selectedKey]);

    const handleChordClick = (item: any) => {
        haptics.medium();
        notify.info(`Modo: ${item.mode} (${item.chord})`);
        // Aqui dispararíamos o evento para o Fretboard Global se disponível via Context
    };

    return (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden relative">
            <div className="absolute top-0 left-0 p-32 bg-purple-500/5 blur-[120px] pointer-events-none" />
            
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                        <Globe size={20} /> Harmonic Field Explorer
                    </CardTitle>
                    <CardDescription>Analise os graus e modos de qualquer tonalidade maior.</CardDescription>
                </div>
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase px-2">Tom:</span>
                    <select 
                        value={selectedKey}
                        onChange={(e) => { setSelectedKey(e.target.value); haptics.light(); }}
                        className="bg-purple-600 text-white font-black text-xs px-4 py-2 rounded-xl outline-none appearance-none cursor-pointer"
                    >
                        {['C', 'G', 'D', 'A', 'E', 'B', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].map(k => (
                            <option key={k} value={k}>{k}</option>
                        ))}
                    </select>
                </div>
            </CardHeader>

            <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                    {field.map((item, idx) => (
                        <motion.button
                            key={item.degree}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            onClick={() => handleChordClick(item)}
                            className="bg-slate-950 border border-white/5 p-5 rounded-[32px] text-center group hover:border-purple-500/40 hover:bg-slate-900 transition-all flex flex-col items-center gap-3 shadow-lg"
                        >
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-purple-400">{item.degree}</span>
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-xl font-black text-white group-hover:bg-purple-600 group-hover:border-white transition-all">
                                {item.chord}
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{item.mode}</p>
                                <ChevronRight size={12} className="mx-auto text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </motion.button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-950/80 rounded-[32px] border border-white/5 flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-white uppercase tracking-tight">Análise de Tétrade</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed">Gerando acordes com 7ª para sonoridade Jazz/MPB moderna.</p>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-950/80 rounded-[32px] border border-white/5 flex items-center gap-4">
                        <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl">
                            <Zap size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-white uppercase tracking-tight">Vínculo Modal</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed">Cada grau sugere uma escala específica para improvisação.</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
