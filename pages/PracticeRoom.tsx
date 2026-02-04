
import React, { useState, useEffect, useRef, useMemo } from 'react';
// FIX: Using any to bypass react-router-dom export errors
import * as RRD from 'react-router-dom';
const { useLocation } = RRD as any;
import { useCurrentStudent } from '../hooks/useCurrentStudent';
// FIX: Changed savePracticeSession to savePracticeTime to match exported members in services/dataService.ts
import { getStudentRepertoire, savePracticeTime } from '../services/dataService';
// FIX: Removed invalid logPracticeSession import which was causing a build error
import { getPracticeSessionFeedback } from '../services/aiService';
import { MaestroAudioPro } from '../lib/audioPro';
import { audioManager } from '../lib/audioManager';
import { PerformanceHUD } from '../components/tools/PerformanceHUD';
import { ComboCounter } from '../components/tools/ComboCounter';
import { NoteHighway } from '../components/tools/NoteHighway';
import { MaestroMixer } from '../components/tools/MaestroMixer';
import { Button } from '../components/ui/Button';
import { Music, Play, Pause, Loader2, Trophy } from 'lucide-react';
import { haptics } from '../lib/haptics';
import { notify } from '../lib/notification';
import { cn } from '../lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '../components/ui/Dialog';
import { motion } from 'framer-motion';
import { parseAlphaTexToSchedule } from '../lib/tabParser';
import { RENAN_SERPA_TABS } from '../lib/tabsStore';

export default function PracticeRoom() {
  const { student } = useCurrentStudent();
  const audioPro = useRef(new MaestroAudioPro());
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [scoreData, setScoreData] = useState({ score: 0, combo: 0, multiplier: 1, flowFactor: 0 });
  const [showSummary, setShowSummary] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  // Notas padrão para o Highway (Spider Walk v1) para não ficar vazio
  const defaultNotes = useMemo(() => parseAlphaTexToSchedule(RENAN_SERPA_TABS.spider_walk_v1, 100), []);

  useEffect(() => {
    // Registra o componente no gerenciador de áudio
    audioManager.requestAccess('PracticeRoom');
    
    let timer: number;
    if (isActive) {
        timer = window.setInterval(() => setSeconds(s => s + 1), 1000);
    }

    return () => {
      audioPro.current.dispose();
      audioManager.release('PracticeRoom');
      clearInterval(timer);
    };
  }, [isActive]);

  const togglePractice = () => {
    setIsActive(!isActive);
    if (!isActive) {
        audioPro.current.play();
        haptics.medium();
    } else {
        audioPro.current.pause();
        haptics.light();
    }
  };

  const handleFinish = async () => {
    setIsActive(false);
    audioPro.current.pause();
    const stats = audioPro.current.getSessionStats(seconds);
    const feedback = await getPracticeSessionFeedback(student?.name || 'Aluno', stats, 100);
    setAiFeedback(feedback);
    setShowSummary(true);
    notify.success("Sessão finalizada!");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-48 pt-10">
      <header className="flex justify-between items-center bg-slate-900/50 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-6">
            <div className="p-4 bg-sky-600 rounded-3xl text-white shadow-lg"><Music size={32} /></div>
            <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Sala de Prática</h1>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">Sincronizado com Maestro Core</p>
            </div>
        </div>
        <div className="flex items-center gap-6">
            <div className="text-right">
                <p className="text-[10px] font-black text-slate-600 uppercase">Tempo de Voo</p>
                <p className="text-3xl font-mono font-black text-white">{Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}</p>
            </div>
            <button 
                onClick={togglePractice}
                className={cn(
                    "w-20 h-20 rounded-3xl flex items-center justify-center transition-all shadow-xl",
                    isActive ? "bg-red-600 text-white animate-pulse" : "bg-sky-600 text-white"
                )}
            >
                {isActive ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
              <NoteHighway 
                  notes={defaultNotes} 
                  currentTime={audioPro.current.getCurrentTime()} 
                  isPlaying={isActive} 
                  bpm={100} 
                  // Passamos um mock de amplitude para testar o brilho das cordas
                  micAmplitude={isActive ? 0.2 : 0}
              />
          </div>
          <div className="lg:col-span-4 space-y-6">
              <MaestroMixer 
                gains={{ music: 0.7, mic: 0.8, metro: 0.5 }} 
                onGainChange={(c, v) => audioPro.current.setGain(c, v)}
                micEnhancement={true}
                onToggleEnhancement={() => {}}
              />
              <Button onClick={handleFinish} variant="outline" className="w-full py-6 text-xs font-black uppercase tracking-widest">Encerrar e Salvar</Button>
          </div>
      </div>

      <PerformanceHUD lastJudgment={null} />
      <ComboCounter combo={scoreData.combo} multiplier={scoreData.multiplier} />

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
          <DialogContent className="bg-slate-900 border-slate-800 rounded-[48px] p-10 text-center max-w-lg">
                <Trophy size={64} className="text-amber-500 mx-auto mb-6" />
                <DialogTitle className="text-2xl font-black text-white uppercase">Prática Concluída!</DialogTitle>
                <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 mt-6 text-left italic text-slate-300">
                    "{aiFeedback}"
                </div>
                <DialogFooter className="mt-8">
                    <Button onClick={() => setShowSummary(false)} className="w-full">Voltar ao Painel</Button>
                </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
