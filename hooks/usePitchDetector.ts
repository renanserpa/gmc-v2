
import { useState, useEffect, useRef } from 'react';
import { MaestroAudioPro } from '../lib/audioPro';
import { autoCorrelate, freqToNoteIdx } from '../lib/theoryEngine';
import { notify } from '../lib/notification';

export function usePitchDetector(audioPro: MaestroAudioPro | null, isEnabled: boolean) {
    const [detectedNote, setDetectedNote] = useState<number | null>(null);
    const requestRef = useRef<number>(0);
    const silenceCounter = useRef<number>(0);
    const hasNotifiedSilence = useRef<boolean>(false);
    
    const stabilityBuffer = useRef<{ note: number, count: number }>({ note: -1, count: 0 });
    const STABILITY_THRESHOLD = 3; 

    const processAudio = () => {
        if (!isEnabled || !audioPro) return;

        const analyser = audioPro.micAnalyser;
        
        if (analyser && analyser.context && analyser.context.state !== 'closed') {
            try {
                const buffer = new Float32Array(analyser.fftSize);
                analyser.getFloatTimeDomainData(buffer);
                
                const freq = autoCorrelate(buffer, analyser.context.sampleRate);
                
                if (freq) {
                    silenceCounter.current = 0;
                    hasNotifiedSilence.current = false;
                    const noteIdx = freqToNoteIdx(freq);
                    
                    if (noteIdx === stabilityBuffer.current.note) {
                        stabilityBuffer.current.count++;
                    } else {
                        stabilityBuffer.current.note = noteIdx;
                        stabilityBuffer.current.count = 0;
                    }

                    if (stabilityBuffer.current.count >= STABILITY_THRESHOLD) {
                        setDetectedNote(noteIdx);
                    }
                } else {
                    silenceCounter.current++;
                    stabilityBuffer.current.count = 0;
                    setDetectedNote(null);

                    // Self-Healing: Se houver silêncio por ~5 segundos (considerando 60fps)
                    if (silenceCounter.current > 300 && !hasNotifiedSilence.current) {
                        notify.warning("Lucca diz: Não estou ouvindo seu violão! Verifique o microfone.");
                        hasNotifiedSilence.current = true;
                    }
                }
            } catch (err) {
                console.warn("[PitchDetector] Frame skip.");
            }
        }
        
        if (isEnabled) {
            requestRef.current = requestAnimationFrame(processAudio);
        }
    };

    useEffect(() => {
        if (isEnabled && audioPro) {
            requestRef.current = requestAnimationFrame(processAudio);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            setDetectedNote(null);
            silenceCounter.current = 0;
        }

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isEnabled, audioPro]);

    return detectedNote;
}
