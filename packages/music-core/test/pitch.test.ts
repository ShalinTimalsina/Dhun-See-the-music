import { test, expect, describe } from 'vitest';
import * as fc from 'fast-check';
import {
  PitchClassSpelled,
  getChroma,
  isEnharmonicallyEquivalent,
  formatPitchClass,
  Step,
  Alter,
} from '../src/pitch';

describe('Pitch Math', () => {
  const stepArb = fc.constantFrom('C', 'D', 'E', 'F', 'G', 'A', 'B') as fc.Arbitrary<Step>;
  const alterArb = fc.integer({ min: -2, max: 2 }) as fc.Arbitrary<Alter>;

  const pitchClassArb = fc.record({
    step: stepArb,
    alter: alterArb,
  });

  test('Chroma is always between 0 and 11', () => {
    fc.assert(
      fc.property(pitchClassArb, (pc) => {
        const chroma = getChroma(pc);
        expect(chroma).toBeGreaterThanOrEqual(0);
        expect(chroma).toBeLessThanOrEqual(11);
      }),
    );
  });

  test('Known enharmonic equivalents', () => {
    const cSharp: PitchClassSpelled = { step: 'C', alter: 1 };
    const dFlat: PitchClassSpelled = { step: 'D', alter: -1 };

    expect(isEnharmonicallyEquivalent(cSharp, dFlat)).toBe(true);
    expect(getChroma(cSharp)).toBe(1);
    expect(getChroma(dFlat)).toBe(1);

    const fFlat: PitchClassSpelled = { step: 'F', alter: -1 };
    const e: PitchClassSpelled = { step: 'E', alter: 0 };
    expect(isEnharmonicallyEquivalent(fFlat, e)).toBe(true);
    expect(getChroma(fFlat)).toBe(4);
    expect(getChroma(e)).toBe(4);

    const bSharp: PitchClassSpelled = { step: 'B', alter: 1 };
    const c: PitchClassSpelled = { step: 'C', alter: 0 };
    expect(isEnharmonicallyEquivalent(bSharp, c)).toBe(true);
    expect(getChroma(bSharp)).toBe(0);
    expect(getChroma(c)).toBe(0);
  });

  test('Formatting rules', () => {
    expect(formatPitchClass({ step: 'C', alter: 1 })).toBe('C♯');
    expect(formatPitchClass({ step: 'B', alter: -1 })).toBe('B♭');
    expect(formatPitchClass({ step: 'F', alter: 2 })).toBe('Fx');
    expect(formatPitchClass({ step: 'E', alter: -2 })).toBe('E♭♭');
    expect(formatPitchClass({ step: 'G', alter: 0 })).toBe('G');
  });
});
