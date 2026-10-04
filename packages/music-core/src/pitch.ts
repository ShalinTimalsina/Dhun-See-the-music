export type Step = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type Alter = -2 | -1 | 0 | 1 | 2; // -2 = double flat, 2 = double sharp

export interface PitchClassSpelled {
  step: Step;
  alter: Alter;
}

export interface Note {
  step: Step;
  alter: Alter;
  octave: number;
}

const STEP_TO_SEMITONE: Record<Step, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

/**
 * Gets the chromatic index (0-11) of a spelled pitch class, where C=0.
 * Used for comparing enharmonically equivalent notes (e.g. C# and Db both return 1).
 */
export function getChroma(pc: PitchClassSpelled): number {
  const base = STEP_TO_SEMITONE[pc.step];
  // add alter and wrap around 12 (positive modulo)
  return (((base + pc.alter) % 12) + 12) % 12;
}

/**
 * Checks if two spelled pitch classes are enharmonically equivalent (sound the same).
 */
export function isEnharmonicallyEquivalent(a: PitchClassSpelled, b: PitchClassSpelled): boolean {
  return getChroma(a) === getChroma(b);
}

/**
 * Format a spelled pitch class as a string, e.g. "C#", "Bb", "Fx" (double sharp)
 */
export function formatPitchClass(pc: PitchClassSpelled): string {
  let alterStr = '';
  if (pc.alter === 1) alterStr = '♯';
  else if (pc.alter === 2)
    alterStr = 'x'; // standard notation for double sharp
  else if (pc.alter === -1) alterStr = '♭';
  else if (pc.alter === -2) alterStr = '♭♭';

  return `${pc.step}${alterStr}`;
}

/**
 * Gets the MIDI note number for a given Note.
 * Middle C (C4) is 60.
 */
export function getMidi(note: Note): number {
  const chroma = getChroma(note);
  // C4 = 60. Note that in standard scientific pitch notation, C0 is MIDI 12.
  return (note.octave + 1) * 12 + chroma;
}

/**
 * Gets the frequency in Hz for a given Note.
 * refA4 defaults to 440 Hz.
 */
export function getFrequency(note: Note, refA4: number = 440): number {
  const midi = getMidi(note);
  // A4 is MIDI 69
  return refA4 * Math.pow(2, (midi - 69) / 12);
}
