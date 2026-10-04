---
name: audit-a11y
description: Run a comprehensive accessibility audit on the music platform — instruments, keyboard navigation, screen readers, and WCAG 2.2 AA compliance.
---

# Workflow: Audit Accessibility

1. **Run axe-core** via Playwright or browser extension on the target page
2. **Keyboard navigation audit:**
   - Tab through every interactive element. Tab order = visual order?
   - Piano: computer keyboard plays notes? Octave shift works?
   - Guitar fretboard: arrow keys navigate strings/frets? Enter/Space plays?
   - Chord diagram carousel: Tab switches, Enter selects?
   - Circle of fifths: arrow keys rotate, Enter selects key?
   - All keyboard mappings discoverable in a help panel?
3. **Screen reader audit:**
   - ARIA live regions announce "now playing" (e.g., "C major: C, E, G")?
   - SVG instruments have proper roles and labels?
   - Theory explanations are structured (headings, lists), not visual-only?
   - Dynamic content updates announced (key change, chord selection, capo change)?
4. **Visual accessibility:**
   - Color contrast ≥ 4.5:1 for text, ≥ 3:1 for UI components?
   - Role language uses shape/label/pattern in addition to color?
   - Visible focus ring on every interactive element?
5. **Touch accessibility:**
   - All touch targets ≥ 44px on mobile?
   - Multi-touch works on piano?
   - No hover-only interactions on touch devices?
6. **Reduced motion:**
   - `prefers-reduced-motion` collapses transforms to instant?
   - Opacity transitions ≤ 150ms under reduced motion?
7. **Implement fixes** for any violations
8. **Re-run axe-core** — must reach zero violations
