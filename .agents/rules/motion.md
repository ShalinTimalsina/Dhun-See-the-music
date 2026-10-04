---
trigger: always_on
---

# Motion Rules

## Core Principle

- Motion answers a user action. A note lights up when played. A shape slides when capo changes. The circle of fifths animates when the key changes. That is it.
- No scattered entrance animations. No hover transitions on everything. No infinite loops on informational sections.

## Allowed Properties

- Animate ONLY `transform` and `opacity`. NEVER animate `width`, `height`, `top`, or `left`.
- Use `will-change: transform` sparingly — only on elements that will actually animate.

## Easings

- Default: `ease-out` for entrances, `ease-in` for exits.
- `ease-in-out` and `linear` are BANNED on UI elements.
- Spring physics (`type: "spring"`) for instrument interactions (key press, fret tap, chord shape transition).

## Instrument-Specific Motion

- **Piano key press:** scale down on press, spring back on release. Fast (<100ms).
- **Guitar fret highlight:** fade in from 0 opacity, no positional shift.
- **Chord shape carousel:** horizontal slide with spring physics.
- **Circle of fifths rotation:** smooth rotation to new key position.
- **Capo position change:** translate the capo bar along the fretboard.
- **Canvas selection change:** cross-fade between highlighted note sets across all instruments simultaneously.

## Reduced Motion (mandatory)

- `prefers-reduced-motion` support ships WITH the animation, not later.
- Under reduced motion: all transforms collapse to instant, opacity transitions remain at ≤150ms.
- Use `useReducedMotion()` from Motion library in every animated client component.

## Hover

- Hover effects gated behind `@media (hover: hover)`.
- Touch devices get `:active` feedback instead.
