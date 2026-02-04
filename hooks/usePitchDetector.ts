
import { useState, useEffect, useRef } from 'react';
import { audioManager } from '../lib/audioManager.ts';
import { autoCorrelate, freqToNoteIdx, NOTES_CHROMATIC } from '../lib/theoryEngine.ts';

export interface PitchData {
  note: string;
  freq: number;
  cents: number;
  isDetected: boolean;
  // Added noteIdx to facilitate numeric pitch comparisons in games and trainers
  noteIdx: number | null;
}

export function usePitchDetector(isActive: boolean) {
  const [data, setData] = useState<PitchData>({
    note: '--',
    freq: 0,
    cents: 0,
    isDetected: false,
    noteIdx: null
  });

  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafId = useRef<number>(0);

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = await audioManager.getContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      
      analyserRef.current = analyser;
      streamRef.current = stream;
      update();
    } catch (e) {
      console.error("Mic access denied", e);
    }
  };

  const stopMic = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    analyserRef.current = null;
  };

  const update = () => {
    if (!analyserRef.current) return;

    const buffer = new Float32Array(analyserRef.current.fftSize);
    analyserRef.current.getFloatTimeDomainData(buffer);
    
    const freq = autoCorrelate(buffer, 44100);
    
    if (freq && freq > 50 && freq < 1000) {
      const noteIdx = freqToNoteIdx(freq);
      const noteName = NOTES_CHROMATIC[noteIdx % 12];
      
      // Cálculo de cents para afinação fina
      const expectedFreq = 440 * Math.pow(2, (noteIdx - 69) / 12);
      const diffCents = Math.floor(1200 * Math.log2(freq / expectedFreq));

      setData({
        note: noteName,
        freq: Math.round(freq * 10) / 10,
        cents: diffCents,
        isDetected: true,
        noteIdx: noteIdx
      });
    } else {
      // Fix: Ensure noteIdx is reset when no pitch is detected
      setData(prev => ({ ...prev, isDetected: false, noteIdx: null }));
    }

    rafId.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    if (isActive) startMic();
    else stopMic();
    return () => stopMic();
  }, [isActive]);

  return data;
}
