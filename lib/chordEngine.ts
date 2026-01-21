
const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Mapeamento de preferências enarmônicas por tom alvo
const PREFERENCE_MAP: Record<string, 'sharps' | 'flats'> = {
    'C': 'sharps', 'G': 'sharps', 'D': 'sharps', 'A': 'sharps', 'E': 'sharps', 'B': 'sharps',
    'F': 'flats', 'Bb': 'flats', 'Eb': 'flats', 'Ab': 'flats', 'Db': 'flats', 'Gb': 'flats'
};

export const transposeChord = (chord: string, semitones: number, preference: 'sharps' | 'flats' = 'sharps'): string => {
    const match = chord.match(/^([A-G][#b]?)(.*)/);
    if (!match) return chord;

    let root = match[1];
    const suffix = match[2];

    let index = SHARPS.indexOf(root);
    if (index === -1) index = FLATS.indexOf(root);
    if (index === -1) return chord;

    let newIndex = (index + semitones) % 12;
    if (newIndex < 0) newIndex += 12;

    const scale = preference === 'sharps' ? SHARPS : FLATS;
    return scale[newIndex] + suffix;
};

export const parseChordPro = (content: string, transposition: number = 0) => {
    // Detecta o tom de destino via localStorage para alinhar enarmonia com o Circle of Fifths
    const targetKey = localStorage.getItem('maestro_target_key') || 'C';
    const preference = PREFERENCE_MAP[targetKey] || 'sharps';

    return content.split('\n').map(line => {
        if (!line.includes('[')) return `<div class="lyric-line">${line}</div>`;

        let chordLine = '';
        let lastIdx = 0;

        const regex = /\[(.*?)\]/g;
        let m;
        while ((m = regex.exec(line)) !== null) {
            const chord = m[1];
            const transposed = transposeChord(chord, transposition, preference);
            
            const offset = m.index;
            const spaces = offset - lastIdx;
            chordLine += '&nbsp;'.repeat(Math.max(0, spaces)) + `<span class="chord font-black text-sky-500">${transposed}</span>`;
            
            lastIdx = offset + m[0].length;
        }

        const cleanLyrics = line.replace(/\[.*?\]/g, '');
        
        return `
            <div class="chord-row flex flex-col mb-4 leading-none group cursor-default">
                <div className="chord-line font-mono text-xs h-4 overflow-visible whitespace-nowrap opacity-90 group-hover:opacity-100 transition-opacity">${chordLine}</div>
                <div class="text-line text-slate-800 text-lg font-medium">${cleanLyrics}</div>
            </div>
        `;
    }).join('');
};
