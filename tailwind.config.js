/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Source Code Pro', 'Monaco', 'Consolas', 'monospace'],
        display: ['Exo', 'Inter', 'sans-serif']
      },
      colors: {
        mission: {
          dark: '#0a0a0f',
          darker: '#000000',
          panel: 'rgba(20, 25, 40, 0.85)',
          border: 'rgba(0, 217, 255, 0.2)',
          accent: '#00d9ff',
          success: '#00ff88',
          warning: '#ffaa00',
          error: '#ff4444',
          text: '#ffffff',
          secondary: '#b3c5d1'
        }
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'rotate-slow': 'rotate 60s linear infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite'
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 217, 255, 0.8)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }
    },
  },
  plugins: [],
}
