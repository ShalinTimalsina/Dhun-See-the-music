export const DIATONIC_ROLES = {
  I: {
    label: 'Home',
    description: 'Feels settled. Most songs start and end here.',
  },
  IV: {
    label: 'Open and lifting',
    description: 'Feels like stepping out into something new.',
  },
  V: {
    label: 'Wants to go home',
    description: 'Builds a little tension that the home chord resolves.',
  },
  vi: {
    label: 'Soft, a bit sad',
    description: 'Same family as the home chord, but gentler.',
  },
  ii: {
    label: 'Gentle, moving',
    description: 'A calm step between chords.',
  },
  iii: {
    label: 'Dreamy',
    description: 'Sits between happy and sad.',
  },
  'vii°': {
    label: 'Very tense',
    description: 'Strongly wants to pull up to the home chord.',
  },
};

export function explainDiatonicRole(
  numeral: string,
  level: 'Beginner' | 'Learning' | 'Advanced' = 'Beginner',
): string {
  const role = DIATONIC_ROLES[numeral.toUpperCase() as keyof typeof DIATONIC_ROLES];
  if (!role) return 'A chord outside the main key.';

  if (level === 'Beginner') {
    if (numeral.toUpperCase() === 'VII°') return ''; // Hidden at beginner level
    return `${role.label}. ${role.description}`;
  }

  return `The ${numeral} chord. ${role.label}. ${role.description}`;
}
