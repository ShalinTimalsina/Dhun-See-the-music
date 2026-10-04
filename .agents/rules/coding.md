---
trigger: always_on
---

# Coding Rules

## TypeScript

- `strict: true` in every `tsconfig.json`. No exceptions.
- NO `any` type. NO `as unknown as T`. Fix the actual type.
- NO `// @ts-ignore` or `// @ts-expect-error` without a linked issue explaining why.
- Prefer small, typed, pure functions. A function in `music-core` takes typed inputs and returns typed outputs with no side effects.

## Test-First Development

- Write the test before or together with each function in `music-core`.
- Property tests (fast-check) for every invariant: transposition round-trips, Roman numeral invariance, capo sounding-pitch equality, guitar shape pitch-class correctness, Find My Key fit guarantees.
- Golden tables for all 12 major and 12 natural-minor keys (signature, spelled scale, diatonic triads, diatonic sevenths, Roman numerals).
- Cross-check against Tonal.js in tests only. Production engine is our own code.
- Seedable RNG for ear training exercises so they are reproducible in tests.

## Never Fake Functionality

- No static chord images, no hardcoded transposition tables, no random recommendations, no placeholder "AI" features.
- If something is not built yet, it is not shown in the UI (or it is clearly marked "coming later" and disabled).
- Every visualization is generated from the model. Every transposition, capo result, and shape is computed.

## Import Discipline

- `music-core` must not import from React, the DOM, Tone.js, or any app package.
- Verify with `eslint-plugin-import` boundary rules and CI check.
- Before importing ANY third-party library, check `package.json`. If missing, output the install command first.
