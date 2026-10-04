---
trigger: always_on
---

# Design Rules

All visual decisions follow `docs/DESIGN_PLAN.md`. Key rules:

## Audience and Tone

- Curious beginners and self-taught musicians, including Indian-music learners on harmonium, many on phones.
- Calm, encouraging, never intimidating, never childish.
- Musical relationships are the product. The design makes them legible.

## Role Language (mandatory, used identically in every component)

- Define ONE consistent visual system for: root, third, fifth, seventh, extension, scale tone, and outside-the-scale note.
- Use shape, label, or pattern IN ADDITION to color (never color alone).
- The same role language appears on piano, guitar fretboard, harmonium, circle of fifths, and chord diagrams.
- Meet WCAG AA contrast for every role indicator.

## Color and Palette

- Define 4–6 named hex values in `docs/DESIGN_PLAN.md`. Lock them for the entire app.
- No generic defaults: no cream+serif+terracotta, no near-black+acid-accent, no AI-purple gradients.
- Take a distinct point of view from the world of music (instrument materials, notation, tuning, stage/studio).

## Typography

- No banned fonts: Inter, Roboto, Arial, Open Sans are banned as defaults.
- Include a notation or music-symbol font for flats (♭), sharps (♯), and diminished (°) or half-diminished (ø) symbols. Evaluate Bravura or Leland via SMuFL, or well-rendered Unicode.
- Full Devanagari support for sargam labels (e.g., Noto Sans Devanagari or Mukta). Test rendering on mobile.
- Body line length under ~80 characters.

## Progressive Disclosure

- Beginner level: hides interval math and Roman numerals until asked.
- Standard level: shows intervals, Roman numerals, key context.
- Advanced level: exposes voicing details, scoring breakdowns, alternate spellings.
- The `display.level` in `canvasStore` drives this globally.

## Anti-Default Discipline

- Do not use: identical-rounded-card SaaS kit, tracked ALL-CAPS eyebrow labels on every section, "→" on every button, numbered markers (01, 02, 03) unless content is a true sequence (lessons are).
- Do not accent a single word in headlines.
- Icons: Phosphor Light (`@phosphor-icons/react`). No thick-stroked defaults.

## The One Memorable Thing

- The Music Canvas: choosing a chord visibly lights up the same notes across piano, fretboard, and harmonium at once with the consistent role language.
- Spend the boldness there. Keep everything else quiet and disciplined.
