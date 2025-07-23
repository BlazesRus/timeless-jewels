// PostCSS configuration - Modern Tailwind CSS v4 (postcss.config.cjs)

// Modern configuration - uses Tailwind CSS v4
const config = {
  plugins: {
    'postcss-import': {},
    '@tailwindcss/postcss': {},
    autoprefixer: {}
  }
};

console.log('PostCSS config loaded for Svelte 5 (Modern mode)');

module.exports = config;
