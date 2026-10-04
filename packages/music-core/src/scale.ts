import { Interval } from './interval';
import { PitchClassSpelled, Step, Alter, getChroma } from './pitch';

export interface ScaleDef {
  id: string;
  name: string;
  intervals: Interval[];
}

import { Quality } from './interval';

function makeScale(id: string, name: string, intStr: string): ScaleDef {
  const intervals = intStr.split(' ').map((s) => {
    const match = s.match(/^(\d+)(P|M|m|A|d|AA|dd)$/);
    if (!match) throw new Error(`Invalid interval string: ${s}`);
    return { number: parseInt(match[1]), quality: match[2] as Quality };
  });
  return { id, name, intervals };
}

export const MAJOR_SCALE = makeScale('major', 'Major', '1P 2M 3M 4P 5P 6M 7M');
export const NATURAL_MINOR_SCALE = makeScale(
  'natural_minor',
  'Natural Minor',
  '1P 2M 3m 4P 5P 6m 7m',
);
export const HARMONIC_MINOR_SCALE = makeScale(
  'harmonic_minor',
  'Harmonic Minor',
  '1P 2M 3m 4P 5P 6m 7M',
);
export const MELODIC_MINOR_SCALE = makeScale(
  'melodic_minor',
  'Melodic Minor',
  '1P 2M 3m 4P 5P 6M 7M',
);

export const MAJOR_PENTATONIC = makeScale('major_pentatonic', 'Major Pentatonic', '1P 2M 3M 5P 6M');
export const MINOR_PENTATONIC = makeScale('minor_pentatonic', 'Minor Pentatonic', '1P 3m 4P 5P 7m');
export const BLUES_SCALE = makeScale('blues', 'Blues', '1P 3m 4P 5d 5P 7m'); // Note: 5d used for b5

export const DORIAN_MODE = makeScale('dorian', 'Dorian', '1P 2M 3m 4P 5P 6M 7m');
export const PHRYGIAN_MODE = makeScale('phrygian', 'Phrygian', '1P 2m 3m 4P 5P 6m 7m');
export const LYDIAN_MODE = makeScale('lydian', 'Lydian', '1P 2M 3M 4A 5P 6M 7M');
export const MIXOLYDIAN_MODE = makeScale('mixolydian', 'Mixolydian', '1P 2M 3M 4P 5P 6M 7m');
export const LOCRIAN_MODE = makeScale('locrian', 'Locrian', '1P 2m 3m 4P 5d 6m 7m');

export const SCALES = [
  MAJOR_SCALE,
  NATURAL_MINOR_SCALE,
  HARMONIC_MINOR_SCALE,
  MELODIC_MINOR_SCALE,
  MAJOR_PENTATONIC,
  MINOR_PENTATONIC,
  BLUES_SCALE,
  DORIAN_MODE,
  PHRYGIAN_MODE,
  LYDIAN_MODE,
  MIXOLYDIAN_MODE,
  LOCRIAN_MODE,
];

const STEP_ORDER: Step[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

/**
 * Given a root pitch class and a scale definition, returns the spelled pitch classes for the scale.
 */
export function getScalePitches(root: PitchClassSpelled, scale: ScaleDef): PitchClassSpelled[] {
  const rootStepIndex = STEP_ORDER.indexOf(root.step);

  return scale.intervals.map((interval) => {
    // 1. Calculate the target letter name (step) based strictly on interval number
    const targetStepIndex = (rootStepIndex + interval.number - 1) % 7;
    const targetStep = STEP_ORDER[targetStepIndex];

    // 2. Calculate the target chroma based on root chroma + interval semitones
    const rootChroma = getChroma(root);
    const intervalSemitones = getIntervalSemitones(interval);
    const targetChroma = (rootChroma + intervalSemitones) % 12;

    // 3. Find the correct alteration for the target step to match the target chroma
    // Base chroma of the un-altered target step:
    const baseTargetChroma = getChroma({ step: targetStep, alter: 0 });

    // We need: (baseTargetChroma + alter) % 12 === targetChroma
    // Solving for alter (handling negative wraparounds carefully):
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
    // Major/Minor intervals
    if (interval.quality === 'm') adjustment = -1;
    if (interval.quality === 'd') adjustment = -2;
    if (interval.quality === 'A') adjustment = 1;
    if (interval.quality === 'AA') adjustment = 2;
  } else {
    // Perfect intervals (1, 4, 5, 8)
    if (interval.quality === 'd') adjustment = -1;
    if (interval.quality === 'A') adjustment = 1;
    if (interval.quality === 'dd') adjustment = -2;
  }

  return baseSemitones + adjustment;
}
