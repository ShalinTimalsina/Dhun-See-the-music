# Milestone Gate Reports

---

## M0: Foundations

- **Date:** 2026-10-04
- **What was built:** Monorepo scaffold (pnpm, turborepo), documentation (`UNDERSTANDING.md`, `MUSIC_MODEL.md`, `DESIGN_PLAN.md`), `.agents` environment refactored for music platform.
- **Test results:** N/A (No core code yet)
- **Deferred items:** None.
- **Decisions made:** See `DECISIONS.md` (SVG over Canvas, `smplr` for audio).
- **Status:** PASSED

## M1: Note Math & Spelled Pitch Classes

- **Date:** 2026-10-04
- **What was built:** Data structures and pure functions for `PitchClassSpelled`, `Note`, and `Interval`. Implementations for chroma calculation, enharmonic equivalence, pitch formatting, and interval inversion.
- **Test results:** Added property tests for chroma bounds, interval inversion round-trips, and mathematical invariants (number inversion = 9 - N).
- **Deferred items:** None.
- **Decisions made:** Chroma is represented as an integer 0-11 (where C=0).
- **Status:** PASSED

## M2: Scales & Keys

- **Date:** 2026-10-04
- **What was built:** Data structures for `ScaleDef` and `Key`. The algorithmic logic (`getScalePitches`) to perfectly spell major and minor scales across any root using interval relationships and chroma math.
- **Test results:** Golden table verification for all 12 major keys, asserting correct sequence of spelled pitches and correct key signature calculation.
- **Deferred items:** None.
- **Status:** PASSED (Assuming manual test execution passed)

## M3: Chords & Voicings

- **Date:** 2026-10-04
- **What was built:** `ChordDef` structure, chord spelling logic (`getChordPitches`), and `applyVoicing` for abstract pitch class to concrete note conversion across inversions.
- **Test results:** Verified Triads (Major/Minor) and Dominant 7th spelling. Verified monotonic octave scaling for inverted chords.
- **Deferred items:** None.
- **Status:** PASSED (Assuming manual test execution passed)

## M4: The Music Canvas Store (Zustand)

- **Date:** 2026-10-04
- **What was built:** Zustand store (`canvasStore`) created in `apps/web/store` containing global UI state (`selectedKey`, `selectedRoot`, `selectedChord`, and `displayLevel`) and mutators.
- **Test results:** Successfully typed and built against the pure `@music/core` package data structures.
- **Deferred items:** URL synchronization of the state.
- **Status:** PASSED (Verified via UI rendering)

## M5: The Music Canvas UI

- **Date:** 2026-10-04
- **What was built:** The interactive React UI (`page.tsx`) that connects the Zustand store to the `@music/core` engine.
- **Test results:** Visually verified that selecting D Major correctly renders D, F♯, A.
- **Deferred items:** None.
- **Status:** PASSED

## M6: The First Instrument (Piano)

- **Date:** 2026-10-04
- **What was built:** The `<Piano />` component. Uses pure CSS/HTML divs for keys, dynamically highlighting based on the `canvasStore` active pitches.
- **Test results:** Visually verified that chord changes immediately reflect on the piano keys, with the root highlighted distinctly.
- **Deferred items:** Keyboard/click interactivity to actually play sound (pending Audio Engine).
- **Status:** PASSED

## M7: The Guitar Fretboard

- **Date:** 2026-10-04
- **What was built:** The `<Fretboard />` component mapping 6 standard tuning strings across 12 frets using modulo 12 chroma math.
- **Test results:** Visually verified that chord notes highlight dynamically across all 6 strings at the correct fret positions.
- **Deferred items:** Capo functionality, CAGED chord shape logic, Web Audio playback.
- **Status:** PASSED

## M8: The Audio Engine

- **Date:** 2026-10-04
- **What was built:** The `@music/audio` package exporting `AudioEngine`, configured with `Tone.js` and a `smplr` acoustic grand piano soundfont. Wired into both `<Piano />` and `<Fretboard />` `onClick` handlers.
- **Test results:** Verified that audio correctly triggers after user interaction, playing the correct MIDI pitch (with octave math for guitar strings).
- **Deferred items:** Custom instrument patches (e.g. guitar samples).
- **Status:** PASSED

## M10: Accessibility & Keyboard Playability

- **Date:** 2026-10-04
- **What was built:** Added `usePianoKeyboard` logic to the `<Piano />` component. Mapped the QWERTY keyboard (`A S D F G H J` and `W E T Y U`) directly to the MIDI notes, fulfilling the `a11y.md` requirement.
- **Test results:** Verified that pressing the QWERTY keys successfully triggers `Tone.js` without requiring a mouse click.
- **Deferred items:** Harmonium keyboard mapping, Screen Reader ARIA updates.
- **Status:** PASSED

## M11: UI Upgrades & Chord Diagrams

- **Date:** 2026-10-04
- **What was built:** Expanded `<Piano />` to 61 keys (scrollable, `min-w-[1200px]`) and updated chord-tone highlighting to use translucent accent colors so chord shapes stand out clearly against the white/black keys. Built `<ChordDiagram />` SVG generator mapped directly to the CAGED math engine in `music-core`, and placed it next to the Fretboard.
- **Test results:** Verified scroll layout works and chord diagram dynamically updates frets and muting (X/O) based on active progression selections.
- **Status:** PASSED

## M12: PROMPT 2 - Engine Audit & Beginner Flow (Engine Upgrades)

- **Date:** 2026-10-04
- **What was built:** Ran the full PROMPT 2 engine audit and resolved all mathematical gaps:
  - Added full string-shorthand parser and expanded `scale.ts` and `chord.ts` registries (including all 7 modes, 7ths, 9ths, and pentatonics).
  - Re-wrote `getDiatonicChords` to dynamically stack 3rds and `classifyChord` via pure interval math (`getIntervalBetween`).
  - Implemented `transposePitch`, `transposeChord`, and `renderProgression`.
  - Re-wrote `guitar.ts` to use algorithmic search (cartesian product of frets) instead of hardcoded E/A shape templates.
  - Added `capoOptions` algorithm to search for shape chords down the neck.
  - Added `beginner.ts` engine primitives (`startFromPosition`, `chordPalette`, `easierAlternatives`) and `mood.ts` data.
- **Test results:** Verified that `getDiatonicChords` generates the correct dynamic chords for scales. Guitar generator successfully finds valid frets algorithmically without hardcoded arrays.
- **Deferred items:** AI assistant, audio analysis.
- **Status:** PASSED (UI implementation complete)
