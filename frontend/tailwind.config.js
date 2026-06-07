/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        void: '#03040a',
        surface: '#0a0c14',
        panel: '#0e1020',
        border: '#1a1f35',
        accent: '#00e5ff',
        green: '#00ff88',
        amber: '#ffb300',
        red: '#ff3d5a',
        purple: '#b060ff',
        muted: '#4a5270',
        text: '#c8d0f0',
      },
      animation: {
        pulse_soft: 'pulse_soft 2s ease-in-out infinite',
        scan: 'scan 3s linear infinite',
        fadeIn: 'fadeIn 0.4s ease forwards',
      },
      keyframes: {
        pulse_soft: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        scan: {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
