/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        'surface-hover': 'var(--bg-surface-hover)',
        primary: 'var(--text-primary)',
        muted: 'var(--text-muted)',
        accent: 'var(--accent-primary)',
        border: 'var(--border-subtle)',
      },
    },
  },
  plugins: [],
};
