
import { notify } from './notification';

export type InputSource = 'microphone' | 'midi';

export interface NoteEvent {
    note: number; // MIDI Note Number
    velocity: number;
    timestamp: number;
    source: InputSource;
}

class InputManager {
    private midiAccess: MIDIAccess | null = null;
    private onNoteCallback: ((event: NoteEvent) => void) | null = null;
    private activeSource: InputSource = 'microphone';

    async initMIDI() {
        if (!navigator.requestMIDIAccess) {
            console.warn("Web MIDI não suportada neste navegador.");
            return false;
        }

        try {
            this.midiAccess = await navigator.requestMIDIAccess();
            this.setupMIDIListeners();
            notify.info("Dispositivo MIDI detectado e pronto!");
            return true;
        } catch (e) {
            console.error("Falha ao acessar MIDI:", e);
            return false;
        }
    }

    private setupMIDIListeners() {
        if (!this.midiAccess) return;

        this.midiAccess.inputs.forEach(input => {
            input.onmidimessage = (message) => {
                const [status, note, velocity] = message.data;
                
                // 144 = Note On em canal 1
                if (status === 144 && velocity > 0) {
                    this.dispatchNote({
                        note,
                        velocity,
                        timestamp: performance.now(),
                        source: 'midi'
                    });
                }
            };
        });
    }

    setSource(source: InputSource) {
        this.activeSource = source;
        notify.info(`Fonte de entrada: ${source.toUpperCase()}`);
    }

    onNoteOn(callback: (event: NoteEvent) => void) {
        this.onNoteCallback = callback;
    }

    private dispatchNote(event: NoteEvent) {
        if (this.onNoteCallback) {
            this.onNoteCallback(event);
        }
    }

    getConnectedDevices() {
        if (!this.midiAccess) return [];
        const devices: string[] = [];
        this.midiAccess.inputs.forEach(input => devices.push(input.name || 'Dispositivo USB'));
        return devices;
    }
}

export const inputManager = new InputManager();
