
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { audioManager } from '../lib/audioManager.ts';
import { autoCorrelate, freqToNoteIdx, NOTES_CHROMATIC } from '../lib/theoryEngine.ts';

interface AudioAnalystResult {
    currentNote: string;
    noteIdx: number | null;
    cents: number;
    isInTune: boolean;
    volumeLevel: number;
    isDetected: boolean;
}

const NOISE_FLOOR_THRESHOLD = 0.005; // ~ -45dB aproximado

/**
 * Hook de Análise Maestro Otimizado.
 * Implementa detecção de hardware e gate de ruído para preservação de CPU.
 */
export function useAudioAnalyst(isActive: boolean, targetNoteIdx?: number | null, difficulty: 'beginner' | 'pro' = 'beginner') {
    const [result, setResult] = useState<AudioAnalystResult>({
        currentNote: '--',
        noteIdx: null,
        cents: 0,
        isInTune: false,
        volumeLevel: 0,
        isDetected: false
    });

    const analyserRef = useRef<AnalyserNode | null>(null);
    const rafRef = useRef<number>(0);
    const bufferRef = useRef<Float32Array | null>(null);
    
    // Resource Optimization: Hardware Detection
    const isMobile = useMemo(() => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent), []);
    const FFT_SIZE = isMobile ? 1024 : 2048; 
    
    const tolerance = difficulty === 'beginner' ? 40 : 15;

    const process = useCallback(() => {
        if (!analyserRef.current || !isActive) return;

        if (!bufferRef.current) {
            bufferRef.current = new Float32Array(analyserRef.current.fftSize);
        }
        
        const buffer = bufferRef.current;
        analyserRef.current.getFloatTimeDomainData(buffer);
        
        // RMS Optimization: Calcula energia antes de processar Pitch (Noise Gate)
        let sum = 0;
        const len = buffer.length;
        for (let i = 0; i < len; i++) {
            const val = buffer[i];
            sum += val * val;
        }
        const rms = Math.sqrt(sum / len);
        const vol = Math.min(1, rms * 5);

        // Somente executa correlação se o volume exceder o Noise Floor
        if (vol > NOISE_FLOOR_THRESHOLD) {
            const freq = autoCorrelate(buffer, analyserRef.current.context.sampleRate);
            
            if (freq) {
                const idx = freqToNoteIdx(freq);
                const expectedFreq = 440 * Math.pow(2, (idx - 69) / 12);
                const cents = Math.floor(1200 * Math.log2(freq / expectedFreq));

                let inTune = false;
                if (targetNoteIdx !== undefined && targetNoteIdx !== null) {
                    inTune = (idx % 12 === targetNoteIdx % 12) && Math.abs(cents) <= tolerance;
                } else {
                    inTune = Math.abs(cents) <= tolerance;
                }

                setResult({
                    currentNote: NOTES_CHROMATIC[idx % 12],
                    noteIdx: idx,
                    cents,
                    isInTune: inTune,
                    volumeLevel: vol,
                    isDetected: true
                });
            }
        } else {
            // Silêncio: Zera detecção preservando apenas o nível de volume
            setResult(prev => ({ 
                ...prev, 
                volumeLevel: vol, 
                isDetected: false, 
                isInTune: false,
                currentNote: '--'
            }));
        }

        rafRef.current = requestAnimationFrame(process);
    }, [isActive, targetNoteIdx, tolerance]);

    useEffect(() => {
        if (isActive) {
            const init = async () => {
                const ctx = await audioManager.requestAccess('AudioAnalyst');
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const source = ctx.createMediaStreamSource(stream);
                const analyser = ctx.createAnalyser();
                analyser.fftSize = FFT_SIZE;
                analyser.smoothingTimeConstant = isMobile ? 0.3 : 0.5;
                source.connect(analyser);
                analyserRef.current = analyser;
                process();
            };
            init();
        } else {
            cancelAnimationFrame(rafRef.current);
            if (analyserRef.current) {
                analyserRef.current.disconnect();
            }
            analyserRef.current = null;
            bufferRef.current = null;
            audioManager.release('AudioAnalyst');
        }
        return () => cancelAnimationFrame(rafRef.current);
    }, [isActive, process, FFT_SIZE, isMobile]);

    return result;
}
