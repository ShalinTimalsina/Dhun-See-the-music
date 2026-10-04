'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import {
  getChordPitches,
  getChroma,
  generateShapes,
  STANDARD_TUNING,
  startFromPosition,
} from '@music/core';

const TUNING_CHROMAS = [
  { note: 'E', chroma: 4, octave: 4, thickness: 'h-[1px]', label: 'Thinnest (Floor)' }, // High E (String 1)
  { note: 'B', chroma: 11, octave: 3, thickness: 'h-[2px]' }, // B (String 2)
  { note: 'G', chroma: 7, octave: 3, thickness: 'h-[2px]' }, // G (String 3)
  { note: 'D', chroma: 2, octave: 3, thickness: 'h-[3px]' }, // D (String 4)
  { note: 'A', chroma: 9, octave: 2, thickness: 'h-[4px]' }, // A (String 5)
  { note: 'E', chroma: 4, octave: 2, thickness: 'h-[5px]', label: 'Thickest (Ceiling)' }, // Low E (String 6)
];

const NUM_FRETS = 12;

export function Fretboard() {
  const { appMode, selectedRoot, selectedChord, setStartedNote } = useCanvasStore();
  const [showFingers, setShowFingers] = useState(false);

  const activePitches = getChordPitches(selectedRoot, selectedChord);
  const rootChroma = getChroma(selectedRoot);

  // M9: Get playable guitar chord shape using algorithmic generation
  const shapes = generateShapes(selectedRoot, selectedChord, STANDARD_TUNING, { maxFret: 12 });
  const shape =
    shapes.length > 0
      ? shapes[0]
      : { frets: [-1, -1, -1, -1, -1, -1], fingers: [-1, -1, -1, -1, -1, -1] };

  // In start mode, find what note is currently selected
  const startedChroma =
    appMode === 'start' && useCanvasStore.getState().startedNote
      ? getChroma(useCanvasStore.getState().startedNote.note)
      : -1;

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex gap-4">
        <button
          onClick={() => setShowFingers(false)}
          className={`rounded-full border px-4 py-1 text-xs font-bold uppercase tracking-wider ${!showFingers ? 'bg-accent/20 border-accent text-accent' : 'text-muted border-white/10 hover:border-white/30'}`}
        >
          Show Notes
        </button>
        <button
          onClick={() => setShowFingers(true)}
          className={`rounded-full border px-4 py-1 text-xs font-bold uppercase tracking-wider ${showFingers ? 'bg-accent/20 border-accent text-accent' : 'text-muted border-white/10 hover:border-white/30'}`}
        >
          Show Fingers
        </button>
      </div>

      <div className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-xl border-4 border-[#3a2c25] bg-[#2a1c15] p-6 shadow-2xl">
        {/* Nut (Fret 0 marker) */}
        <div className="absolute bottom-0 left-[8.5rem] top-0 z-0 w-3 bg-gradient-to-r from-gray-300 to-gray-400 shadow-lg" />

        {TUNING_CHROMAS.map((stringInfo, stringIndex) => (
          <div key={stringIndex} className="group relative flex h-10 items-center">
            {/* The actual string line with 3D thickness */}
            <div
              className={`absolute left-28 right-0 ${stringInfo.thickness} group-hover:from-accent/50 z-0 bg-gradient-to-b from-white/70 to-white/20 shadow-[0_2px_4px_rgba(0,0,0,0.5)]`}
            />

            {/* String label and orientation hint */}
            <div className="z-10 flex w-28 flex-shrink-0 flex-col justify-center bg-[#2a1c15] pr-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white/80">{stringInfo.note}</span>
                <span className="text-muted/60 rounded bg-black/40 px-1 text-xs">
                  {stringIndex + 1}
                </span>
              </div>
              {stringInfo.label && (
                <span className="text-accent/80 mt-0.5 text-[10px] font-bold uppercase tracking-widest">
                  {stringInfo.label}
                </span>
              )}
            </div>

            {/* Frets */}
            <div className="relative z-10 flex flex-1">
              {Array.from({ length: NUM_FRETS + 1 }).map((_, fret) => {
                // Calculate the exact chroma for this fret on this string
                const fretChroma = (stringInfo.chroma + fret) % 12;

                // Only active if this specific fret on this string is part of the computed chord shape
                // In start mode, all frets are interactive, but we only "highlight" the startedChroma if it matches
                const isShapeActive = shape.frets[stringIndex] === fret;
                let isActive = appMode === 'start' ? false : isShapeActive;
                let isRoot = false;

                if (appMode === 'start') {
                  if (startedChroma === fretChroma) {
                    isActive = true;
                    isRoot = true; // highlight as root
                  }
                } else {
                  isRoot = fretChroma === rootChroma;
                }

                // Find the pitch label if active
                let pitch = activePitches.find((p) => getChroma(p) === fretChroma);

                // Always have a generic fallback so we can play the sound even if it's not in the chord
                const genericNotesArray = [
                  'C',
                  'C#',
                  'D',
                  'D#',
                  'E',
                  'F',
                  'F#',
                  'G',
                  'G#',
                  'A',
                  'A#',
                  'B',
                ];

                if (appMode === 'start') {
                  const n = genericNotesArray[fretChroma];
                  pitch = {
                    step: n.replace('#', '') as import('@music/core').Step,
                    alter: (n.includes('#') ? 1 : 0) as import('@music/core').Alter,
                  };
                }

                const noteLabel = pitch
                  ? pitch.alter === 1
                    ? `${pitch.step}♯`
                    : pitch.alter === -1
                      ? `${pitch.step}♭`
                      : pitch.step
                  : '';

                // Find fingering if active
                const finger = shape.fingers ? shape.fingers[stringIndex] : -1;
                const fingerLabel = finger > 0 ? finger.toString() : '';

                const label = showFingers && appMode !== 'start' ? fingerLabel : noteLabel;

                // Calculate octave based on string and fret
                const noteOctave = stringInfo.octave + Math.floor((stringInfo.chroma + fret) / 12);
                const noteName = pitch
                  ? pitch.alter === 1
                    ? `${pitch.step}#`
                    : pitch.alter === -1
                      ? `${pitch.step}b`
                      : pitch.step
                  : '';

                // Always have a generic fallback so we can play the sound even if it's not in the chord
                const noteNameToPlay = noteName || genericNotesArray[fretChroma];

                const handlePlayNote = () => {
                  // AudioEngine guitar sound removed. Play piano note instead or just handle start selection
                  if (appMode === 'start') {
                    const data = startFromPosition(stringIndex, fret, STANDARD_TUNING);
                    setStartedNote(data);
                  }
                };

                return (
                  <div
                    key={fret}
                    onClick={handlePlayNote}
                    className={`relative flex h-10 flex-1 cursor-pointer items-center justify-center border-r-2 border-[#1a110d] shadow-[1px_0_0_rgba(255,255,255,0.1)] transition-colors last:border-0 hover:bg-white/5`}
                  >
                    {isActive && (
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold shadow-[0_4px_8px_rgba(0,0,0,0.5)] ${isRoot && appMode !== 'start' ? 'bg-accent text-[#1a1412]' : 'bg-white text-[#1a1412]'} `}
                      >
                        {label}
                      </div>
                    )}
                    {appMode !== 'start' && shape.frets[stringIndex] === -1 && fret === 0 && (
                      <div className="absolute left-[-2rem] text-xl font-bold text-red-500/80">
                        X
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Fret markers (Dots) */}
        <div className="absolute bottom-4 left-28 right-6 z-0 flex">
          {Array.from({ length: NUM_FRETS + 1 }).map((_, fret) => (
            <div key={fret} className="flex flex-1 justify-center">
              {[3, 5, 7, 9].includes(fret) && (
                <div className="mt-1 h-3 w-3 rounded-full bg-white/30 shadow-inner" />
              )}
              {fret === 12 && (
                <div className="mt-1 flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-white/30 shadow-inner" />
                  <div className="h-3 w-3 rounded-full bg-white/30 shadow-inner" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
