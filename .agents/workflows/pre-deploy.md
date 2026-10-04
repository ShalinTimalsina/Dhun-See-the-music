---
name: pre-deploy
description: Final checks before shipping a milestone. Runs the full Definition of Done, Playwright tests, and verifies repo health.
---

# Workflow: Pre-Deploy

1. **Run all CI gates:**

   ```
   pnpm typecheck
   pnpm lint
   pnpm test
   ```

2. **Run Playwright smoke tests:**
   - Canvas sync: select a chord, assert all instruments highlight correctly
   - Key change: change key, assert all panels update
   - Capo flow: verify "Shape played / Sounding chord" display
   - Find My Key: happy path and no-fit path
   - Notebook: save, reload, export, import
   - Axe checks on every main page
   - Mobile viewport tests

3. **Verify coverage:**
   - `music-core` coverage ≥ 95% lines and branches

4. **Search for unresolved markers:**
   - `TODO: confirm` — must be resolved before ship
   - `coming later` — verify these features are disabled, not partially visible

5. **Verify no hardcoded musical content** in UI components

6. **Verify responsive layout:** 360px, 768px, 1024px, 1440px, 1920px

7. **Verify both themes:** dark and light mode functional

8. **Verify `pnpm install` then `pnpm dev` works** from a clean state

9. **Update docs:**
   - `docs/DECISIONS.md` current
   - `docs/GATE_REPORTS.md` has milestone entry
   - `docs/KNOWLEDGE_SOURCES.md` has sources for any new theory content
   - README has setup and architecture diagram

10. **Run `/milestone-gate` workflow** for the formal gate report
