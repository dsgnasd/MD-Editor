/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
      colors: {
        solarized: {
          bg: '#fdf6e3',
          surface: '#eee8d5',
          text: '#657b83',
          heading: '#586e78',
          border: '#d3cbb8',
        },
        ocean: {
          bg: '#0f1923',
          surface: '#162231',
          text: '#8899aa',
          heading: '#aabbcc',
          border: '#1e3044',
        },
        forest: {
          bg: '#1a2e1a',
          surface: '#243524',
          text: '#a3b8a3',
          heading: '#c5d8c5',
          border: '#2d4a2d',
        },
        lavender: {
          bg: '#f0e6f6',
          surface: '#e8ddf0',
          text: '#5a4a6a',
          heading: '#4a3a5a',
          border: '#d4c4e0',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
