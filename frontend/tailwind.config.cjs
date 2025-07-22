// tailwind.config.cjs
const colors       = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    // include SvelteKit runtime so its shipped JS can
    // reference utilities when doing @apply in .js/.ts
    'node_modules/@sveltejs/kit/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1900px',
        '4xl': '2500px',
      },
      colors: {
        // re-introduce the full neutral palette (v3+v4)
        neutral: colors.neutral,
      },
      // Ensure spacing values are properly extended
      spacing: {
        '0.5': '0.125rem',
        '1.5': '0.375rem',
        '2.5': '0.625rem',
        '3.5': '0.875rem',
      }
    },
  },
  // Ensure core utilities are always available
  corePlugins: {
    // Enable all core utilities including padding
    padding: true,
    margin: true,
    spacing: true,
  },
  plugins: [],
};

