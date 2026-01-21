
import * as Tone from 'tone';
import { ChordBlock } from '../types';

class StudioEngine {
    private polySynth: Tone.PolySynth;
    private drumKit: {
        kick: Tone.MembraneSynth;
        snare: Tone.NoiseSynth;
        hihat: Tone.MetalSynth;
        tom: Tone.MembraneSynth;
    };
    private loop: Tone.Sequence | null = null;

    constructor() {
        this.polySynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.1, release: 1 }
        }).toDestination();

        this.drumKit = {
            kick: new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 10,
                oscillator: { type: "sine" },
                envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
            }).toDestination(),
            snare: new Tone.NoiseSynth({
                noise: { type: "white" },
                envelope: { attack: 0.005, decay: 0.1, sustain: 0 }
            }).toDestination(),
            hihat: new Tone.MetalSynth({
                frequency: 200,
                envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
                harmonicity: 5.1,
                modulationIndex: 32,
                resonance: 4000,
                octaves: 1.5
            }).toDestination(),
            tom: new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 4,
                oscillator: { type: "sine" },
                envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
            }).toDestination()
        };
    }

    async startTransport() {
        await Tone.start();
        if (Tone.Transport.state !== 'started') {
            Tone.Transport.start();
        }
    }

    stop() {
        Tone.Transport.stop();
        Tone.Transport.cancel();
        if (this.loop) {
            this.loop.dispose();
            this.loop = null;
        }
        this.polySynth.releaseAll();
    }

    // Toca sequencia de acordes (Blocos)
    playSequence(blocks: ChordBlock[], bpm: number, style: string) {
        this.stop();
        Tone.Transport.bpm.value = bpm;

        blocks.forEach((block, index) => {
            const time = `${index}:0:0`;
            
            // Trigger do Acorde (Bloco)
            Tone.Transport.schedule((t) => {
                this.polySynth.triggerAttackRelease(block.notes, "1n", t);
            }, time);

            // Ritmo de Bateria Automático (Mock Simples)
            if (style === 'Rock') {
                Tone.Transport.schedule((t) => this.drumKit.kick.triggerAttackRelease("C1", "8n", t), `${index}:0:0`);
                Tone.Transport.schedule((t) => this.drumKit.hihat.triggerAttackRelease("16n", t), `${index}:0:2`);
                Tone.Transport.schedule((t) => this.drumKit.snare.triggerAttackRelease("16n", t), `${index}:1:0`);
                Tone.Transport.schedule((t) => this.drumKit.kick.triggerAttackRelease("C1", "8n", t), `${index}:1:2`);
            }
        });

        Tone.Transport.start();
    }

    // Nova função: Step Sequencer para Drum Machine
    startDrumPattern(grid: boolean[][], bpm: number, onStep?: (step: number) => void) {
        this.stop();
        Tone.Transport.bpm.value = bpm;

        // grid[0] = Kick, [1] = Snare, [2] = HiHat, [3] = Tom
        const steps = Array.from({ length: 16 }, (_, i) => i);

        this.loop = new Tone.Sequence((time, step) => {
            if (grid[0][step]) this.drumKit.kick.triggerAttackRelease("C1", "8n", time);
            if (grid[1][step]) this.drumKit.snare.triggerAttackRelease("8n", time);
            if (grid[2][step]) this.drumKit.hihat.triggerAttackRelease("32n", time, 0.5); // HiHat mais baixo
            if (grid[3][step]) this.drumKit.tom.triggerAttackRelease("A1", "8n", time);
            
            // Callback visual para UI
            if (onStep) {
                Tone.Draw.schedule(() => {
                    onStep(step);
                }, time);
            }
        }, steps, "16n").start(0);

        Tone.Transport.start();
    }
}

export const studioEngine = new StudioEngine();
