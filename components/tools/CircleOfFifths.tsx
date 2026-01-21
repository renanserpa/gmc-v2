

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { CircleDot, Sparkles, Heart, Brain, Sun, Moon, Cloud } from 'lucide-react';
import { haptics } from '../../lib/haptics';
import { cn } from '../../lib/utils';
import { notify } from '../../lib/notification';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { MODES } from '../../lib/theoryEngine';

const KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

export const CircleOfFifths: React.FC = () => {
    const [selected, setSelected] = useState(0);
    const [activeMode, setActiveMode] = useState('ionian');

    const modeIcons: Record<string, any> = {
        'lydian': Sun,
        'ionian': Sparkles,
        'mixolydian': Heart,
        'dorian': Brain,
        'aeolian': Moon,
        'phrygian': CircleDot,
        'locrian': Cloud
    };

    const applyToClassroom = () => {
        const key = KEYS[selected];
        localStorage.setItem('maestro_target_key', key);
        localStorage.setItem('maestro_target_mode', activeMode);
        haptics.success();
        notify.success(`Tom ${key} (${(MODES as any)[activeMode].name}) aplicado ao estúdio!`);
    };

    return (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-purple-500/5 blur-[120px] pointer-events-none" />
            
            <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                    <CircleDot size={20}/> Bússola Modal Pro
                </CardTitle>
                <CardDescription>Mapeie sentimentos e explore a harmonia das esferas.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-10">
                {/* Círculo Principal */}
                <div className="flex justify-center items-center py-4">
                    <div className="relative w-80 h-80 rounded-full border-[16px] border-slate-800/50 flex items-center justify-center shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]">
                        {KEYS.map((key, i) => {
                            const angle = (i * 30) - 90;
                            const rad = (angle * Math.PI) / 180;
                            const x = Math.cos(rad) * 125;
                            const y = Math.sin(rad) * 125;

                            return (
                                <motion.button
                                    key={key}
                                    onClick={() => { setSelected(i); haptics.light(); }}
                                    className={cn(
                                        "absolute w-12 h-12 rounded-2xl font-black text-sm transition-all duration-300 border-2",
                                        selected === i 
                                            ? "bg-purple-600 border-white text-white scale-125 z-10 shadow-2xl" 
                                            : "bg-slate-950 border-slate-800 text-slate-500 hover:border-purple-500/50"
                                    )}
                                    style={{ transform: `translate(${x}px, ${y}px)` }}
                                >
                                    {key}
                                </motion.button>
                            );
                        })}
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Tônica Selecionada</p>
                            <p className="text-6xl font-black text-white leading-none">{KEYS[selected]}</p>
                        </div>
                    </div>
                </div>

                {/* Seletor de Moods (Sentimentos) */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] flex items-center gap-2">
                        <Heart size={12} className="text-pink-500" /> Modal Moods: Qual o sentimento?
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(Object.entries(MODES) as [string, any][]).map(([id, mode]) => {
                            const Icon = modeIcons[id] || Sparkles;
                            return (
                                <button
                                    key={id}
                                    onClick={() => { setActiveMode(id); haptics.medium(); }}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 transition-all text-left group",
                                        activeMode === id 
                                            ? "bg-purple-600 border-white text-white shadow-xl" 
                                            : "bg-slate-950 border-slate-800 text-slate-500 hover:border-purple-500/30"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <Icon size={16} className={activeMode === id ? "text-white" : "text-purple-500"} />
                                        <span className="text-[8px] font-black uppercase opacity-60">{mode.feel}</span>
                                    </div>
                                    <p className="text-xs font-bold truncate group-hover:text-white transition-colors">{mode.name}</p>
                                    <p className="text-[9px] font-medium opacity-50 line-clamp-1">{mode.mood.split(' / ')[0]}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <Button onClick={applyToClassroom} className="w-full py-8 rounded-[32px] text-lg" leftIcon={Sparkles}>
                    Projetar Harmonia no Estúdio
                </Button>
            </CardContent>
        </Card>
    );
};