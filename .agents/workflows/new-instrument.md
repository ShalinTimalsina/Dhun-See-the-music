---
name: new-instrument
description: Add a new instrument view to the Music Canvas. Ensures it connects to canvasStore, implements the role language, handles all input methods, and passes a11y checks.
---

# Workflow: New Instrument

1. **Read the spec** — find the instrument's section in `MUSIC_PLATFORM_MASTER_PROMPT.md` (section 7)
2. **Verify core support** — ensure `music-core` has the data this instrument needs (e.g., fretboard map for guitar, sargam mapping for harmonium). If not, run `/new-core-module` first
3. **Design the SVG component:**
   - Hand-written SVG React component (Canvas only if profiling shows SVG is too slow)
   - Accept `highlight` input: `{ notes | pitchClasses, roles: root|third|fifth|seventh|extension|scaleTone|outside }`
   - Emit `onPlay(note)` events
   - Apply the role language consistently (same colors, shapes, labels as all other instruments)
4. **Implement input methods:**
   - Click/tap to play
   - Touch and multi-touch where applicable
   - Computer keyboard mapping (documented)
   - MIDI input (feature-detected, graceful degradation)
5. **Connect to `canvasStore`:**
   - Subscribe to shared selection
   - Highlight updates when Canvas selection changes
   - Emit selection changes back to the store
6. **Implement display modes:**
   - Note labels: names, intervals, degrees, sargam (driven by `display.noteLabels`)
   - Progressive disclosure levels (beginner, standard, advanced)
7. **Responsive layout:**
   - Desktop: renders alongside other instruments in the Canvas
   - Mobile: renders as a standalone panel with a mini theory bar
   - Test at 360px, 768px, 1024px, 1440px
8. **Accessibility:**
   - Keyboard navigation with documented key map
   - ARIA labels on every interactive element
   - Screen reader "now playing" announcements via live region
   - Touch targets ≥ 44px
9. **Write Playwright test:** select a chord on Canvas, assert this instrument highlights correctly
10. **Run Definition of Done checklist**
