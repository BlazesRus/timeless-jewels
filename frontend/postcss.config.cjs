// PostCSS configuration - dynamically configures based on Svelte version (postcss.config.cjs)

const { version: svelteVersion } = require('svelte/package.json');
const major = parseInt(svelteVersion.split('.')[0], 10) || 0;

function getCurrentSvelteVersion() {
  return major;
}

const sVersion = getCurrentSvelteVersion();

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
    tailwindcss: {},
    autoprefixer: {}
  }
};

const config = sVersion >= 5 ? modernConfig : legacyConfig;
console.log(`PostCSS config loaded for Svelte ${sVersion} (${sVersion >= 5 ? 'Modern' : 'Legacy'} mode)`);

module.exports = config;
