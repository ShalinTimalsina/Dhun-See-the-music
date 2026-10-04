'use client';

import React from 'react';
import { useCanvasStore } from '../store/canvasStore';
import {
  MAJOR_TRIAD,
  MINOR_TRIAD,
  DOMINANT_7,
  getChordPitches,
  getDiatonicChords,
} from '@music/core';
import { Piano } from '../components/Piano';
import { Fretboard } from '../components/Fretboard';
import { ChordDiagram } from '../components/ChordDiagram';
import { StartFromHere } from '../components/StartFromHere';
import { MoodComposer } from '../components/MoodComposer';
import { ChordPalette } from '../components/ChordPalette';
import { SongPad } from '../components/SongPad';
import { PianoKeys } from '@phosphor-icons/react';

export default function DhunApp() {
  const {
    appMode,
    selectedRoot,
    selectedChord,
    displayLevel,
    selectedKey,
    setRoot,
    setChord,
    setKey,
    setDisplayLevel,
    setAppMode,
  } = useCanvasStore();

  const pitches = getChordPitches(selectedRoot, selectedChord);
  const diatonicChords = getDiatonicChords(selectedKey);

  return (
    <div className="bg-base text-primary flex min-h-screen flex-col items-center p-8 font-sans">
      <header className="mb-12 flex w-full max-w-[1600px] items-center justify-between border-b border-white/5 pb-6">
        <div className="group flex cursor-pointer select-none items-center gap-5">
          {/* Ultra-premium glassmorphic logo container */}
          <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#2a1c15] to-[#120803] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_15px_35px_rgba(0,0,0,0.4)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#e59500_0%,transparent_70%)] opacity-20"></div>
            <PianoKeys
              weight="duotone"
              className="text-accent relative z-10 text-3xl drop-shadow-[0_0_10px_rgba(229,149,0,0.5)]"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="mb-1 bg-gradient-to-b from-white to-white/60 bg-clip-text text-[32px] font-bold leading-none tracking-tighter text-transparent">
              Dhun
            </h1>
            <p className="text-muted/80 text-[11px] font-bold uppercase tracking-[0.25em]">
              See • Hear • Understand • Play
            </p>
          </div>
        </div>

        {appMode !== 'start' && (
          <nav className="flex gap-4">
            {appMode === 'compose' && (
              <button
                onClick={() => setAppMode('start')}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold transition-all hover:bg-white/10"
              >
                ← Back to Start
              </button>
            )}

            {appMode === 'palette' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setAppMode('start')}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold transition-all hover:bg-white/10"
                >
                  Start Over
                </button>
                <button
                  onClick={() => setAppMode('compose')}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold transition-all hover:bg-white/10"
                >
                  Change Mood
                </button>
              </div>
            )}

            {appMode === 'songpad' && (
              <button
                onClick={() => setAppMode('start')}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold transition-all hover:bg-white/10"
              >
                ← Back to Start
              </button>
            )}
          </nav>
        )}
      </header>

      {appMode === 'start' && (
        <section className="flex w-full max-w-[1600px] flex-1 flex-col items-center justify-center gap-12">
          <StartFromHere />

          {/* Always visible instruments in start mode so they can tap them */}
          <div className="flex w-full flex-col items-center gap-16 opacity-90 transition-opacity hover:opacity-100">
            <div className="w-full max-w-5xl overflow-hidden">
              <Piano />
            </div>

            <div className="w-full max-w-4xl overflow-x-auto">
              <Fretboard />
            </div>
          </div>
        </section>
      )}

      {appMode === 'compose' && (
        <section className="w-full max-w-6xl flex-1">
          <MoodComposer />
        </section>
      )}

      {appMode === 'songpad' && (
        <section className="flex w-full max-w-6xl flex-1 flex-col items-center">
          <SongPad />

          {/* Show the selected chord on instruments if they tap one */}
          <div className="mt-20 flex w-full flex-col items-center gap-16 opacity-90">
            <div className="w-full max-w-5xl overflow-hidden">
              <h3 className="text-muted mb-4 text-center text-sm font-semibold uppercase tracking-wider">
                Piano Layout
              </h3>
              <Piano />
            </div>
            <div className="w-full max-w-4xl overflow-x-auto">
              <h3 className="text-muted mb-4 text-center text-sm font-semibold uppercase tracking-wider">
                Guitar Fretboard
              </h3>
              <Fretboard />
            </div>
          </div>
        </section>
      )}

      {appMode === 'palette' && (
        <>
          {/* Controls */}
          {/* Controls - Hidden for absolute beginners */}
          {displayLevel !== 'beginner' && (
            <section className="bg-surface mb-12 flex gap-4 overflow-x-auto rounded-2xl border border-white/5 p-6">
              <div className="flex flex-col gap-2">
                <label className="text-muted text-sm font-semibold uppercase tracking-wider">
                  Root Note
                </label>
                <select
                  className="bg-base text-primary rounded-lg border border-white/10 p-2"
                  value={selectedRoot.step}
                  onChange={(e) =>
                    setRoot({ step: e.target.value as import('@music/core').Step, alter: 0 })
                  }
                >
                  {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((step) => (
                    <option key={step} value={step}>
                      {step}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-muted text-sm font-semibold uppercase tracking-wider">
                  Chord Quality
                </label>
                <select
                  className="bg-base text-primary rounded-lg border border-white/10 p-2"
                  value={selectedChord.id}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'major') setChord(MAJOR_TRIAD);
                    if (val === 'minor') setChord(MINOR_TRIAD);
                    if (val === 'dom7') setChord(DOMINANT_7);
                  }}
                >
                  <option value="major">Major</option>
                  <option value="minor">Minor</option>
                  <option value="dom7">Dominant 7</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-muted text-sm font-semibold uppercase tracking-wider">
                  Key
                </label>
                <select
                  className="bg-base text-primary rounded-lg border border-white/10 p-2"
                  value={`${selectedKey.tonic.step}${selectedKey.mode === 'major' ? '' : 'm'}`}
                  onChange={(e) => {
                    const val = e.target.value;
                    const isMinor = val.endsWith('m');
                    const step = isMinor ? val.slice(0, -1) : val;
                    setKey({
                      tonic: { step: step as import('@music/core').Step, alter: 0 },
                      mode: isMinor ? 'minor' : 'major',
                    });
                  }}
                >
                  {['C', 'G', 'D', 'A', 'E', 'B', 'F'].map((step) => (
                    <React.Fragment key={step}>
                      <option value={step}>{step} Major</option>
                      <option value={`${step}m`}>{step} Minor</option>
                    </React.Fragment>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-muted text-sm font-semibold uppercase tracking-wider">
                  Level
                </label>
                <select
                  className="bg-base text-primary rounded-lg border border-white/10 p-2"
                  value={displayLevel}
                  onChange={(e) =>
                    setDisplayLevel(e.target.value as import('../store/canvasStore').DisplayLevel)
                  }
                >
                  <option value="beginner">Beginner</option>
                  <option value="standard">Standard</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="ml-auto flex flex-col gap-2">
                <button
                  onClick={() => setAppMode('start')}
                  className="h-full rounded-lg bg-white/10 px-6 font-bold hover:bg-white/20"
                >
                  Restart
                </button>
              </div>
            </section>
          )}

          {/* Main Layout: Instruments (Left) + Palette (Right) */}
          <div className="flex w-full max-w-[1600px] flex-col gap-8 xl:flex-row">
            {/* Left: Engine Output & Instruments */}
            <div className="flex flex-1 flex-col items-center">
              {/* Spelling Output */}
              <div className="mb-12 flex flex-col items-center">
                <h2 className="mb-2 text-2xl font-bold">
                  {selectedRoot.step}
                  {selectedRoot.alter === 1 ? '♯' : selectedRoot.alter === -1 ? '♭' : ''}{' '}
                  {selectedChord.id === 'major'
                    ? 'Major'
                    : selectedChord.id === 'minor'
                      ? 'Minor'
                      : selectedChord.id}
                </h2>
                <p className="text-muted mb-6">These are the notes that make up this chord.</p>
                <div className="flex gap-4">
                  {pitches.map((p, i) => {
                    const label =
                      p.alter === 1 ? `${p.step}♯` : p.alter === -1 ? `${p.step}♭` : p.step;
                    return (
                      <div
                        key={i}
                        className="bg-accent text-base-inverted flex h-20 w-20 items-center justify-center rounded-xl text-2xl font-bold shadow-lg"
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instruments */}
              <div className="flex w-full flex-col items-center gap-16">
                <div className="w-full overflow-hidden">
                  <h3 className="text-muted mb-4 text-center text-sm font-semibold uppercase tracking-wider">
                    Piano Layout
                  </h3>
                  <Piano />
                </div>

                <div className="w-full">
                  <h3 className="text-muted mb-4 text-center text-sm font-semibold uppercase tracking-wider">
                    Guitar Fretboard
                  </h3>
                  <div className="flex flex-col items-center justify-center gap-8 lg:flex-row">
                    <ChordDiagram />
                    <div className="w-full max-w-4xl flex-1 overflow-x-auto">
                      <Fretboard />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Chord Palette */}
            <div className="w-full xl:sticky xl:top-8 xl:h-[calc(100vh-8rem)] xl:w-96">
              <ChordPalette />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
