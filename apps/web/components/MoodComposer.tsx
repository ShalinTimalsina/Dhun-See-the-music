'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import {
  MOODS,
  getDiatonicChords,
  renderProgression,
  getChordPitches,
  Key,
  getChroma,
} from '@music/core';
import { AudioEngine } from '@music/audio';
import { Play, SpinnerGap } from '@phosphor-icons/react';

export function MoodComposer() {
  const { selectedMood, setMood, setKey, setAppMode, displayLevel, baseOctave } = useCanvasStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const handleMoodSelect = (moodId: string) => {
    setMood(moodId);

    // Auto-select a key based on mood to demonstrate
    const moodData = MOODS.find((m) => m.id === moodId);
    if (moodData) {
      const mode =
        moodData.scaleOrMode === 'major' || moodData.scaleOrMode.includes('lydian')
          ? 'major'
          : 'minor';
      setKey({ tonic: { step: 'C', alter: 0 }, mode });
    }
  };

  const playPattern = async () => {
    if (!selectedMood || isPlaying) return;
    setIsPlaying(true);
    const moodData = MOODS.find((m) => m.id === selectedMood);
    if (!moodData) {
      setIsPlaying(false);
      return;
    }

    await AudioEngine.init();

    const mode =
      moodData.scaleOrMode === 'major' || moodData.scaleOrMode.includes('lydian')
        ? 'major'
        : 'minor';
    const tempKey: Key = { tonic: { step: 'C', alter: 0 }, mode };

    const chords = renderProgression({ key: tempKey, steps: moodData.progressionTemplates[0] });

    chords.forEach((chordData, i) => {
      setTimeout(() => {
        const pitches = getChordPitches(chordData.root, chordData.chordDef);

        const rootStep =
          pitches[0].alter === 1
            ? `${pitches[0].step}#`
            : pitches[0].alter === -1
              ? `${pitches[0].step}b`
              : pitches[0].step;
        const noteNames = [`${rootStep}${baseOctave - 1}`]; // Deep bass note

        let currentOctave = baseOctave;
        let lastChroma = -1;

        pitches.forEach((p) => {
          const step = p.alter === 1 ? `${p.step}#` : p.alter === -1 ? `${p.step}b` : p.step;
          const chroma = getChroma(p);
          if (lastChroma !== -1 && chroma < lastChroma) currentOctave++;
          lastChroma = chroma;
          noteNames.push(`${step}${currentOctave}`);
        });

        setPlayingIndex(i);
        AudioEngine.playChord(noteNames);

        // Reset state when finished
        if (i === chords.length - 1) {
          setTimeout(() => {
            setPlayingIndex(null);
            setIsPlaying(false);
          }, 1000);
        }
      }, i * 1000); // 1 chord per second
    });
  };

  return (
    <div className="flex w-full flex-col">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold">How do you want to feel?</h2>
          <p className="text-muted">Pick a mood, and we'll give you the chords to match.</p>
        </div>
        {selectedMood && (
          <button
            onClick={() => setAppMode('palette')}
            className="bg-accent text-base-inverted hover:bg-accent/90 rounded-full px-6 py-2 font-bold"
          >
            Go to Palette →
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {MOODS.map((mood) => {
          const isSelected = selectedMood === mood.id;

          return (
            <div
              key={mood.id}
              onClick={() => handleMoodSelect(mood.id)}
              className={`cursor-pointer rounded-2xl border p-6 transition-colors ${isSelected ? 'bg-accent/20 border-accent' : 'bg-surface border-white/10 hover:border-white/30'} `}
            >
              <h3
                className={`mb-3 text-xl font-bold ${isSelected ? 'text-accent' : 'text-primary'}`}
              >
                {mood.name}
              </h3>

              <div className="text-muted/90 mb-4 h-12 text-sm">{mood.explanation[0]?.message}</div>

              <div className="flex flex-col gap-2">
                {displayLevel !== 'beginner' && (
                  <div className="inline-block w-max rounded bg-black/20 px-2 py-1 text-xs opacity-70">
                    Scale: {mood.scaleOrMode}
                  </div>
                )}
                <div className="text-accent/80 font-mono text-xs uppercase tracking-widest">
                  {mood.rhythmHint}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedMood && (
        <div className="bg-surface border-accent/30 mt-12 rounded-2xl border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">Your Starter Pattern</h3>
            <button
              onClick={playPattern}
              disabled={isPlaying}
              className="bg-accent text-base-inverted hover:bg-accent/90 flex items-center gap-2 rounded-full px-4 py-2 font-bold shadow-lg active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              {isPlaying ? (
                <SpinnerGap size={18} weight="bold" className="animate-spin" />
              ) : (
                <Play size={18} weight="fill" />
              )}
              {isPlaying ? 'Playing...' : 'Hear Pattern'}
            </button>
          </div>
          <div className="flex gap-2">
            {MOODS.find((m) => m.id === selectedMood)?.progressionTemplates[0].map((numeral, i) => {
              const isActive = playingIndex === i;
              return (
                <div
                  key={i}
                  className={`flex h-16 w-16 items-center justify-center rounded-xl border text-lg font-bold transition-all duration-300 ${isActive ? 'bg-accent text-base-inverted border-accent scale-110 shadow-[0_0_20px_rgba(229,149,0,0.5)]' : 'border-white/10 bg-[#1a1412] text-white'} `}
                >
                  {numeral}
                </div>
              );
            })}
          </div>
          <p className="text-muted mt-4 text-sm italic">
            * {MOODS.find((m) => m.id === selectedMood)?.caveat}
          </p>
        </div>
      )}
    </div>
  );
}
