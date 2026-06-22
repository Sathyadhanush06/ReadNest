/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          150: '#edf2f7',
          205: '#e2e8f0',
          250: '#cbd5e1',
          255: '#cbd5e1',
          350: '#94a3b8',
          405: '#64748b',
          450: '#64748b',
          455: '#475569',
          550: '#475569',
          655: '#334155',
          705: '#1e293b',
          805: '#1e293b',
          850: '#0f172a',
          855: '#0f172a',
          905: '#0f172a',
          955: '#020617',
        },
        primary: {
          50: '#f5f7fa',
          100: '#e4e8f0',
          200: '#cdd5e4',
          300: '#a8b9d3',
          400: '#7c97be',
          500: '#5c78a5',
          600: '#485f88',
          700: '#3c4e6e',
          800: '#34425c',
          900: '#2e3a50',
          950: '#1e2535',
        },
        accent: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        lg: '24px',
        xl: '32px',
      }
    },
  },
  plugins: [],
}
