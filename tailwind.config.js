/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./src/**/*.{html,js}",
    "./*.js",
    "!./node_modules/**/*"
  ],
  theme: {
    extend: {
      colors: {
        'electron-gray': '#2f3241',
        'electron-dark': '#1e1e1e',
        'accent-blue': '#007acc',
        'accent-green': '#28a745',
        'accent-orange': '#ffc107',
        'accent-red': '#dc3545'
      },
      fontFamily: {
        'system': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Ubuntu', 'Cantarell', 'Noto Sans', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce 1s infinite'
      }
    },
  },
  plugins: [],
  darkMode: 'media'
}