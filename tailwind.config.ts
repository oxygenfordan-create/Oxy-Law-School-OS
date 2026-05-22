import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#110f12',
        parchment: '#f4ece1',
        amberSoft: '#d9b49c',
        stone: '#2e2a2e',
        veil: '#141217'
      },
      boxShadow: {
        glow: '0 24px 80px rgba(0,0,0,0.24)',
        soft: '0 20px 48px rgba(21, 19, 24, 0.2)'
      },
      backgroundImage: {
        vignette: 'radial-gradient(circle at top, rgba(255,255,255,0.06), transparent 32%)'
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config;
