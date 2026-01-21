
export interface MusicalNote {
    id: string;
    time: number;
    fret: number;
    string: number;
    duration: number;
    measure: number;
}

export const parseAlphaTexToSchedule = (alphaTex: string, bpm: number): MusicalNote[] => {
    // Limpeza básica e separação por compassos
    const measures = alphaTex.split('|');
    const beatDuration = 60 / bpm;
    const notes: MusicalNote[] = [];
    
    let currentTime = 0;

    measures.forEach((measureText, mIdx) => {
        // Regex para capturar notas no formato fret.string (ex: 7.5)
        const notePattern = /(\d+)\.(\d+)/g;
        const matches = Array.from(measureText.matchAll(notePattern));
        
        // Se um compasso não tem notas, assumimos que ele dura 4 tempos (padrão)
        // Se tem notas, distribuímos as notas linearmente pelo compasso para este estágio
        const notesInMeasure = matches.length;
        const measureDuration = 4 * beatDuration; 
        const interval = notesInMeasure > 0 ? measureDuration / notesInMeasure : measureDuration;

        matches.forEach((match, nIdx) => {
            const fret = parseInt(match[1]);
            const string = parseInt(match[2]);
            
            notes.push({
                id: `m${mIdx}-n${nIdx}-${fret}-${string}`,
                time: currentTime + (nIdx * interval),
                fret,
                string,
                duration: interval * 0.8, // 80% do intervalo como duração visual
                measure: mIdx + 1
            });
        });

        currentTime += measureDuration;
    });

    return notes;
};
