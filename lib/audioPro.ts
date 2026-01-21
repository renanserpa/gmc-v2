
import { audioManager } from './audioManager';

export interface MusicalNote {
    id: string;
    time: number;
    fret: number;
    string: number;
    duration: number;
    measure: number;
}

export interface PerformanceEvent {
    timestamp: number;
    noteIdx: number;
    expectedNoteIdx: number;
    timingDiff: number; 
    centsDiff: number;
    precision: 'perfect' | 'great' | 'good' | 'miss';
    points: number;
    pitchStability: number;
    amplitude: number; 
    intensityZone: 'soft' | 'normal' | 'heavy';
    resonance: number; 
}

export interface NoteStats {
    hits: number;
    misses: number;
    avgCentsDiff: number;
    avgTimingDiff: number;
    lastDetectedAt: number;
    stabilityScore: number;
    jitter: number;
    avgAmplitude: number;
}

export interface SessionStats {
    totalBeats: number;
    onTargetBeats: number;
    durationSeconds: number;
    averagePrecision: number;
    averageLatency: number;
    totalScore: number;
    maxCombo: number;
    avgStability: number;
    flowFactor: number;
    dynamicRange: { min: number, max: number };
    noteHeatmap: Record<number, NoteStats>;
    resonanceScore: number;
}

export type StemType = 'vocals' | 'drums' | 'bass' | 'other' | 'backing';

export class MaestroAudioPro {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private musicGain: GainNode | null = null;
    private micGain: GainNode | null = null;
    private metroGain: GainNode | null = null;
    private micFilter: BiquadFilterNode | null = null;
    
    private stems: Map<StemType, { source: AudioBufferSourceNode | null, gain: GainNode, buffer: AudioBuffer | null, analyser: AnalyserNode | null }> = new Map();
    
    private isPlaying: boolean = false;
    private startTime: number = 0;
    private pauseOffset: number = 0;
    private playbackRate: number = 1.0;
    
    private sessionBeats: number = 0;
    private successfulHits: number = 0;
    private currentScore: number = 0;
    private currentCombo: number = 0;
    private maxCombo: number = 0;
    private performanceHistory: PerformanceEvent[] = [];
    private noteHeatmap: Record<number, NoteStats> = {};
    private metroBpm: number = 120;
    private metroTimer: number | null = null;
    private nextBeatTime: number = 0;
    private beatCount: number = 0;
    
    public onBeat: ((beat: number, time: number) => void) | null = null;
    public micAnalyser: AnalyserNode | null = null;
    private masterAnalyser: AnalyserNode | null = null;
    private musicAnalyser: AnalyserNode | null = null;
    private micStream: MediaStream | null = null;

    constructor() {}

    private async ensureContext() {
        if (!this.ctx) {
            this.ctx = await audioManager.requestAccess('MaestroAudioPro');
            
            this.masterGain = this.ctx.createGain();
            this.musicGain = this.ctx.createGain();
            this.micGain = this.ctx.createGain();
            this.metroGain = this.ctx.createGain();
            this.micFilter = this.ctx.createBiquadFilter();
            this.masterAnalyser = this.ctx.createAnalyser();
            this.musicAnalyser = this.ctx.createAnalyser();
            
            this.micFilter.type = 'highpass';
            this.micFilter.frequency.setValueAtTime(80, this.ctx.currentTime);
            
            this.masterGain.connect(this.masterAnalyser);
            this.masterGain.connect(this.ctx.destination);

            ['vocals', 'drums', 'bass', 'other', 'backing'].forEach(type => {
                const gain = this.ctx!.createGain();
                const stemAnalyser = this.ctx!.createAnalyser();
                gain.connect(stemAnalyser);
                stemAnalyser.connect(this.musicGain!);
                this.stems.set(type as StemType, { source: null, gain, buffer: null, analyser: stemAnalyser });
            });
            
            this.musicGain.connect(this.musicAnalyser);
            this.musicGain.connect(this.masterGain);
            this.metroGain.connect(this.masterGain);
        }
        return this.ctx;
    }

    async play(atTime: number = 0) {
        if (this.isPlaying) return;
        const context = await this.ensureContext();
        
        this.stems.forEach((stem) => {
            if (stem.buffer) {
                stem.source = context.createBufferSource();
                stem.source.buffer = stem.buffer;
                stem.source.playbackRate.value = this.playbackRate;
                stem.source.connect(stem.gain);
                stem.source.start(0, Math.max(0, this.pauseOffset + atTime));
            }
        });

        this.startTime = context.currentTime;
        this.isPlaying = true;
        this.nextBeatTime = context.currentTime;
        this.beatCount = 0;
        this.metroScheduler();
    }

    private metroScheduler() {
        if (!this.ctx || !this.isPlaying) return;
        while (this.nextBeatTime < this.ctx.currentTime + 0.1) {
            const isDownbeat = this.beatCount % 4 === 0;
            this.scheduleBeat(this.nextBeatTime, isDownbeat);
            if (this.onBeat) {
                const delay = (this.nextBeatTime - this.ctx.currentTime) * 1000;
                const currentBeat = this.beatCount;
                const scheduledTime = this.nextBeatTime;
                setTimeout(() => this.onBeat?.(currentBeat % 4, scheduledTime), Math.max(0, delay));
            }
            this.nextBeatTime += (60.0 / this.metroBpm);
            this.beatCount++;
            this.sessionBeats++;
        }
        this.metroTimer = window.setTimeout(() => this.metroScheduler(), 25);
    }

    private scheduleBeat(time: number, isDownbeat: boolean) {
        if (!this.ctx || !this.metroGain) return;
        const osc = this.ctx.createOscillator();
        const env = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isDownbeat ? 1000 : 800, time);
        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(0.1, time + 0.005);
        env.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        osc.connect(env);
        env.connect(this.metroGain);
        osc.start(time);
        osc.stop(time + 0.1);
    }

    async connectMicrophone() {
        if (this.micStream) return { stream: this.micStream };
        const context = await this.ensureContext();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.micStream = stream;
        const source = context.createMediaStreamSource(stream);
        this.micAnalyser = context.createAnalyser();
        this.micAnalyser.fftSize = 2048;
        if (this.micFilter && this.micGain) {
            source.connect(this.micFilter);
            this.micFilter.connect(this.micAnalyser);
            this.micFilter.connect(this.micGain);
        }
        return { stream };
    }

    getRecordingStream(): MediaStream | null {
        return this.micStream;
    }

    disconnectMicrophone() {
        if (this.micStream) {
            this.micStream.getTracks().forEach(t => t.stop());
            this.micStream = null;
        }
        if (this.micGain && this.ctx) {
            this.micGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
        }
    }

    setGain(channel: 'master' | 'music' | 'mic' | 'metro', value: number) {
        const gainNode = { master: this.masterGain, music: this.musicGain, mic: this.micGain, metro: this.metroGain }[channel];
        if (gainNode && this.ctx) gainNode.gain.setTargetAtTime(value, this.ctx.currentTime, 0.1);
    }

    getCurrentTime(): number {
        if (!this.isPlaying || !this.ctx) return this.pauseOffset;
        return this.pauseOffset + (this.ctx.currentTime - this.startTime) * this.playbackRate;
    }

    pause() {
        if (!this.isPlaying || !this.ctx) return;
        this.pauseOffset += (this.ctx.currentTime - this.startTime) * this.playbackRate;
        this.stop();
    }

    stop() {
        this.isPlaying = false;
        if (this.metroTimer) clearTimeout(this.metroTimer);
        this.stems.forEach(stem => {
            if (stem.source) { 
                try { 
                    stem.source.stop(); 
                    stem.source.disconnect();
                } catch(e) {} 
                stem.source = null; 
            }
        });
    }

    getLevels() {
        let master = 0; let mic = 0; let music = 0;
        if (this.masterAnalyser) {
            const data = new Float32Array(this.masterAnalyser.fftSize);
            this.masterAnalyser.getFloatTimeDomainData(data);
            let sum = 0; for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
            master = Math.sqrt(sum / data.length);
        }
        if (this.micAnalyser) {
            const data = new Float32Array(this.micAnalyser.fftSize);
            this.micAnalyser.getFloatTimeDomainData(data);
            let sum = 0; for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
            mic = Math.sqrt(sum / data.length);
        }
        const musicNorm = Math.min(1, music * 3);
        const micNorm = Math.min(1, mic * 3);
        const resonance = 1 - Math.abs(musicNorm - micNorm);
        return { master, mic, music, resonance, isAttack: mic > 0.3 };
    }

    getSpectralData() {
        if (!this.micAnalyser) return new Float32Array(0);
        const data = new Float32Array(this.micAnalyser.frequencyBinCount);
        this.micAnalyser.getFloatFrequencyData(data);
        return data;
    }

    getSessionStats(seconds: number): SessionStats {
        return {
            totalBeats: this.sessionBeats,
            onTargetBeats: this.successfulHits,
            durationSeconds: seconds,
            averagePrecision: (this.successfulHits / Math.max(1, this.sessionBeats)) * 100,
            averageLatency: 0,
            totalScore: this.currentScore,
            maxCombo: this.maxCombo,
            avgStability: 1,
            flowFactor: (this.currentCombo / 50) + (this.getLevels().resonance * 0.5),
            dynamicRange: { min: 0, max: 1 },
            noteHeatmap: this.noteHeatmap,
            resonanceScore: 100
        };
    }

    /**
     * Cleanup Rigoroso - Libera memória RAM (buffers) e desconecta nós do contexto.
     */
    dispose() {
        this.stop();
        
        // 1. Desconectar e limpar Stems (Buffers pesados)
        this.stems.forEach((stem) => {
            if (stem.source) {
                try { stem.source.disconnect(); } catch(e) {}
                stem.source = null;
            }
            stem.gain.disconnect();
            stem.analyser?.disconnect();
            stem.buffer = null; // Libera RAM decodificada
        });
        this.stems.clear();

        // 2. Desconectar Nós Principais
        const nodes = [
            this.masterGain, this.musicGain, this.micGain, 
            this.metroGain, this.micFilter, this.masterAnalyser, 
            this.musicAnalyser, this.micAnalyser
        ];

        nodes.forEach(node => {
            if (node) {
                try { node.disconnect(); } catch(e) {}
            }
        });

        // 3. Resetar referências para o Garbage Collector
        this.masterGain = null;
        this.musicGain = null;
        this.micGain = null;
        this.metroGain = null;
        this.micFilter = null;
        this.masterAnalyser = null;
        this.musicAnalyser = null;
        this.micAnalyser = null;

        // 4. Fechar Microfone
        if (this.micStream) {
            this.micStream.getTracks().forEach(t => t.stop());
            this.micStream = null;
        }

        // 5. Notificar Gerenciador e suspender contexto se necessário
        audioManager.release('MaestroAudioPro');
        this.ctx = null;
        
        console.debug("[MaestroAudioPro] Rigorous cleanup finished. Resources released.");
    }
}
