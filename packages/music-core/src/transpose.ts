import { PitchClassSpelled, Step, Alter, getChroma } from './pitch';
import { Interval, invertInterval } from './interval';
import { ChordDef } from './chord';
import { Key, getDiatonicChords } from './key';
import { MAJOR_TRIAD, MINOR_TRIAD } from './chord';

const STEP_ORDER: Step[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

/**
 * Transposes a spelled pitch class by an interval using letter-step arithmetic.
 */
export function transposePitch(pitch: PitchClassSpelled, interval: Interval): PitchClassSpelled {
  const rootStepIndex = STEP_ORDER.indexOf(pitch.step);

  // 1. Calculate target step (number - 1 because unison is 1)
  const targetStepIndex = (rootStepIndex + interval.number - 1) % 7;
  const targetStep = STEP_ORDER[targetStepIndex];

  // 2. Calculate target chroma
  const rootChroma = getChroma(pitch);
  const intervalSemitones = getIntervalSemitones(interval);
  const targetChroma = (rootChroma + intervalSemitones) % 12;

  // 3. Find correct alteration for target step
  const baseTargetChroma = getChroma({ step: targetStep, alter: 0 });
  let alter = targetChroma - baseTargetChroma;
  if (alter > 6) alter -= 12;
  if (alter < -5) alter += 12;

  return {
    step: targetStep,
    alter: alter as Alter,
  };
}

export function transposeChord(
  root: PitchClassSpelled,
  chordDef: ChordDef,
  interval: Interval,
  bass?: PitchClassSpelled,
): { root: PitchClassSpelled; chordDef: ChordDef; bass?: PitchClassSpelled } {
  const newRoot = transposePitch(root, interval);
  const newBass = bass ? transposePitch(bass, interval) : undefined;
  return { root: newRoot, chordDef, bass: newBass };
}

// Helpers for the interval semitones
function getIntervalSemitones(interval: Interval): number {
  const baseSemitones = [0, 2, 4, 5, 7, 9, 11][interval.number - 1]; // relative to major scale

  let adjustment = 0;
  if (['2', '3', '6', '7'].includes(interval.number.toString())) {
    if (interval.quality === 'm') adjustment = -1;
    if (interval.quality === 'd') adjustment = -2;
    if (interval.quality === 'A') adjustment = 1;
    if (interval.quality === 'AA') adjustment = 2;
  } else {
    if (interval.quality === 'd') adjustment = -1;
    if (interval.quality === 'A') adjustment = 1;
    if (interval.quality === 'dd') adjustment = -2;
  }

  return baseSemitones + adjustment;
}

export interface Progression {
  key: Key;
  steps: string[]; // e.g. ['I', 'IV', 'V']
}

export function renderProgression(
  prog: Progression,
): { root: PitchClassSpelled; chordDef: ChordDef; bass?: PitchClassSpelled }[] {
  // A simple implementation that parses diatonic roman numerals
  const diatonic = getDiatonicChords(prog.key, { sevenths: true });
  const triadDiatonic = getDiatonicChords(prog.key, { sevenths: false });

  return prog.steps.map((numeral) => {
    // Find the chord matching the numeral exactly, checking 7th and triad forms
    const match =
      diatonic.find((d) => d.numeral === numeral) ||
      triadDiatonic.find((d) => d.numeral === numeral);
    if (match) {
      return { root: match.root, chordDef: match.chord };
    }
    // Fallback if numeral isn't strictly diatonic (e.g., 'II' in Lydian)
    const numeralsMaj = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    // Find the longest matching prefix (to handle 'III' vs 'II' correctly)
    const baseNumeral = numeralsMaj
      .slice()
      .sort((a, b) => b.length - a.length)
      .find((n) => numeral.toUpperCase().startsWith(n));
    if (baseNumeral) {
      const baseIndex = numeralsMaj.indexOf(baseNumeral);
      const root = triadDiatonic[baseIndex].root;
      const isMinor =
        numeral.toLowerCase() === numeral &&
        !numeral.toUpperCase().includes('DIM') &&
        !numeral.includes('°');
      return { root, chordDef: isMinor ? MINOR_TRIAD : MAJOR_TRIAD };
    }

    throw new Error(`Numeral ${numeral} not supported in basic renderProgression yet`);
  });
}
