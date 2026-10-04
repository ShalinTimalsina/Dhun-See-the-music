export type SourceRef = { url: string; note: string };
export type StructuredReason = { type: string; message: string };

export interface MoodProfile {
  id: string;
  name: string;
  scaleOrMode: string; // registry id
  tempoRange: [number, number];
  progressionTemplates: string[][]; // Roman numerals, transposed to any key
  colorChords: string[]; // maj7, add9, sus2, etc., allowed in this mood
  rhythmHint: string;
  explanation: StructuredReason[]; // theory behind the tendency
  caveat: string; // "a tendency, not a rule"
  sources: SourceRef[];
}

export const MOODS: MoodProfile[] = [
  {
    id: 'happy',
    name: 'Happy and bright',
    scaleOrMode: 'major',
    tempoRange: [100, 140],
    progressionTemplates: [
      ['I', 'V', 'vi', 'IV'],
      ['I', 'IV', 'V'],
    ],
    colorChords: ['maj7', 'add9'],
    rhythmHint: 'Upbeat strumming',
    explanation: [
      {
        type: 'theory',
        message: 'Major chords have a raised third which creates a bright, resolved sound.',
      },
    ],
    caveat: 'A tendency, not a rule. Fast minor songs can also sound happy.',
    sources: [{ url: 'docs/KNOWLEDGE_SOURCES.md', note: 'Standard Western convention' }],
  },
  {
    id: 'sad',
    name: 'Sad and reflective',
    scaleOrMode: 'natural_minor',
    tempoRange: [60, 90],
    progressionTemplates: [
      ['i', 'VI', 'III', 'VII'],
      ['i', 'iv', 'v'],
    ],
    colorChords: ['m9', 'm7'],
    rhythmHint: 'Slow, picked patterns',
    explanation: [
      {
        type: 'theory',
        message: 'Minor chords have a lowered third which creates a darker, unresolved feeling.',
      },
    ],
    caveat: 'A tendency, not a rule. Some major progressions played slowly feel sad.',
    sources: [{ url: 'docs/KNOWLEDGE_SOURCES.md', note: 'Standard Western convention' }],
  },
  {
    id: 'hopeful',
    name: 'Hopeful',
    scaleOrMode: 'major',
    tempoRange: [80, 110],
    progressionTemplates: [['vi', 'IV', 'I', 'V']], // Same chords as sad, different order!
    colorChords: ['add9', 'sus4'],
    rhythmHint: 'Building intensity',
    explanation: [
      {
        type: 'theory',
        message:
          'Starting on the minor vi chord but moving towards the bright I chord creates a sense of rising hope.',
      },
    ],
    caveat: 'A tendency, not a rule.',
    sources: [{ url: 'docs/KNOWLEDGE_SOURCES.md', note: 'Standard Western convention' }],
  },
  {
    id: 'dreamy',
    name: 'Dreamy',
    scaleOrMode: 'lydian',
    tempoRange: [70, 100],
    progressionTemplates: [['I', 'II']], // Imaj7 -> II
    colorChords: ['maj7', 'maj9'],
    rhythmHint: 'Flowing, arpeggiated',
    explanation: [
      {
        type: 'theory',
        message:
          'The Lydian mode features a raised 4th scale degree which creates an ethereal, floating sound.',
      },
    ],
    caveat: 'A tendency, not a rule.',
    sources: [{ url: 'docs/KNOWLEDGE_SOURCES.md', note: 'Standard Western convention' }],
  },
];
