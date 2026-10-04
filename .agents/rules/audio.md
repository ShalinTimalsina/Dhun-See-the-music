---
trigger: always_on
---

# Audio Rules

## User Gesture Requirement

- Create `AudioContext` and start it ONLY after a user gesture. Show a clear "Tap to enable sound" state.
- Handle iOS Safari restrictions and the silent switch (note in UI if needed).

## Scheduling

- Use the audio clock (Tone.Transport or equivalent) for rhythmic accuracy. NEVER use `setTimeout` for musical timing.
- All audio features must be unit-tested at the scheduling-data level (what notes at what times) even if the sound itself cannot be tested.

## Instruments and Playback

- Sampled instruments: piano, guitar (nylon or steel), harmonium (or convincing organ/reed). Lazy-load and cache. Fall back to a synth voice.
- Chord playback of guitar voicings plays the EXACT generated pitches (including capo effect) at the correct octave.
- Piano playback uses the chosen voicing and octave.
- Tuning reference pitch is configurable (A4 = 415–466 Hz, default 440).
- Respect user volume. Keep latency low: preload on the Canvas page, show loading state.

## Performance

- Dynamic-import heavy audio libraries (Tone.js, sample files).
- Cache sample files via service worker after first load for PWA offline support.
- Avoid re-triggering audio context creation on navigation.
