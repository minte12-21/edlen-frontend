/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  corePlugins: { preflight: false }, // we use our own reset in globals.css
  theme: {
    extend: {
      colors: { glow: '#7cfc4a', gold: '#ffc83d', ink: '#0f1f14', mint: '#e8f5ec', g500: '#16a34a', g700: '#0f5a2a', g900: '#04230f' },
    },
  },
  plugins: [],
};
