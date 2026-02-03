
import { useState, useEffect, useRef, useCallback } from 'react';
import { audioManager } from '../lib/audioManager';
import { haptics } from '../lib/haptics';

export type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8';

export function useMetronome() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [signature, setSignature] = useState<TimeSignature>('4/4');
  const [currentBeat, setCurrentBeat] = useState(0);

  const nextNoteTime = useRef(0);
  const timerID = useRef<number | null>(null);
  const beatCounter = useRef(0);
  
  // Ref para acessar o BPM dentro do loop sem causar re-renders do scheduler
  const bpmRef = useRef(bpm);
  const sigRef = useRef(signature);

  useEffect(() => {
    bpmRef.current = bpm;
    sigRef.current = signature;
  }, [bpm, signature]);

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
    // Lookahead loop
    while (nextNoteTime.current < ctx.currentTime + 0.1) {
      const time = nextNoteTime.current;
      const beatsPerMeasure = parseInt(sigRef.current.split('/')[0]);
      const isDownbeat = beatCounter.current % beatsPerMeasure === 0;

      playClick(time, isDownbeat);

      // Sincroniza estado visual com pequeno delay para alinhar com o áudio
      const delay = (time - ctx.currentTime) * 1000;
      const currentBeatVal = beatCounter.current % beatsPerMeasure;
      
      setTimeout(() => {
        setCurrentBeat(currentBeatVal);
        if (currentBeatVal === 0) haptics.heavy();
        else haptics.light();
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
    } else {
      if (ctx.state === 'suspended') await ctx.resume();
      beatCounter.current = 0;
      nextNoteTime.current = ctx.currentTime + 0.05;
      setIsPlaying(true);
      scheduler();
    }
  }, [isPlaying, scheduler]);

  return { bpm, setBpm, isPlaying, toggle, signature, setSignature, currentBeat };
}
