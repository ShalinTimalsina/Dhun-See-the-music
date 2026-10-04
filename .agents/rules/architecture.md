---
trigger: always_on
---

# Architecture Rules

## Monorepo Boundaries

- **`packages/music-core`** is PURE TypeScript. No React, no DOM, no Web Audio, no Tone.js, no `window`, no `document`. Enforce with ESLint `no-restricted-imports` and a CI check.
- UI components render values returned by `music-core`. They NEVER contain theory logic, interval arithmetic, transposition math, or chord formula definitions.
- `packages/music-audio` depends on `music-core` and the browser. It handles playback scheduling only.
- `packages/music-content` contains lessons, exercises, and public-domain songs as typed data files.
- `apps/web` is the Next.js App Router application. It imports from packages via workspace aliases.

## Component Conventions

- Server Components by default. Use `"use client"` only when hooks, events, Web Audio, or interactive instruments are needed.
- One component per file. Named exports matching the filename.
- Absolute imports via `@/` alias within `apps/web`. Package imports via `@music/core`, `@music/audio`, `@music/content`.
- No barrel exports (`index.ts` re-exports).

## State

- One Zustand `canvasStore` holds the shared Music Canvas selection (spec section 8).
- Local `useState` / `useReducer` for isolated component UI.
- `useMotionValue` / `useTransform` for continuous values (pointer position, scroll). Never `useState` for these.
- Canvas selection serialized to URL query for shareability and refresh safety.

## Data Integrity

- Every persisted or imported object validated with Zod schemas, including a `schemaVersion` field.
- All transposition goes through one function and returns new immutable objects.
- Roman numerals are stored as functions of the key, not as absolute chord names.
- Songs store chords as progression + key so changing key re-renders everything.
