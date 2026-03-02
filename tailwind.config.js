/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          900: '#04070f',
          800: '#0a1020',
        },
        neon: {
          cyan: '#00e5ff',
          blue: '#2979ff',
        },
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0, 0, 0, 0.35)',
        neon: '0 0 0 1px rgba(0,229,255,.3), 0 12px 28px rgba(41,121,255,.25)',
      },
      keyframes: {
        tabIn: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,229,255,0.45)' },
          '50%': { boxShadow: '0 0 0 10px rgba(0,229,255,0)' },
        },
      },
      animation: {
        tabIn: 'tabIn 260ms ease-out',
        pulseGlow: 'pulseGlow 2s infinite',
      },
    },
  },
  plugins: [],
};
