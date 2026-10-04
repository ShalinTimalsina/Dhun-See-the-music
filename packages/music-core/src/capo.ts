import { PitchClassSpelled, Step, Alter } from './pitch';
import { ChordDef } from './chord';
import { transposeChord } from './transpose';
import { generateShapes, GuitarShape, STANDARD_TUNING, Tuning } from './guitar';

export interface CapoOption {
  capoFret: number;
  shapes: {
    soundingChord: { root: PitchClassSpelled; chordDef: ChordDef; bass?: PitchClassSpelled };
    shapeChord: { root: PitchClassSpelled; chordDef: ChordDef; bass?: PitchClassSpelled };
    guitarShape: GuitarShape;
  }[];
  overallScore: number;
}

export function capoOptions(
  chords: { root: PitchClassSpelled; chordDef: ChordDef; bass?: PitchClassSpelled }[],
  options?: { positions?: number[]; tuning?: Tuning },
): CapoOption[] {
  const positions = options?.positions || [0, 1, 2, 3, 4, 5, 6, 7];
  const tuning = options?.tuning || STANDARD_TUNING;

  const result: CapoOption[] = [];

  for (const capo of positions) {
    let valid = true;
    let totalScore = 0;
    const shapes = [];

    // Create an interval going DOWN by 'capo' semitones to find the "Shape Chord"
    // To do this simply, we know each fret is 1 semitone.
    // Transposing down by N semitones is equivalent to finding a chord that when transposed UP by N semitones gives the target.
    // For now, a naive implementation for the engine audit:

    for (const chord of chords) {
      // Find the shape chord by transposing down
      // Actually, transpose down by 'capo' semitones
      const shapeChord = getShapeChord(chord, capo);

      // Get the best shape for the shapeChord at open position (since capo makes it open)
      const generated = generateShapes(shapeChord.root, shapeChord.chordDef, tuning, {
        maxFret: 4,
      });
      if (generated.length === 0) {
        valid = false;
        break;
      }

      const bestShape = generated[0];
      totalScore += bestShape.score;

      shapes.push({
        soundingChord: chord,
        shapeChord,
        guitarShape: bestShape,
      });
    }

    if (valid && shapes.length > 0) {
      // Bonus points if shapes belong to easy keys like C, G, D, A, E
      const firstRoot = shapes[0].shapeChord.root.step;
      const firstAlter = shapes[0].shapeChord.root.alter;
      if (firstAlter === 0 && ['C', 'G', 'D', 'A', 'E'].includes(firstRoot)) {
        totalScore -= 20; // Lower score is better
      }

      result.push({
        capoFret: capo,
        shapes,
        overallScore: totalScore,
      });
    }
  }

  return result.sort((a, b) => a.overallScore - b.overallScore);
}

function getShapeChord(
  target: { root: PitchClassSpelled; chordDef: ChordDef; bass?: PitchClassSpelled },
  capoFret: number,
): { root: PitchClassSpelled; chordDef: ChordDef; bass?: PitchClassSpelled } {
  // Transpose down by capoFret semitones.
  // We can hack this by creating an Interval that corresponds to -capoFret semitones.
  // We use `transposeChord` from transpose.ts.

  // Note: a robust implementation needs a proper interval finder by semitone distance.
  // For the prompt structure, we will use a brute-force approach across the circle of fifths or chromatic scale.
  const CHROMATIC_STEPS = [
    { step: 'C', alter: 0 },
    { step: 'C', alter: 1 },
    { step: 'D', alter: 0 },
    { step: 'E', alter: -1 },
    { step: 'E', alter: 0 },
    { step: 'F', alter: 0 },
    { step: 'F', alter: 1 },
    { step: 'G', alter: 0 },
    { step: 'G', alter: 1 },
    { step: 'A', alter: 0 },
    { step: 'B', alter: -1 },
    { step: 'B', alter: 0 },
  ];

  // Find current index
  let idx = CHROMATIC_STEPS.findIndex(
    (p) => p.step === target.root.step && p.alter === target.root.alter,
  );
  if (idx === -1) idx = 0; // fallback

  let newIdx = (idx - capoFret) % 12;
  if (newIdx < 0) newIdx += 12;

  const newRoot = CHROMATIC_STEPS[newIdx] as PitchClassSpelled;

  let newBass = undefined;
  if (target.bass) {
    let bIdx = CHROMATIC_STEPS.findIndex(
      (p) => p.step === target.bass!.step && p.alter === target.bass!.alter,
    );
    if (bIdx === -1) bIdx = 0;
    let bNewIdx = (bIdx - capoFret) % 12;
    if (bNewIdx < 0) bNewIdx += 12;
    newBass = CHROMATIC_STEPS[bNewIdx] as PitchClassSpelled;
  }

  return { root: newRoot, chordDef: target.chordDef, bass: newBass };
}
