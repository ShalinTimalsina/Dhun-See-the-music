---
trigger: always_on
---

# Definition of Done

Every milestone must pass these gates before proceeding to the next. A milestone is NOT complete if any gate fails.

## CI Gates (automated)

1. `pnpm typecheck` — zero errors across all packages.
2. `pnpm lint` — zero warnings or errors.
3. `pnpm test` — all unit and property tests pass.
4. Coverage threshold on `music-core`: ≥95% lines and branches.

## music-core Correctness

5. Golden tables pass for all 12 major and 12 natural-minor keys.
6. All property tests pass (transposition round-trips, Roman numeral invariance, capo pitch equality, shape pitch-class correctness, Find My Key fit guarantees, sargam uniform shift).
7. Musical edge cases tested (enharmonics, double accidentals, slash chords, sus chords, borrowed chords, alternate tunings, capo above fret 7).

## UI Quality

8. Responsive from 360px to 1920px. Mobile collapse explicit per section.
9. Dark and light themes both tested and functional.
10. Zero axe-core accessibility violations on every main page.
11. Keyboard navigation works for every instrument and flow.
12. `prefers-reduced-motion` collapses all transforms to instant.

## Content Integrity

13. No hardcoded musical content in UI components (all from `music-core` or `music-content`).
14. No TODO markers in shipped code without a linked tracking item.
15. `docs/DECISIONS.md` updated with any decisions made during the milestone.

## Milestone Gate Report

16. Write a short report at the end of each milestone: what was built, test results, deferred items, decisions made. Store in `docs/GATE_REPORTS.md`.

## Repo Health

17. `pnpm install` then `pnpm dev` must work after every milestone.
18. No unresolved merge conflicts or broken imports.
