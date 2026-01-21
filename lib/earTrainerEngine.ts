import { audioManager } from './audioManager';

export type IntervalType = 'P4' | 'P5';

export class EarTrainerEngine {
    private async playNote(freq: number, startTime: number, duration: number) {
        const ctx = await audioManager.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    async playInterval(type: IntervalType) {
        const ctx = await audioManager.getContext();
        const now = ctx.currentTime;
        const root = 220; // A3
        const target = type === 'P4' ? root * (4/3) : root * (3/2);

        // Melódico
        this.playNote(root, now, 0.8);
        this.playNote(target, now + 0.8, 1.2);

        // Harmônico (simultâneo) após um breve delay
        this.playNote(root, now + 2.5, 2.0);
        this.playNote(target, now + 2.5, 2.0);
    }
}