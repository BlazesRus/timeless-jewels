#!/usr/bin/env node

// Demo script showing the pnpm configDependencies in action
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🎯 Timeless Jewels Generator - pnpm configDependencies Demo\n');

// Function to demonstrate dependency switching
function showDependencyConfig(mode) {
  console.log(`📋 ${mode.toUpperCase()} Mode Configuration:`);

  // Set environment and load config
  process.env.SVELTE_MODE = mode;
  delete require.cache[require.resolve('./pnpmfile.cjs')];
  const config = require('./pnpmfile.cjs');

  // Simulate package.json processing
  const mockPackage = {
    name: 'frontend',
    devDependencies: {
      svelte: '^5.33.18',
      '@sveltejs/kit': '^2.21.3',
      vite: '^6.3.5'
    }
  };

  console.log('  📦 Before hooks:');
  console.log(`    svelte: ${mockPackage.devDependencies.svelte}`);
  console.log(`    @sveltejs/kit: ${mockPackage.devDependencies['@sveltejs/kit']}`);
  console.log(`    vite: ${mockPackage.devDependencies.vite}`);

  // Apply hooks if available
  if (config.hooks && config.hooks.readPackage) {
    const processedPackage = config.hooks.readPackage(mockPackage);
    console.log('  📦 After hooks:');
    console.log(`    svelte: ${processedPackage.devDependencies.svelte}`);
    console.log(`    @sveltejs/kit: ${processedPackage.devDependencies['@sveltejs/kit']}`);
    console.log(`    vite: ${processedPackage.devDependencies.vite}`);
  } else {
    console.log('  ⚠️  No hooks applied');
  }

  console.log('');
}

// Demo both modes
showDependencyConfig('legacy');
showDependencyConfig('modern');

console.log('🚀 Available Commands:');
console.log('  Legacy Mode:');
console.log('    pnpm run dev:legacy    # Install with Svelte 4 + dev server');
console.log('    pnpm run build:legacy  # Install with Svelte 4 + build');
console.log('');
console.log('  Modern Mode:');
console.log('    pnpm run dev:modern    # Install with Svelte 5 + dev server');
console.log('    pnpm run build:modern  # Install with Svelte 5 + build');
console.log('');
console.log('  Direct installation:');
console.log('    cross-env SVELTE_MODE=legacy pnpm install');
console.log('    cross-env SVELTE_MODE=modern pnpm install');

console.log('\n✨ configDependencies setup is ready!');
