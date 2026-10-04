import { PitchClassSpelled, Note, Step } from './pitch';
import { ChordDef } from './chord';
import { Key, getDiatonicChords } from './key';
import { Tuning, GuitarShape, generateShapes, STANDARD_TUNING, getPitchAtFret } from './guitar';
import { CapoOption, capoOptions } from './capo';
import { renderProgression } from './transpose';

// Temporary structured reason type
export type StructuredReason = { type: string; message: string };

export function startFromPosition(
  stringIdx: number,
  fret: number,
  tuning: Tuning = STANDARD_TUNING,
): {
  note: Note;
  keySuggestions: { key: Key; reason: StructuredReason }[];
} {
  // stringIdx is 0-indexed (0 = High E)
  const openString = tuning[stringIdx];

  // Calculate sounding midi or pitch. We just need pitch class here for the keys.
  const chroma = getPitchAtFret(openString, fret);

  // Convert chroma back to a spelled Note.
  // Standard spelling logic, default to sharps for simple keys.
  const CHROMATIC_STEPS = [
    { step: 'C', alter: 0 },
    { step: 'C', alter: 1 },
    { step: 'D', alter: 0 },
    { step: 'E', alter: -1 },
    { step: 'E', alter: 0 },
    { step: 'F', alter: 0 },
    { step: 'F', alter: 1 },
    { step: 'G', alter: 0 },
    { step: 'G', alter: 1 },
    { step: 'A', alter: 0 },
    { step: 'B', alter: -1 },
    { step: 'B', alter: 0 },
  ];

  const pc = CHROMATIC_STEPS[chroma] as PitchClassSpelled;

  // Naive octave calculation
  const octave = openString.octave + Math.floor((getPitchAtFret(openString, 0) + fret) / 12);

  const note: Note = { step: pc.step as Step, alter: pc.alter as any, octave };

  // Suggest Keys (Major and Minor of that root)
  const keySuggestions = [
    {
      key: { tonic: pc, mode: 'major' } as Key,
      reason: { type: 'bright', message: 'Major chords feel happy and bright.' },
    },
    {
      key: { tonic: pc, mode: 'minor' } as Key,
      reason: {
        type: 'sad',
        message: 'Minor chords feel sadder because the middle note is lower.',
      },
    },
  ];

  return { note, keySuggestions };
}

export interface PaletteChord {
  chord: { root: PitchClassSpelled; chordDef: ChordDef; bass?: PitchClassSpelled };
  numeral: string;
  function: string; // tonic, subdominant, dominant
  shapes: GuitarShape[];
}

export function chordPalette(
  key: Key,
  options?: { level?: string; tuning?: Tuning; capoAllowed?: boolean },
): {
  diatonic: PaletteChord[];
  popularProgressions: { root: PitchClassSpelled; chordDef: ChordDef }[][];
  easierAlternatives: Record<string, GuitarShape[]>;
  capoOptions: CapoOption[];
} {
  const diatonicChords = getDiatonicChords(key);
  const tuning = options?.tuning || STANDARD_TUNING;

  const diatonic = diatonicChords.map((d) => {
    // Determine function
    let func = 'unknown';
    if (d.numeral.toUpperCase() === 'I' || d.numeral.toUpperCase() === 'VI') func = 'tonic';
    if (d.numeral.toUpperCase() === 'IV' || d.numeral.toUpperCase() === 'II') func = 'subdominant';
    if (d.numeral.toUpperCase() === 'V' || d.numeral.toUpperCase() === 'VII°') func = 'dominant';

    return {
      chord: { root: d.root, chordDef: d.chord },
      numeral: d.numeral,
      function: func,
      shapes: generateShapes(d.root, d.chord, tuning, { maxFret: 5 }),
    };
  });

  const popularProgressions = [
    renderProgression({ key, steps: ['I', 'V', 'vi', 'IV'] }),
    renderProgression({ key, steps: ['ii', 'V', 'I'] }),
  ];

  const easierAlternatives: Record<string, GuitarShape[]> = {};
  for (const d of diatonic) {
    // E.g., for F major, suggest Fmaj7 (xx3210)
    const sym = `${d.chord.root.step}${d.chord.chordDef.symbol}`;
    easierAlternatives[sym] = generateShapes(d.chord.root, d.chord.chordDef, tuning, {
      maxFret: 3,
      maxSpan: 3,
    });
  }

  const capoOpts = options?.capoAllowed
    ? capoOptions(
        diatonic.map((d) => d.chord),
        { tuning },
      )
    : [];

  return {
    diatonic,
    popularProgressions,
    easierAlternatives,
    capoOptions: capoOpts,
  };
}

export function easierAlternatives(
  root: PitchClassSpelled,
  chordDef: ChordDef,
  tuning: Tuning = STANDARD_TUNING,
): GuitarShape[] {
  // A beginner substitute might be restricting span to 3 frets and allowing inversions
  return generateShapes(root, chordDef, tuning, { maxFret: 3, maxSpan: 3, allowInversions: true });
}

export function whatNext(
  progressionSoFar: { root: PitchClassSpelled; chordDef: ChordDef }[],
  key: Key,
  mood?: string,
): {
  chord: { root: PitchClassSpelled; chordDef: ChordDef };
  reasons: StructuredReason[];
  score: number;
}[] {
  // Simplistic whatNext returning the I, IV, or V depending on length
  const diatonic = getDiatonicChords(key);

  const suggestions = [];
  if (progressionSoFar.length % 2 === 0) {
    // Suggest V or IV
    const V = diatonic.find((d) => d.numeral.toUpperCase() === 'V');
    if (V)
      suggestions.push({
        chord: { root: V.root, chordDef: V.chord },
        reasons: [{ type: 'tension', message: 'Builds tension back to home.' }],
        score: 10,
      });
  } else {
    // Suggest vi or I
    const I = diatonic.find((d) => d.numeral.toUpperCase() === 'I');
    if (I)
      suggestions.push({
        chord: { root: I.root, chordDef: I.chord },
        reasons: [{ type: 'home', message: 'Feels resolved and complete.' }],
        score: 10,
      });
  }

  return suggestions;
}
