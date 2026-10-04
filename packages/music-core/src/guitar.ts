import { PitchClassSpelled, Note, getChroma, isEnharmonicallyEquivalent } from './pitch';
import { ChordDef, getChordPitches } from './chord';

export type Tuning = Note[];

export const STANDARD_TUNING: Tuning = [
  { step: 'E', alter: 0, octave: 2 },
  { step: 'A', alter: 0, octave: 2 },
  { step: 'D', alter: 0, octave: 3 },
  { step: 'G', alter: 0, octave: 3 },
  { step: 'B', alter: 0, octave: 3 },
  { step: 'E', alter: 0, octave: 4 },
];

export const DROP_D_TUNING: Tuning = [
  { step: 'D', alter: 0, octave: 2 },
  ...STANDARD_TUNING.slice(1),
];

export interface GuitarShape {
  frets: number[]; // -1 = muted
  fingers: number[];
  soundingPitches: PitchClassSpelled[];
  score: number;
  label: 'Beginner' | 'Intermediate' | 'Advanced';
}

/**
 * Returns the sounding pitch class at a specific fret for a given open string Note.
 */
export function getPitchAtFret(openString: Note, fret: number): number {
  return (getChroma(openString) + fret) % 12;
}

/**
 * Search and generate valid guitar shapes for a given chord and tuning.
 */
export function generateShapes(
  root: PitchClassSpelled,
  chordDef: ChordDef,
  tuning: Tuning = STANDARD_TUNING,
  options?: {
    maxSpan?: number;
    maxFret?: number;
    allowInversions?: boolean;
    bass?: PitchClassSpelled;
  },
): GuitarShape[] {
  const maxSpan = options?.maxSpan || 4;
  const maxFret = options?.maxFret || 12;
  const targetPitches = getChordPitches(root, chordDef);
  const targetChromas = new Set(targetPitches.map((p) => getChroma(p)));

  const rootChroma = getChroma(options?.bass || root);

  const shapes: GuitarShape[] = [];

  // Generate windows (fret ranges). A window is defined by a minFret.
  // We check windows from minFret=1 to maxFret - maxSpan.
  // minFret=0 is a special case (open chords), handled naturally if we consider fret 0 always available.

  for (let minFret = 1; minFret <= maxFret - maxSpan + 1; minFret++) {
    // For each string, find valid frets: either 0, muted (-1), or a fret within [minFret, minFret + maxSpan - 1]
    const validFretsPerString = tuning.map((openString, stringIdx) => {
      const valid: number[] = [-1]; // always can mute

      // Check open string
      const openChroma = getPitchAtFret(openString, 0);
      if (targetChromas.has(openChroma)) valid.push(0);

      // Check frets in window
      for (let fret = minFret; fret < minFret + maxSpan; fret++) {
        const fretChroma = getPitchAtFret(openString, fret);
        if (targetChromas.has(fretChroma)) valid.push(fret);
      }
      return valid;
    });

    // Cartesian product to find all combinations
    const combinations = cartesianProduct(validFretsPerString);

    for (const combo of combinations) {
      if (isValidShape(combo, targetChromas, rootChroma, tuning, options?.allowInversions)) {
        shapes.push({
          frets: combo,
          fingers: guessFingers(combo), // A heuristic finger assigner
          soundingPitches: getSoundingPitches(combo, tuning, targetPitches),
          score: 0,
          label: 'Intermediate',
        });
      }
    }
  }

  // Deduplicate and score
  const uniqueShapes = deduplicateShapes(shapes);

  for (const s of uniqueShapes) {
    const scored = scoreShape(s.frets);
    s.score = scored.score;
    s.label = scored.label;
  }

  return uniqueShapes.sort((a, b) => a.score - b.score);
}

function cartesianProduct(arrays: number[][]): number[][] {
  return arrays.reduce<number[][]>(
    (a, b) => a.map((x) => b.map((y) => x.concat([y]))).flat(),
    [[]],
  );
}

function isValidShape(
  frets: number[],
  targetChromas: Set<number>,
  rootChroma: number,
  tuning: Tuning,
  allowInversions?: boolean,
): boolean {
  // 1. Must contain all required chord tones (we allow dropping the 5th for 7ths later, but strictly require all for now)
  const soundedChromas = new Set<number>();
  let lowestSoundedChroma = -1;
  let firstPlayedString = -1;

  for (let i = 0; i < frets.length; i++) {
    if (frets[i] !== -1) {
      const chroma = getPitchAtFret(tuning[i], frets[i]);
      soundedChromas.add(chroma);
      if (lowestSoundedChroma === -1) lowestSoundedChroma = chroma;
      if (firstPlayedString === -1) firstPlayedString = i;
    }
  }

  // Basic completeness check
  if (soundedChromas.size < Math.min(3, targetChromas.size)) return false;

  // 2. No muted strings between sounded strings (except at edges)
  let started = false;
  let ended = false;
  for (let i = 0; i < frets.length; i++) {
    if (frets[i] !== -1) {
      if (ended) return false; // Muted gap
      started = true;
    } else {
      if (started) ended = true;
    }
  }

  // 3. Bass note check
  if (!allowInversions && lowestSoundedChroma !== rootChroma) return false;

  return true;
}

function getSoundingPitches(
  frets: number[],
  tuning: Tuning,
  chordTones: PitchClassSpelled[],
): PitchClassSpelled[] {
  const res: PitchClassSpelled[] = [];
  for (let i = 0; i < frets.length; i++) {
    if (frets[i] !== -1) {
      const chroma = getPitchAtFret(tuning[i], frets[i]);
      // Find matching spelling
      const match = chordTones.find((t) => getChroma(t) === chroma);
      if (match) res.push(match);
    }
  }
  return res;
}

function guessFingers(frets: number[]): number[] {
  // Very simplistic barre/finger heuristc
  return frets.map((f) => (f > 0 ? 1 : f === 0 ? 0 : -1));
}

function deduplicateShapes(shapes: GuitarShape[]): GuitarShape[] {
  const seen = new Set<string>();
  const res: GuitarShape[] = [];
  for (const s of shapes) {
    const key = s.frets.join(',');
    if (!seen.has(key)) {
      seen.add(key);
      res.push(s);
    }
  }
  return res;
}

export function scoreShape(frets: number[]): {
  score: number;
  label: 'Beginner' | 'Intermediate' | 'Advanced';
} {
  let score = 0;
  let hasBarre = false;
  let maxFret = Math.max(...frets);

  if (maxFret > 5) score += 20;

  // ... more sophisticated scoring logic will go here
  let label: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
  if (score > 10) label = 'Intermediate';
  if (score > 30) label = 'Advanced';

  return { score, label };
}
