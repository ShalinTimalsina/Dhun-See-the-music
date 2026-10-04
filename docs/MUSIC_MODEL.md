# Music Data Model (V1)

This document defines the core data structures for `music-core`. It is the single source of truth for the musical model.

## 1. Pitch and Spelling

```typescript
export type Step = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type Alter = -2 | -1 | 0 | 1 | 2; // double flat to double sharp

export interface Note {
  step: Step;
  alter: Alter;
  octave: number;
}

export interface PitchClassSpelled {
  step: Step;
  alter: Alter;
}
```

_Note: MIDI and frequency are derived properties, not stored._

## 2. Interval

```typescript
export type Quality = 'P' | 'M' | 'm' | 'A' | 'd' | 'AA' | 'dd';

export interface Interval {
  number: number; // 1=unison, 2=second, etc.
  quality: Quality;
}
```

## 3. Scales, Modes, Keys

```typescript
export interface ScaleDef {
  id: string;
  name: string;
  intervals: Interval[]; // from root
  family?: string;
  parentScaleId?: string;
  modeIndex?: number;
}

export interface Key {
  tonic: PitchClassSpelled;
  mode: 'major' | 'minor' | string;
  scaleId: string;
}
```

## 4. Chords

```typescript
export interface ChordQualityDef {
  id: string;
  symbols: string[];
  intervals: Interval[];
  name: string;
}

export interface Chord {
  root: PitchClassSpelled;
  quality: string;
  bass?: PitchClassSpelled; // For slash chords
  extensions?: string[];
}

export interface Voicing {
  notes: Note[];
  inversion: number;
}
```

## 5. Progression, Rhythm, Melody, Song

```typescript
export interface ProgressionStep {
  numeral: string;
  chord?: Chord; // ChordOverride
  beats: number;
}

export interface Progression {
  key: Key;
  steps: ProgressionStep[];
}

export const PPQ = 480; // ticks per quarter note

export interface MelodyNote {
  note: Note;
  startTick: number;
  durationTicks: number;
  velocity?: number;
}

export interface Section {
  name?: string;
  progression: ProgressionStep[];
  // melody?: ...
}

export interface Song {
  schemaVersion: number;
  id: string;
  title: string;
  artist?: string;
  key: Key;
  tempo: number;
  meter: { num: number; den: number };
  sections: Section[];
  instrumentConfig: {
    guitar?: { tuning: Note[]; capo: number };
    harmonium?: { sa: PitchClassSpelled };
  };
  vocal?: { low: Note; high: Note };
  practice: {
    status: 'new' | 'learning' | 'comfortable' | 'mastered';
    history: any[]; // PracticeEntry[]
  };
  notes?: string;
  source?: string; // ProvenanceRef
  license?: 'public-domain' | 'user-owned' | 'structure-only';
}
```
