/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0D0D0F',
          soft: '#1A1A1F',
          muted: '#2A2A32',
        },
        slate: {
          ui: '#3A3A45',
          border: '#48485A',
          text: '#9090A8',
          dim: '#6060748',
        },
        acid: {
          DEFAULT: '#C8FF00',
          dim: '#A8D800',
          glow: 'rgba(200,255,0,0.15)',
        },
        coral: '#FF6B6B',
        sky: '#60CFFF',
        violet: '#A78BFA',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
