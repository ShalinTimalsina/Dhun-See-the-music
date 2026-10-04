import { create } from 'zustand';
import { Key, ChordDef, PitchClassSpelled, Note, MAJOR_TRIAD } from '@music/core';

export interface StartedNoteData {
  note: Note;
  keySuggestions: { key: Key; reason: { message: string } }[];
}

export type DisplayLevel = 'beginner' | 'standard' | 'advanced';
export type AppMode = 'start' | 'palette' | 'compose' | 'songpad';

interface CanvasState {
  // Global Musical State
  selectedKey: Key;
  selectedRoot: PitchClassSpelled;
  selectedChord: ChordDef;

  // UI Preferences
  displayLevel: DisplayLevel;
  appMode: AppMode;
  selectedMood: string | null;
  startedNote: StartedNoteData | null; // The note they tapped in 'start' mode
  composition: { root: PitchClassSpelled; chordDef: ChordDef }[];
  baseOctave: number;

  // Actions
  setKey: (key: Key) => void;
  setRoot: (root: PitchClassSpelled) => void;
  setChord: (chord: ChordDef) => void;
  setDisplayLevel: (level: DisplayLevel) => void;
  setAppMode: (mode: AppMode) => void;
  setMood: (moodId: string | null) => void;
  setStartedNote: (note: StartedNoteData | null) => void;
  addToComposition: (chord: { root: PitchClassSpelled; chordDef: ChordDef }) => void;
  clearComposition: () => void;
  setBaseOctave: (octave: number | ((prev: number) => number)) => void;
}

const DEFAULT_KEY: Key = { tonic: { step: 'C', alter: 0 }, mode: 'major' };
const DEFAULT_ROOT: PitchClassSpelled = { step: 'C', alter: 0 };

export const useCanvasStore = create<CanvasState>((set) => ({
  // Initial State
  selectedKey: DEFAULT_KEY,
  selectedRoot: DEFAULT_ROOT,
  selectedChord: MAJOR_TRIAD,
  displayLevel: 'beginner',
  appMode: 'start',
  selectedMood: null,
  startedNote: null,
  composition: [],
  baseOctave: 3,

  // Mutators
  setKey: (key) => set({ selectedKey: key }),
  setRoot: (root) => set({ selectedRoot: root }),
  setChord: (chord) => set({ selectedChord: chord }),
  setDisplayLevel: (level) => set({ displayLevel: level }),
  setAppMode: (mode) => set({ appMode: mode }),
  setMood: (moodId) => set({ selectedMood: moodId }),
  setStartedNote: (note) => set({ startedNote: note }),
  addToComposition: (chord) => set((state) => ({ composition: [...state.composition, chord] })),
  clearComposition: () => set({ composition: [] }),
  setBaseOctave: (updater) =>
    set((state) => ({
      baseOctave: typeof updater === 'function' ? updater(state.baseOctave) : updater,
    })),
}));
