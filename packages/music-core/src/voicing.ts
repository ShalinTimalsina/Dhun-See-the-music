import { PitchClassSpelled, Note } from './pitch';

export type Inversion = 'root' | 'first' | 'second' | 'third';

/**
 * A Voicing converts an abstract set of Pitch Classes into concrete, playable Notes
 * in a specific octave, ordered from lowest to highest.
 */
export function applyVoicing(
  pitches: PitchClassSpelled[],
  baseOctave: number,
  inversion: Inversion = 'root',
): Note[] {
  if (pitches.length === 0) return [];

  // Determine how many times to shift the bottom note to the top
  let shifts = 0;
  if (inversion === 'first') shifts = 1;
  else if (inversion === 'second') shifts = 2;
  else if (inversion === 'third') shifts = 3;

  // We assign octaves strictly monotonically ascending
  const notes: Note[] = [];
  let currentOctave = baseOctave;

  // Create an array of indices to represent the inverted order
  // e.g. for a triad in 1st inversion: [1, 2, 0]
  const orderedIndices = [];
  for (let i = 0; i < pitches.length; i++) {
    orderedIndices.push((i + shifts) % pitches.length);
  }

  // Iterate through the indices to create notes
  for (let i = 0; i < orderedIndices.length; i++) {
    const p = pitches[orderedIndices[i]];

    // If we've wrapped around (i > 0 and this step comes alphabetically *before* the previous step,
    // OR if we shifted it explicitly), we must increment the octave to ensure it's higher.
    if (i > 0) {
      const prevNote = notes[notes.length - 1];
      const prevStep = prevNote.pitchClass.step;

      const stepVals: Record<string, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };

      // If current step is less than or equal to previous step, it must have crossed an octave boundary
      if (stepVals[p.step] <= stepVals[prevStep]) {
        currentOctave++;
      }
    }

    notes.push({
      pitchClass: p,
      octave: currentOctave,
    });
  }

  return notes;
}
