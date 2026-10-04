'use client';

import React from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { formatPitchClass } from '@music/core';
import { SpeakerHigh } from '@phosphor-icons/react';

export function StartFromHere() {
  const { setKey, setRoot, setAppMode, startedNote, setStartedNote } = useCanvasStore();

  const selectPath = (mode: 'major' | 'minor', action: 'palette' | 'compose') => {
    if (!startedNote) return;

    setKey({ tonic: startedNote.note, mode });
    setRoot(startedNote.note);
    setAppMode(action);
  };

  if (startedNote) {
    const formatted = formatPitchClass(startedNote.note);

    return (
      <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
        <div className="mb-4 flex items-center gap-4">
          <h2 className="text-4xl font-bold">That's the note {formatted}.</h2>
          <button
            onClick={() => {
              import('@music/audio').then(({ AudioEngine }) => {
                AudioEngine.init().then(() => {
                  AudioEngine.playNote(
                    startedNote.note.step.replace('♯', '#').replace('♭', 'b'),
                    startedNote.note.octave || 4,
                  );
                });
              });
            }}
            className="bg-surface text-accent rounded-full border border-white/10 p-3 shadow-lg active:scale-95"
            title="Hear it again"
            aria-label="Hear it again"
          >
            <SpeakerHigh size={24} weight="fill" />
          </button>
        </div>
        <p className="text-muted mb-8 text-lg">
          Do you want to use {formatted} as your "home" note? Home is the note a song feels settled
          on.
        </p>

        <div className="mb-12 flex w-full justify-center gap-6">
          {startedNote.keySuggestions.map(
            (
              sug: import('../store/canvasStore').StartedNoteData['keySuggestions'][0],
              i: number,
            ) => (
              <div
                key={i}
                className="bg-surface flex w-64 flex-col rounded-2xl border border-white/10 p-6 shadow-2xl"
              >
                <h3 className="mb-2 text-2xl font-bold">
                  {formatted} {sug.key.mode === 'major' ? 'Major' : 'Minor'}
                </h3>
                <p className="text-muted h-16 text-sm">{sug.reason.message}</p>

                <div className="mt-6 flex flex-col gap-2">
                  <button
                    onClick={() => selectPath(sug.key.mode, 'palette')}
                    className="bg-accent text-base-inverted w-full rounded-xl py-3 font-bold shadow-lg active:scale-95"
                  >
                    Play along
                  </button>
                  <button
                    onClick={() => selectPath(sug.key.mode, 'compose')}
                    className="text-primary w-full rounded-xl border border-white/10 bg-white/5 py-3 font-bold active:scale-95"
                  >
                    Compose music
                  </button>
                </div>
              </div>
            ),
          )}
        </div>

        <button
          onClick={() => setStartedNote(null)}
          className="text-muted hover:text-primary text-sm font-bold uppercase tracking-widest"
        >
          ← Pick a different note
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center text-center">
      <h2 className="text-accent mb-4 text-4xl font-bold">Tap a note to begin.</h2>
      <p className="text-muted mb-8 text-lg">
        Pick any note on the piano or guitar below to be your starting point.
      </p>

      <div className="flex items-center gap-4">
        <span className="text-muted/50 text-sm italic">or</span>
        <button
          onClick={() => setAppMode('songpad')}
          className="bg-surface text-primary rounded-full border border-white/10 px-6 py-2.5 text-sm font-bold shadow-lg transition-all hover:border-white/30 hover:bg-white/5 hover:shadow-xl"
        >
          Paste your own chords
        </button>
      </div>
    </div>
  );
}
