
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, Timer, Volume2, Radio, Zap, 
  Trash2, Play, Square, Mic, MicOff,
  ChevronRight, Save, Globe, Smartphone,
  Activity, Eraser, Search, BookOpen,
  ZoomIn, ZoomOut, Link, Link2Off
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

// New Imports for Tabs
import { TabRenderer } from '../../../components/tools/TabRenderer.tsx';
import { EXERCISES_DATABASE, TabExercise } from '../../../lib/tabsStore.ts';

const M = motion as any;

export default function LiveTools() {
  const { user, schoolId } = useAuth();
  const metronome = useMetronome();
  const [isTunerActive, setIsTunerActive] = useState(false);
  const tuner = usePitchDetector(isTunerActive);
  
  // Tab State
  const [activeExercise, setActiveExercise] = useState<TabExercise>(EXERCISES_DATABASE[0]);
  const [activeMeasure, setActiveMeasure] = useState(0);
  const [zoom, setZoom] = useState(1.2);
  const [isLiveSync, setIsLiveSync] = useState(false);

  const [whiteboard, setWhiteboard] = useState<boolean[][]>(
    Array(6).fill(null).map(() => Array(12).fill(false))
  );

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [lastTaps, setLastTaps] = useState<number[]>([]);

  // Sincronia de Estado (Broadcast)
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

    const timer = setTimeout(syncState, 100);
    return () => clearTimeout(timer);
  }, [metronome.bpm, activeExercise.id, activeMeasure, isBroadcasting, isLiveSync, schoolId]);

  const handleMeasureClick = (idx: number) => {
    haptics.light();
    setActiveMeasure(idx);
    if (isLiveSync) notify.info(`Compasso ${idx + 1} sincronizado.`);
  };

  const handleTap = () => {
    haptics.light();
    const now = performance.now();
    const newTaps = [...lastTaps, now].slice(-4);
    setLastTaps(newTaps);

    if (newTaps.length >= 2) {
      const averageInterval = (newTaps[newTaps.length - 1] - newTaps[0]) / (newTaps.length - 1);
      const newBpm = Math.round(60000 / averageInterval);
      if (newBpm >= 30 && newBpm <= 250) metronome.setBpm(newBpm);
    }
  };

  const handleBroadcast = async () => {
    if (!schoolId) {
        notify.error("Selecione uma turma para transmitir.");
        return;
    }
    setIsBroadcasting(!isBroadcasting);
    haptics.heavy();
    
    if (!isBroadcasting) notify.success("Sinal Rítmico injetado nos dispositivos dos alunos!");
  };

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
                className={cn(
                    "h-14 px-6 rounded-2xl transition-all",
                    isLiveSync ? "bg-sky-600 border-white" : "border-white/10 text-slate-500"
                )}
                leftIcon={isLiveSync ? Link : Link2Off}
            >
                {isLiveSync ? "LIVE SYNC ATIVO" : "ATIVAR LIVE SYNC"}
            </Button>
            <Button 
                onClick={handleBroadcast}
                className={cn(
                    "h-14 px-8 rounded-2xl transition-all shadow-xl",
                    isBroadcasting ? "bg-red-600 hover:bg-red-500 shadow-red-900/20" : "bg-sky-600 hover:bg-sky-500"
                )}
                leftIcon={isBroadcasting ? Square : Globe}
            >
                {isBroadcasting ? "PARAR BROADCAST" : "TRANSMITIR PARA ALUNOS"}
            </Button>
        </div>
      </header>

      {/* EXERCISE RENDERER CENTER STAGE */}
      <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-900 rounded-2xl text-sky-400">
                    <BookOpen size={20} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{activeExercise.title}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nível: {activeExercise.difficulty}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-white/5">
                <button onClick={() => setZoom(Math.max(0.8, zoom - 0.2))} className="p-3 text-slate-500 hover:text-white"><ZoomOut size={16}/></button>
                <span className="text-[10px] font-black text-slate-600 w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(Math.min(2.5, zoom + 0.2))} className="p-3 text-slate-500 hover:text-white"><ZoomIn size={16}/></button>
            </div>
          </div>

          <TabRenderer 
            exercise={activeExercise} 
            activeMeasure={activeMeasure} 
            onMeasureClick={handleMeasureClick}
            zoom={zoom}
          />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* EXERCISES SELECTOR */}
        <Card className="lg:col-span-3 bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-xs uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Search size={16} /> Biblioteca Técnica
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {EXERCISES_DATABASE.map(ex => (
                <button
                    key={ex.id}
                    onClick={() => { setActiveExercise(ex); setActiveMeasure(0); haptics.heavy(); }}
                    className={cn(
                        "w-full p-4 rounded-3xl text-left transition-all border-2",
                        activeExercise.id === ex.id 
                            ? "bg-sky-500/10 border-sky-500 text-white" 
                            : "bg-transparent border-transparent text-slate-500 hover:bg-white/5"
                    )}
                >
                    <p className="text-xs font-black uppercase truncate">{ex.title}</p>
                    <p className="text-[9px] font-bold opacity-60 mt-1">{ex.difficulty}</p>
                </button>
            ))}
          </CardContent>
        </Card>

        {/* METRONOME PANEL */}
        <Card className="lg:col-span-6 bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-white/5 flex items-center justify-between">
            <CardTitle className="text-xs uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Timer size={16} className="text-sky-400" /> Motor Rítmico
            </CardTitle>
            <div className="flex gap-1">
              {(['2/4', '3/4', '4/4'] as TimeSignature[]).map(s => (
                <button 
                  key={s} 
                  onClick={() => metronome.setSignature(s)}
                  className={cn(
                    "px-2 py-1 rounded text-[8px] font-black transition-colors",
                    metronome.signature === s ? "bg-sky-500 text-white" : "bg-slate-900 text-slate-600"
                  )}
                >{s}</button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-10 flex flex-col md:flex-row items-center gap-12">
              <div className="relative shrink-0">
                <M.div 
                  animate={metronome.isPlaying ? { scale: [1, 1.1, 1] } : {}}
                  className={cn(
                    "w-32 h-32 rounded-full border-[8px] flex items-center justify-center transition-colors duration-200",
                    metronome.currentBeat === 0 && metronome.isPlaying ? "border-sky-500 bg-sky-500/5 shadow-[0_0_40px_rgba(56,189,248,0.2)]" : "border-slate-900 bg-slate-950"
                  )}
                >
                   <span className="text-4xl font-black text-white font-mono tracking-tighter">{metronome.bpm}</span>
                </M.div>
              </div>

              <div className="w-full space-y-6">
                <input 
                  type="range" min="30" max="250" value={metronome.bpm} 
                  onChange={(e) => metronome.setBpm(parseInt(e.target.value))}
                  className="w-full accent-sky-500 h-2 bg-slate-900 rounded-full appearance-none cursor-pointer"
                />
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleTap} className="py-4 rounded-2xl bg-slate-900 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">Tap Tempo</button>
                  <Button onClick={metronome.toggle} variant={metronome.isPlaying ? "danger" : "primary"} className="py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                    {metronome.isPlaying ? "STOP" : "START"}
                  </Button>
                </div>
              </div>
          </CardContent>
        </Card>

        {/* TUNER QUICK-VIEW */}
        <Card className="lg:col-span-3 bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl relative">
          <CardHeader className="p-8 border-b border-white/5 flex items-center justify-between">
            <CardTitle className="text-xs uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Volume2 size={16} className="text-emerald-400" /> Pitch Check
            </CardTitle>
            <button onClick={() => setIsTunerActive(!isTunerActive)} className={cn("p-2 rounded-lg transition-colors", isTunerActive ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-400")}>
              {isTunerActive ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
          </CardHeader>
          <CardContent className="p-10 flex flex-col items-center justify-center h-full">
               <span className={cn("text-6xl font-black italic tracking-tighter transition-colors", Math.abs(tuner.cents) < 5 ? "text-emerald-400" : "text-white")}>
                {isTunerActive ? tuner.note : "--"}
               </span>
               <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-2">Frequência Vocal/Corda</p>
          </CardContent>
        </Card>
      </div>

      <div className="p-8 bg-purple-500/5 border border-purple-500/10 rounded-[40px] flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-lg"><Smartphone size={24} /></div>
            <div>
                <h4 className="text-sm font-black text-white uppercase mb-1">Mirror Link Ativado</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Os alunos estão vendo agora: <span className="text-purple-400 font-bold">{activeExercise.title}</span> na posição <span className="text-purple-400 font-bold">Compasso {activeMeasure + 1}</span>.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full border border-white/5">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
             <span className="text-[10px] font-black text-slate-500 uppercase">Sincronia RLS OK</span>
          </div>
      </div>
    </div>
  );
}
