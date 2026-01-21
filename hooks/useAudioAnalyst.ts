import { useState, useEffect, useRef, useCallback } from 'react';
import { audioManager } from '../lib/audioManager';
import { autoCorrelate, freqToNoteIdx, NOTES_CHROMATIC } from '../lib/theoryEngine';

interface AudioAnalystResult {
    currentNote: string;
    noteIdx: number | null;
    cents: number;
    isInTune: boolean;
    volumeLevel: number;
    isDetected: boolean;
}

/**
 * Hook Avançado de Análise de Performance Audio-Visual.
 * Captura o pitch e compara com a tolerância técnica definida pelo nível do aluno.
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
    
    // Tolerância: 40 cents para iniciantes (quase meio tom), 15 para pro (ouvido absoluto/estúdio)
    const tolerance = difficulty === 'beginner' ? 40 : 15;

    const process = useCallback(() => {
        if (!analyserRef.current || !isActive) return;

        const buffer = new Float32Array(analyserRef.current.fftSize);
        analyserRef.current.getFloatTimeDomainData(buffer);
        
        // 1. Cálculo de Volume (RMS)
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
        const rms = Math.sqrt(sum / buffer.length);
        const vol = Math.min(1, rms * 5); // Normalizado para visualização

        // 2. Detecção de Frequência
        const freq = autoCorrelate(buffer, analyserRef.current.context.sampleRate);
        
        if (freq && vol > 0.02) {
            const idx = freqToNoteIdx(freq);
            const noteName = NOTES_CHROMATIC[idx % 12];
            
            // 3. Cálculo de Cents (Desvio da nota pura)
            // freq_pure = 440 * 2^((idx - 69) / 12)
            const expectedFreq = 440 * Math.pow(2, (idx - 69) / 12);
            const cents = Math.floor(1200 * Math.log2(freq / expectedFreq));

            // 4. Validação contra Alvo (se fornecido)
            let inTune = false;
            if (targetNoteIdx !== undefined && targetNoteIdx !== null) {
                // Verifica se a nota é a mesma e se o desvio está dentro da tolerância
                inTune = (idx % 12 === targetNoteIdx % 12) && Math.abs(cents) <= tolerance;
            } else {
                // Apenas verifica se a nota detectada está "afinada" consigo mesma
                inTune = Math.abs(cents) <= tolerance;
            }

            setResult({
                currentNote: noteName,
                noteIdx: idx,
                cents,
                isInTune: inTune,
                volumeLevel: vol,
                isDetected: true
            });
        } else {
            setResult(prev => ({ ...prev, volumeLevel: vol, isDetected: false, isInTune: false }));
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
                analyser.fftSize = 2048;
                source.connect(analyser);
                analyserRef.current = analyser;
                process();
            };
            init();
        } else {
            cancelAnimationFrame(rafRef.current);
            audioManager.release('AudioAnalyst');
        }
        return () => cancelAnimationFrame(rafRef.current);
    }, [isActive, process]);

    return result;
}
