// PostCSS configuration loader - dynamically loads version-specific config
const { join } = require('path');
const { existsSync, readFileSync } = require('fs');

function getCurrentSvelteVersion() {
  const versionIniPath = join(__dirname, 'version.ini');
  if (existsSync(versionIniPath)) {
    try {
      const content = readFileSync(versionIniPath, 'utf8');
      const versionMatch = content.match(/version\s*=\s*(\d+)/);
      return versionMatch ? versionMatch[1] : '5';
    } catch (error) {
      console.warn('Failed to read version.ini, defaulting to Svelte 5');
      return '5';
    }
  }
  
  // Default to Svelte 5 (Modern mode)
  return '5';
}

const svelteVersion = getCurrentSvelteVersion();
const configFile = svelteVersion === '5' 
  ? './PostCSSSettings/postcss.modern.config.cjs'
  : './PostCSSSettings/postcss.legacy.config.cjs';

console.log(`Loading PostCSS config for Svelte ${svelteVersion}: ${configFile}`);

module.exports = require(configFile);
