'use client';

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { PianoKey } from './PianoKey';
import { useCanvasStore } from '../store/canvasStore';
import { ArrowsOut, ArrowsIn, SlidersHorizontal } from '@phosphor-icons/react';
import {
  getChordPitches,
  getChroma,
  startFromPosition,
  STANDARD_TUNING,
  formatPitchClass,
} from '@music/core';
import { AudioEngine, PIANO_SOUNDS, DEFAULT_SOUND_SETTINGS } from '@music/audio';
import type { PianoSoundId, SoundSettings } from '@music/audio';

const OCTAVE_NOTES = [
  { note: 'C', type: 'white', chroma: 0, keybind: 'a' },
  { note: 'C♯', type: 'black', chroma: 1, keybind: 'w' },
  { note: 'D', type: 'white', chroma: 2, keybind: 's' },
  { note: 'D♯', type: 'black', chroma: 3, keybind: 'e' },
  { note: 'E', type: 'white', chroma: 4, keybind: 'd' },
  { note: 'F', type: 'white', chroma: 5, keybind: 'f' },
  { note: 'F♯', type: 'black', chroma: 6, keybind: 't' },
  { note: 'G', type: 'white', chroma: 7, keybind: 'g' },
  { note: 'G♯', type: 'black', chroma: 8, keybind: 'y' },
  { note: 'A', type: 'white', chroma: 9, keybind: 'h' },
  { note: 'A♯', type: 'black', chroma: 10, keybind: 'u' },
  { note: 'B', type: 'white', chroma: 11, keybind: 'j' },
];

const PIANO_KEYS: Array<{
  note: string;
  type: string;
  chroma: number;
  keybind?: string;
  octave: number;
}> = [];
for (let octave = 2; octave <= 6; octave++) {
  OCTAVE_NOTES.forEach((n) =>
    PIANO_KEYS.push({ note: n.note, type: n.type, chroma: n.chroma, octave }),
  );
}
PIANO_KEYS.push({ note: 'C', type: 'white', chroma: 0, octave: 7 }); // 61st key

// Black-key positions, computed once (not on every render)
const TOTAL_WHITE_KEYS = PIANO_KEYS.filter((k) => k.type === 'white').length;
const KEY_LAYOUT: ReadonlyArray<{ leftPct: number; widthPct: number }> = (() => {
  let whiteSeen = 0;
  return PIANO_KEYS.map((k) => {
    if (k.type === 'white') whiteSeen += 1;
    return {
      leftPct: (whiteSeen / TOTAL_WHITE_KEYS) * 100,
      widthPct: (100 / TOTAL_WHITE_KEYS) * 0.6,
    };
  });
})();

// Computer-keyboard map, relative to the base octave. K is the C one octave above A.
const KEY_BINDS: ReadonlyArray<{ keybind: string; note: string; offset: number }> = [
  ...OCTAVE_NOTES.map((n) => ({ keybind: n.keybind, note: n.note, offset: 0 })),
  { keybind: 'k', note: 'C', offset: 1 },
];

const MIN_BASE_OCTAVE = 2;
const MAX_BASE_OCTAVE = 5;
const DEFAULT_BASE_OCTAVE = 3;

export function Piano() {
  const { appMode, selectedRoot, selectedChord, setStartedNote, baseOctave, setBaseOctave } =
    useCanvasStore();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shiftOctave = (delta: number) =>
    setBaseOctave((o: number) => Math.min(MAX_BASE_OCTAVE, Math.max(MIN_BASE_OCTAVE, o + delta)));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSoundPanel, setShowSoundPanel] = useState(false);
  const [sound, setSound] = useState<SoundSettings>(DEFAULT_SOUND_SETTINGS);
  const [soundLoading, setSoundLoading] = useState(false);

  const [phase, setPhase] = useState<'idle' | 'enter' | 'leave'>('idle');

  useEffect(() => {
    const onChange = () => {
      const full = document.fullscreenElement === wrapperRef.current;
      setIsFullscreen(full);
      setPhase(full ? 'enter' : 'leave');
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // The computer-keyboard keys (A–K) play from the base octave, so bring that part of the piano into view
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const whiteKeysBefore = (baseOctave - 2) * 7; // 7 white keys per octave, piano starts at C2
    const totalWhite = 36;
    const target = (whiteKeysBefore / totalWhite) * el.scrollWidth - 24;
    el.scrollTo({ left: Math.max(0, target), behavior: 'auto' });
  }, [isFullscreen, baseOctave]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void wrapperRef.current?.requestFullscreen();
    }
  };

  const changeSound = (patch: Partial<SoundSettings>) => {
    setSound((prev) => ({ ...prev, ...patch }));
    if (patch.sound !== undefined) setSoundLoading(true);
    void AudioEngine.init()
      .then(() => AudioEngine.updateSettings(patch))
      .finally(() => setSoundLoading(false));
  };
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [pointerDown, setPointerDown] = useState<Set<number>>(new Set());

  // Latest values for the stable press handler, so the keys don't re-render when these change
  const latest = useRef({ appMode, setStartedNote });
  latest.current = { appMode, setStartedNote };

  const releasePointerKey = useCallback((i: number) => {
    setPointerDown((prev) => {
      if (!prev.has(i)) return prev;
      const next = new Set(prev);
      next.delete(i);
      return next;
    });
  }, []);

  // Fires on pointer-down (not click). Sound first, visuals after, so nothing delays the note.
  const pressPointerKey = useCallback((i: number) => {
    const key = PIANO_KEYS[i];
    if (!key) return;
    AudioEngine.playNote(key.note.replace('♯', '#'), key.octave);
    void AudioEngine.init();
    setPointerDown((prev) => new Set(prev).add(i));
    if (latest.current.appMode === 'start') {
      const step = key.note.replace('♯', '').replace('♭', '');
      const alter = key.note.includes('♯') ? 1 : 0;
      latest.current.setStartedNote({
        note: {
          step: step as import('@music/core').Step,
          alter: alter as import('@music/core').Alter,
          octave: key.octave,
        },
        keySuggestions: [
          {
            key: { tonic: { step, alter }, mode: 'major' },
            reason: { message: 'A bright, happy sound.' },
          },
          {
            key: { tonic: { step, alter }, mode: 'minor' },
            reason: { message: 'A sad, reflective sound.' },
          },
        ],
      });
    }
  }, []);
  // Piano keys with the computer-keyboard letter for the current base octave
  const boundKeys = useMemo(
    () =>
      PIANO_KEYS.map((k) => {
        const bind = KEY_BINDS.find((b) => b.note === k.note && baseOctave + b.offset === k.octave);
        return { ...k, keybind: bind?.keybind };
      }),
    [baseOctave],
  );
  // In start mode, highlight the started note if any
  const startedChroma =
    appMode === 'start' && useCanvasStore.getState().startedNote
      ? getChroma(useCanvasStore.getState().startedNote.note)
      : -1;

  // Calculate which chromas are currently active
  const activePitches = getChordPitches(selectedRoot, selectedChord);
  const activeChromas =
    appMode === 'start'
      ? startedChroma !== -1
        ? [startedChroma]
        : []
      : activePitches.map((p) => getChroma(p));

  // Determine root chroma for special highlighting
  const rootChroma = appMode === 'start' ? startedChroma : getChroma(selectedRoot);

  // M10: Computer Keyboard Mapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.repeat) return; // Prevent auto-repeat triggers

      const keyStr = e.key.toLowerCase();
      if (keyStr === 'z') {
        shiftOctave(-1);
        return;
      }
      if (keyStr === 'x') {
        shiftOctave(1);
        return;
      }
      const keyMap = boundKeys.find((k) => k.keybind === keyStr);
      if (keyMap) {
        setPressedKeys((prev) => {
          const next = new Set(prev);
          next.add(keyStr);
          return next;
        });

        AudioEngine.init();
        AudioEngine.playNote(keyMap.note.replace('♯', '#'), keyMap.octave);

        if (appMode === 'start') {
          const data = {
            note: {
              step: keyMap.note.replace('♯', '').replace('♭', '') as import('@music/core').Step,
              alter: (keyMap.note.includes('♯')
                ? 1
                : keyMap.note.includes('♭')
                  ? -1
                  : 0) as import('@music/core').Alter,
              octave: keyMap.octave,
            },
            keySuggestions: [
              {
                key: {
                  tonic: {
                    step: keyMap.note.replace('♯', '').replace('♭', ''),
                    alter: keyMap.note.includes('♯') ? 1 : 0,
                  },
                  mode: 'major',
                },
                reason: { message: 'A bright, happy sound.' },
              },
              {
                key: {
                  tonic: {
                    step: keyMap.note.replace('♯', '').replace('♭', ''),
                    alter: keyMap.note.includes('♯') ? 1 : 0,
                  },
                  mode: 'minor',
                },
                reason: { message: 'A sad, reflective sound.' },
              },
            ],
          };
          setStartedNote(data);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyStr = e.key.toLowerCase();
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(keyStr);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [appMode, setStartedNote, boundKeys]);

  return (
    <div
      ref={wrapperRef}
      className={`piano-fs-root flex w-full flex-col items-center ${isFullscreen ? 'h-screen justify-center overflow-auto bg-[radial-gradient(ellipse_at_top,#1f2a24_0%,#0a0c0a_70%)] px-[4vw] py-[4vh]' : ''}`}
    >
      <div
        className={`flex w-full flex-col items-center ${isFullscreen ? 'gap-[3vh]' : ''} ${phase === 'enter' ? 'piano-enter' : phase === 'leave' ? 'piano-leave' : ''}`}
      >
        {isFullscreen && (
          <div className="text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-white">Piano</h2>
            <p className="mt-2 text-lg text-white/60">
              Tap a key or press A S D F G H J K. Press Esc to leave full screen.
            </p>
          </div>
        )}

        {/* Control bar */}
        <div
          className={`flex w-full ${isFullscreen ? 'max-w-none' : 'max-w-5xl'} mb-3 flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl`}
        >
          <p className="text-sm text-white/60">
            Press A S D F G H J K on your keyboard, or tap the keys. Z and X change octave.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Octave"
              className="inline-flex items-center rounded-full bg-white/10 text-white"
            >
              <button
                type="button"
                onClick={() => shiftOctave(-1)}
                disabled={baseOctave <= MIN_BASE_OCTAVE}
                aria-label="Lower octave (Z)"
                className="min-h-[44px] min-w-[44px] rounded-full text-lg transition-[transform,opacity] duration-150 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e59500] active:scale-95 disabled:opacity-30"
              >
                −
              </button>
              <span className="px-2 text-sm tabular-nums" aria-live="polite">
                Octave {baseOctave}
              </span>
              <button
                type="button"
                onClick={() => shiftOctave(1)}
                disabled={baseOctave >= MAX_BASE_OCTAVE}
                aria-label="Higher octave (X)"
                className="min-h-[44px] min-w-[44px] rounded-full text-lg transition-[transform,opacity] duration-150 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e59500] active:scale-95 disabled:opacity-30"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowSoundPanel((v) => !v)}
              aria-expanded={showSoundPanel}
              aria-controls="piano-sound-panel"
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-sm font-medium transition-[transform,opacity] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e59500] active:scale-95 ${showSoundPanel ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/15'}`}
            >
              <SlidersHorizontal size={20} weight="light" aria-hidden="true" />
              Sound
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white/10 px-5 text-sm font-medium text-white transition-[transform,opacity] duration-200 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e59500] active:scale-95"
            >
              {isFullscreen ? (
                <ArrowsIn size={20} weight="light" aria-hidden="true" />
              ) : (
                <ArrowsOut size={20} weight="light" aria-hidden="true" />
              )}
              {isFullscreen ? 'Exit full screen' : 'Full screen'}
            </button>
          </div>
        </div>

        {showSoundPanel && (
          <div
            id="piano-sound-panel"
            className={`piano-panel-in w-full ${isFullscreen ? 'max-w-none' : 'max-w-5xl'} mb-4 flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl`}
          >
            <div role="radiogroup" aria-label="Instrument" className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-white">Instrument</span>
                {soundLoading && (
                  <span className="text-xs text-white/50" role="status">
                    Loading sound…
                  </span>
                )}
              </div>
              <div className="flex w-fit max-w-full flex-wrap gap-1 rounded-full bg-black/40 p-1">
                {PIANO_SOUNDS.map((s) => {
                  const selected = sound.sound === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => changeSound({ sound: s.id })}
                      className={`min-h-[44px] rounded-full px-4 text-sm font-medium transition-[background-color,color,transform] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e59500] active:scale-95 ${selected ? 'bg-white text-black shadow-[0_2px_10px_rgba(0,0,0,0.35)]' : 'text-white/70 hover:text-white'}`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {(
                [
                  { key: 'reverb', label: 'Reverb', hint: 'Room echo' },
                  { key: 'brightness', label: 'Brightness', hint: 'Soft to sparkling' },
                  { key: 'volume', label: 'Volume', hint: 'Quiet to loud' },
                ] as const
              ).map((ctl) => {
                const value = sound[ctl.key];
                return (
                  <div key={ctl.key} className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between">
                      <label
                        htmlFor={`piano-${ctl.key}`}
                        className="text-sm font-medium text-white"
                      >
                        {ctl.label}
                      </label>
                      <span className="text-sm tabular-nums text-white/60">
                        {Math.round(value * 100)}%
                      </span>
                    </div>
                    <input
                      id={`piano-${ctl.key}`}
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={value}
                      onChange={(e) => changeSound({ [ctl.key]: Number(e.target.value) })}
                      className="apple-range"
                      style={{ '--pct': `${value * 100}%` } as React.CSSProperties}
                    />
                    <span className="text-xs text-white/45">{ctl.hint}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div
          ref={scrollRef}
          className={`relative flex w-full ${isFullscreen ? 'max-w-none rounded-[2rem] border-t-[16px] border-[#3a1d13] bg-gradient-to-b from-[#2d150b] to-[#120803] p-[2vw] pb-[2.5vw] shadow-[0_40px_120px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.05)]' : 'max-w-5xl rounded-2xl border-t-[12px] border-[#3a1d13] bg-gradient-to-b from-[#2d150b] to-[#120803] p-[1.5vw] pb-[2vw] shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_2px_6px_rgba(255,255,255,0.05)]'} premium-scroll mb-2 justify-start overflow-x-auto`}
        >
          <div
            className={`relative flex ${isFullscreen ? 'h-[clamp(280px,44vh,460px)] min-w-[2200px]' : 'h-[300px] min-w-[1200px]'} w-full rounded-sm bg-black shadow-[inset_0_10px_30px_rgba(0,0,0,1)]`}
          >
            {/* Classic Premium Red Felt Strip */}
            <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 h-3 border-b border-black/80 bg-gradient-to-b from-[#aa1111] to-[#440000] shadow-[0_3px_5px_rgba(0,0,0,0.8)]" />
            {boundKeys.map((key, i) => {
              const layout = KEY_LAYOUT[i]!;

              let displayNote = key.note;
              if (appMode !== 'start') {
                const pitch = activePitches.find((p) => getChroma(p) === key.chroma);
                if (pitch) {
                  displayNote =
                    pitch.alter === 1
                      ? `${pitch.step}♯`
                      : pitch.alter === -1
                        ? `${pitch.step}♭`
                        : pitch.step;
                }
              }

              return (
                <PianoKey
                  key={i}
                  index={i}
                  note={displayNote}
                  type={key.type}
                  keybind={key.keybind}
                  isActive={activeChromas.includes(key.chroma)}
                  isRoot={key.chroma === rootChroma}
                  isPressed={
                    pointerDown.has(i) ||
                    (key.keybind !== undefined && pressedKeys.has(key.keybind))
                  }
                  isFullscreen={isFullscreen}
                  leftPct={layout.leftPct}
                  widthPct={layout.widthPct}
                  onPress={pressPointerKey}
                  onRelease={releasePointerKey}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
