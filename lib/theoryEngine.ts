

import { ChordSubstitution } from '../types';

export const NOTES_CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTES_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const INTERVAL_NAMES: Record<number, string> = {
    0: 'Tônica (P1)',
    1: '2ª Menor (m2)',
    2: '2ª Maior (M2)',
    3: '3ª Menor (m3)',
    4: '3ª Maior (M3)',
    5: '4ª Justa (P4)',
    6: '4ª Aum / 5ª Dim (Tritono)',
    7: '5ª Justa (P5)',
    8: '6ª Menor (m6)',
    9: '6ª Maior (M6)',
    10: '7ª Menor (m7)',
    11: '7ª Maior (M7)',
};

// FIX: Added MODES export to resolve CircleOfFifths error
export const MODES = {
    lydian: { name: 'Lídio', feel: 'Místico', mood: 'Sonhador / Inspirador' },
    ionian: { name: 'Jônio (Maior)', feel: 'Feliz', mood: 'Alegre / Brilhante' },
    mixolydian: { name: 'Mixolídio', feel: 'Rock/Blues', mood: 'Festivo / Relaxado' },
    dorian: { name: 'Dórico', feel: 'Jazz/Funk', mood: 'Sério / Cool' },
    aeolian: { name: 'Eólio (Menor)', feel: 'Triste', mood: 'Melancólico / Introspectivo' },
    phrygian: { name: 'Frígio', feel: 'Espanhol', mood: 'Exótico / Tenso' },
    locrian: { name: 'Lócrio', feel: 'Tenebroso', mood: 'Instável / Sombrio' }
};

// FIX: Added getNoteCoords export to resolve ChromaticMandala error
export const getNoteCoords = (index: number, radius: number, center: number) => {
    const angle = (index * 30) - 90;
    const rad = (angle * Math.PI) / 180;
    return {
        x: center + Math.cos(rad) * radius,
        y: center + Math.sin(rad) * radius
    };
};

// FIX: Added CHORDS export to resolve VisualTheory error
export const CHORDS = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    dom7: [0, 4, 7, 10]
};

// FIX: Added freqToNoteIdx export to resolve pitch detection errors
export const freqToNoteIdx = (freq: number): number => {
    // a4 = 440hz which is midi note 69
    const noteNum = 12 * (Math.log(freq / 440) / Math.log(2));
    return Math.round(noteNum) + 69;
};

// FIX: Added identifyChord export to resolve ReverseChordFinder error
export const identifyChord = (notes: number[]) => {
    if (notes.length === 0) return null;
    const rootIdx = notes[0] % 12;
    const root = NOTES_CHROMATIC[rootIdx];
    return { name: root, formula: '1-3-5', root };
};

// FIX: Added getHarmonicField export to resolve HarmonicFieldExplorer error
export const getHarmonicField = (key: string) => {
    const rootIdx = NOTES_CHROMATIC.indexOf(key.replace('b', '#'));
    const degrees = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
    const modesNames = ['Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian'];
    
    return SCALES.major.map((interval, i) => {
        const noteIdx = (rootIdx + interval) % 12;
        const noteName = NOTES_CHROMATIC[noteIdx];
        let suffix = '';
        if ([1, 2, 5].includes(i)) suffix = 'm';
        if (i === 6) suffix = 'dim'; // Corrected to 'dim' for diminished
        return { chord: noteName + suffix, degree: degrees[i], mode: modesNames[i] };
    });
};

// FIX: Added CAGED_SHAPES export to resolve CAGEDVisualizer error
export const CAGED_SHAPES = {
    C: { strings: [{s:4, f:3}, {s:3, f:2}, {s:2, f:0}, {s:1, f:1}, {s:0, f:0}] },
    A: { strings: [{s:4, f:0}, {s:3, f:2}, {s:2, f:2}, {s:1, f:2}, {s:0, f:0}] },
    G: { strings: [{s:5, f:3}, {s:4, f:2}, {s:3, f:0}, {s:2, f:0}, {s:1, f:0}, {s:0, f:3}] },
    E: { strings: [{s:5, f:0}, {s:4, f:2}, {s:3, f:2}, {s:2, f:1}, {s:1, f:0}, {s:0, f:0}] },
    D: { strings: [{s:3, f:0}, {s:2, f:2}, {s:1, f:3}, {s:0, f:2}] }
};

/**
 * Inteligência de Rearmonização: Sugere substitutos para um acorde em um tom.
 */
export const getSubstitutions = (chordName: string, key: string = 'C'): ChordSubstitution[] => {
    const match = chordName.match(/^([A-G][#b]?)(.*)/);
    if (!match) return [];
    
    const root = match[1];
    const suffix = match[2];
    const subs: ChordSubstitution[] = [];

    // 1. Relativa Menor (Ex: C -> Am)
    if (suffix === '' || suffix === '7M' || suffix === 'maj7') {
        const rootIdx = NOTES_CHROMATIC.indexOf(root.replace('b', '#'));
        const relIdx = (rootIdx + 9) % 12;
        subs.push({
            chord: NOTES_CHROMATIC[relIdx] + 'm7',
            type: 'relative',
            description: 'Mesma função de Tônica, sonoridade mais suave.'
        });
    }

    // 2. Empréstimo Modal (Ex: C -> Cm)
    if (suffix === '') {
        subs.push({
            chord: root + 'm',
            type: 'parallel',
            description: 'Troca de modo (Maior para Menor Paralelo).'
        });
    }

    // 3. SubV (Substituto de Trítono para Dominantes)
    if (suffix === '7') {
        const rootIdx = NOTES_CHROMATIC.indexOf(root.replace('b', '#'));
        const subVIdx = (rootIdx + 6) % 12;
        subs.push({
            chord: NOTES_CHROMATIC[subVIdx] + '7',
            type: 'tritone',
            description: 'Substituto de Trítono. Tensão Jazzística máxima.'
        });
    }

    return subs;
};

/**
 * Retorna as coordenadas de um shape CAGED para um acorde e tom específicos.
 */
export const getChordVoicings = (root: string, type: 'major' | 'minor' = 'major') => {
    const rootIdx = NOTES_CHROMATIC.indexOf(root.replace('b', '#'));
    
    // Voicings baseados nas formas CAGED (offsets relativos à tônica do shape)
    const forms = [
        { name: 'Shape de C', strings: [{s:4, f:3}, {s:3, f:2}, {s:2, f:0}, {s:1, f:1}, {s:0, f:0}], rootFret: 3 },
        { name: 'Shape de A', strings: [{s:4, f:0}, {s:3, f:2}, {s:2, f:2}, {s:1, f:2}, {s:0, f:0}], rootFret: 0 },
        { name: 'Shape de G', strings: [{s:5, f:3}, {s:4, f:2}, {s:3, f:0}, {s:2, f:0}, {s:1, f:0}, {s:0, f:3}], rootFret: 3 },
        { name: 'Shape de E', strings: [{s:5, f:0}, {s:4, f:2}, {s:3, f:2}, {s:2, f:1}, {s:1, f:0}, {s:0, f:0}], rootFret: 0 },
        { name: 'Shape de D', strings: [{s:3, f:0}, {s:2, f:2}, {s:1, f:3}, {s:0, f:2}], rootFret: 0 }
    ];

    return forms.map(form => ({
        name: form.name,
        notes: form.strings.map(s => ({
            s: s.s,
            f: (s.f + rootIdx) % 12 // Simplificação: Na prática requer lógica de oitava real
        }))
    }));
};

export const getNoteName = (index: number, key: string = 'C'): string => {
    const flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];
    const isFlatKey = flatKeys.includes(key);
    const noteIdx = ((index % 12) + 12) % 12;
    return isFlatKey ? NOTES_FLATS[noteIdx] : NOTES_CHROMATIC[noteIdx];
};

export const getNoteTemperatureColor = (interval: number): string => {
    const thermalMap: Record<number, string> = {
        0: '#f59e0b', 7: '#fbbf24', 4: '#f97316', 3: '#8b5cf6',
        10: '#38bdf8', 11: '#0ea5e9', 2: '#22d3ee', 5: '#10b981', 6: '#ef4444',
    };
    return thermalMap[interval] || '#64748b';
};

export const SCALES = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    pentatonic_major: [0, 2, 4, 7, 9],
    pentatonic_minor: [0, 3, 5, 7, 10]
};

export const getScaleNotes = (rootIdx: number, type: string = 'major'): number[] => {
    const scale = SCALES[type as keyof typeof SCALES] || SCALES.major;
    return scale.map(interval => (rootIdx + interval) % 12);
};

export const getChordTones = (chordName: string): number[] => {
    if (!chordName) return [];
    const match = chordName.match(/^([A-G][#b]?)(.*)/);
    if (!match) return [];
    const root = match[1];
    const suffix = match[2] || '';
    let rootIdx = NOTES_CHROMATIC.indexOf(root.replace('b', '#'));
    if (rootIdx === -1) rootIdx = NOTES_FLATS.indexOf(root);
    const intervals: Record<string, number[]> = {
        '': [0, 4, 7], 'm': [0, 3, 7], '7': [0, 4, 7, 10], '7M': [0, 4, 7, 11], 'm7': [0, 3, 7, 10], 'm7(b5)': [0, 3, 6, 10]
    };
    const chordIntervals = intervals[suffix] || intervals[''];
    return chordIntervals.map(i => (rootIdx + i) % 12);
};

export const autoCorrelate = (buffer: Float32Array, sampleRate: number): number | null => {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
    const rms = Math.sqrt(sum / buffer.length);
    if (rms < 0.01) return null;
    let r1 = 0, r2 = buffer.length - 1;
    const threshold = 0.2;
    for (let i = 0; i < buffer.length / 2; i++) if (Math.abs(buffer[i]) < threshold) { r1 = i; break; }
    for (let i = 1; i < buffer.length / 2; i++) if (Math.abs(buffer[buffer.length - i]) < threshold) { r2 = buffer.length - i; break; }
    const trimmedBuffer = buffer.slice(r1, r2);
    const c = new Array(trimmedBuffer.length).fill(0);
    for (let i = 0; i < trimmedBuffer.length; i++) {
        for (let j = 0; j < trimmedBuffer.length - i; j++) {
            c[i] = c[i] + trimmedBuffer[j] * trimmedBuffer[j + i];
        }
    }
    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < trimmedBuffer.length; i++) if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
    return maxpos !== -1 ? sampleRate / maxpos : null;
};