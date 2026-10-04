'use client';

import React, { useState } from 'react';
import {
  parseChord,
  getChordPitches,
  getChroma,
  formatChord,
  PitchClassSpelled,
  ChordDef,
} from '@music/core';
import { AudioEngine } from '@music/audio';
import { useCanvasStore } from '../store/canvasStore';

export function SongPad() {
  const [inputText, setInputText] = useState('C G Am F');
  const [parsedChords, setParsedChords] = useState<
    { root: PitchClassSpelled; chordDef: ChordDef }[]
  >([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { setRoot, setChord, baseOctave } = useCanvasStore();

  const handleExtract = () => {
    // Basic extraction: split by whitespace, commas, or newlines, and parse
    const tokens = inputText.split(/[\s,]+/);
    const validChords: { root: PitchClassSpelled; chordDef: ChordDef }[] = [];

    tokens.forEach((token) => {
      if (!token) return;
      const parsed = parseChord(token);
      if (parsed) {
        validChords.push({ root: parsed.root, chordDef: parsed.chordDef });
      }
    });

    setParsedChords(validChords);
  };

  const playChord = async (root: PitchClassSpelled, chordDef: ChordDef, index: number) => {
    setRoot(root);
    setChord(chordDef);

    // Visual feedback
    setActiveIndex(index);
    setTimeout(() => {
      setActiveIndex((prev) => (prev === index ? null : prev));
    }, 300);

    await AudioEngine.init();
    const pitches = getChordPitches(root, chordDef);

    const rootStep =
      pitches[0].alter === 1
        ? `${pitches[0].step}#`
        : pitches[0].alter === -1
          ? `${pitches[0].step}b`
          : pitches[0].step;
    const noteNames = [`${rootStep}${baseOctave - 1}`]; // Bass note one octave below

    let currentOctave = baseOctave;
    let lastChroma = -1;

    pitches.forEach((p) => {
      const step = p.alter === 1 ? `${p.step}#` : p.alter === -1 ? `${p.step}b` : p.step;
      const chroma = getChroma(p);
      if (lastChroma !== -1 && chroma < lastChroma) currentOctave++;
      lastChroma = chroma;
      noteNames.push(`${step}${currentOctave}`);
    });

    AudioEngine.playChord(noteNames);
  };

  // Keyboard mapping for 1-9
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.repeat) return;

      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= 9) {
        const idx = num - 1;
        if (parsedChords[idx]) {
          playChord(parsedChords[idx].root, parsedChords[idx].chordDef, idx);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [parsedChords, baseOctave]);

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-12">
      <div className="text-center">
        <h2 className="mb-4 text-4xl font-bold tracking-tight">Song Pad</h2>
        <p className="text-muted mx-auto max-w-xl">
          Paste any chord progression (e.g., from Ultimate Guitar or a songbook) and we'll extract
          them into a playable interactive pad.
        </p>
      </div>

      <div className="bg-surface flex w-full flex-col gap-4 rounded-3xl border border-white/5 p-6 shadow-2xl">
        <textarea
          className="bg-base text-primary focus:border-accent h-32 w-full resize-none rounded-2xl border border-white/10 p-4 font-mono outline-none transition-colors"
          placeholder="Paste chords here... e.g. C G Am F"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          onClick={handleExtract}
          className="self-end rounded-full bg-white px-8 py-3 font-bold text-[#1a1412] shadow-lg active:scale-95"
        >
          Extract Chords
        </button>
      </div>

      {parsedChords.length > 0 && (
        <div className="w-full">
          <h3 className="text-muted mb-6 text-center text-sm font-semibold uppercase tracking-wider">
            Your Playable Chords
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
            {parsedChords.map((chord, i) => {
              const name = formatChord(chord.root, chord.chordDef);
              const isActive = activeIndex === i;

              return (
                <button
                  key={i}
                  onClick={() => playChord(chord.root, chord.chordDef, i)}
                  className={`group relative flex flex-col items-center justify-center rounded-3xl border p-6 transition-all duration-200 ${
                    isActive
                      ? 'bg-accent border-accent scale-105 shadow-[0_0_30px_rgba(229,149,0,0.4)]'
                      : 'bg-surface border-white/10 hover:border-white/30 hover:bg-white/5 active:scale-95'
                  } `}
                >
                  <span
                    className={`absolute left-4 top-3 font-mono text-xs font-bold opacity-50 ${isActive ? 'text-[#1a1412]' : 'text-muted'}`}
                  >
                    {i < 9 ? i + 1 : ''}
                  </span>
                  <span
                    className={`text-3xl font-bold transition-colors ${isActive ? 'text-[#1a1412]' : 'text-primary group-hover:text-accent'}`}
                  >
                    {name}
                  </span>
                  <span
                    className={`mt-2 text-xs transition-opacity ${isActive ? 'text-[#1a1412]/70 opacity-100' : 'text-muted opacity-0 group-hover:opacity-100'}`}
                  >
                    {isActive ? 'Playing...' : 'Tap to play'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
