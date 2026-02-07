
import { useState, useEffect, useRef, useCallback } from 'react';
import { audioManager } from '../lib/audioManager.ts';
import { haptics } from '../lib/haptics.ts';

export type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8';

export interface ProgressiveConfig {
  active: boolean;
  stepBpm: number;
  measuresInterval: number;
  targetBpm: number;
}

export function useMetronome(onMeasureTick?: (measure: number) => void) {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [signature, setSignature] = useState<TimeSignature>('4/4');
  const [currentBeat, setCurrentBeat] = useState(0);
  const [currentMeasure, setCurrentMeasure] = useState(0);
  
  const [progression, setProgression] = useState<ProgressiveConfig>({
    active: false,
    stepBpm: 5,
    measuresInterval: 4,
    targetBpm: 180
  });

  const nextNoteTime = useRef(0);
  const timerID = useRef<number | null>(null);
  const beatCounter = useRef(0);
  const measureCounter = useRef(0);
  
  const bpmRef = useRef(bpm);
  const progRef = useRef(progression);

  useEffect(() => {
    bpmRef.current = bpm;
    progRef.current = progression;
  }, [bpm, progression]);

  const panic = useCallback(() => {
    const halfBpm = Math.floor(bpmRef.current / 2);
    setBpm(Math.max(40, halfBpm));
    haptics.error();
  }, []);

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
      const beatsPerMeasure = parseInt(signature.split('/')[0]);
      const isDownbeat = beatCounter.current % beatsPerMeasure === 0;

      if (isDownbeat && beatCounter.current > 0) {
        measureCounter.current++;
        
        // Lógica Progressiva
        const prog = progRef.current;
        if (prog.active && measureCounter.current % prog.measuresInterval === 0) {
          const nextBpm = bpmRef.current + prog.stepBpm;
          if (nextBpm <= prog.targetBpm) {
            setBpm(nextBpm);
          }
        }
        
        // Notifica o sistema de novo compasso
        if (onMeasureTick) onMeasureTick(measureCounter.current);
      }

      playClick(time, isDownbeat);

      const delay = (time - ctx.currentTime) * 1000;
      const currentBeatVal = beatCounter.current % beatsPerMeasure;
      const currentMeasureVal = measureCounter.current;
      
      setTimeout(() => {
        setCurrentBeat(currentBeatVal);
        setCurrentMeasure(currentMeasureVal);
      }, Math.max(0, delay));

      nextNoteTime.current += 60.0 / bpmRef.current;
      beatCounter.current++;
    }
    timerID.current = window.setTimeout(scheduler, 25);
  }, [playClick, signature, onMeasureTick]);

  const toggle = useCallback(async () => {
    const ctx = await audioManager.getContext();
    if (isPlaying) {
      if (timerID.current) clearTimeout(timerID.current);
      setIsPlaying(false);
      setCurrentBeat(0);
      setCurrentMeasure(0);
      measureCounter.current = 0;
      beatCounter.current = 0;
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
    bpm, setBpm, isPlaying, toggle, panic,
    currentBeat, currentMeasure, progression, setProgression 
  };
}
