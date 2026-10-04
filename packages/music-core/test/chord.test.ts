import { test, expect, describe } from 'vitest';
import { PitchClassSpelled, formatPitchClass } from '../src/pitch';
import { MAJOR_TRIAD, MINOR_TRIAD, DOMINANT_7, getChordPitches } from '../src/chord';
import { applyVoicing } from '../src/voicing';

describe('M3: Chords & Voicing', () => {
  test('Spells Major, Minor, and Dom7 chords correctly', () => {
    const root: PitchClassSpelled = { step: 'C', alter: 0 };

    const majorPitches = getChordPitches(root, MAJOR_TRIAD);
    expect(majorPitches.map(formatPitchClass)).toEqual(['C', 'E', 'G']);

    const minorPitches = getChordPitches(root, MINOR_TRIAD);
    expect(minorPitches.map(formatPitchClass)).toEqual(['C', 'E♭', 'G']);

    const dom7Pitches = getChordPitches(root, DOMINANT_7);
    expect(dom7Pitches.map(formatPitchClass)).toEqual(['C', 'E', 'G', 'B♭']);
  });

  test('Applies inversions correctly with monotonic octaves', () => {
    // C Major Triad [C, E, G]
    const root: PitchClassSpelled = { step: 'C', alter: 0 };
    const pitches = getChordPitches(root, MAJOR_TRIAD);

    // Root Position: C4, E4, G4
    const rootPos = applyVoicing(pitches, 4, 'root');
    expect(rootPos.map((n) => `${formatPitchClass(n.pitchClass)}${n.octave}`)).toEqual([
      'C4',
      'E4',
      'G4',
    ]);

    // 1st Inversion: E4, G4, C5 (C crosses the octave boundary)
    const firstInv = applyVoicing(pitches, 4, 'first');
    expect(firstInv.map((n) => `${formatPitchClass(n.pitchClass)}${n.octave}`)).toEqual([
      'E4',
      'G4',
      'C5',
    ]);

    // 2nd Inversion: G4, C5, E5
    const secondInv = applyVoicing(pitches, 4, 'second');
    expect(secondInv.map((n) => `${formatPitchClass(n.pitchClass)}${n.octave}`)).toEqual([
      'G4',
      'C5',
      'E5',
    ]);
  });
});
