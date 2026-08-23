/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#FFD56B',
          500: '#FFAB00',
          600: '#D98200',
        },
        libya: {
          red: '#E70013',
          green: '#239E46',
          dark: '#0B0F19'
        }
      },
      fontFamily: {
        arabic: ['Tajawal', 'Cairo', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif']
      }
    },
  },
  plugins: [],
}
