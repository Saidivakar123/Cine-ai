/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'cinema-dark': '#0a0a0a',
        'cinema-card': '#141414',
        'cinema-border': '#2a2a2a',
        'cinema-red': '#e50914',
        'cinema-gold': '#f5c518',
      }
    },
  },
  plugins: [],
}