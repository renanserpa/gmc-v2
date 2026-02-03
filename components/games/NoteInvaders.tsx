
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MaestroAudioPro } from '../../lib/audioPro';
import { usePitchDetector } from '../../hooks/usePitchDetector';
import { Rocket, Zap, ShieldAlert, Trophy, Star, RefreshCw } from 'lucide-react';
import { haptics } from '../../lib/haptics';
import { uiSounds } from '../../lib/uiSounds';
import { notify } from '../../lib/notification';
import { cn } from '../../lib/utils';
import { NOTES_CHROMATIC } from '../../lib/theoryEngine';
import { Button } from '../ui/Button';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { audioManager } from '../../lib/audioManager';

interface Enemy {
    id: number;
    noteIdx: number;
    x: number;
    y: number;
    speed: number;
    isDestroyed: boolean;
}

const OPEN_STRINGS = [
    { name: 'E', idx: 64 }, { name: 'B', idx: 59 }, { name: 'G', idx: 55 },
    { name: 'D', idx: 50 }, { name: 'A', idx: 45 }, { name: 'E', idx: 40 },
];

export const NoteInvaders: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const { settings } = useAccessibility();
    const isHC = settings.highContrast;

    const audioPro = useRef(new MaestroAudioPro());
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [score, setScore] = useState(0);

    // Fix: usePitchDetector only expects the isActive boolean. Destructured noteIdx for game logic.
    const { noteIdx: detectedNote } = usePitchDetector(gameState === 'playing');

    useEffect(() => {
        if (gameState === 'playing') {
            audioManager.requestAccess('NoteInvaders');
        }
        return () => audioManager.release('NoteInvaders');
    }, [gameState]);

    const startGame = async () => {
        await audioPro.current.connectMicrophone();
        setEnemies([]);
        setScore(0);
        setGameState('playing');
        haptics.heavy();
    };

    return (
        <div className={cn(
            "w-full h-[600px] rounded-[64px] border-4 relative overflow-hidden shadow-2xl",
            isHC ? "bg-black border-white" : "bg-slate-950 border-white/5"
        )}>
            <div className="absolute top-8 left-10 right-10 flex justify-between items-center z-50">
                <div className="bg-slate-900/80 px-5 py-2 rounded-2xl border border-white/5">
                    <p className={cn("text-[8px] font-black uppercase", isHC ? "text-white" : "text-slate-500")}>Galactic Score</p>
                    <p className={cn("text-xl font-black font-mono", isHC ? "text-white" : "text-amber-400")}>{score}</p>
                </div>
            </div>

            <AnimatePresence>
                {enemies.filter(e => !e.isDestroyed).map(enemy => (
                    <motion.div
                        key={enemy.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, y: `${enemy.y}%` }}
                        style={{ left: `${enemy.x}%`, position: 'absolute' }}
                        className="absolute -translate-x-1/2"
                    >
                        <div className={cn(
                            "w-16 h-16 rounded-3xl border-2 flex items-center justify-center font-black text-2xl",
                            isHC ? "bg-white text-black border-black" : "bg-slate-900 text-white border-white/20 shadow-xl"
                        )}>
                            {NOTES_CHROMATIC[enemy.noteIdx % 12]}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {gameState === 'idle' && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-[100] p-10 text-center">
                    <Rocket size={64} className="text-sky-500 mb-6" />
                    <h2 className="text-4xl font-black text-white uppercase mb-4">Note Invaders</h2>
                    <Button onClick={startGame} className="px-16 py-6">Iniciar Defesa</Button>
                </div>
            )}
        </div>
    );
};