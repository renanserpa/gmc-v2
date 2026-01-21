
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Play, Square, Music2, Volume2, Drum, Layers, Plus, Minus, Zap } from 'lucide-react';
import { haptics } from '../../lib/haptics';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { audioManager } from '../../lib/audioManager';

const SUBDIVISIONS = [
    { label: '1/4', value: 1, desc: 'Semínima' },
    { label: '1/8', value: 2, desc: 'Colcheia' },
    { label: '1/12', value: 3, desc: 'Tercina' },
    { label: '1/16', value: 4, desc: 'Semicolcheia' }
];

type MetronomeSound = 'digital' | 'wood' | 'snare';

const SOUND_TYPES: { id: MetronomeSound, label: string, icon: any }[] = [
    { id: 'digital', label: 'Digital', icon: Zap },
    { id: 'wood', label: 'Madeira', icon: Music2 },
    { id: 'snare', label: 'Bateria', icon: Drum }
];

export const Metronome: React.FC = () => {
    const [bpm, setBpm] = useState(120);
    const [isPlaying, setIsPlaying] = useState(false);
    const [subdivision, setSubdivision] = useState(1);
    const [soundType, setSoundType] = useState<MetronomeSound>('digital');
    const [activeBeat, setActiveBeat] = useState<{ beat: number, sub: number } | null>(null);

    // Refs para o Scheduler de Áudio
    const nextNoteTime = useRef(0);
    const timerID = useRef<number | null>(null);
    const currentBeat = useRef(0);
    const notesInQueue = useRef<{ note: number, time: number }[]>([]);
    
    // Configurações persistentes via Ref para acesso dentro do loop
    const configRef = useRef({ bpm, subdivision, soundType });

    useEffect(() => {
        configRef.current = { bpm, subdivision, soundType };
    }, [bpm, subdivision, soundType]);

    useEffect(() => {
        audioManager.requestAccess('Metronome');
        return () => {
            stop();
            audioManager.release('Metronome');
        };
    }, []);

    const scheduleNote = async (beatNumber: number, time: number) => {
        const ctx = await audioManager.getContext();
        
        // Push para visualização
        notesInQueue.current.push({ note: beatNumber, time: time });

        // Audio Synthesis
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const { subdivision, soundType } = configRef.current;

        const isDownbeat = beatNumber % (4 * subdivision) === 0;
        const isQuarter = beatNumber % subdivision === 0;

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (soundType === 'digital') {
            osc.frequency.value = isDownbeat ? 1000 : isQuarter ? 800 : 600;
            osc.type = isDownbeat ? 'square' : 'sine';
            gain.gain.setValueAtTime(0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        } else if (soundType === 'wood') {
            osc.frequency.value = isDownbeat ? 1200 : 900;
            osc.type = 'triangle';
            gain.gain.setValueAtTime(0.15, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
        } else {
            // Snare synth simples
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(isDownbeat ? 150 : 200, time);
            gain.gain.setValueAtTime(0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        }

        osc.start(time);
        osc.stop(time + 0.1);
    };

    const scheduler = async () => {
        const ctx = await audioManager.getContext();
        const lookahead = 25.0; // ms
        const scheduleAheadTime = 0.1; // sec

        while (nextNoteTime.current < ctx.currentTime + scheduleAheadTime) {
            scheduleNote(currentBeat.current, nextNoteTime.current);
            nextNote();
        }
        timerID.current = window.setTimeout(scheduler, lookahead);
    };

    const nextNote = () => {
        const secondsPerBeat = 60.0 / configRef.current.bpm;
        // Ajusta tempo baseado na subdivisão
        nextNoteTime.current += (secondsPerBeat / configRef.current.subdivision);
        currentBeat.current++;
    };

    const start = async () => {
        if (isPlaying) return;
        const ctx = await audioManager.getContext();
        if (ctx.state === 'suspended') await ctx.resume();
        
        currentBeat.current = 0;
        nextNoteTime.current = ctx.currentTime + 0.05;
        setIsPlaying(true);
        scheduler();
    };

    const stop = () => {
        setIsPlaying(false);
        if (timerID.current) window.clearTimeout(timerID.current);
        setActiveBeat(null);
    };

    const toggleMetronome = () => {
        if (isPlaying) {
            stop();
        } else {
            start();
        }
        haptics.medium();
    };

    // Loop de Animação Visual (desacoplado do áudio para performance)
    useEffect(() => {
        let animationFrame: number;

        const draw = async () => {
            const ctx = await audioManager.getContext();
            const currentTime = ctx.currentTime;
            
            while (notesInQueue.current.length && notesInQueue.current[0].time < currentTime) {
                const currentNote = notesInQueue.current[0];
                const subVal = configRef.current.subdivision;
                
                // Calcula batida visual (0-3) e se é subdivisão
                const absoluteBeat = Math.floor(currentNote.note / subVal);
                const visualBeat = absoluteBeat % 4;
                const visualSub = currentNote.note % subVal;

                setActiveBeat({ beat: visualBeat, sub: visualSub });
                if (visualSub === 0) haptics.tick();
                
                notesInQueue.current.splice(0, 1);
            }
            animationFrame = requestAnimationFrame(draw);
        };

        if (isPlaying) draw();
        return () => cancelAnimationFrame(animationFrame);
    }, [isPlaying]);

    const updateBpm = (newBpm: number) => {
        const val = Math.max(40, Math.min(240, newBpm));
        setBpm(val);
    };

    return (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-pink-500/5 blur-[100px] pointer-events-none" />
            
            <CardHeader>
                <CardTitle className="text-pink-400 flex items-center gap-2">
                    <Music2 size={20}/> Metrônomo Maestro
                </CardTitle>
                <CardDescription>Precisão técnica com múltiplos timbres e subdivisões.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
                {/* Visual Feedback Circle */}
                <div className="flex justify-center items-center py-6">
                    <div className="relative flex items-center justify-center">
                        <motion.div 
                            animate={activeBeat?.sub === 0 ? { scale: [1, 1.2, 1], borderColor: ['#1e293b', '#ec4899', '#1e293b'] } : {}}
                            transition={{ duration: 0.1 }}
                            className="w-48 h-48 rounded-full border-[8px] border-slate-800 flex flex-col items-center justify-center bg-slate-950 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                        >
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">BPM</span>
                            <span className="text-6xl font-black text-white leading-none font-mono">{bpm}</span>
                        </motion.div>

                        {/* Subdivision Indicators */}
                        <div className="absolute -bottom-4 flex gap-1">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <motion.div 
                                    key={i}
                                    animate={activeBeat?.beat === i && activeBeat?.sub === 0 ? { scale: 1.5, backgroundColor: '#ec4899' } : { scale: 1, backgroundColor: '#1e293b' }}
                                    className="w-3 h-3 rounded-full border border-white/5 bg-slate-800 transition-colors"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tempo Controls */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => updateBpm(bpm - 5)} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-pink-500/50 transition-all"><Minus size={20}/></button>
                        <input 
                            type="range" min="40" max="240" value={bpm} 
                            onChange={(e) => updateBpm(parseInt(e.target.value))}
                            className="flex-1 accent-pink-500 h-2 bg-slate-950 rounded-full appearance-none cursor-pointer"
                        />
                        <button onClick={() => updateBpm(bpm + 5)} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-pink-500/50 transition-all"><Plus size={20}/></button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[60, 90, 120, 140].map(v => (
                            <button 
                                key={v} 
                                onClick={() => updateBpm(v)}
                                className={cn(
                                    "py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                    bpm === v ? "bg-pink-500/10 border-pink-500/40 text-pink-400" : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                                )}
                            >
                                {v} BPM
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Subdivision Settings */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-500 px-1">
                            <Layers size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Subdivisão</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {SUBDIVISIONS.map(s => (
                                <button
                                    key={s.value}
                                    onClick={() => { setSubdivision(s.value); haptics.light(); }}
                                    className={cn(
                                        "py-3 rounded-2xl border-2 font-black text-xs transition-all",
                                        subdivision === s.value 
                                            ? "bg-slate-800 border-pink-500 text-pink-400 shadow-lg" 
                                            : "bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700"
                                    )}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sound Settings */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-500 px-1">
                            <Volume2 size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Timbre</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {SOUND_TYPES.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => { setSoundType(s.id); haptics.light(); }}
                                    className={cn(
                                        "flex flex-col items-center gap-2 py-3 rounded-2xl border-2 transition-all",
                                        soundType === s.id 
                                            ? "bg-slate-800 border-pink-500 text-pink-400 shadow-lg" 
                                            : "bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700"
                                    )}
                                >
                                    <s.icon size={16} />
                                    <span className="text-[9px] font-black uppercase tracking-tighter">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <Button 
                    onClick={toggleMetronome} 
                    variant={isPlaying ? "danger" : "primary"}
                    className={cn(
                        "w-full py-10 rounded-[32px] text-xl font-black uppercase tracking-[0.3em] shadow-2xl transition-all",
                        !isPlaying && "bg-pink-600 hover:bg-pink-500 shadow-pink-900/30"
                    )}
                    leftIcon={isPlaying ? Square : Play}
                >
                    {isPlaying ? "Interromper" : "Iniciar Pulso"}
                </Button>
            </CardContent>
        </Card>
    );
};
