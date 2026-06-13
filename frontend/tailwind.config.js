/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // custom pastel palette (example)
        plum: '#d8b4fe',
        sky: '#bae6fd',
        rose: '#fda4af',
      },
    },
  },
  plugins: [],
};
