
import { useState, useEffect, useRef } from 'react';
import { audioManager } from '../lib/audioManager';
import { autoCorrelate, freqToNoteIdx, NOTES_CHROMATIC } from '../lib/theoryEngine';

export function useTuner() {
    const [isListening, setIsListening] = useState(false);
    const [detectedNote, setDetectedNote] = useState('--');
    const [frequency, setFrequency] = useState(0);
    const [cents, setCents] = useState(0);
    
    const analyserRef = useRef<AnalyserNode | null>(null);
    const micStreamRef = useRef<MediaStream | null>(null);
    const rafId = useRef<number | null>(null);

    const start = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = stream;
            
            const ctx = await audioManager.getContext();
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);
            analyserRef.current = analyser;
            
            setIsListening(true);
            update();
        } catch (e) {
            console.error("Mic access denied", e);
        }
    };

    const stop = () => {
        setIsListening(false);
        if (rafId.current) cancelAnimationFrame(rafId.current);
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(t => t.stop());
        }
        setDetectedNote('--');
        setFrequency(0);
        setCents(0);
    };

    const update = () => {
        if (!analyserRef.current) return;
        const buffer = new Float32Array(analyserRef.current.fftSize);
        analyserRef.current.getFloatTimeDomainData(buffer);
        
        const freq = autoCorrelate(buffer, 44100);
        if (freq && freq > 50 && freq < 1000) {
            setFrequency(Math.round(freq * 10) / 10);
            const noteIdx = freqToNoteIdx(freq);
            setDetectedNote(NOTES_CHROMATIC[noteIdx % 12]);
            
            const expectedFreq = 440 * Math.pow(2, (noteIdx - 69) / 12);
            const diffCents = Math.floor(1200 * Math.log2(freq / expectedFreq));
            setCents(diffCents);
        }
        rafId.current = requestAnimationFrame(update);
    };

    return { isListening, start, stop, detectedNote, frequency, cents };
}
