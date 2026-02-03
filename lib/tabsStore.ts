
export interface TabNote {
  string: number;
  fret: number | string;
}

export interface TabMeasure {
  notes: TabNote[];
}

export interface TabExercise {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'pro';
  measures: TabMeasure[];
}

export const EXERCISES_DATABASE: TabExercise[] = [
  {
    id: 'spider-walk-v1',
    title: 'Caminhada da Aranha (1-2-3-4)',
    difficulty: 'beginner',
    measures: [
      { notes: [{ string: 6, fret: 1 }, { string: 6, fret: 2 }, { string: 6, fret: 3 }, { string: 6, fret: 4 }] },
      { notes: [{ string: 5, fret: 1 }, { string: 5, fret: 2 }, { string: 5, fret: 3 }, { string: 5, fret: 4 }] },
      { notes: [{ string: 4, fret: 1 }, { string: 4, fret: 2 }, { string: 4, fret: 3 }, { string: 4, fret: 4 }] },
      { notes: [{ string: 6, fret: 4 }, { string: 6, fret: 3 }, { string: 6, fret: 2 }, { string: 6, fret: 1 }] },
    ]
  },
  {
    id: 'c-major-scale',
    title: 'Escala de Dó Maior (Posição 1)',
    difficulty: 'beginner',
    measures: [
      { notes: [{ string: 5, fret: 3 }, { string: 4, fret: 0 }, { string: 4, fret: 2 }, { string: 4, fret: 3 }] },
      { notes: [{ string: 3, fret: 0 }, { string: 3, fret: 2 }, { string: 2, fret: 0 }, { string: 2, fret: 1 }] },
    ]
  },
  {
    id: 'e-minor-arpeggio',
    title: 'Arpejo Mi Menor (Fluidez)',
    difficulty: 'intermediate',
    measures: [
      { notes: [{ string: 6, fret: 0 }, { string: 5, fret: 2 }, { string: 4, fret: 2 }, { string: 3, fret: 0 }] },
      { notes: [{ string: 2, fret: 0 }, { string: 1, fret: 0 }, { string: 2, fret: 0 }, { string: 3, fret: 0 }] },
    ]
  }
];

// FIX: Added missing RENAN_SERPA_TABS export to resolve import errors in PracticeRoom and TechniqueGym
/**
 * Repositório de tablaturas AlphaTex da Metodologia Renan Serpa.
 * Utilizado pelo Motor de Sincronia de Áudio Maestro para exercícios técnicos e repertório inicial.
 */
export const RENAN_SERPA_TABS = {
    spider_walk_v1: "1.6 2.6 3.6 4.6 | 1.5 2.5 3.5 4.5 | 1.4 2.4 3.4 4.4 | 4.4 3.4 2.4 1.4 | 4.5 3.5 2.5 1.5 | 4.6 3.6 2.6 1.6",
    thumb_jump: "0.6 0.4 0.6 0.4 | 0.5 0.3 0.5 0.3 | 0.6 0.5 0.4 0.3 | 0.3 0.4 0.5 0.6",
    seven_nation_army: "7.5 7.5 10.5 7.5 5.5 3.5 2.5 | 7.5 7.5 10.5 7.5 5.5 3.5 5.5 3.5 2.5"
};
