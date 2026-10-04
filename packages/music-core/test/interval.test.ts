import { test, expect, describe } from 'vitest';
import * as fc from 'fast-check';
import { Interval, invertInterval, Quality } from '../src/interval';

describe('Interval Math', () => {
  // Arbitrary for interval numbers 1 through 7 (simple intervals)
  const intervalNumberArb = fc.integer({ min: 1, max: 7 });
  const qualityArb = fc.constantFrom('P', 'M', 'm', 'A', 'd', 'AA', 'dd') as fc.Arbitrary<Quality>;

  const intervalArb = fc.record({
    number: intervalNumberArb,
    quality: qualityArb,
  });

  test('Interval inversion round-trips correctly', () => {
    // Inverting an interval twice should return the original interval
    fc.assert(
      fc.property(intervalArb, (interval) => {
        const inverted = invertInterval(interval);
        const doubleInverted = invertInterval(inverted);
        expect(doubleInverted).toEqual(interval);
      }),
    );
  });

  test('Numbers invert to 9 minus original', () => {
    fc.assert(
      fc.property(intervalNumberArb, (num) => {
        const interval: Interval = { number: num, quality: 'P' };
        expect(invertInterval(interval).number).toBe(9 - num);
      }),
    );
  });

  test('Known inversions', () => {
    // Major 3rd -> Minor 6th
    expect(invertInterval({ number: 3, quality: 'M' })).toEqual({ number: 6, quality: 'm' });

    // Perfect 5th -> Perfect 4th
    expect(invertInterval({ number: 5, quality: 'P' })).toEqual({ number: 4, quality: 'P' });

    // Augmented 4th -> Diminished 5th
    expect(invertInterval({ number: 4, quality: 'A' })).toEqual({ number: 5, quality: 'd' });
  });
});
