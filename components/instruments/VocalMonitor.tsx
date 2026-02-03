
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Mic, Activity, Zap, MicOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { MaestroAudioPro } from '../../lib/audioPro';
import { usePitchDetector } from '../../hooks/usePitchDetector';
import { NOTES_CHROMATIC } from '../../lib/theoryEngine';
import { audioManager } from '../../lib/audioManager';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export const VocalMonitor: React.FC = () => {
    const audioPro = useRef(new MaestroAudioPro());
    const [isListening, setIsListening] = useState(false);
    const [history, setHistory] = useState<number[]>(new Array(50).fill(null));
    
    // Fix: usePitchDetector call corrected (only isActive arg). Extracted noteIdx for visualization.
    const { noteIdx: detectedNoteIdx } = usePitchDetector(isListening);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (isListening) {
            audioManager.requestAccess('VocalMonitor');
            audioPro.current.connectMicrophone();
        }
        return () => {
            audioManager.release('VocalMonitor');
        };
    }, [isListening]);

    // Loop de desenho do gráfico
    useEffect(() => {
        if (!isListening) return;

        const interval = setInterval(() => {
            setHistory(prev => {
                const next = [...prev.slice(1), detectedNoteIdx || null];
                return next as number[]; // Cast seguro pois filtramos null no render
            });
        }, 50); // 20fps update rate

        return () => clearInterval(interval);
    }, [isListening, detectedNoteIdx]);

    useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const w = canvasRef.current.width;
        const h = canvasRef.current.height;
        
        ctx.clearRect(0, 0, w, h);

        // Grid de Notas (Linhas horizontais)
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#1e293b'; // slate-800
        for(let i=0; i<12; i++) {
            const y = (i / 12) * h;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Linha do Pitch
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#38bdf8'; // sky-400
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        let hasStarted = false;
        const stepX = w / history.length;

        history.forEach((noteIdx, i) => {
            if (noteIdx === null) {
                hasStarted = false;
                return;
            }

            // Normaliza a nota dentro de uma oitava para visualização (0-11)
            const normalizedPitch = noteIdx % 12;
            // Inverte Y pois canvas 0 é topo
            const y = h - ((normalizedPitch / 12) * h) - (h/24); 
            const x = i * stepX;

            if (!hasStarted) {
                ctx.moveTo(x, y);
                hasStarted = true;
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#38bdf8';
        ctx.stroke();
        ctx.shadowBlur = 0;

    }, [history]);

    const toggleMic = () => {
        setIsListening(!isListening);
    };

    const currentNoteName = detectedNoteIdx !== null ? NOTES_CHROMATIC[detectedNoteIdx % 12] : '--';

    return (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 p-32 bg-pink-500/5 blur-[100px] pointer-events-none" />
            
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-pink-400 flex items-center gap-2">
                        <Mic size={24} /> Vocal Pitch Lab
                    </CardTitle>
                    <CardDescription>Visualize a estabilidade e afinação da sua voz em tempo real.</CardDescription>
                </div>
                <Button 
                    onClick={toggleMic}
                    className={cn(
                        "rounded-full px-6",
                        isListening ? "bg-red-500 hover:bg-red-600" : "bg-sky-600 hover:bg-sky-500"
                    )}
                >
                    {isListening ? <><MicOff size={16} className="mr-2"/> Parar</> : <><Mic size={16} className="mr-2"/> Captar Voz</>}
                </Button>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="relative h-64 bg-slate-950 rounded-[32px] border border-white/5 overflow-hidden shadow-inner">
                    <canvas 
                        ref={canvasRef}
                        width={600}
                        height={256}
                        className="w-full h-full opacity-90"
                    />
                    
                    {!isListening && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm">
                            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                                <Activity size={16} /> Aguardando sinal de áudio...
                            </p>
                        </div>
                    )}

                    {/* Nota Atual Overlay */}
                    <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur border border-white/10 p-4 rounded-2xl flex flex-col items-center min-w-[80px]">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Nota</span>
                        <motion.span 
                            key={currentNoteName}
                            initial={{ scale: 1.2, color: '#fff' }}
                            animate={{ scale: 1, color: isListening && detectedNoteIdx !== null ? '#38bdf8' : '#64748b' }}
                            className="text-4xl font-black"
                        >
                            {currentNoteName}
                        </motion.span>
                    </div>
                </div>

                <div className="flex gap-4">
                     <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex-1">
                         <div className="flex items-center gap-2 mb-2 text-pink-400">
                             <Zap size={16} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Estabilidade</span>
                         </div>
                         <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                             <motion.div 
                                className="h-full bg-pink-500"
                                animate={{ width: detectedNoteIdx !== null ? "92%" : "0%" }}
                             />
                         </div>
                     </div>
                     <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex-1">
                         <p className="text-xs text-slate-400 leading-relaxed font-medium">
                             <strong className="text-white">Dica:</strong> Tente manter a linha azul o mais reta possível para treinar sustentação (Sustain). Oscilações rápidas indicam Vibrato.
                         </p>
                     </div>
                </div>
            </CardContent>
        </Card>
    );
};