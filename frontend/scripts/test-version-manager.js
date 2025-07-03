#!/usr/bin/env node

// Simple test for the modernized version manager
import VersionManager from './version-manager.js';

console.log('🧪 Testing modernized version manager...');

try {
  const manager = new VersionManager();

  console.log('✅ VersionManager constructor works');

  const currentMode = manager.getCurrentMode();
  console.log(`📋 Current mode: ${currentMode}`);

  const version = manager.getInstalledSvelteVersion();
  console.log(`📦 Installed Svelte version: ${version || 'unknown'}`);

  console.log('✅ Version manager basic functionality works!');
} catch (error) {
  console.error('❌ Error testing version manager:', error.message);
  process.exit(1);
}
