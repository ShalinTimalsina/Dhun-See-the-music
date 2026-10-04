# MASTER PROMPT: Music Intelligence and Learning Environment (Next.js)

Paste this whole file as the first message to your coding agent. Put the full product specification in the repo at `docs/SPEC.md` before you start (the agent must read it in full). If anything in this prompt conflicts with the spec, this prompt wins for technical decisions and the spec wins for product intent.

---

## 0. Your role and working agreement

You are the lead engineer and designer building a real, fully functional music learning platform. You are not building a mockup. Everything visible must be computed from a real musical model.

Working rules:

1. **Read `docs/SPEC.md` completely before writing code.** Summarize your understanding in `docs/UNDERSTANDING.md` (max one page) and list any ambiguity you resolved and how.
2. **Do not stop to ask questions** unless you hit a blocker listed in section 17. For everything else, make the best decision, and record it in `docs/DECISIONS.md` (date, decision, alternatives, reason).
3. **Music model first, UI last.** Follow the spec's Development Rule (section 48): define the concept, its math, its relations, its instrument mapping, its audio, its transposition, its edge cases, test it, and only then build UI.
4. **Work milestone by milestone** (section 14). At the end of each milestone: run all tests, run lint and typecheck, summarize what works and what is deliberately deferred, then continue to the next milestone without waiting unless a gate fails.
5. **Never fake functionality.** No static chord images, no hardcoded transposition tables, no random recommendations, no placeholder "AI" features. If something is not built yet, it is not shown in the UI (or it is clearly marked "coming later" and disabled).
6. **Keep the repo always runnable.** `pnpm install && pnpm dev` must work after every milestone.
7. Prefer small, typed, pure functions. Write the test before or together with each function.

---

## 1. Product in one paragraph

A beginner-friendly web app where a user chooses a chord, key, scale, song or melody and instantly **sees it** (piano, guitar fretboard, guitar chord diagrams, harmonium), **hears it**, **understands why** (interval-based explanations), **plays it** (interactive instruments, touch and MIDI), **transposes it** (including capo and comfortable-singing-key), **practices it** (lessons, ear training), and **saves it** (local-first notebook). Core loop: SEE, HEAR, UNDERSTAND, PLAY, EXPERIMENT, PRACTICE, SAVE. The interface stays simple; complexity appears progressively.

Signature features that must be excellent: **Music Canvas** (one shared selection drives every view), **Capo Engine**, **Find My Key** (voice-range-based transposition), **Guitar shape generator**, **Harmonium with sargam**, **"Why?" explanations**.

V1 has **no AI and no audio analysis**. Those are later phases and must be architecturally possible but not built.

---

## 2. Tech stack (decisions already made)

Use current stable versions. Verify versions with `npm view <pkg> version` at install time; do not guess version numbers.

| Concern              | Choice                                                                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework            | Next.js, App Router, React, TypeScript `strict: true`                                                                                                                                   |
| Monorepo             | pnpm workspaces plus Turborepo                                                                                                                                                          |
| Styling              | Tailwind CSS, shadcn/ui for primitives (restyled to match section 11, not left at defaults)                                                                                             |
| Interactive graphics | Hand-written SVG React components for piano, fretboard, chord diagrams, circle of fifths. Canvas only if profiling shows SVG is too slow                                                |
| State                | Zustand. One `canvasStore` holds the shared selection (section 8)                                                                                                                       |
| Audio                | Web Audio API with Tone.js and a sampled-instrument library (evaluate smplr; choose one, record in DECISIONS.md). Synth fallback when samples are not loaded                            |
| Notation             | VexFlow or abcjs for rendering (evaluate; choose one). Only needed for the Melody Builder in M7                                                                                         |
| Theory helpers       | You may use Tonal.js for cross-checking in tests. **The production engine is our own code** so that spelling, capo, shapes, voice-fit and sargam are fully under our control            |
| Validation           | Zod schemas for every persisted or imported object, with `schemaVersion`                                                                                                                |
| Storage (V1)         | Dexie (IndexedDB), local-first, with JSON export and import. No accounts in V1. Keep a storage interface so a server DB (Postgres plus Drizzle or Prisma, plus auth) can be added later |
| Tests                | Vitest, fast-check (property tests), Playwright (UI and a11y smoke), `@axe-core/playwright`                                                                                             |
| MIDI                 | Web MIDI API (feature-detected; Chrome and Edge only; degrade gracefully)                                                                                                               |
| PWA                  | Installable and offline-capable (service worker; cache app shell and sample files)                                                                                                      |
| i18n                 | Structure all UI strings for translation from day one (English first; sargam labels in Latin and Devanagari)                                                                            |
| CI                   | GitHub Actions: typecheck, lint, unit, property tests, Playwright smoke                                                                                                                 |

---

## 3. Repository structure

```
/
  docs/
    SPEC.md                (the product spec, provided)
    UNDERSTANDING.md
    DECISIONS.md
    MUSIC_MODEL.md         (written in M0; the single source of truth for the model)
    KNOWLEDGE_SOURCES.md   (provenance for explanations and lesson content)
    SKILLS.md              (skills installed and why; see section 15)
  packages/
    music-core/            PURE TypeScript. No React, no DOM, no Web Audio.
      src/
        pitch/             Note, PitchClass, spelling, MIDI conversion, frequency
        interval/
        scale/             scale + mode definitions, scale builder
        chord/             chord formulas, chord parser and symbol writer
        key/               key signatures, circle of fifths, diatonic chords
        harmony/           Roman numerals, functions, progressions
        transpose/
        rhythm/            ticks, durations, meter
        melody/
        instruments/
          piano/
          guitar/          tuning, fretboard map, shape generator, scoring
          harmonium/       keyboard map, sargam
        performance/       capo engine, voicing, inversion
        voice/             range model, key-fit
        match/             chord-to-melody matching
        explain/           structured "Why?" explanations (data, not prose strings)
        difficulty/        (stub in V1, implemented later)
      test/
    music-audio/           Playback scheduling on top of music-core (browser only)
    music-content/         Lessons, exercises, public-domain songs, as typed data files
  apps/
    web/                   Next.js app
  e2e/                     Playwright
```

**Hard rule:** `music-core` must not import from React, the DOM, Tone.js, or any app package. Enforce with an ESLint `no-restricted-imports` rule and a CI check. UI components must never contain theory logic; they only render values returned by `music-core`.

---

## 4. Core data model (implement exactly this shape, extend carefully)

Document the final model in `docs/MUSIC_MODEL.md` in M0.

### 4.1 Pitch and spelling

```ts
type Step = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
type Alter = -2 | -1 | 0 | 1 | 2; // double flat to double sharp
interface Note {
  step: Step;
  alter: Alter;
  octave: number;
} // spelled pitch, e.g. Bb3
interface PitchClassSpelled {
  step: Step;
  alter: Alter;
} // no octave, e.g. Bb
```

- MIDI number is **derived**: `midi = 12*(octave+1) + stepSemitone[step] + alter` (C4 = 60).
- Frequency is derived from MIDI and a reference pitch (default A4 = 440 Hz, configurable).
- Spelling comes from **interval arithmetic on letter names**, never from a lookup of "nearest sharp or flat". Example: a major third above Bb is D, a minor third above F# is A, a major third above Db is F.
- Provide `enharmonicEquivalent`, `simplifySpelling` (only on explicit request, never silently), and `spellForKey(midi, key)`.

### 4.2 Interval

```ts
type Quality = 'P' | 'M' | 'm' | 'A' | 'd' | 'AA' | 'dd';
interface Interval {
  number: number /* 1=unison, 2=second, ... can exceed 8 */;
  quality: Quality;
}
```

Provide `semitones(interval)`, `transposeNote(note, interval, direction)`, `intervalBetween(a, b)`, `invert`, and a display function returning both the name ("Major 3rd") and numeric size ("4 semitones"). The tritone must be representable as both A4 and d5 with correct spelling.

### 4.3 Scales, modes, keys

```ts
interface ScaleDef {
  id: string;
  name: string;
  intervals: Interval[];
  /* from root */ family?: string;
  parentScaleId?: string;
  modeIndex?: number;
}
interface Key {
  tonic: PitchClassSpelled;
  mode: 'major' | 'minor' | string;
  scaleId: string;
}
```

Registry-based so new scales are added by data, not code. V1 scales: major, natural minor, harmonic minor, melodic minor (ascending form with a note on descending), major and minor pentatonic, blues, the seven modes. Provide key signatures (sharps or flats count, spelled accidentals), relative major or minor, parallel key, neighboring keys on the circle of fifths. Support theoretical keys (for example, G# major with F-double-sharp) without crashing; mark them as theoretical.

### 4.4 Chords

```ts
interface ChordQualityDef {
  id: string;
  symbols: string[];
  intervals: Interval[];
  name: string;
}
interface Chord {
  root: PitchClassSpelled;
  quality: string;
  bass?: PitchClassSpelled /* slash chord */;
  extensions?: string[];
}
interface Voicing {
  notes: Note[];
  inversion: number; /* absolute pitches */
}
```

V1 qualities: major, minor, diminished, augmented, sus2, sus4, maj7, 7, m7, m7b5, dim7, mMaj7, 6, m6, add9, 9, maj9, m9 (the last four may be basic in V1; the registry must allow 11, 13 and alterations later). Provide a **chord symbol parser and writer** that round-trips (`Cmaj7`, `CM7`, `C△7`, `Am7b5`, `Bø`, `D/F#`, `Gsus4`). Provide `chordTones`, `chordPitchClasses`, `invertChord`, `romanNumeral(chord, key)` and `chordFromRoman(numeral, key)`. Roman numerals must handle case (I vs i), diminished (vii°), augmented, sevenths, borrowed chords (bVII, bVI, iv in major), and secondary dominants (V/V) at least at a basic level, otherwise return an explicit `nonDiatonic` flag with the best interpretation. Never silently mislabel.

### 4.5 Progression, rhythm, melody, song

```ts
interface ProgressionStep { numeral: string; chord?: ChordOverride; beats: number }
interface Progression { key: Key; steps: ProgressionStep[] }       // stored as functions, rendered as chords
const PPQ = 480;                                                  // ticks per quarter note
interface MelodyNote { note: Note; startTick: number; durationTicks: number; velocity?: number }
interface Song {
  schemaVersion: number; id: string; title: string; artist?: string;
  key: Key; tempo: number; meter: { num: number; den: number };
  sections: Section[];   // each has chords and optional lyrics and melody, in ticks
  instrumentConfig: { guitar?: {tuning: Note[]; capo: number}; harmonium?: {sa: PitchClassSpelled}; ... };
  vocal?: { low: Note; high: Note };
  practice: { status: 'new'|'learning'|'comfortable'|'mastered'; history: PracticeEntry[] };
  notes?: string; source?: ProvenanceRef; license?: 'public-domain'|'user-owned'|'structure-only';
}
```

A song's chords are stored as **progression plus key**, so changing key re-renders everything. All transposition goes through one function and returns new immutable objects.

---

## 5. Algorithms (specify, implement, test)

### 5.1 Transposition

`transpose(x, interval)` works on Note, Chord, Key, Progression, Melody, Song, vocal range, capo-aware config. Choose spelling for the new key by interval arithmetic (a whole step up from Bb major tonic gives C major; up a minor second from C major gives Db major by default, with an option to prefer F# vs Gb by fewest accidentals in the resulting key signature). Roman numerals do not change under transposition. Provide `transposeBySemitones(x, n, {preferSpelling})` for UI sliders.

### 5.2 Guitar fretboard map

Given a tuning (array of open-string Notes, low to high; default E2 A2 D3 G3 B3 E4), fret count (default 24), and capo, compute for every string and fret the sounding Note. Provide `positionsOf(pitchClassSet, range)` and `positionsOfExactPitch(note)`. Tunings are data: standard, drop D, DADGAD, open G, open D, half-step down, ukulele (4 strings, re-entrant) as proof that string count is configurable.

### 5.3 Guitar chord shape generator (search, not lookup)

For a target chord and tuning, enumerate fret assignments per string (muted, open, or fretted within a window), and keep candidates satisfying:

- fret span of at most 4 (configurable) within the fretted notes,
- every chord tone present (fifth may be omitted for 7th and extended chords, with a flag),
- no muted string between two played strings except at the edges (configurable),
- lowest sounded note is the root for non-slash chords (inversions and slash chords allowed with a flag),
- at most 4 distinct fretted positions without a barre, otherwise it must be representable as a barre.
  Then compute a **difficulty score**: barre penalty (full barre vs partial), finger count, span, muted-string count, distance from nut, stretch between adjacent strings, open-string bonus, root-in-bass bonus. Return a ranked list, each with: frets array, fingers (best-effort assignment), root string markers, barre info, difficulty label, and the actual sounding pitches. **The generator output must be verified against the chord's pitch classes in an automated property test.** Use well-known shapes (open C, G, D, A, E, Am, Em, Dm, F barre, Bm barre) as regression fixtures that the generator must rediscover; never ship them as the source.

### 5.4 Capo engine

For a progression or song and capo positions 0 to 12 (default UI 0 to 7): for each chord, `shape = chord transposed down by capo semitones` (spelling of the shape chosen by the shape's own key, for example, Bb with capo 1 gives A shape). Rank capo options by the sum and max difficulty of the best shape per chord (from 5.3, restricted to open-position preference), the number of open-friendly chords, and whether the shapes belong to a common easy key (G, C, D, A, E, and their relative minors). Display, always and explicitly: "Shape played: A / Sounding chord: Bb / Capo 1". Property: for every result, `soundingPitch(shape, capo) == targetChord` for every chord.

### 5.5 Find My Key (voice-range fitting)

Inputs: melody (or its lowest and highest notes), the user's `comfortLow` and `comfortHigh` (and optionally `maxLow` and `maxHigh`), the original key, and options. For every shift `t` in -12..+12 semitones (octave shifts evaluated explicitly):

- `fits = melodyLow + t >= comfortLow && melodyHigh + t <= comfortHigh`
- margin = min(distance of low note above comfortLow, distance of high note below comfortHigh)
- centeredness = distance of the melody's median pitch (or weighted by duration) from the centre of the comfort range
- optionally penalize for difficult chords or bad capo options (user toggle)
  Rank fitting candidates by margin, then centeredness, then ease. If **no** shift fits comfortably, say so honestly; show the best partial fits and which notes fall outside the range, and whether they fall inside the "maximum range". If the melody span is wider than the singer's range, state that clearly. For each candidate show: lowest and highest melody note, distance to range edges, new key, chords, Roman numerals (unchanged), guitar capo options, piano notes, harmonium notes with sargam. Prefer musically familiar keys only as a tie-breaker, never as the primary criterion.

### 5.6 Chord-to-melody matching

For melody segments (by bar or beat window), score each candidate chord (diatonic first, then common borrowed and secondary dominants): chord-tone coverage weighted by `beatStrength * duration`, penalty for strongly clashing non-chord tones on strong beats (such as a half-step clash with a chord tone), bonus for fit with the key and the previous chord (functional progression plausibility). Return a **ranked list with explanations** (chord tones hit, non-chord tones, key context). Never output a single "correct" chord. Include a visible disclaimer in the UI that multiple harmonizations are valid.

### 5.7 Harmonium and sargam

Model swaras as semitone offsets from Sa: Sa 0, Re komal 1, Re 2, Ga komal 3, Ga 4, Ma 5, Ma tivra 6, Pa 7, Dha komal 8, Dha 9, Ni komal 10, Ni 11, (Sa upper 12). Sa and Pa are fixed; Re, Ga, Dha, Ni have shuddha and komal forms; Ma has shuddha and tivra. **Sa is a variable** (any pitch class, default C). Do not store sargam as Western note names; derive Western names via `Sa + offset` with correct spelling for display. Labels in Latin (Sa Re Ga Ma Pa Dha Ni) and Devanagari, selectable. Harmonium keyboard: a range-limited keyboard (default three octaves, configurable) with the same pitch model as piano, plus an optional scale-change (transposition) setting. Leave extension points (empty registries) for raga, arohana, avarohana, pakad, tala, and do not implement them in V1.

### 5.8 Explanations ("Why?")

`music-core/explain` returns **structured explanation objects** (for example, `{ type: 'chord-construction', root, intervals, notes, summary }`), and a separate presentation layer turns them into text at two reading levels (beginner, standard). Every explanation must be derivable from the model: "Why is this C major?" lists the intervals from the actual chord formula; "Why does G work after C?" explains the function (V resolving to I) using actual scale degrees and the shared and moving tones. No free-typed theory text disconnected from model data. When a claim is a convention or has competing interpretations, say so and cite the source in `KNOWLEDGE_SOURCES.md`.

---

## 6. Audio

- Create the `AudioContext` and start it only after a user gesture; show a clear "Tap to enable sound" state. Handle iOS Safari's restrictions and the silent switch (note in UI if needed).
- Provide: play note, play chord (block and arpeggiated), play scale (up, down), play interval (harmonic and melodic), play progression with tempo and metronome click, loop a sequence, play recorded melody.
- Scheduling uses the audio clock (Tone.Transport or equivalent), never `setTimeout`, for rhythmic accuracy.
- Sampled instruments: piano, guitar (nylon or steel), harmonium (or a convincing organ or reed sample). Lazy-load and cache; fall back to a synth voice. Respect user volume. Keep latency low: preload on the Canvas page, show loading state.
- Chord playback of guitar voicings plays the **exact** generated pitches (including capo effect) at the correct octave; piano playback uses the chosen voicing and octave.
- Tuning reference pitch is configurable (A4 = 415 to 466, default 440).
- All audio features must be unit-tested at the scheduling-data level (what notes at what times) even if the sound itself cannot be.

---

## 7. Instruments (UI components driven only by `music-core`)

All of them accept a `highlight` input of the form `{ notes | pitchClasses, roles: root|third|fifth|seventh|extension|scaleTone|outside }` and emit `onPlay(note)` events.

- **Piano:** configurable range (default C2 to C7 scrolling; compact mode of two octaves for mobile), click, touch, multi-touch, computer-keyboard mapping, MIDI input, octave shift, sustain toggle, highlight scales, chord tones, inversions, intervals between two selected notes, record and loop.
- **Guitar fretboard:** tuning-driven (section 5.2), horizontal and vertical orientation (vertical for mobile), left-handed toggle, fret range selector, capo visualized as a bar with the nut shifted, click or tap to play, show note names or intervals or scale degrees, highlight roots, scales, chord tones, CAGED-style position overlays for later, compare two voicings side by side.
- **Chord diagram:** SVG diagram generated from the shape data (strings, frets, fingers, muted and open markers, barre, root marker, starting fret label). Provide alternatives carousel with difficulty labels and a "hear it" button.
- **Harmonium:** keyboard with sargam labels and Sa selector, show Western names on demand, highlight scale or chord, and play.
- **Circle of fifths:** interactive; click a key to set the Canvas; show relative minor, signature, diatonic chords with Roman numerals, neighbors, and a transposition arc.

Roles must be distinguishable **without color alone** (shape, label, or pattern in addition to color).

---

## 8. Music Canvas (central workspace)

One Zustand `canvasStore`:

```ts
interface CanvasState {
  key: Key; selection: { kind: 'note'|'interval'|'scale'|'chord'|'progression'|'song'|'melody'; value: ... };
  guitar: { tuning: Note[]; capo: number; shapeIndex: number; leftHanded: boolean };
  harmonium: { sa: PitchClassSpelled; labelScript: 'latin'|'devanagari' };
  display: { noteLabels: 'names'|'intervals'|'degrees'|'sargam'; level: 'beginner'|'standard'|'advanced' };
  playback: {...}; vocal?: { low: Note; high: Note };
}
```

Selecting anything updates all panels (piano, guitar, harmonium, circle of fifths, theory panel with formula, intervals, notes, scale relationship, Roman numeral, audio controls). Changing the key re-renders everything. URL state: the Canvas selection is serialized to the URL query so any state is shareable and refresh-safe. Undo and redo for selection changes.

Layout is responsive: desktop shows panels together; mobile shows one instrument at a time with a persistent mini theory bar.

---

## 9. Features by area (V1 scope)

**Home ("What do you want to do?"):** Learn Music, Learn a Song, Find My Key, Play Guitar, Play Piano, Play Harmonium, Understand a Chord, Build a Melody, Practice Ear Training, My Music Notebook. Each is an entry into a guided flow, not a settings page.

**Learn a Song / Song workspace:** create or open a song (progression plus key plus tempo plus meter plus optional lyrics, melody), change key and everything re-renders, show capo options, "Hear Original / Hear Transposed / Play Along / Why? / Save My Version."

**Find My Key wizard:** the 12-step flow in spec section 23, with manual vocal-range entry (piano-key picker plus note-name input, comfortable and maximum range), and a clear honest result screen (section 5.5). Microphone range test is **later**, but keep the `VocalRange` type ready for it.

**Melody Builder:** click notes, set durations with a quantize grid in ticks, record from piano or MIDI or computer keyboard, loop, show note names, intervals, detected possible keys (ranked by scale membership), notation, guitar positions, harmonium keys, and send to chord matching.

**Ear training (measurable):** interval identification, chord quality, scale or mode recognition, progression recognition (I-V-vi-IV and others), melody dictation, chord-to-melody choice. Results stored per exercise type and per item; adaptive difficulty; spaced repetition (FSRS or a simple SM-2 variant, choose and record). Randomness must come from a **seedable RNG** so exercises are reproducible in tests.

**Learning system:** a dependency-aware lesson graph (levels 1 to 8 from the spec; V1 content covers levels 1 to 6 at least, 7 through ear training, 8 as a simple composition sandbox). Every lesson follows SEE, HEAR, UNDERSTAND, PLAY, EXPERIMENT, PRACTICE, SAVE and is authored as typed data in `music-content` with embedded live widgets, not as static text and screenshots. Prerequisite gating is advisory: users can always explore freely.

**Notebook:** local-first. Save songs, chords, progressions, melodies, scales, ideas, voice configurations, capo configurations, practice sessions, notes. Saved items keep full musical structure (not rendered images). Practice history with a simple streak and time log. JSON export and import with schema versioning and migration functions. Optional recording of audio clips can wait for after V1.

**Export (V1 nice-to-have, M9):** printable chord sheet (CSS print or PDF), MIDI file export of melody and progression.

**Search (basic in V1):** filter saved and built-in songs by key, mode, progression (Roman numeral pattern, transposition-invariant), capo ease, and "in my vocal range". Built on structured metadata, not keywords.

---

## 10. Content, legal, provenance

- Seed songs: **public domain only** (traditional folk songs, hymns, traditional bhajans, and similar). Verify public-domain status for each and record it in `KNOWLEDGE_SOURCES.md` or the song's `source` field.
- Never include copyrighted lyrics or full copyrighted melodies. For commercial songs, users may enter their own data privately (`license: 'user-owned'`), and the app should store harmonic structure only if the user chooses. Show a short notice on import.
- Every nontrivial theory claim in lessons or explanations carries a `source` reference (authoritative theory text, university or conservatory open material, established educators). Where interpretations conflict (for example, naming of certain chords or Roman numeral conventions), show the convention used and note the alternative; never silently merge.
- Do not paste or reproduce copyrighted textbook content. Write original explanations, cite sources.

---

## 11. Design direction (apply the frontend-design principles)

Before building UI, produce `docs/DESIGN_PLAN.md` containing: color (4 to 6 named hex values), type (families and roles), layout concept with ASCII wireframes for Home, Music Canvas (desktop and mobile), Find My Key, and Lesson; and principles. Then **review the plan against this brief and revise any part that reads like a generic default**, noting what you changed and why. Only then write UI code.

Brief and constraints:

- **Audience:** curious beginners and self-taught musicians, including Indian-music learners using harmonium, many on phones. Calm, encouraging, never intimidating, never childish.
- **Primary job of the design:** make musical relationships legible. The instruments and the relationships between them are the product.
- **The one memorable thing:** the Music Canvas, where choosing a chord visibly lights up the same notes across piano, fretboard, and harmonium at once with a consistent role language. Spend the boldness there; keep everything else quiet and disciplined.
- **Role language:** define one consistent visual system for root, third, fifth, seventh, extension, scale tone, and outside-the-scale note, used identically in every component. Use shape, label, or pattern in addition to color. Meet WCAG AA contrast.
- **Avoid generic defaults:** do not use the cream background plus serif plus terracotta look, the near-black plus single acid accent look, the identical-rounded-card SaaS kit with gradient washes, tracked ALL-CAPS eyebrow labels above headings, numbered markers (01, 02, 03) unless the content truly is a sequence (lessons and steps are), middle-dot meta strings, or "→" on every button. Do not accent a single word in headlines. Take a distinct point of view from the world of music (instrument materials, notation, tuning, stage and studio tools) and make deliberate choices for palette, type, and layout.
- **Type:** one or two clearly distinct families, chosen deliberately, with a defined type scale; body line length under about 80 characters. Include a notation or music-symbol font for flats, sharps, and diminished or half-diminished symbols where used (evaluate Bravura or Leland via SMuFL, or well-rendered Unicode). Ensure full **Devanagari** support for sargam labels (for example, a Noto or Mukta family) and test rendering on mobile.
- **Motion:** only motion that answers a user action (note lights up, shape slides to a new capo position, key change animates the circle). No scattered entrance animations or hover transitions on everything. Respect `prefers-reduced-motion`.
- **Copy:** from the user's point of view, plain verbs, sentence case, active voice. Buttons say what happens ("Save my version", not "Submit"). The same action keeps the same name through the flow ("Save" then "Saved"). Errors say what went wrong and how to fix it, with no apologies. Empty states invite action ("Pick a chord to see it on every instrument"). Use musical terms with an always-available plain-language tooltip or "What's this?".
- **Progressive disclosure:** beginner level hides interval math and Roman numerals until asked; standard shows them; advanced exposes voicing details, scoring breakdowns, and alternate spellings.
- **Quality floor (do not announce, just do):** responsive from 360 px wide up, visible keyboard focus, full keyboard operability for instruments (documented key map), screen-reader names and live regions for "now playing" (for example, "C major: C, E, G"), reduced motion, touch targets of at least 44 px, dark and light themes derived from the token system, harmonious palette. Take screenshots at mobile and desktop during development and critique them; remove one accessory before finishing each screen.
- Keep a `docs/DESIGN_NOTES.md` journal of what you tried and rejected.

---

## 12. Testing and correctness gates (non-negotiable)

**Unit tests (Vitest)** for every module in `music-core`, with golden tables for all 12 major and 12 natural-minor keys (signature, spelled scale, diatonic triads, diatonic sevenths, Roman numerals), checked against independently written fixtures (and cross-checked against Tonal.js in tests only).

**Property tests (fast-check)** that must exist and pass:

- `transpose(transpose(x, i), invert(i))` equals `x` for notes, chords, keys, progressions, melodies, and songs (spelling-preserving where the round trip is exact).
- Roman numerals are invariant under transposition: `romanNumerals(transpose(prog, i)) == romanNumerals(prog)`.
- For every capo result, the sounding pitch classes of (shape, capo) equal the target chord's pitch classes, in every one of the 12 keys and every capo from 0 to 12.
- Every generated guitar shape, for every supported chord quality, root, and tuning, sounds only pitch classes belonging to the chord, includes the root and third (and fifth unless flagged), and respects the fret-span limit.
- `midi(note) == midi(parse(format(note)))` and chord symbol parse and format round trip.
- Find My Key: any returned "fits" candidate truly keeps `low+t >= comfortLow` and `high+t <= comfortHigh`; if any `t` in -12..12 fits, the function never returns "no fit"; ranking is monotone in margin.
- Sargam: `Sa=X` mapping equals `X + offset`; changing Sa shifts all swaras uniformly.
- Chord matching: a melody made only of the tones of chord C always ranks C (or a chord containing those tones) in the top candidates.

**Musical edge-case tests** from spec section 39: enharmonic spelling (F# vs Gb by key), double accidentals, slash chords, sus chords, sevenths, borrowed chords, secondary dominants (basic), alternate tunings (drop D, DADGAD, ukulele), capo above fret 7, octave displacement, melody notes that are not chord tones, ambiguous chords (for example, Am7 vs C6 as different interpretations of the same notes), songs that change key.

**UI tests (Playwright):** select a chord on the Canvas and assert that piano, fretboard, harmonium, circle, and theory panel all agree; change key and assert all update; capo flow shows "Shape played / Sounding chord"; Find My Key wizard happy path and no-fit path; ear training scoring; notebook save, reload, export, import. Axe checks on every main page. Test mobile viewport.

**CI gates:** typecheck, lint, all tests, and a coverage threshold on `music-core` (aim for 95 percent or higher lines and branches). A milestone is not complete if any gate fails.

---

## 13. Non-functional requirements

- **Performance:** interactive within about 3 seconds on a mid-range phone on 4G for the Canvas; audio samples lazy-loaded; avoid re-rendering all SVG on each hover (memoize, derive from the store with selectors). Dynamic-import heavy libraries (notation, Tone samples).
- **Offline/PWA:** app shell, theory data, and lessons work offline; samples cached after first load.
- **Privacy:** all user data stays on device in V1; no analytics that send musical or personal data without explicit opt-in. Microphone (later) is requested only when needed, with a clear explanation.
- **Security basics:** strict CSP where feasible, Zod validation on all imports, no `dangerouslySetInnerHTML` with user content.
- **Next.js practices:** use App Router with server components for static content (lessons, explanations shell) and client components only for interactive instruments and audio; avoid unnecessary client bundles; use route-level code splitting; metadata and Open Graph for shareable Canvas links; error and loading boundaries.
- **Code quality:** ESLint, Prettier, strict TS, no `any` without a comment, conventional commits, small PR-sized commits per task, README with setup and architecture diagram.

---

## 14. Milestones (do them in order; each ends with a gate report)

**M0 Foundations.** Repo, tooling, CI, `docs/*`, the data model in `MUSIC_MODEL.md`, the design plan, the skills setup (section 15). Gate: repo builds; docs exist; design plan self-reviewed.

**M1 music-core: pitch, interval, scale, key, chord, Roman numerals, transpose.** Full tests and property tests. Gate: golden tables for 24 keys pass; transposition properties pass; chord symbol round trip passes.

**M2 Audio and base instruments.** Audio engine with user-gesture start, piano and fretboard components driven by core, note and chord and scale playback. Gate: you can click a piano key and a fret and hear the correct pitch; scheduling tests pass.

**M3 Music Canvas.** Shared store, URL state, theory panel, circle of fifths, role language across instruments. Gate: Playwright test proving all panels stay in sync.

**M4 Guitar shape generator and capo engine.** Gate: all shape and capo property tests pass; open-chord regression fixtures rediscovered; the Bb with capo 1 (A, F#m, D, E) example works and displays "Shape played / Sounding chord".

**M5 Song workspace and progressions.** Song model, editor, transposition of whole songs, Hear Original and Hear Transposed, save to notebook. Gate: C-Am-F-G to Bb-Gm-Eb-F and D-Bm-G-A via one action, with melody, capo, and instruments updating.

**M6 Voice range and Find My Key.** Manual range entry, key-fit algorithm, honest no-fit handling, full wizard. Gate: key-fit property tests and UI paths.

**M7 Harmonium, sargam, Melody Builder, chord-to-melody matching.** Gate: Sa=C and Sa=D mapping tests; melody to ranked chord suggestions with explanations.

**M8 Learning and ear training.** Lesson graph, lessons for levels 1 to 6, ear training with scoring, spaced repetition, progress tracking. Gate: each lesson uses live widgets and the SEE-HEAR-UNDERSTAND-PLAY-EXPERIMENT-PRACTICE-SAVE loop; exercise reproducibility via seeds.

**M9 Polish and release.** Notebook export or import, printable chord sheets, MIDI export, PWA offline, accessibility audit, performance pass, seed public-domain songs, README, demo script. Gate: all CI gates; manual walk through the spec's section 45 journey end to end.

Later (do **not** build now, but do not block): V2 song import and key detection, V3 audio analysis with confidence scores and user correction (pitch detection, beat tracking, chord recognition via a worker), V4 assistant that calls the deterministic engine through typed tool functions. Keep `music-core` functions pure and serializable so they can later be exposed as tools.

---

## 15. Skills: how to discover and use them

1. At M0, run: `npx skills add vercel-labs/skills@find-skills`. Before installing **any** skill, read its contents; skills are instructions you will follow. Do not install anything that requests credentials, exfiltrates data, or runs unexplained network or shell commands.
2. Use the find-skills capability (or `npx skills find <keyword>`) to search for skills covering each of these, and install the best-rated, best-maintained ones that match. Record each installed skill, its source, and why in `docs/SKILLS.md`; record the ones you searched for and rejected too.
   - Next.js App Router best practices, React performance, server and client component boundaries
   - Frontend design, distinctive UI, web interface guidelines
   - Tailwind CSS and shadcn/ui
   - Accessibility auditing (WCAG, keyboard navigation, ARIA for custom widgets)
   - SVG and interactive graphics
   - Web Audio API and Tone.js (may not exist; if not, rely on official docs)
   - Zustand state management
   - Zod and TypeScript patterns
   - Vitest, fast-check, Playwright testing
   - PWA, service workers, offline support
   - IndexedDB and Dexie
   - Database and ORM and auth (Drizzle or Prisma) for a later server phase
   - Technical writing and documentation
3. If a skill conflicts with this prompt, this prompt wins; note the conflict in `DECISIONS.md`.
4. If the skills ecosystem does not offer something you need, use official library documentation and note it.

---

## 16. Definition of done (V1)

- A beginner can complete the spec's section 45 journey (choose song, find comfortable key, see new chords, get capo options with explicit "Shape played / Sounding chord," view piano and harmonium with sargam, hear original and transposed, learn why, save "My Version") with no theory knowledge.
- Every visualization is generated from the model; every transposition, capo result, and shape is computed; every property test passes.
- Ear training and lessons are measurable and persistent.
- Works on phone and desktop, offline after first load, keyboard- and screen-reader-usable.
- No fake features; deferred features are absent or clearly disabled.
- Docs are current: `MUSIC_MODEL.md`, `DECISIONS.md`, `KNOWLEDGE_SOURCES.md`, `SKILLS.md`, `DESIGN_PLAN.md`, README.

## 17. When you may stop and ask me (only these)

- A legal or licensing question that you cannot resolve (for example, whether a specific song is public domain).
- A needed paid service, API key, or account.
- A decision that would invalidate the data model in section 4 after M1 (explain the tradeoff and propose one option).
- A skill or dependency that needs elevated permissions or looks unsafe.

Otherwise: decide, document, and keep going.

## 18. First actions (do these now, in order)

1. Read `docs/SPEC.md` fully. Write `docs/UNDERSTANDING.md`.
2. Scaffold the monorepo, tooling, CI, and ESLint boundary rule for `music-core`.
3. Install and review skills per section 15; write `docs/SKILLS.md`.
4. Write `docs/MUSIC_MODEL.md` from section 4 and section 5, and `docs/DESIGN_PLAN.md` from section 11 (including the self-review).
5. Begin M1 with tests first. Report at the end of M0 and each milestone in a short gate report: what was built, test results, deferred items, decisions made.
