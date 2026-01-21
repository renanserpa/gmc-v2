
export const KONNAKKOL_MAP: Record<number, string> = {
    1: 'Ta',
    2: 'Ta-Ka',
    3: 'Ta-Ki-Ta',
    4: 'Ta-Ka-Di-Mi',
    5: 'Ta-Di-Gi-Na-Tum',
    6: 'Ta-Ka Ta-Ki-Ta',
    7: 'Ta-Ki-Ta Ta-Ka-Di-Mi',
    8: 'Ta-Ka-Di-Mi Ta-Ka-Di-Mi'
};

/**
 * Converte uma sequência de subdivisões em sílabas Konnakkol
 * Ex: [2, 3] -> "Ta-Ka Ta-Ki-Ta"
 */
export const generateKonnakkol = (pattern: number[]): string => {
    return pattern.map(n => KONNAKKOL_MAP[n] || 'Ta').join(' ');
};

export const getKonnakkolForBeat = (beat: number, totalBeats: number): string => {
    // Retorna a sílaba correspondente ao tempo atual (simplificado)
    const syllables = KONNAKKOL_MAP[totalBeats]?.split('-') || ['Ta'];
    return syllables[beat % syllables.length];
};
