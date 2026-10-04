# AGENTS.md — Music Intelligence and Learning Environment

This is the project constitution. Every agent working in this repo must follow these rules.

## Product

A beginner-friendly music learning platform. Core loop: **SEE → HEAR → UNDERSTAND → PLAY → EXPERIMENT → PRACTICE → SAVE**. Built as a pnpm monorepo with a pure TypeScript music theory engine, interactive SVG instruments, Web Audio playback, and local-first storage.

## Tech Stack

| Concern      | Choice                                                                  |
| ------------ | ----------------------------------------------------------------------- |
| Framework    | Next.js App Router, React, TypeScript `strict: true`                    |
| Monorepo     | pnpm workspaces + Turborepo                                             |
| Styling      | Tailwind CSS, shadcn/ui (restyled, not defaults)                        |
| Graphics     | Hand-written SVG React components for instruments                       |
| State        | Zustand — one `canvasStore` for shared selection                        |
| Audio        | Web Audio API + Tone.js, sampled instruments, synth fallback            |
| Theory       | `packages/music-core` — pure TS, our own code (not Tonal.js in prod)    |
| Validation   | Zod schemas with `schemaVersion`                                        |
| Storage (V1) | Dexie (IndexedDB), local-first, JSON export/import                      |
| Tests        | Vitest, fast-check (property tests), Playwright, `@axe-core/playwright` |
| Icons        | Phosphor Light (`@phosphor-icons/react`)                                |

## Repository Structure

```
packages/
  music-core/       # PURE TypeScript. No React, no DOM, no Web Audio.
  music-audio/      # Playback scheduling (browser only)
  music-content/    # Lessons, exercises, public-domain songs
apps/
  web/              # Next.js App Router application
e2e/                # Playwright tests
docs/               # SPEC.md, UNDERSTANDING.md, DECISIONS.md, MUSIC_MODEL.md, etc.
```

## Hard Rules

1. **`music-core` is pure.** No React, no DOM, no Tone.js, no `window`, no `document`. Enforced by ESLint boundary rule and CI.
2. **UI renders, never computes.** Components render values from `music-core`. No theory logic in `.tsx` files.
3. **Server Components by default.** `"use client"` only for hooks, events, audio, or interactive instruments.
4. **No `any`.** No `as unknown as T`. Fix the type.
5. **No faking.** No static chord images, hardcoded transposition tables, or placeholder features.
6. **Test-first.** Write the test before or together with each `music-core` function.
7. **Music model first, UI last.** Follow the Development Rule: concept → math → relations → instrument mapping → audio → transposition → edge cases → test → UI.
8. **Repo always runnable.** `pnpm install && pnpm dev` works after every milestone.

## Milestones

M0 → M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8 → M9. Each ends with a gate report. See `MUSIC_PLATFORM_MASTER_PROMPT.md` section 14 for details.

## Rules, Workflows, and Skills

- Rules: `.agents/rules/` — always-on constraints (architecture, coding, design, motion, a11y, content, audio, security, definition-of-done)
- Workflows: `.agents/workflows/` — step-by-step processes (`/new-core-module`, `/new-instrument`, `/new-lesson`, `/milestone-gate`, `/audit-design`, `/audit-a11y`, `/audit-motion`, `/audit-theory`, `/pre-deploy`, `/new-section`)
- Skills: `.agents/skills/` — AI prompt modifiers for design taste, animation, Apple-style motion, etc.

## When to Stop and Ask

Only these:

- A legal or licensing question you cannot resolve.
- A needed paid service, API key, or account.
- A decision that would invalidate the data model after M1.
- A dependency that needs elevated permissions or looks unsafe.

Otherwise: decide, document in `docs/DECISIONS.md`, and keep going.
