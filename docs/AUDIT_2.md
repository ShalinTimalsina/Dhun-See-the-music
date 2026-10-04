# Engine Audit (PROMPT 2)

| #   | Check                                                        | Result      | Evidence / Notes                                                                                                         |
| --- | ------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| A1  | Pitch type has an octave, and MIDI and frequency are derived | **FAIL**    | `pitch.ts` has `Note` with `octave`, but no derivation functions for MIDI or frequency (A4=440).                         |
| A2  | Spelling uses letter-step arithmetic                         | **PARTIAL** | Core chroma math exists, but a general `transpose(x, interval)` using step arithmetic is missing.                        |
| A3  | `getDiatonicChords` derives triads by stacking thirds        | **FAIL**    | `key.ts` uses a hardcoded lookup array `[MAJOR_TRIAD, MINOR_TRIAD...]` based on `key.mode`.                              |
| A4  | Chord registry covers all extended chords                    | **FAIL**    | `chord.ts` only has `MAJOR_TRIAD`, `MINOR_TRIAD`, `DIMINISHED_TRIAD`, `DOMINANT_7`.                                      |
| A5  | Chord symbol parser and writer round-trip                    | **FAIL**    | No `parseChord(symbol)` or formatting utility exists.                                                                    |
| A6  | Scale registry added by data                                 | **FAIL**    | Only `MAJOR_SCALE` and `NATURAL_MINOR_SCALE` exist in `scale.ts`.                                                        |
| A7  | Roman numerals, progressions, transposition exist            | **FAIL**    | Roman numerals are just hardcoded strings attached to `getDiatonicChords`. No progression engine or invariant transpose. |
| A8  | Guitar module computes shapes from pitch and tuning (search) | **FAIL**    | `guitar.ts` uses hardcoded E-shape and A-shape templates (`fret6 + 2`).                                                  |
| A9  | Muted strings chosen by voicing rules                        | **FAIL**    | Hardcoded to `-1` on the 6th string for A-shapes.                                                                        |
| A10 | Capo engine exists                                           | **FAIL**    | No capo engine exists.                                                                                                   |
| A11 | Tests exist, with coverage                                   | **FAIL**    | Minimal tests.                                                                                                           |
| A12 | `music-core` imports nothing from React, DOM, or audio       | **PASS**    | Checked via architecture. It is pure TypeScript.                                                                         |

## Work Plan

**Rule Check:** All FAILs that are "tables instead of derivations" (A3, A8) must be rewritten.

1. **Section 2.1 - 2.4 (Pitch, Scales, Chords, Progressions):**
   - Add MIDI/Freq derivations.
   - Expand `ScaleDef` registry. Rewrite `getDiatonicChords` to dynamically stack 3rds.
   - Expand `ChordDef` registry and implement parsing/formatting.
   - Build general transposition engine.
2. **Section 2.5 - 2.6 (Guitar & Capo):**
   - Rewrite `guitar.ts` to perform algorithmic search over tuning arrays.
   - Implement Capo logic.
3. **Section 2.7 (Beginner Engine):**
   - `startFromPosition`, `chordPalette`, `easierAlternatives`, `whatNext`.
4. **Section 3 & 4 (Moods & Text Layer):**
   - Implement mood data structures and plain-language dictionaries.
5. **Section 5 & 6 (UI Flows & Tests):**
   - Build out the UI flows requested in the prompt.
