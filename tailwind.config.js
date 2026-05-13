export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#0d0221',    // neon-bg
          surface: '#1a0b2e', // slightly lighter bg
          cyan: '#00f2fe',    // neon-cyan
          pink: '#ff0844',    // neon-pink
          purple: '#b224ef',  // neon-purple
          white: '#ffffff',
          light: '#e0e0e0'
        }
      },
      animation: {
        'spin-slow': 'spin 4s linear infinite',
        'pulse-neon': 'pulseNeon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sound-wave': 'soundWave 1.2s ease-in-out infinite',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(0, 242, 254, 0.8))' },
          '50%': { opacity: '.7', filter: 'drop-shadow(0 0 2px rgba(0, 242, 254, 0.3))' },
        },
        soundWave: {
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1)' },
        }
      }
    },
  },
  plugins: [],
}
