---
name: new-section
description: Add a new UI section or page to the music platform. Reads design plan, implements with instruments in mind, audits.
---

# Workflow: New Section / Page

1. **Read `docs/DESIGN_PLAN.md`** for locked palette, type scale, layout concept, and wireframes
2. **Identify what instruments or music-core data** this section needs
3. **Verify core support exists** — if the section needs data from `music-core` that isn't built, run `/new-core-module` first
4. **Design the layout:**
   - Use `design-taste-frontend` skill for composition decisions
   - Desktop: panels together where applicable
   - Mobile: one instrument at a time with persistent mini theory bar
   - No scattered entrance animations — motion only where it answers a user action
5. **Implement as a Server Component** in `apps/web/app/` unless interactivity requires `"use client"`
6. **Wire content from `music-core` or `music-content`** — no hardcoded musical strings in JSX
7. **Connect to `canvasStore`** if the section participates in the shared selection
8. **Add `prefers-reduced-motion` support** for any motion
9. **Test responsive layout:** 360px, 768px, 1024px, 1440px
10. **Run `/audit-design`** to verify role language, progressive disclosure, and anti-default discipline
11. **Run `/audit-a11y`** to verify keyboard nav, screen reader, touch targets
12. **Run Definition of Done checklist**
