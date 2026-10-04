import { test, expect, describe } from 'vitest';
import { PitchClassSpelled, formatPitchClass } from '../src/pitch';
import { MAJOR_SCALE, NATURAL_MINOR_SCALE, getScalePitches } from '../src/scale';
import { Key, getKeySignature } from '../src/key';

// Golden Table for all 12 Major Keys
const MAJOR_GOLDEN_TABLE: Record<string, { sig: number; scale: string[] }> = {
  C: { sig: 0, scale: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
  G: { sig: 1, scale: ['G', 'A', 'B', 'C', 'D', 'E', 'F♯'] },
  D: { sig: 2, scale: ['D', 'E', 'F♯', 'G', 'A', 'B', 'C♯'] },
  A: { sig: 3, scale: ['A', 'B', 'C♯', 'D', 'E', 'F♯', 'G♯'] },
  E: { sig: 4, scale: ['E', 'F♯', 'G♯', 'A', 'B', 'C♯', 'D♯'] },
  B: { sig: 5, scale: ['B', 'C♯', 'D♯', 'E', 'F♯', 'G♯', 'A♯'] },
  'F♯': { sig: 6, scale: ['F♯', 'G♯', 'A♯', 'B', 'C♯', 'D♯', 'E♯'] },
  F: { sig: -1, scale: ['F', 'G', 'A', 'B♭', 'C', 'D', 'E'] },
  'B♭': { sig: -2, scale: ['B♭', 'C', 'D', 'E♭', 'F', 'G', 'A'] },
  'E♭': { sig: -3, scale: ['E♭', 'F', 'G', 'A♭', 'B♭', 'C', 'D'] },
  'A♭': { sig: -4, scale: ['A♭', 'B♭', 'C', 'D♭', 'E♭', 'F', 'G'] },
  'D♭': { sig: -5, scale: ['D♭', 'E♭', 'F', 'G♭', 'A♭', 'B♭', 'C'] },
  'G♭': { sig: -6, scale: ['G♭', 'A♭', 'B♭', 'C♭', 'D♭', 'E♭', 'F'] },
};

describe('Golden Tables: Scales and Keys', () => {
  test('All 12 Major Keys spell perfectly', () => {
    for (const [tonicStr, expected] of Object.entries(MAJOR_GOLDEN_TABLE)) {
      const step = tonicStr[0] as any;
      const alter = tonicStr.includes('♯') ? 1 : tonicStr.includes('♭') ? -1 : 0;
      const root: PitchClassSpelled = { step, alter };

      const spelled = getScalePitches(root, MAJOR_SCALE);
      const spelledStrs = spelled.map(formatPitchClass);

      expect(spelledStrs).toEqual(expected.scale);

      const key: Key = { tonic: root, mode: 'major' };
      expect(getKeySignature(key)).toBe(expected.sig);
    }
  });

  test('A Natural Minor spells correctly relative to C Major', () => {
    const root: PitchClassSpelled = { step: 'A', alter: 0 };
    const spelled = getScalePitches(root, NATURAL_MINOR_SCALE);
    const spelledStrs = spelled.map(formatPitchClass);

    expect(spelledStrs).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);

    const key: Key = { tonic: root, mode: 'minor' };
    expect(getKeySignature(key)).toBe(0);
  });
});
