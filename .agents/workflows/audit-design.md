---
name: audit-design
description: Audit a page or component against the music platform's DESIGN_PLAN.md — role language, instrument legibility, progressive disclosure, and anti-default discipline.
---

# Workflow: Audit Design

1. **Read `docs/DESIGN_PLAN.md`** for the locked palette, type scale, and layout concept
2. **Capture screenshot** of the target UI at desktop and mobile viewports
3. **Check role language consistency:**
   - Are root, third, fifth, seventh, extension, scale tone, outside-note visually distinct?
   - Is the same role system used identically on piano, fretboard, harmonium, circle of fifths, and chord diagrams?
   - Does the system use shape/label/pattern IN ADDITION to color?
4. **Check progressive disclosure:**
   - Beginner level: interval math and Roman numerals hidden?
   - Standard level: intervals, Roman numerals, key context visible?
   - Advanced level: voicing details, scoring, alternate spellings exposed?
5. **Check anti-default discipline:**
   - No generic card SaaS kit, no tracked ALL-CAPS eyebrows everywhere, no "→" on every button
   - No cream+serif+terracotta, no near-black+acid-accent, no AI-purple
   - Typography: no Inter, Roboto, Arial, Open Sans
   - Devanagari rendering correct on mobile for sargam labels?
   - Notation symbols (♭ ♯ ° ø) rendering correctly?
6. **Check instrument legibility:**
   - Can a beginner immediately understand which notes are highlighted and why?
   - Are note labels readable at the instrument's scale?
   - Is the Canvas the "memorable thing" — does it feel like the centerpiece?
7. **Check responsiveness:** 360px, 768px, 1024px, 1440px, 1920px
8. **Implement fixes** for any violations
9. **Re-test** after fixes
