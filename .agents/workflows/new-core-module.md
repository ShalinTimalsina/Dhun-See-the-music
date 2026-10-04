---
name: new-core-module
description: Add a new module to music-core following the spec's Development Rule — concept, math, relations, instrument mapping, audio, transposition, edge cases, tests, then UI.
---

# Workflow: New Core Module

Follow the spec's Development Rule (section 48) strictly. Music model first, UI last.

1. **Define the concept** in `docs/MUSIC_MODEL.md` — what it represents musically, its properties, its relationships to existing types
2. **Write the TypeScript interfaces** in `packages/music-core/src/<module>/`
3. **Implement the math** — pure functions, no side effects, no DOM
4. **Define relationships** to other modules (e.g., a Chord relates to Intervals, PitchClasses, Keys)
5. **Write instrument mappings** — how does this concept appear on piano, guitar, harmonium?
6. **Handle transposition** — the concept must work with `transpose()` and produce correct spelling
7. **Identify edge cases** — enharmonic spelling, double accidentals, theoretical keys, ambiguous representations
8. **Write tests:**
   - Unit tests with golden tables (all 12 keys where applicable)
   - Property tests (round-trip, invariance, correctness guarantees)
   - Edge case tests from spec section 39
   - Cross-check against Tonal.js in test files only
9. **Verify CI passes:** typecheck, lint, all tests, coverage ≥95% on the new module
10. **Only then build UI** that renders values returned by the new module
11. **Record decisions** in `docs/DECISIONS.md` — what you chose, alternatives, reason
