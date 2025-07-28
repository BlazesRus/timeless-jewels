// Dynamic pnpmfile.cjs for Timeless Jewels Generator
// Modernized for Svelte 5 - Now supports toggle system
// Toggle system: Set ENABLE_PNPM_HOOKS=true to enable experimental package management
// Default: OFF (no hooks applied) - Recommended for stable builds

const path = require('path');
const fs = require('fs');

// Check if pnpm hooks should be enabled (default: OFF)
const enableHooks = process.env.ENABLE_PNPM_HOOKS === 'true';

if (!enableHooks) {
  console.log('📦 pnpm hooks DISABLED (default) - Using standard package.json configuration');
  console.log('💡 To enable experimental package management: set ENABLE_PNPM_HOOKS=true');
  
  // Export empty hooks when disabled
  module.exports = {
    hooks: {}
  };
  
  module.exports.getCurrentMode = () => 'standard';
  module.exports.getSvelteVersion = () => '5';
  
  // Exit early - no hooks applied
  return;
}

console.log('🔧 pnpm hooks ENABLED - Applying experimental package management');

// Try to load the appropriate config's hooks
let hooks = {};

try {
  // Modern mode (Svelte 5) configuration
  const possiblePaths = [
    path.join(__dirname, '.config-deps', 'timeless-jewels-modern-config', 'pnpmfile.cjs'),
    path.join(__dirname, 'node_modules', 'timeless-jewels-modern-config', 'pnpmfile.cjs'),
    path.join(__dirname, '.pnpm-config', 'timeless-jewels-modern-config', 'pnpmfile.cjs')
  ];

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
            pkg.devDependencies['svelte'] = '^5.34.8';
          }
        }
        return pkg;
      }
    };
  }
} catch (error) {
  console.error(`❌ Error loading modern config:`, error.message);
  console.log('📝 Using minimal fallback configuration');
  hooks = {};
}

// Export the hooks
module.exports = {
  hooks: hooks || {}
};

// Also export some utility info
module.exports.getCurrentMode = () => enableHooks ? 'experimental' : 'standard';
module.exports.getSvelteVersion = () => '5';
