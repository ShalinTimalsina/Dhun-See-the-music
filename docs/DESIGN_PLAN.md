# Design Plan

## Principles

1. **Calm & Encouraging**: The interface is for beginners. It must not be intimidating.
2. **Music as the Product**: The instruments and the relationships between notes are the core experience. The UI chrome should get out of the way.
3. **Role Language**: Strict, consistent visual representation of musical roles (root, third, fifth) across all views.
4. **Anti-Default**: Avoid generic SaaS aesthetics, AI-purple, and centered hero sections.

## Color Palette (Dark-First)

We are using a **Forest** inspired palette (Cold/Warm contrast):

- `bg-base`: `#0a0c0a` (Very dark, slightly green-tinted black)
- `bg-surface`: `#141714` (Elevated surface)
- `bg-surface-hover`: `#1e231e`
- `text-primary`: `#f0f2f0` (Off-white)
- `text-muted`: `#8a938a`
- `accent-primary`: `#e59500` (Warm amber/gold for highlights and selection)
- `border-subtle`: `#2a302a`

### Role Language Colors (in addition to shape/label)

- Root: `accent-primary` (Amber) - Shape: Circle with strong border
- Third: `#4b88a2` (Muted Blue) - Shape: Triangle or pill
- Fifth: `#bb4430` (Brick Red) - Shape: Square
- Seventh: `#706677` (Muted Purple) - Shape: Diamond
- Scale Tone: `#4a5d23` (Olive Green) - Shape: Small dot
- Outside Note: `#333333` (Dim grey) - Shape: Cross or hollow circle

## Typography

- **Display/Headlines**: `Outfit` (sans-serif, geometric, readable)
- **Body**: `Geist` (or system UI sans if Geist is unavailable, but sticking to Geist for cleanliness)
- **Notation/Symbols**: `Bravura` or `Noto Music` for flats/sharps.
- **Sargam (Devanagari)**: `Noto Sans Devanagari`

## Layout Concepts

### Music Canvas (Desktop)

- **Left Panel**: Navigation and current selection (Key, Scale, Chord). Theory breakdown.
- **Main Area**: Split view. Top half: Interactive Piano. Bottom left: Guitar Fretboard. Bottom right: Harmonium.
- **Sidebar**: Progression builder or Notebook.

### Music Canvas (Mobile)

- Persistent mini theory bar at the top (showing current chord/key).
- Carousel or tabbed view to switch between ONE instrument at a time (Piano -> Guitar -> Harmonium).
- Guitar fretboard oriented vertically.

## Self-Review against Banned Patterns

- _Did I use Inter?_ No, using Outfit and Geist.
- _Is it a cream+brass premium consumer default?_ No, it's a dark-forest/amber theme.
- _Are there scattered animations?_ No, animations are strictly instrument-responsive.
