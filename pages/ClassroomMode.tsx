
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MaestroAudioPro } from '../lib/audioPro';
import { TablatureView } from '../components/tools/TablatureView';
import { Fretboard } from '../components/tools/Fretboard';
import { CAGEDLayer } from '../components/tools/CAGEDLayer';
import { GrooveCircle } from '../components/tools/GrooveCircle';
import { LessonPlaylist } from '../components/dashboard/LessonPlaylist';
import { Leaderboard } from '../components/Leaderboard';
import { MaestroLiveTip } from '../components/tools/MaestroLiveTip';
import { CollectiveEnergyMeter } from '../components/tools/CollectiveEnergyMeter';
import { AccuracyMeter } from '../components/tools/AccuracyMeter';
import { BossRaidHUD } from '../components/tools/BossRaidHUD';
import { DynamicZoneHUD } from '../components/tools/DynamicZoneHUD';
import { useScreenMode } from '../hooks/useScreenMode';
import { usePitchDetector } from '../hooks/usePitchDetector';
import { useAuth } from '../contexts/AuthContext';
import { classroomService, ClassroomCommand } from '../services/classroomService';
import { getClassVerdict } from '../services/aiService';
import { LessonStep, BossState } from '../types';
import { Play, Pause, Monitor, Zap, Trophy, Flame, Star, Sparkles, Brain, Activity, Target } from 'lucide-react';
import { haptics } from '../lib/haptics';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import confetti from 'canvas-confetti';

export default function ClassroomMode() {
    const [searchParams] = useSearchParams();
    const classId = searchParams.get('classId') || 'demo-class';
    const { user } = useAuth();
    const { isTvMode, setIsTvMode } = useScreenMode();
    
    const audioPro = useRef(new MaestroAudioPro());
    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState(120);
    const [currentBeat, setCurrentBeat] = useState(0);
    const [currentShape, setCurrentShape] = useState('E');
    const [currentStep, setCurrentStep] = useState<LessonStep | null>(null);
    const [performanceStatus, setPerformanceStatus] = useState<Record<string, 'hit' | 'miss'>>({});
    const [lastPerf, setLastPerf] = useState({ cents: 0, timing: 0, precision: 'miss' as any });

    const steps: LessonStep[] = [
        { id: 'step_1', title: 'Exploração CAGED', type: 'theory', duration_mins: 10, content: '\\tuning E2 A2 D3 G3 B3 E4 . 0.6 2.6' }
    ];

    const detectedNote = usePitchDetector(audioPro.current, isPlaying);

    useEffect(() => {
        audioPro.current.onBeat = (beat) => setCurrentBeat(beat);
        const unsubscribe = classroomService.subscribeToCommands(classId, (cmd) => {
            if (cmd.type === 'PLAY') setIsPlaying(true);
            if (cmd.type === 'PAUSE') setIsPlaying(false);
        });
        if (!currentStep) setCurrentStep(steps[0]);
        return () => {
            unsubscribe();
            audioPro.current.dispose();
        };
    }, [classId]);

    return (
        <div className={cn("min-h-screen transition-all duration-700 relative", isTvMode ? "bg-slate-950 p-12 overflow-hidden" : "p-6")}>
            <header className="rounded-[48px] border border-white/5 bg-slate-900/60 backdrop-blur-3xl shadow-2xl p-8 flex justify-between items-center relative z-10 mb-10">
                <div className="flex items-center gap-8">
                    <div className="bg-sky-500 w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg">
                        <Monitor size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{currentStep?.title}</h1>
                        <p className="text-[10px] font-black text-sky-500 tracking-widest uppercase mt-2">Teoria Visual Integrada</p>
                    </div>
                </div>
                <GrooveCircle bpm={bpm} currentTime={0} isPlaying={isPlaying} externalPulse={currentBeat} mode="konnakkol" />
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
                <main className="lg:col-span-12 space-y-10 relative">
                    <div className="relative group">
                        <Fretboard rootKey="C" detectedNoteIdx={detectedNote} className="opacity-90" />
                        <CAGEDLayer 
                            rootNote="C" 
                            currentShape={currentShape} 
                            onShapeChange={setCurrentShape} 
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}
