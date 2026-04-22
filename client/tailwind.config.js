/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        hub: {
          bg:      '#0a0a0a',
          surface: '#0e0e0e',
          card:    '#141414',
          border:  '#1e1e1e',
          muted:   '#1a1a1a',
          gold:    '#c8a96e',
          'gold-dim': 'rgba(200,169,110,0.08)',
          text:    '#ffffff',
          sub:     '#888888',
          faint:   '#444444',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
