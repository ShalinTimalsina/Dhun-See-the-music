import { Interval, getIntervalBetween, Quality } from './interval';
import { PitchClassSpelled, Step, Alter, getChroma } from './pitch';

export interface ChordDef {
  id: string;
  name: string;
  symbol: string;
  intervals: Interval[];
}

function makeChord(id: string, name: string, symbol: string, intStr: string): ChordDef {
  const intervals = intStr.split(' ').map((s) => {
    const match = s.match(/^(\d+)(P|M|m|A|d|AA|dd)$/);
    if (!match) throw new Error(`Invalid interval string: ${s}`);
    return { number: parseInt(match[1]), quality: match[2] as Quality };
  });
  return { id, name, symbol, intervals };
}

// Triads
export const MAJOR_TRIAD = makeChord('major', 'Major', '', '1P 3M 5P');
export const MINOR_TRIAD = makeChord('minor', 'Minor', 'm', '1P 3m 5P');
export const DIMINISHED_TRIAD = makeChord('dim', 'Diminished', 'dim', '1P 3m 5d');
export const AUGMENTED_TRIAD = makeChord('aug', 'Augmented', 'aug', '1P 3M 5A');

// Sus chords
export const SUS2_TRIAD = makeChord('sus2', 'Suspended 2nd', 'sus2', '1P 2M 5P');
export const SUS4_TRIAD = makeChord('sus4', 'Suspended 4th', 'sus4', '1P 4P 5P');

// Sevenths
export const DOMINANT_7 = makeChord('7', 'Dominant 7th', '7', '1P 3M 5P 7m');
export const MAJOR_7 = makeChord('maj7', 'Major 7th', 'maj7', '1P 3M 5P 7M');
export const MINOR_7 = makeChord('m7', 'Minor 7th', 'm7', '1P 3m 5P 7m');
export const HALF_DIMINISHED_7 = makeChord('m7b5', 'Half-Diminished 7th', 'm7b5', '1P 3m 5d 7m');
export const DIMINISHED_7 = makeChord('dim7', 'Diminished 7th', 'dim7', '1P 3m 5d 7d');
export const MINOR_MAJOR_7 = makeChord('mmaj7', 'Minor-Major 7th', 'mMaj7', '1P 3m 5P 7M');

// Sixths
export const MAJOR_6 = makeChord('6', 'Major 6th', '6', '1P 3M 5P 6M');
export const MINOR_6 = makeChord('m6', 'Minor 6th', 'm6', '1P 3m 5P 6M');

// Extended (9ths) - mapped to 1 octave for simplicity in this engine right now (2=9)
export const ADD_9 = makeChord('add9', 'Add 9', 'add9', '1P 2M 3M 5P'); // 2M represents 9th
export const DOMINANT_9 = makeChord('9', 'Dominant 9th', '9', '1P 2M 3M 5P 7m');
export const MAJOR_9 = makeChord('maj9', 'Major 9th', 'maj9', '1P 2M 3M 5P 7M');
export const MINOR_9 = makeChord('m9', 'Minor 9th', 'm9', '1P 2M 3m 5P 7m');

export const CHORD_REGISTRY = [
  MAJOR_TRIAD,
  MINOR_TRIAD,
  DIMINISHED_TRIAD,
  AUGMENTED_TRIAD,
  SUS2_TRIAD,
  SUS4_TRIAD,
  DOMINANT_7,
  MAJOR_7,
  MINOR_7,
  HALF_DIMINISHED_7,
  DIMINISHED_7,
  MINOR_MAJOR_7,
  MAJOR_6,
  MINOR_6,
  ADD_9,
  DOMINANT_9,
  MAJOR_9,
  MINOR_9,
];

/**
 * Classifies an array of pitches into a ChordDef if it matches one exactly.
 * Assumes pitches[0] is the root.
 */
export function classifyChord(pitches: PitchClassSpelled[]): ChordDef | null {
  if (pitches.length < 3) return null;
  const root = pitches[0];

  const intervals = pitches.map((p) => getIntervalBetween(root, p));

  for (const def of CHORD_REGISTRY) {
    if (def.intervals.length !== intervals.length) continue;

    // Check if every interval in the definition is present
    const isMatch = def.intervals.every((defInt) =>
      intervals.some(
        (actualInt) => actualInt.number === defInt.number && actualInt.quality === defInt.quality,
      ),
    );

    if (isMatch) return def;
  }

  return null;
}

export function parseChord(
  symbol: string,
): { root: PitchClassSpelled; chordDef: ChordDef; bass?: PitchClassSpelled } | null {
  // Regex to match: [Root][Alteration][Quality][.../Bass]
  // e.g. C#maj7/G#
  const regex = /^([A-G])([#b♯♭]?)((?:maj|m|dim|aug|sus|add)?\d*(?:b5)?)(?:\/([A-G])([#b♯♭]?))?$/;
  const match = symbol.match(regex);
  if (!match) return null;

  const [, rootStep, rootAlterStr, quality, bassStep, bassAlterStr] = match;

  const parseAlter = (a: string): Alter => {
    if (a === '#' || a === '♯') return 1;
    if (a === 'b' || a === '♭') return -1;
    return 0;
  };

  const root: PitchClassSpelled = { step: rootStep as Step, alter: parseAlter(rootAlterStr) };
  let bass: PitchClassSpelled | undefined = undefined;
  if (bassStep) {
    bass = { step: bassStep as Step, alter: parseAlter(bassAlterStr) };
  }

  // Find chord def by symbol
  // Map common aliases
  const aliases: Record<string, string> = {
    '': 'major',
    M: 'major',
    '-': 'minor',
    min: 'minor',
    M7: 'maj7',
    ø: 'm7b5',
    dim: 'dim',
    '°': 'dim',
  };

  const searchSymbol = aliases[quality] || quality;

  const chordDef = CHORD_REGISTRY.find((c) => c.symbol === searchSymbol || c.id === searchSymbol);

  if (!chordDef) return null;

  return { root, chordDef, bass };
}

export function formatChord(
  root: PitchClassSpelled,
  chordDef: ChordDef,
  options?: { style?: 'standard' | 'jazz'; bass?: PitchClassSpelled },
): string {
  let rootStr = `${root.step}${root.alter === 1 ? '♯' : root.alter === -1 ? '♭' : ''}`;
  let sym = chordDef.symbol;

  if (options?.style === 'jazz') {
    if (sym === 'maj7') sym = 'M7';
    if (sym === 'm7b5') sym = 'ø';
    if (sym === 'dim7') sym = '°7';
    if (sym === 'm') sym = '-';
  }

  let res = `${rootStr}${sym}`;
  if (options?.bass) {
    res += `/${options.bass.step}${options.bass.alter === 1 ? '♯' : options.bass.alter === -1 ? '♭' : ''}`;
  }

  return res;
}

const STEP_ORDER: Step[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

/**
 * Given a root pitch class and a chord definition, returns the spelled pitch classes for the chord.
 * Reuses the same robust interval math as scale spelling.
 */
export function getChordPitches(root: PitchClassSpelled, chord: ChordDef): PitchClassSpelled[] {
  const rootStepIndex = STEP_ORDER.indexOf(root.step);

  return chord.intervals.map((interval) => {
    // Target letter name based on interval number
    const targetStepIndex = (rootStepIndex + interval.number - 1) % 7;
    const targetStep = STEP_ORDER[targetStepIndex];

    // Target chroma based on semitones
    const rootChroma = getChroma(root);
    const intervalSemitones = getIntervalSemitones(interval);
    const targetChroma = (rootChroma + intervalSemitones) % 12;

    // Base chroma of the un-altered target step
    const baseTargetChroma = getChroma({ step: targetStep, alter: 0 });

    // Find correct alteration
    let alter = targetChroma - baseTargetChroma;
    if (alter > 6) alter -= 12;
    if (alter < -5) alter += 12;

    return {
      step: targetStep,
      alter: alter as Alter,
    };
  });
}

function getIntervalSemitones(interval: Interval): number {
  const baseSemitones = [0, 2, 4, 5, 7, 9, 11][interval.number - 1]; // for Major scale

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
