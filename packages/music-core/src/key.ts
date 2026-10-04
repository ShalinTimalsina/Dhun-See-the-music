import { PitchClassSpelled } from './pitch';
import { ScaleDef, getScalePitches, MAJOR_SCALE, NATURAL_MINOR_SCALE } from './scale';
import { ChordDef, classifyChord, MAJOR_TRIAD } from './chord';

export interface Key {
  tonic: PitchClassSpelled;
  mode: 'major' | 'minor'; // Corresponds to scale definitions
}

/**
 * Returns the diatonic pitches of the key correctly spelled.
 */
export function getKeyPitches(key: Key): PitchClassSpelled[] {
  const scaleDef = key.mode === 'major' ? MAJOR_SCALE : NATURAL_MINOR_SCALE;
  return getScalePitches(key.tonic, scaleDef);
}

/**
 * Determines the key signature as the number of sharps (positive) or flats (negative).
 * Uses the circle of fifths math relative to C Major / A Minor.
 */
export function getKeySignature(key: Key): number {
  const pitches = getKeyPitches(key);

  let sharps = 0;
  let flats = 0;

  for (const p of pitches) {
    if (p.alter > 0) sharps += p.alter;
    if (p.alter < 0) flats += Math.abs(p.alter);
  }

  // Standard keys do not mix sharps and flats in the signature
  if (sharps > 0) return sharps;
  if (flats > 0) return -flats;
  return 0; // C major / A minor
}

/**
 * Returns the diatonic chords for a given key by stacking 3rds from the scale.
 * Classifies them dynamically against the chord registry.
 */
export function getDiatonicChords(
  key: Key,
  options?: { sevenths?: boolean },
): { root: PitchClassSpelled; chord: ChordDef; numeral: string }[] {
  const pitches = getKeyPitches(key);
  const chords: { root: PitchClassSpelled; chord: ChordDef; numeral: string }[] = [];

  const numeralsMaj = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

  for (let i = 0; i < 7; i++) {
    const root = pitches[i];
    const third = pitches[(i + 2) % 7];
    const fifth = pitches[(i + 4) % 7];
    const seventh = pitches[(i + 6) % 7];

    const chordPitches = options?.sevenths ? [root, third, fifth, seventh] : [root, third, fifth];

    // Classify using the interval engine
    let chordDef = classifyChord(chordPitches);

    // Fallback if not perfectly classified (should not happen for standard diatonic scales)
    if (!chordDef) {
      chordDef = MAJOR_TRIAD; // safe fallback
    }

    // Determine Roman numeral casing based on classified chord quality
    let numeral = numeralsMaj[i];
    const isMinor = chordDef.id.startsWith('minor') || chordDef.id === 'm7';
    const isDim = chordDef.id.startsWith('dim') || chordDef.id === 'm7b5';

    if (isMinor || isDim) {
      numeral = numeral.toLowerCase();
    }
    if (isDim) {
      numeral += '°';
    }

    // Special seventh labels
    if (options?.sevenths) {
      if (chordDef.id === 'maj7') numeral += 'maj7';
      else if (chordDef.id === 'm7') numeral += '7';
      else if (chordDef.id === '7')
        numeral += '7'; // dominant 7
      else if (chordDef.id === 'm7b5') numeral = numeral.replace('°', 'ø7'); // half-dim
    }

    chords.push({ root, chord: chordDef, numeral });
  }

  return chords;
}
