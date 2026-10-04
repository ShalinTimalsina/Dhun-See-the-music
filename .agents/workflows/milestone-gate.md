---
name: milestone-gate
description: End-of-milestone gate check. Run all tests, verify all CI gates, write a gate report. A milestone is NOT complete until this passes.
---

# Workflow: Milestone Gate

Run this at the end of every milestone (M0–M9).

1. **Run CI gates:**

   ```
   pnpm typecheck
   pnpm lint
   pnpm test
   ```

   All three must pass with zero errors.

2. **Check coverage** on `music-core`:
   - Target: ≥95% lines and branches
   - If below threshold, write missing tests before proceeding

3. **Verify property tests:**
   - Transposition round-trips
   - Roman numeral invariance under transposition
   - Capo sounding-pitch equality
   - Guitar shape pitch-class correctness
   - Find My Key fit guarantees
   - Sargam uniform shift
   - Chord symbol parse/format round-trip

4. **Verify the repo is runnable:**

   ```
   pnpm install
   pnpm dev
   ```

   Must work without errors.

5. **Run Playwright smoke tests** (if UI exists for this milestone):
   - Canvas sync test (all panels agree on selection)
   - Axe checks on every main page

6. **Write gate report** — append to `docs/GATE_REPORTS.md`:
   - Milestone name and date
   - What was built
   - Test results (pass counts, coverage numbers)
   - Items deliberately deferred (with reason)
   - Decisions made (reference `docs/DECISIONS.md` entries)
   - Known issues

7. **Proceed to next milestone** only if all gates pass.
   - If a gate fails: fix the failure, re-run, do not proceed with a broken gate.
