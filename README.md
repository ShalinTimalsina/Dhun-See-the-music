# Dhun

See • Hear • Understand • Play

A visual playground for music theory and composition.

---

## What is Dhun?

Dhun (धुन, Nepali for _melody_ or _tune_) is a music learning platform. It maps music theory directly to instruments. Instead of reading static chord charts, you pick a chord and see it light up on a piano, a guitar fretboard, and a chord palette at the same time. Everything is driven by a pure-math theory engine, so no chords or scales are hardcoded.

## Features

- **Music Canvas**: Pick a root note and chord quality. See the exact fingering and voicings on the piano and guitar.
- **Pure-math engine**: Every chord, interval, and fretboard shape is calculated from scratch by a TypeScript core engine.
- **Audio playback**: Hear what you build using the Web Audio API and acoustic piano samples.
- **Song Pad**: Paste any chord progression (e.g., `C G Am F`) to extract the chords, map them to your keyboard (keys 1-9), and play along.
- **Mood Composer**: Pick an emotional intent (Epic, Melancholic, Dreamy) to generate diatonic and borrowed chord progressions.

## Architecture

Dhun is a pnpm monorepo.

```text
packages/
  music-core/       # Pure TypeScript theory engine. No React, no DOM, no Web Audio.
  music-audio/      # Playback scheduling and soundfont management.
apps/
  web/              # Next.js App Router application (The UI).
```

### Tech Stack

- Next.js (App Router), React 18, TypeScript (`strict: true`)
- Tailwind CSS
- Zustand (Global synced octave and canvas state)
- Web Audio API
- Vitest, Playwright

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Run the development server:

   ```bash
   pnpm dev
   ```

3. Open `http://localhost:3000`.

## Rules

1. **UI renders, never computes.** All theory math lives in `music-core`.
2. **Motion answers a user action.** Animations are physics-based (like a piano key pressing down). No scattered entrance animations.
3. **No faking.** Every visualization is generated from the math model. No placeholder features.

---

_For curious beginners and self-taught musicians._
