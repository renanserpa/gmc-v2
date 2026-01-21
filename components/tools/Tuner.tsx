
import React, { useState, useRef, useEffect } from 'react';
import { autoCorrelate, freqToNoteIdx, NOTES_CHROMATIC } from '../../lib/theoryEngine';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Volume2, Mic, MicOff, Zap } from 'lucide-react';
import { haptics } from '../../lib/haptics';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { notify } from '../../lib/notification';
import { audioManager } from '../../lib/audioManager';

const GUITAR_TUNING: Record<string, number> = {
    'E2': 82.41, 'A2': 110.00, 'D3': 146.83, 'G3': 196.00, 'B3': 246.94, 'E4': 329.63
};

export const Tuner: React.FC = () => {
    const [mode, setMode] = useState<'reference' | 'live'>('reference');
    const [activeNote, setActiveNote] = useState<string | null>(null);
    const [detectedNote, setDetectedNote] = useState<string | null>(null);
    const [cents, setCents] = useState(0);
    
    const oscRef = useRef<OscillatorNode | null>(null);
    const gainRef = useRef<GainNode | null>(null);
    const micStream = useRef<MediaStream | null>(null);
    const analyser = useRef<AnalyserNode | null>(null);
    const animationFrame = useRef<number>(0);

    useEffect(() => {
        audioManager.requestAccess('Tuner');
        return () => {
            stopTone();
            stopLive();
            audioManager.release('Tuner');
        };
    }, []);

    const playTone = async (freq: number) => {
        stopTone();
        const ctx = await audioManager.getContext();
        oscRef.current = ctx.createOscillator();
        gainRef.current = ctx.createGain();
        oscRef.current.frequency.value = freq;
        gainRef.current.gain.setValueAtTime(0.1, ctx.currentTime);
        oscRef.current.connect(gainRef.current);
        gainRef.current.connect(ctx.destination);
        oscRef.current.start();
    };

    const stopTone = () => {
        oscRef.current?.stop();
        oscRef.current = null;
    };

    const toggleMode = async () => {
        if (mode === 'reference') {
            stopTone();
            setActiveNote(null);
            await startLive();
            setMode('live');
        } else {
            stopLive();
            setMode('reference');
        }
        haptics.medium();
    };

    const startLive = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStream.current = stream;
            const ctx = await audioManager.getContext();
            const source = ctx.createMediaStreamSource(stream);
            analyser.current = ctx.createAnalyser();
            analyser.current.fftSize = 2048;
            source.connect(analyser.current);
            notify.success("Microfone Ativado");
            processPitch();
        } catch (e) {
            notify.error("Acesso ao microfone negado.");
            setMode('reference');
        }
    };

    const stopLive = () => {
        cancelAnimationFrame(animationFrame.current);
        micStream.current?.getTracks().forEach(t => t.stop());
        micStream.current = null;
        setDetectedNote(null);
        setCents(0);
    };

    const processPitch = () => {
        if (!analyser.current) return;
        const buffer = new Float32Array(analyser.current.fftSize);
        analyser.current.getFloatTimeDomainData(buffer);
        const freq = autoCorrelate(buffer, 44100);
        if (freq && freq > 50 && freq < 1000) {
            const noteIdx = freqToNoteIdx(freq);
            setDetectedNote(NOTES_CHROMATIC[noteIdx % 12]);
            const expectedFreq = 440 * Math.pow(2, (noteIdx - 69) / 12);
            const diff = freq - expectedFreq;
            setCents(Math.max(-50, Math.min(50, diff * 2)));
        }
        animationFrame.current = requestAnimationFrame(processPitch);
    };

    const isTuned = Math.abs(cents) < 5 && detectedNote;

    return (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-sky-400 flex items-center gap-2">
                        <Volume2 size={20}/> Afinador Maestro
                    </CardTitle>
                    <CardDescription>{mode === 'live' ? 'Toque uma corda.' : 'Modo Referência.'}</CardDescription>
                </div>
                <button onClick={toggleMode} className="p-3 rounded-2xl border bg-slate-800 border-slate-700 text-slate-400">
                    {mode === 'live' ? <Mic size={14}/> : <MicOff size={14}/>}
                </button>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6">
                <AnimatePresence mode="wait">
                    {mode === 'live' ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                            <p className={cn("text-7xl font-black mb-2 transition-colors", isTuned ? "text-emerald-400" : "text-white")}>
                                {detectedNote || '--'}
                            </p>
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                {isTuned ? "AFINADO" : "OUVINDO..."}
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                            {Object.entries(GUITAR_TUNING).map(([note, freq]) => (
                                <button
                                    key={note}
                                    onClick={() => { setActiveNote(note); playTone(freq); haptics.light(); }}
                                    className={cn("p-6 rounded-[24px] border-2 transition-all", activeNote === note ? "bg-sky-600 border-white text-white" : "bg-slate-950 border-slate-800 text-slate-500")}
                                >
                                    <span className="text-2xl font-black">{note}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};
