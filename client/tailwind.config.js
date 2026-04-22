/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        hub: {
          bg:           '#0a0a0a',
          surface:      '#0e0e0e',
          card:         '#141414',
          border:       '#1e1e1e',
          muted:        '#1a1a1a',
          gold:         '#c8a96e',
          'gold-bright':'#d9bb82',
          'gold-dim':   'rgba(200,169,110,0.08)',
          'gold-line':  'rgba(200,169,110,0.22)',
          text:         '#ffffff',
          sub:          '#888888',
          faint:        '#444444',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.4s ease both',
      },
    },
  },
  plugins: [],
}
