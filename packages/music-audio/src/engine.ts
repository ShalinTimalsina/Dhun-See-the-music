import { Soundfont } from 'smplr';
import * as Tone from 'tone';

export type PianoSoundId = 'grand' | 'bright' | 'electric' | 'organ' | 'harpsichord';

export const PIANO_SOUNDS: ReadonlyArray<{ id: PianoSoundId; label: string; font: string }> = [
  { id: 'grand', label: 'Grand piano', font: 'acoustic_grand_piano' },
  { id: 'bright', label: 'Bright piano', font: 'bright_acoustic_piano' },
  { id: 'electric', label: 'Electric piano', font: 'electric_piano_1' },
  { id: 'organ', label: 'Church organ', font: 'church_organ' },
  { id: 'harpsichord', label: 'Harpsichord', font: 'harpsichord' },
];

export interface SoundSettings {
  sound: PianoSoundId;
  /** 0 (dry) to 1 (very wet) */
  reverb: number;
  /** 0 (muffled) to 1 (bright) */
  brightness: number;
  /** 0 to 1 */
  volume: number;
}

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  sound: 'grand',
  reverb: 0.25,
  brightness: 0.8,
  volume: 0.8,
};

let context: AudioContext | null = null;
let piano: Soundfont | null = null;
let initPromise: Promise<void> | null = null;
let settings: SoundSettings = { ...DEFAULT_SOUND_SETTINGS };

// Effects chain: input -> filter -> (dry | convolver -> wet) -> master -> speakers
let input: GainNode | null = null;
let filter: BiquadFilterNode | null = null;
let dryGain: GainNode | null = null;
let wetGain: GainNode | null = null;
let masterGain: GainNode | null = null;
let loadToken = 0;

function buildImpulse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

function applySettings(): void {
  if (!context || !filter || !dryGain || !wetGain || !masterGain) return;
  const t = context.currentTime;
  const cutoff = 800 * Math.pow(25, settings.brightness); // 800 Hz .. 20 kHz
  filter.frequency.setTargetAtTime(cutoff, t, 0.02);
  wetGain.gain.setTargetAtTime(settings.reverb, t, 0.02);
  dryGain.gain.setTargetAtTime(1 - settings.reverb * 0.4, t, 0.02);
  masterGain.gain.setTargetAtTime(settings.volume, t, 0.02);
}

function fontFor(id: PianoSoundId): string {
  return (PIANO_SOUNDS.find((s) => s.id === id) ?? PIANO_SOUNDS[0]!).font;
}

async function loadPiano(id: PianoSoundId): Promise<void> {
  if (!context || !input) return;
  const token = ++loadToken;
  const next = new Soundfont(context, { instrument: fontFor(id), destination: input });
  await next.load;
  if (token !== loadToken) return;
  piano = next;
}

export const AudioEngine = {
  async init(): Promise<void> {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      // Tone.start() resumes/creates the AudioContext after a user gesture
      await Tone.start();
      const ctx = Tone.getContext().rawContext as AudioContext;
      context = ctx;

      input = ctx.createGain();
      filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      dryGain = ctx.createGain();
      wetGain = ctx.createGain();
      masterGain = ctx.createGain();
      const convolver = ctx.createConvolver();
      convolver.buffer = buildImpulse(ctx, 2.6, 2.4);

      input.connect(filter);
      filter.connect(dryGain);
      filter.connect(convolver);
      convolver.connect(wetGain);
      dryGain.connect(masterGain);
      wetGain.connect(masterGain);
      masterGain.connect(ctx.destination);
      applySettings();

      await loadPiano(settings.sound);
    })();
    try {
      await initPromise;
    } catch (error) {
      initPromise = null;
      throw error;
    }
  },

  getSettings(): SoundSettings {
    return { ...settings };
  },

  async updateSettings(patch: Partial<SoundSettings>): Promise<void> {
    const soundChanged = patch.sound !== undefined && patch.sound !== settings.sound;
    settings = { ...settings, ...patch };
    applySettings();
    if (soundChanged && context) await loadPiano(settings.sound);
  },

  playNote(noteName: string, octave: number = 4) {
    if (!piano) return;
    piano.start({ note: `${noteName}${octave}`, velocity: 80, duration: 2 });
  },

  playChord(notes: string[], baseOctave: number = 4) {
    if (!piano || !context) return;
    const flatToSharp: Record<string, string> = {
      Db: 'C#',
      Eb: 'D#',
      Gb: 'F#',
      Ab: 'G#',
      Bb: 'A#',
    };

    notes.forEach((note, index) => {
      // Normalize flats to sharps for smplr
      const normalized = note.replace(/([A-G])b/, (match) => flatToSharp[match] || match);
      const fullNote = /\d$/.test(normalized) ? normalized : `${normalized}${baseOctave}`;
      piano!.start({
        note: fullNote,
        velocity: 80,
        duration: 2,
        time: context!.currentTime + index * 0.05,
      });
    });
  },
};
