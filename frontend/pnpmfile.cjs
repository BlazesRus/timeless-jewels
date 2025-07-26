// Dynamic pnpmfile.cjs for Timeless Jewels Generator
// Switches between experimental modes and Modern (Svelte 5) configuration
// Based on environment variable SVELTE_MODE

const path = require('path');
const fs = require('fs');

// Try to load the appropriate config's hooks
let hooks = {};

try {
//Modern mode(default)
    // Load modern config hooks - try multiple possible paths
    const possiblePaths = [path.join(__dirname, '.config-deps', 'timeless-jewels-modern-config', 'pnpmfile.cjs'), path.join(__dirname, 'node_modules', 'timeless-jewels-modern-config', 'pnpmfile.cjs'), path.join(__dirname, '.pnpm-config', 'timeless-jewels-modern-config', 'pnpmfile.cjs')];

    for (const configPath of possiblePaths) {
      if (fs.existsSync(configPath)) {
        const modernConfig = require(configPath);
        hooks = modernConfig.hooks;
        console.log(`✅ Loaded Modern (Svelte 5) configuration from: ${configPath}`);
        break;
      }
    }

    if (!hooks.readPackage) {
      console.warn('⚠️  Modern config hooks not found, using fallback configuration');
      // Fallback modern hooks
      hooks = {
        readPackage(pkg) {
          if (pkg.name === 'frontend') {
            console.log('🚀 Applying fallback Modern (Svelte 5) configuration...');
            if (pkg.devDependencies && pkg.devDependencies['svelte']) {
              pkg.devDependencies['svelte'] = '^5.33.18';
            }
          }
          return pkg;
        }
      };
  }
} catch (error) {
  console.error(`❌ Error loading ${mode} config:`, error.message);
  console.log('📝 Using minimal fallback configuration');
  hooks = {};
}

// Export the hooks
module.exports = {
  hooks: hooks || {}
};

// Also export some utility info
module.exports.getCurrentMode = () => mode;
module.exports.getSvelteVersion = () => (mode === 'legacy' ? '4' : '5');
