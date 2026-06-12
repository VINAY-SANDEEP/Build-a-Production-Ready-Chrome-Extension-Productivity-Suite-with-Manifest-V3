/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./popup.html",
    "./options.html",
    "./newtab.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f8ff',
          100: '#eef3ff',
          200: '#dbe5ff',
          300: '#bdcfff',
          400: '#94b0ff',
          500: '#6385ff',
          600: '#475eff',
          700: '#3647eb',
          800: '#2b37c0',
          900: '#283299',
        }
      }
    },
  },
  plugins: [],
}
