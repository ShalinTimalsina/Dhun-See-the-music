# Project Understanding: Music Intelligence and Learning Environment

## Core Objective

A beginner-friendly music learning platform built as a web application. It allows users to explore musical concepts (chords, keys, scales, melodies) and instantly see them on instruments, hear them, understand the theory behind them, play them interactively, and practice them. The core loop is: SEE, HEAR, UNDERSTAND, PLAY, EXPERIMENT, PRACTICE, SAVE.

## Key Features & Constraints

- **Pure Engine (`music-core`)**: A pure TypeScript music theory engine isolated from React/DOM/Audio. It handles pitch, intervals, scales, chords, keys, transposition, guitar shapes, capo logic, voice fitting, and structured explanations.
- **Visual Instruments**: Piano, guitar fretboard, chord diagrams, harmonium, and circle of fifths. All interactive, responsive, accessible, and rendered via SVG driven by `music-core`.
- **Music Canvas**: A central, shared state (`canvasStore`) where a selection (e.g., a chord) updates all instrument views simultaneously.
- **Audio**: Web Audio API and Tone.js for accurate playback scheduling and sampled instruments (piano, guitar, harmonium).
- **Find My Key**: An algorithm to fit melodies into a user's vocal range.
- **Capo Engine**: Computes guitar shapes and capo positions for a given progression.
- **Sargam**: Support for Indian music notation (Sa Re Ga Ma...) on the harmonium, treating Sa as a variable pitch class.
- **Testing & Integrity**: Heavy reliance on property tests (fast-check), golden tables, and ≥95% coverage for `music-core`.
- **Local-first Storage**: V1 uses Dexie (IndexedDB) for saving notebooks, progressions, and lessons. No backend or auth in V1.
- **Design & A11y**: Distinctive "non-default" aesthetic (no generic SaaS look, specific role languages for notes). WCAG 2.2 AA compliant.

## Ambiguities Resolved

1. **Audio Library**: The spec mentions Tone.js and evaluating `smplr`. Tone.js is standard for scheduling. I will plan to use `smplr` or Tone's own Sampler for the instruments. (Recorded in `DECISIONS.md`)
2. **Notation Rendering**: The spec mentions VexFlow or abcjs for M7. Since M7 is later, I will defer the final choice but note it in `DECISIONS.md`.
3. **SVG vs Canvas**: The spec defaults to hand-written SVG for instruments, falling back to Canvas only if slow. I will stick to SVG as React handles it well unless there are thousands of DOM nodes.
