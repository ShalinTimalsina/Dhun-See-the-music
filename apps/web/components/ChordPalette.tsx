'use client';

import React from 'react';
import { useCanvasStore } from '../store/canvasStore';
import {
  chordPalette,
  explainDiatonicRole,
  formatChord,
  getChordPitches,
  getChroma,
} from '@music/core';
import { AudioEngine } from '@music/audio';
import { SpeakerHigh } from '@phosphor-icons/react';

export function ChordPalette() {
  const { selectedKey, displayLevel, selectedRoot, selectedChord, setRoot, setChord, baseOctave } =
    useCanvasStore();

  // M9: Get structured palette data from the engine
  const palette = chordPalette(selectedKey, { level: displayLevel });

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto rounded-2xl border border-white/5 bg-[#1a1412] p-6">
      <h3 className="text-primary mb-2 text-xl font-bold">Chord Palette</h3>
      <p className="text-muted mb-6 text-sm">
        All the chords that fit naturally in {selectedKey.tonic.step}{' '}
        {selectedKey.mode === 'major' ? 'Major' : 'Minor'}.
      </p>

      <div className="flex flex-col gap-4">
        {palette.diatonic.map((item, i) => {
          const isSelected =
            selectedRoot.step === item.chord.root.step &&
            selectedRoot.alter === item.chord.root.alter &&
            selectedChord.id === item.chord.chordDef.id;
          const chordName = formatChord(item.chord.root, item.chord.chordDef);
          const mappedLevel =
            displayLevel === 'beginner'
              ? 'Beginner'
              : displayLevel === 'advanced'
                ? 'Advanced'
                : 'Learning';
          const explanation = explainDiatonicRole(item.numeral, mappedLevel);

          return (
            <div
              key={i}
              onClick={async () => {
                setRoot(item.chord.root);
                setChord(item.chord.chordDef);

                // Play audio immediately (closes Gulf of Evaluation)
                await AudioEngine.init();
                const pitches = getChordPitches(item.chord.root, item.chord.chordDef);

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
                  const step =
                    p.alter === 1 ? `${p.step}#` : p.alter === -1 ? `${p.step}b` : p.step;
                  const chroma = getChroma(p);
                  if (lastChroma !== -1 && chroma < lastChroma) currentOctave++;
                  lastChroma = chroma;
                  noteNames.push(`${step}${currentOctave}`);
                });

                AudioEngine.playChord(noteNames);
              }}
              className={`cursor-pointer rounded-xl border p-4 transition-all hover:border-white/30 ${isSelected ? 'bg-accent/10 border-accent' : 'bg-surface border-white/10'} `}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={`text-xl font-bold ${isSelected ? 'text-accent' : 'text-primary'}`}
                >
                  {chordName}
                </span>
                {displayLevel !== 'beginner' && (
                  <span className="rounded bg-black/20 px-2 py-1 font-mono text-xs uppercase tracking-widest opacity-50">
                    {item.numeral}
                  </span>
                )}
              </div>

              <p className="text-muted/90 text-sm">{explanation}</p>

              {isSelected && (
                <div className="border-accent/20 mt-4 flex items-center justify-between border-t pt-4">
                  <span className="text-accent/80 text-xs font-medium uppercase tracking-wider">
                    Currently Selected
                  </span>
                  <button className="bg-accent hover:bg-accent/80 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-[#1a1412] shadow-[0_2px_10px_rgba(229,149,0,0.3)] transition-colors">
                    <SpeakerHigh size={16} weight="fill" />
                    Play Again
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
