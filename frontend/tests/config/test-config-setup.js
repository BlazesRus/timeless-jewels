#!/usr/bin/env node

// Test script for pnpm configDependencies setup
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Timeless Jewels pnpm configDependencies Setup\n');

// Test 1: Check if config packages exist
console.log('📦 Checking config packages:');
const legacyPath = '.config-deps/timeless-jewels-legacy-config';
const modernPath = '.config-deps/timeless-jewels-modern-config';

console.log(`  Legacy config: ${fs.existsSync(legacyPath) ? '✅' : '❌'} ${legacyPath}`);
console.log(`  Modern config: ${fs.existsSync(modernPath) ? '✅' : '❌'} ${modernPath}`);

// Test 2: Check pnpmfile.cjs
console.log('\n📋 Checking pnpmfile.cjs:');
const pnpmfilePath = './pnpmfile.cjs';
console.log(`  Main pnpmfile: ${fs.existsSync(pnpmfilePath) ? '✅' : '❌'} ${pnpmfilePath}`);

// Test 3: Test mode detection
console.log('\n🎯 Testing mode detection:');
const originalMode = process.env.SVELTE_MODE;

// Test legacy mode
process.env.SVELTE_MODE = 'legacy';
try {
  delete require.cache[path.resolve('./pnpmfile.cjs')];
  const legacyConfig = require('./pnpmfile.cjs');
  console.log(`  Legacy mode: ✅ Loaded (getCurrentMode: ${typeof legacyConfig.getCurrentMode === 'function' ? legacyConfig.getCurrentMode() : 'N/A'})`);
} catch (error) {
  console.log(`  Legacy mode: ❌ Error - ${error.message}`);
}

// Test modern mode
process.env.SVELTE_MODE = 'modern';
try {
  delete require.cache[path.resolve('./pnpmfile.cjs')];
  const modernConfig = require('./pnpmfile.cjs');
  console.log(`  Modern mode: ✅ Loaded (getCurrentMode: ${typeof modernConfig.getCurrentMode === 'function' ? modernConfig.getCurrentMode() : 'N/A'})`);
} catch (error) {
  console.log(`  Modern mode: ❌ Error - ${error.message}`);
}

// Restore original mode
process.env.SVELTE_MODE = originalMode;

// Test 4: Check package.json configDependencies
console.log('\n⚙️  Checking package.json configDependencies:');
try {
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const configDeps = pkg.pnpm?.configDependencies;
  if (configDeps) {
    console.log('  configDependencies: ✅ Found');
    Object.keys(configDeps).forEach(dep => {
      console.log(`    - ${dep}: ${configDeps[dep]}`);
    });
  } else {
    console.log('  configDependencies: ❌ Not found in package.json');
  }
} catch (error) {
  console.log(`  package.json: ❌ Error reading - ${error.message}`);
}

console.log('\n✨ Test complete!');
console.log('\nUsage:');
console.log('  Legacy mode: SVELTE_MODE=legacy pnpm install');
console.log('  Modern mode: SVELTE_MODE=modern pnpm install (or just pnpm install)');
console.log('  Scripts: pnpm run dev:legacy, pnpm run dev:modern');
