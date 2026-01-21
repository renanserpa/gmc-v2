
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../../lib/audioManager';
import { haptics } from '../../lib/haptics';
import { cn } from '../../lib/utils';
import { Sparkles, Music, Wind } from 'lucide-react';

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
}

export const SensoryBoard: React.FC = () => {
    const [particles, setParticles] = useState<Particle[]>([]);
    
    // Registra acesso ao áudio ao montar
    useEffect(() => {
        audioManager.requestAccess('SensoryBoard');
        return () => audioManager.release('SensoryBoard');
    }, []);

    const colors = ['#38bdf8', '#a78bfa', '#fbbf24', '#f472b6', '#34d399'];

    const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Visual
        const newParticle: Particle = {
            id: Date.now(),
            x, y,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 40 + Math.random() * 80
        };

        setParticles(prev => [...prev, newParticle].slice(-15));
        
        // Som Suave (Senoidal)
        playSoftTone(y / rect.height);
        haptics.light();
    };

    const playSoftTone = async (normalizedY: number) => {
        try {
            const ctx = await audioManager.getContext();
            
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            // Mapeia Y para uma escala pentatônica suave (frequências baixas)
            const freq = 220 * Math.pow(1.059, Math.floor((1 - normalizedY) * 12));
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 2.1);
        } catch (e) {
            console.warn("Audio Context not ready");
        }
    };

    return (
        <div 
            className="w-full h-[600px] bg-slate-950 rounded-[64px] border-4 border-white/5 relative overflow-hidden cursor-pointer touch-none"
            onMouseDown={handleInteraction}
            onTouchStart={handleInteraction}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.05),transparent)]" />
            
            <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10">
                <div className="flex items-center gap-3 justify-center mb-2">
                    <Sparkles className="text-sky-400 animate-pulse" size={24} />
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Espaço Sensorial</h3>
                </div>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Toque para criar cores e sons</p>
            </div>

            <AnimatePresence>
                {particles.map(p => (
                    <motion.div
                        key={p.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: [0, 0.4, 0] }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="absolute rounded-full blur-3xl pointer-events-none"
                        style={{ 
                            left: p.x - p.size/2, 
                            top: p.y - p.size/2, 
                            width: p.size, 
                            height: p.size, 
                            backgroundColor: p.color 
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* Ícones flutuantes decorativos */}
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute bottom-20 left-20 opacity-10">
                <Music size={80} className="text-white" />
            </motion.div>
            <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-40 right-20 opacity-10">
                <Wind size={100} className="text-white" />
            </motion.div>
        </div>
    );
};
