import js from '@eslint/js';
import tsEslint from 'typescript-eslint';

export default tsEslint.config(js.configs.recommended, ...tsEslint.configs.recommended, {
  files: ['src/**/*.ts'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['react', 'react-dom', 'tone', 'next/*'],
            message: 'music-core must be pure TypeScript. No React, DOM, or Audio imports allowed.',
          },
        ],
      },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
  },
});
