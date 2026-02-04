
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, Timer, Volume2, Radio, Zap, 
  Square, Play, Mic, MicOff, Globe, 
  Smartphone, BookOpen, Link, Link2Off
} from 'lucide-react';

import { useMetronome, TimeSignature } from '../../../hooks/useMetronome.ts';
import { usePitchDetector } from '../../../hooks/usePitchDetector.ts';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { supabase } from '../../../lib/supabaseClient.ts';
import { notify } from '../../../lib/notification.ts';
import { Button } from '../../../components/ui/Button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card.tsx';
import { cn } from '../../../lib/utils.ts';
import { haptics } from '../../../lib/haptics.ts';

import { TabRenderer } from '../../../components/tools/TabRenderer.tsx';
import { EXERCISES_DATABASE, TabExercise } from '../../../lib/tabsStore.ts';

const M = motion as any;

export default function LiveTools() {
  const { user, schoolId } = useAuth();
  const metronome = useMetronome();
  const [isTunerActive, setIsTunerActive] = useState(false);
  const tuner = usePitchDetector(isTunerActive);
  
  const [activeExercise, setActiveExercise] = useState<TabExercise>(EXERCISES_DATABASE[0]);
  const [activeMeasure, setActiveMeasure] = useState(0);
  const [isLiveSync, setIsLiveSync] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  useEffect(() => {
    if (!isLiveSync || !schoolId) return;
    const syncState = async () => {
        await supabase.from('classroom_orchestration').upsert({
            class_id: schoolId,
            bpm: metronome.bpm,
            is_locked: isBroadcasting,
            active_exercise_id: activeExercise.id,
            active_measure: activeMeasure,
            updated_at: new Date().toISOString()
        });
    };
    const timer = setTimeout(syncState, 200);
    return () => clearTimeout(timer);
  }, [metronome.bpm, activeExercise.id, activeMeasure, isBroadcasting, isLiveSync, schoolId]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 text-sky-500 mb-2">
            <Radio size={14} className="animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em]">Live Teacher Cockpit</span>
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
            Maestro <span className="text-sky-500">Suite</span>
          </h1>
        </div>
        <div className="flex gap-4">
            <Button 
                onClick={() => { setIsLiveSync(!isLiveSync); haptics.medium(); }}
                variant={isLiveSync ? "primary" : "outline"}
                className="h-14 px-6 rounded-2xl"
                leftIcon={isLiveSync ? Link : Link2Off}
            >
                {isLiveSync ? "LIVE SYNC ON" : "ATIVAR SYNC"}
            </Button>
        </div>
      </header>

      <section className="space-y-6">
          <TabRenderer 
            exercise={activeExercise} 
            activeMeasure={activeMeasure} 
            onMeasureClick={setActiveMeasure}
            zoom={1.2}
          />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 bg-[#0a0f1d] border-white/5 rounded-[48px] p-10 flex flex-col md:flex-row items-center gap-12">
            <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-full border-[8px] border-slate-900 bg-slate-950 flex items-center justify-center">
                   <span className="text-4xl font-black text-white font-mono">{metronome.bpm}</span>
                </div>
            </div>
            <div className="w-full space-y-6">
                <input 
                    type="range" min="30" max="250" value={metronome.bpm} 
                    onChange={(e) => metronome.setBpm(parseInt(e.target.value))}
                    className="w-full accent-sky-500 h-2 bg-slate-900 rounded-full appearance-none cursor-pointer"
                />
                <Button onClick={metronome.toggle} className="w-full py-4 rounded-2xl font-black uppercase text-[10px]">
                    {metronome.isPlaying ? "PARAR METRÔNOMO" : "INICIAR METRÔNOMO"}
                </Button>
            </div>
        </Card>

        <Card className="lg:col-span-4 bg-[#0a0f1d] border-white/5 rounded-[48px] p-10 flex flex-col items-center justify-center">
             <span className={cn("text-6xl font-black italic transition-colors", Math.abs(tuner.cents) < 5 ? "text-emerald-400" : "text-white")}>
                {isTunerActive ? tuner.note : "--"}
             </span>
             <Button variant="ghost" onClick={() => setIsTunerActive(!isTunerActive)} className="mt-4 text-[10px] font-black uppercase">
                {isTunerActive ? "DESATIVAR AFINADOR" : "ATIVAR AFINADOR"}
             </Button>
        </Card>
      </div>
    </div>
  );
}
