# PROMPT 2: Audit the engine, close the gaps, and build the beginner flow

Paste this into your coding agent after the master prompt. It assumes `docs/SPEC.md` and the master prompt rules still apply (music model first, no faking, tests before UI, record decisions in `docs/DECISIONS.md`). If anything here conflicts with the master prompt, ask for nothing: choose the safer option and log it.

---

## 0. Goal

Take the existing `@music/core` engine from "small correct slice" to the foundation the product needs, then build the beginner experience on top:

1. A beginner picks a starting point (a fret, a piano key, or a note), says "this is my home note," and gets a chord palette in plain language.
2. A beginner can compose by choosing a **mood**, and gets matching chords, patterns, and safe melody notes on piano and guitar.
3. Every chord shown has its guitar diagram and piano keys visible in one place, with the chord list always in view next to the instruments (right side on desktop, bottom sheet on phones).

The engine stays the source of truth. The UI never contains theory logic.

---

## 1. Audit first (do this before writing new code)

Review the current engine against the checklist below. For each item write PASS, FAIL, or PARTIAL with evidence (file, function, a test or a quick script output) in `docs/AUDIT_2.md`. Do not take the earlier audit report's claims on trust. Run the checks.

| #   | Check                                                                                                                                   | How to verify                                                                                                                                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Pitch type has an **octave**, and MIDI and frequency are derived from it                                                                | Inspect `pitch.ts`; test `C4 = 60`, `A4 = 440 Hz`                                                                                             |
| A2  | Spelling uses letter-step arithmetic (major 3rd above Gb gives Bb, above G gives B, above F# gives A#)                                  | Unit tests across all 12 roots, including double accidentals                                                                                  |
| A3  | `getDiatonicChords` **derives** triads by stacking thirds within the scale (does not use a fixed quality table)                         | Ask it for A harmonic minor, D Dorian, G Mixolydian, and F melodic minor; compare to known answers. If it only works for major, it is a table |
| A4  | Chord registry covers: major, minor, dim, aug, sus2, sus4, maj7, 7, m7, m7b5, dim7, mMaj7, 6, m6, add9, 9, maj9, m9                     | List the registry                                                                                                                             |
| A5  | Chord symbol parser and writer round-trip (`Cmaj7`, `CM7`, `Am7b5`, `Bø`, `D/F#`, `Gsus4`)                                              | Property test                                                                                                                                 |
| A6  | Scale registry: major, natural, harmonic, melodic minor, major and minor pentatonic, blues, and all seven modes, added by data not code | List the registry                                                                                                                             |
| A7  | Roman numerals, progressions, and transposition exist and Roman numerals are invariant under transposition                              | Property test                                                                                                                                 |
| A8  | The guitar module computes shapes from **pitch and tuning** (search and score) and does not return template arrays                      | Read `guitar.ts`; test with drop D and a 4-string ukulele tuning                                                                              |
| A9  | Muted strings are chosen by voicing rules (root in bass, avoid non-chord tones, avoid gaps) and not only by "clash"                     | Read the logic; test slash chords                                                                                                             |
| A10 | Capo engine exists and preserves sounding pitch                                                                                         | Property test over 12 keys and capo 0 to 12                                                                                                   |
| A11 | Tests exist, with a coverage number for `music-core`                                                                                    | Run coverage; report the percentage                                                                                                           |
| A12 | `music-core` imports nothing from React, DOM, or audio libraries                                                                        | Lint rule and a grep                                                                                                                          |

**Rule:** any FAIL that is "table instead of derivation" must be rewritten as a derivation. Any existing template shapes (for example open E major `[0,2,2,1,0,0]`) are **moved to test fixtures**. The generator must rediscover them from tuning and pitch alone.

Output of this step: `docs/AUDIT_2.md` with the table filled in, a prioritized fix list, and the work plan. Then proceed through the sections below in order.

---

## 2. Engine gaps to close (in this order, each with tests)

### 2.1 Pitch with octave

```ts
interface Note {
  step: Step;
  alter: Alter;
  octave: number;
} // spelled pitch, e.g. Bb3
// derived: midi, frequency(refA4 = 440)
```

Keep a spelled pitch-class type (no octave) for chords, keys, and progressions.

### 2.2 Scale and mode registry; derivation of diatonic chords

- Scales are data: a list of intervals from the root. Add the full set in audit item A6.
- `diatonicChords(key, { sevenths?: boolean })` builds each chord by taking scale degrees 1, 3, 5 (and 7) and **classifying** the resulting interval stack against the chord registry. Do not use a lookup of qualities by degree.
- Provide Roman numerals with correct case and symbols (I, ii, iii, IV, V, vi, vii°; minor keys i, ii°, III, iv, v or V, VI, VII). Flag borrowed and non-diatonic chords instead of mislabeling.

### 2.3 Chord registry and parser

Implement the full registry from A4 as data (formula plus symbols plus display names). Implement `parseChord(symbol)` and `formatChord(chord, { style })`. Support slash chords (`bass` field). Leave room for 11, 13, and altered chords.

### 2.4 Progressions and transposition

- A progression is a key plus Roman numeral steps. `renderProgression(progression)` produces concrete chords.
- `transpose(x, interval)` for notes, chords, keys, progressions, melodies. Choose spelling by interval arithmetic; offer `preferSpelling` for sharp or flat keys.
- Property tests: round trip `transpose(transpose(x, i), invert(i)) == x`; Roman numerals are unchanged by transposition.

### 2.5 Guitar module (real, not templated)

- `Tuning` is data (array of open-string `Note`, low to high). Include standard, drop D, DADGAD, open G, open D, half-step down, and a 4-string ukulele (re-entrant) to prove string count is configurable.
- `fretMap(tuning, frets, capo)` gives the sounding `Note` at every string and fret.
- `generateShapes(chord, tuning, options)` **searches** fret assignments (muted, open, or fretted inside a window) and keeps candidates that:
  - span at most 4 frets (configurable),
  - contain every chord tone (fifth may be omitted for 7th and extended chords, flagged),
  - have no muted strings between sounded strings, except at the edges (configurable),
  - have the root as the lowest note for non-slash chords (inversions and slash chords allowed by flag),
  - are barre-representable if they need more than four fingers.
- `scoreShape(shape)` returns a difficulty score and label (Beginner, Intermediate, Advanced) with a breakdown: barre penalty (full vs partial), finger count, stretch, span, muted strings, distance from the nut, open-string bonus, root-in-bass bonus.
- Each shape returns: frets per string (with `x` for muted), fingers (best-effort), barre info, root markers, sounding notes, starting fret, and the difficulty explanation.
- Regression: the generator must rediscover open C, G, D, A, E, Am, Em, Dm, and barre F and Bm without being given them. These are fixtures, never the source.
- Property test: every shape's sounding pitch classes belong to the chord, for every supported quality, root, and tuning.

### 2.6 Capo engine

`capoOptions(progression or chords, { positions: 0..7 })`: shape chord = sounding chord transposed down by the capo amount. Rank by the difficulty of the best shape per chord, open-friendly count, and whether shapes belong to an easy key. Always display "Shape you play" and "Chord you hear" with the capo position. Property test: sounding pitch of (shape, capo) equals the target chord, in all 12 keys and every capo 0 to 12.

Worked example to include as a test: capo 3 with D, Em, G, A sounds F, Gm, Bb, C.

### 2.7 Beginner-oriented engine functions (new)

All return structured data. A separate text layer (section 4) turns them into words.

```ts
startFromPosition(string: number, fret: number, tuning: Tuning): {
  note: Note; keySuggestions: { key: Key; reason: StructuredReason }[];
}
// e.g. high E string, fret 1 gives F; suggestions: F major, F minor, and other keys that contain F

chordPalette(key: Key, options: { level, instrument, tuning, capoAllowed }): {
  diatonic: PaletteChord[];            // each: chord, roman, function, role, shapes (ranked), pianoVoicing
  popularProgressions: RenderedProgression[];
  nearbyShapes: Shape[];               // shapes near a chosen fret window, ranked by ease
  easierAlternatives: Record<ChordSymbol, Shape[]>;  // e.g. F barre vs mini F
  capoOptions: CapoOption[];
}

easierAlternatives(chord: Chord, tuning: Tuning): Shape[]
// Must surface beginner substitutes when they are valid chords or valid reductions
// (e.g. F: xx3211 mini F; Fmaj7: xx3210), found by search, not stored.

whatNext(progressionSoFar: Chord[], key: Key, mood?: Mood): { chord: Chord; reasons: StructuredReason[]; score: number }[]
// based on harmonic function and mood templates; always returns a ranked list, never one "correct" answer
```

Verified facts to use as tests:

- Guitar standard tuning, high E string, fret 1 is F.
- F major chords: F, Gm, Am, Bb, C, Dm, Edim (I, ii, iii, IV, V, vi, vii°).
- Mini F `xx3211` sounds F, A, C, F. Fmaj7 `xx3210` sounds F, A, C, E.

---

## 3. Mood system (data-driven)

```ts
interface MoodProfile {
  id: string;
  name: string;
  scaleOrMode: string; // registry id
  tempoRange: [number, number];
  progressionTemplates: string[][]; // Roman numerals, transposed to any key
  colorChords: string[]; // maj7, add9, sus2, etc., allowed in this mood
  rhythmHint: string;
  explanation: StructuredReason[]; // theory behind the tendency
  caveat: string; // "a tendency, not a rule"
  sources: SourceRef[];
}
```

Starter profiles (templates are Roman numerals; the examples below are in F and must be generated by the engine, not stored):

| Mood               | Scale or mode                    | Example pattern    | In F         |
| ------------------ | -------------------------------- | ------------------ | ------------ |
| Happy and bright   | Major                            | I V vi IV          | F C Dm Bb    |
| Sad and reflective | Natural minor (Dm has F's notes) | i VI III VII in Dm | Dm Bb F C    |
| Hopeful            | Major, starting on vi            | vi IV I V          | Dm Bb F C    |
| Dreamy             | Lydian                           | Imaj7 II           | Fmaj7 G      |
| Epic               | Mixolydian flavor                | I bVII IV          | F Eb Bb      |
| Tense and dark     | Phrygian                         | i bII              | Fm Gb        |
| Calm               | Major with 7ths                  | Imaj7 IVmaj7       | Fmaj7 Bbmaj7 |
| Bluesy             | Dominant 7ths                    | I7 IV7 V7          | F7 Bb7 C7    |

Notes:

- Moods are Western-convention tendencies that also depend on tempo, rhythm, and sound. Always show the caveat. Cite sources for each profile in `KNOWLEDGE_SOURCES.md` and mark disputed or loose claims.
- "Sad" and "Hopeful" share chords in a different order. Use that as a teaching moment in the Why panel.
- Safe melody notes for a mood are computed from the scale or mode and the current chord (chord tones plus scale tones), not stored.
- For Indian music (later), mood maps to raga and rasa with Sa selectable. Keep that separate from the Western profiles and have it reviewed by a knowledgeable person. Do not build it in this prompt.

---

## 4. Plain-language layer (beginner friendly)

Create a presentation layer in the web app or a `music-text` package that converts structured results into words. The engine returns data; this layer returns sentences. Wording can change without touching music math.

### 4.1 Three levels (Beginner is the default)

| Level    | Shows                                                                                       | Hides                                     |
| -------- | ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Beginner | Chord names, sound, finger diagram, plain "feeling" label                                   | Intervals, Roman numerals, spelling rules |
| Learning | Adds note names inside chords, home and tension roles, the scale                            | Voicing details, scoring                  |
| Advanced | Everything, including intervals, Roman numerals, alternate spellings, shape score breakdown | Nothing                                   |

The user can switch levels any time. The engine always computes all of it. Every theory word has a tap-to-explain "What's this?" (one sentence plus a Hear button).

### 4.2 Plain labels for diatonic chord roles (major key)

| Role | Plain label      | Beginner text (example)                                 |
| ---- | ---------------- | ------------------------------------------------------- |
| I    | Home             | "Feels settled. Most songs start and end here."         |
| IV   | Open and lifting | "Feels like stepping out into something new."           |
| V    | Wants to go home | "Builds a little tension that the home chord resolves." |
| vi   | Soft, a bit sad  | "Same family as the home chord, but gentler."           |
| ii   | Gentle, moving   | "A calm step between chords."                           |
| iii  | Dreamy           | "Sits between happy and sad."                           |
| vii° | Very tense       | Show only at Learning level and above.                  |

Roles are produced by the engine as `function` values (tonic, subdominant, dominant, etc.). The text layer maps them to labels, so changing key never changes the wording logic.

### 4.3 Copy rules (follow these everywhere)

- Say what it sounds like or does before its name ("a chord that feels like home" before "tonic").
- Every theory word gets one sentence and a Hear button.
- Short sentences, active voice, no jargon in headings or buttons.
- Buttons say what happens: "Play it," "Show easier version," "Save my chords." The same action keeps the same name throughout ("Save" then "Saved").
- Errors say what to do next: "That note is outside this key. Try one of the lit-up notes."
- Show at most three choices at once on a beginner screen.
- Explain the first time that "Bb" is the black key next to A, and keep spelling consistent afterwards.

---

## 5. Beginner flows to build

### 5.1 "Start from here" (first-run flow)

1. **Where do you want to start?** Tap a fret on the guitar, tap a piano key, or pick a note name. Tapping string 1 fret 1 shows "That's the note F." with a Play button. Uses `startFromPosition`.
2. **Use F as your home note?** Explain: "Home is the note a song feels settled on." Choices: **Bright (F major)** or **Sad (F minor)**, each with a Hear button.
3. **What do you want to do?** **Play along** or **Make my own music**.
4. Land on the chord palette (5.2).

### 5.2 Chord palette (always visible beside the instruments)

- Desktop: a panel to the right of the guitar and piano. Phone: a bottom sheet that stays reachable while an instrument is on screen.
- Each chord card: name, finger diagram, piano keys, Play button, plain feeling label (4.2), and an "easier version" toggle when one exists.
- Sections: **Try these in order** (one popular pattern with a "Play it" loop button) and **All chords in this key**.
- Tapping a chord highlights it on guitar and piano at once, plays it, and updates the Why panel.
- Easier-chord behavior: if a chord is hard (for example, full F barre), the card says "F is tricky at first. Try an easier version," shows the easiest valid shape first (mini F `xx3211`, or Fmaj7 `xx3210` as a labeled variation), and puts the full version under "When you're ready." Always say how the sound differs ("lighter," "thinner").
- Capo suggestions in plain words: "Put a capo on fret 3 and play these easy chords. They still sound like F, Gm, Bb and C." Always show "Shape you play" and "Chord you hear."

### 5.3 Compose with a mood

- Large cards: Happy and bright, Sad and reflective, Hopeful, Dreamy, Epic, Tense and dark, Calm, Bluesy. Never more than three choices visible at once on a small beginner screen; scroll or paginate.
- Tapping a mood:
  1. Plays a short example in the user's key.
  2. Fills the palette with matching chords and one or two starter patterns.
  3. Lights up "safe notes" for a melody on the piano and shows chord shapes on the guitar.
  4. Shows a one-line reason ("Minor chords feel sadder because the middle note is lower"). Learning level adds the interval detail.
  5. Shows the caveat that mood is a tendency, not a rule.
- Compose timeline: drop chords into bars, loop, play, change the mood and see the same bars re-suggest. A **"What next?"** button uses `whatNext` and gives a short reason per suggestion.
- Save to the notebook with key, mood, chords, capo, and notes preserved as structure.

### 5.4 Guided lesson: "Your first song in F"

Authored as typed data in `music-content`, using the live palette, not screenshots:

1. Hear the home chord (F).
2. Add one more chord (C) and hear how it pulls back to F.
3. Add Dm and Bb to make a loop.
4. Strum along with the metronome using the mini F.
5. Switch the mood to Sad and hear the same chords in a new order.
6. Save "My first progression."
   Each step follows SEE, HEAR, UNDERSTAND, PLAY, EXPERIMENT, PRACTICE, SAVE.

---

## 6. Tests and gates

Add or extend, and keep CI green:

- Unit golden tables: all 24 keys (signature, spelled scale, diatonic triads and sevenths, Roman numerals) in major and natural minor; additional tables for harmonic and melodic minor and the seven modes for at least C, F, and G.
- Property tests: transpose round trips; Roman numeral invariance; capo sounding pitch for every capo 0 to 12 in all 12 keys; every generated shape sounds only chord pitch classes (also in drop D and ukulele tuning); chord symbol parse and format round trip; `startFromPosition` returns the note whose MIDI equals open string plus fret.
- Fixture rediscovery: generator finds open C, G, D, A, E, Am, Em, Dm and barre F and Bm; `easierAlternatives('F')` includes `xx3211`.
- Mood tests: every mood template renders valid chords in all 12 keys; transposing a mood's output equals rendering it in the new key.
- Text layer tests: every function value maps to a label at each level; no raw jargon appears in Beginner copy (a lint over the copy files with a word list: interval, tonic, subdominant, diatonic, Roman, mixolydian, and similar, allowed only at Learning or Advanced).
- UI tests (Playwright): "Start from here" flow with F; palette shows seven chords for F major with correct labels; chord tap highlights guitar and piano together; easier version toggle; capo display shows "Shape you play" and "Chord you hear"; mood pick fills the palette; "Your first song in F" completes and saves; mobile viewport (360 px) usable, with the palette reachable; Axe checks.
- Coverage threshold on `music-core` of 95 percent or higher. A step is not finished if any gate fails.

---

## 7. Work order and reporting

1. Audit and write `docs/AUDIT_2.md`.
2. Sections 2.1 to 2.4 (pitch, scales, chords, progressions, transposition).
3. Sections 2.5 and 2.6 (guitar generator, capo engine). Convert old shape templates to fixtures.
4. Section 2.7 (beginner engine functions).
5. Section 3 (mood data) and section 4 (text layer).
6. Section 5 (flows and UI), following the design plan and accessibility rules from the master prompt (shape plus label plus color for note roles, 44 px touch targets, keyboard operable, reduced motion).
7. Section 6 gates.

After each numbered step, post a short gate report: what was built, test results, what is deferred, decisions made. Keep going unless a gate fails or a blocker from the master prompt's "when to ask me" list occurs.

Not in this prompt: audio analysis, AI assistant, raga and rasa mood mapping, accounts and sync.
