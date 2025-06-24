// Dynamic pnpmfile.cjs for Timeless Jewels Generator
// Switches between Legacy (Svelte 4) and Modern (Svelte 5) configurations
// Based on environment variable SVELTE_MODE

const path = require('path');
const fs = require('fs');

// Determine mode from environment variable or default to modern
const mode = process.env.SVELTE_MODE || 'modern';

console.log(`\n🎯 PNPMFILE EXECUTING: ${mode.toUpperCase()} mode (Svelte ${mode === 'legacy' ? '4' : '5'})\n`);

// Try to load the appropriate config's hooks
let hooks = {};

try {
  if (mode === 'legacy') {
    // Load legacy config hooks - try multiple possible paths
    const possiblePaths = [
      path.join(__dirname, '.config-deps', 'timeless-jewels-legacy-config', 'pnpmfile.cjs'),
      path.join(__dirname, 'node_modules', 'timeless-jewels-legacy-config', 'pnpmfile.cjs'),
      path.join(__dirname, '.pnpm-config', 'timeless-jewels-legacy-config', 'pnpmfile.cjs')
    ];
    
    for (const configPath of possiblePaths) {
      if (fs.existsSync(configPath)) {
        const legacyConfig = require(configPath);
        hooks = legacyConfig.hooks;
        console.log(`✅ Loaded Legacy (Svelte 4) configuration from: ${configPath}`);
        break;
      }
    }
    
    if (!hooks.readPackage) {
      console.warn('⚠️  Legacy config hooks not found, using fallback configuration');
      // Fallback legacy hooks
      hooks = {
        readPackage(pkg) {
          if (pkg.name === "frontend") {
            console.log("🔧 Applying fallback Legacy (Svelte 4) configuration...");
            if (pkg.devDependencies && pkg.devDependencies["svelte"]) {
              pkg.devDependencies["svelte"] = "^4.2.19";
            }
          }
          return pkg;
        }
      };
    }
  } else {
    // Load modern config hooks - try multiple possible paths
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
          if (pkg.name === "frontend") {
            console.log("🚀 Applying fallback Modern (Svelte 5) configuration...");
            if (pkg.devDependencies && pkg.devDependencies["svelte"]) {
              pkg.devDependencies["svelte"] = "^5.33.18";
            }
          }
          return pkg;
        }
      };
    }
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
module.exports.getSvelteVersion = () => mode === 'legacy' ? '4' : '5';
