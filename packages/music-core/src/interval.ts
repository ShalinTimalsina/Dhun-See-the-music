export type Quality = 'P' | 'M' | 'm' | 'A' | 'd' | 'AA' | 'dd';
import { PitchClassSpelled, getChroma, Step } from './pitch';

export interface Interval {
  number: number; // 1 = unison, 2 = second, 3 = third, etc.
  quality: Quality;
}

/**
 * Inverts an interval (e.g. Major 3rd becomes Minor 6th).
 *
 * Rules for inversion:
 * 1. The new number is 9 minus the old number (for simple intervals).
 * 2. Perfect (P) remains Perfect (P).
 * 3. Major (M) becomes Minor (m) and vice versa.
 * 4. Augmented (A) becomes diminished (d) and vice versa.
 * 5. Double Augmented (AA) becomes double diminished (dd) and vice versa.
 */
export function invertInterval(interval: Interval): Interval {
  let simpleNumber = interval.number;
  while (simpleNumber > 8) {
    simpleNumber -= 7;
  }
  const invertedNumber = 9 - simpleNumber;

  let invertedQuality: Quality;
  switch (interval.quality) {
    case 'P':
      invertedQuality = 'P';
      break;
    case 'M':
      invertedQuality = 'm';
      break;
    case 'm':
      invertedQuality = 'M';
      break;
    case 'A':
      invertedQuality = 'd';
      break;
    case 'd':
      invertedQuality = 'A';
      break;
    case 'AA':
      invertedQuality = 'dd';
      break;
    case 'dd':
      invertedQuality = 'AA';
      break;
  }

  return {
    number: invertedNumber,
    quality: invertedQuality,
  };
}

const STEP_ORDER: Step[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export function getIntervalBetween(a: PitchClassSpelled, b: PitchClassSpelled): Interval {
  const stepDiff = ((STEP_ORDER.indexOf(b.step) - STEP_ORDER.indexOf(a.step) + 7) % 7) + 1;
  const chromaDiff = (getChroma(b) - getChroma(a) + 12) % 12;

  const baseSemitones = [0, 2, 4, 5, 7, 9, 11][stepDiff - 1];
  let adjustment = chromaDiff - baseSemitones;

  // Handle octave wrapping for intervals like diminished 7th (chromaDiff=9, base=11, adj=-2)
  if (adjustment > 6) adjustment -= 12;
  if (adjustment < -6) adjustment += 12;

  const isPerfectable = [1, 4, 5, 8].includes(stepDiff);

  let quality: Quality;

  if (isPerfectable) {
    if (adjustment === 0) quality = 'P';
    else if (adjustment === 1) quality = 'A';
    else if (adjustment === -1) quality = 'd';
    else if (adjustment === 2) quality = 'AA';
    else if (adjustment === -2) quality = 'dd';
    else throw new Error(`Invalid perfect interval adjustment: ${adjustment}`);
  } else {
    if (adjustment === 0) quality = 'M';
    else if (adjustment === -1) quality = 'm';
    else if (adjustment === -2) quality = 'd';
    else if (adjustment === 1) quality = 'A';
    else if (adjustment === 2) quality = 'AA';
    else throw new Error(`Invalid major/minor interval adjustment: ${adjustment}`);
  }

  return { number: stepDiff, quality };
}
