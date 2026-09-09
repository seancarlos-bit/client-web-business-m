/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./js/**/*.js",
    "./demos/**/*.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', '"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Inter"', '"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        stone: {
          50: '#FAF9F6',
          100: '#F4F1EA',
          200: '#E8E3D7',
          300: '#D8D1C2',
          400: '#A8A08F',
          800: '#3A3732',
          900: '#23211E',
          950: '#141311',
        },
        forest: {
          800: '#1E3A2F',
          900: '#152921',
        },
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#0d9488',
          600: '#0f766e',
          700: '#115e59',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      }
    }
  },
  plugins: [],
}
