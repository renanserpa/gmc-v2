
import { useState, useEffect, useRef, useCallback } from 'react';
import { audioManager } from '../lib/audioManager.ts';
import { haptics } from '../lib/haptics.ts';

export type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8';

export interface ProgressiveConfig {
  active: boolean;
  initialBpm: number;
  targetBpm: number;
  stepBpm: number;
  measuresInterval: number;
}

export function useMetronome() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [signature, setSignature] = useState<TimeSignature>('4/4');
  const [currentBeat, setCurrentBeat] = useState(0);
  const [currentMeasure, setCurrentMeasure] = useState(0);
  
  const [progression, setProgression] = useState<ProgressiveConfig>({
    active: false,
    initialBpm: 120,
    targetBpm: 160,
    stepBpm: 5,
    measuresInterval: 4
  });

  const nextNoteTime = useRef(0);
  const timerID = useRef<number | null>(null);
  const beatCounter = useRef(0);
  const measureCounter = useRef(0);
  
  const bpmRef = useRef(bpm);
  const seqRef = useRef(signature);
  const progRef = useRef(progression);

  useEffect(() => {
    bpmRef.current = bpm;
    seqRef.current = signature;
    progRef.current = progression;
  }, [bpm, signature, progression]);

  const playClick = useCallback(async (time: number, isDownbeat: boolean) => {
    const ctx = await audioManager.getContext();
    const osc = ctx.createOscillator();
    const envelope = ctx.createGain();

    osc.type = isDownbeat ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(isDownbeat ? 1000 : 800, time);

    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(0.1, time + 0.005);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(envelope);
    envelope.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.05);
  }, []);

  const scheduler = useCallback(async () => {
    const ctx = await audioManager.getContext();
    
    while (nextNoteTime.current < ctx.currentTime + 0.1) {
      const time = nextNoteTime.current;
      const beatsPerMeasure = parseInt(seqRef.current.split('/')[0]);
      
      const isNewMeasure = beatCounter.current % beatsPerMeasure === 0;
      
      if (isNewMeasure && beatCounter.current > 0) {
        measureCounter.current++;
        
        // Lógica de Progressão: Só altera se o modo estiver ativo
        const prog = progRef.current;
        if (prog.active && measureCounter.current % prog.measuresInterval === 0) {
          const nextBpm = bpmRef.current + prog.stepBpm;
          // Trava no Target
          if ((prog.stepBpm > 0 && nextBpm <= prog.targetBpm) || (prog.stepBpm < 0 && nextBpm >= prog.targetBpm)) {
            setBpm(nextBpm);
          } else {
            haptics.success();
          }
        }
      }

      playClick(time, beatCounter.current % beatsPerMeasure === 0);

      const delay = (time - ctx.currentTime) * 1000;
      const currentBeatVal = beatCounter.current % beatsPerMeasure;
      const currentMeasureVal = measureCounter.current;
      
      setTimeout(() => {
        setCurrentBeat(currentBeatVal);
        setCurrentMeasure(currentMeasureVal);
      }, Math.max(0, delay));

      const secondsPerBeat = 60.0 / bpmRef.current;
      nextNoteTime.current += secondsPerBeat;
      beatCounter.current++;
    }
    timerID.current = window.setTimeout(scheduler, 25);
  }, [playClick]);

  const toggle = useCallback(async () => {
    const ctx = await audioManager.getContext();
    if (isPlaying) {
      if (timerID.current) clearTimeout(timerID.current);
      setIsPlaying(false);
      setCurrentBeat(0);
      setCurrentMeasure(0);
      measureCounter.current = 0;
    } else {
      if (ctx.state === 'suspended') await ctx.resume();
      beatCounter.current = 0;
      measureCounter.current = 0;
      nextNoteTime.current = ctx.currentTime + 0.05;
      setIsPlaying(true);
      scheduler();
    }
  }, [isPlaying, scheduler]);

  return { 
    bpm, setBpm, 
    isPlaying, toggle, 
    signature, setSignature, 
    currentBeat, currentMeasure,
    progression, setProgression
  };
}
