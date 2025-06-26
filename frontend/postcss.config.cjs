// PostCSS configuration - dynamically configures based on Svelte version (postcss.config.cjs)

const { VERSION: SVELTE_VER } = require('svelte/compiler');
const majorVer = +SVELTE_VER.split('.')[0];
const isSvelte5 = majorVer >= 5;

// Modern configuration (Svelte 5) - uses Tailwind CSS v4
const modernConfig = {
  plugins: {
    'postcss-import': {},
    '@tailwindcss/postcss': {},
    autoprefixer: {}
  }
};

// Legacy configuration (Svelte 4) - uses traditional Tailwind CSS
const legacyConfig = {
  plugins: {
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {}
  }
};

const config = isSvelte5 ? modernConfig : legacyConfig;
console.log(`PostCSS config loaded for Svelte ${majorVer} (${isSvelte5 ? 'Modern' : 'Legacy'} mode)`);

module.exports = config;
