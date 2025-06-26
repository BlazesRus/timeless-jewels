#!/usr/bin/env node

/**
 * Package Version Manager for Timeless Jewel Generator
 * Manages switching between Svelte 4 and Svelte 5 dependencies using pnpmfile.cjs and SVELTE_MODE
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class VersionManager {
  constructor() {
    this.rootDir = join(__dirname, '..');
    this.packageJsonPath = join(this.rootDir, 'package.json');
  }

  /**
   * Get the current Svelte version from the compiler (runtime detection)
   */
  getInstalledSvelteVersion() {
    try {
      const { VERSION } = require('svelte/compiler');
      return +VERSION.split('.')[0]; // Return major version as number
    } catch (error) {
      console.warn('Could not detect installed Svelte version, checking package.json...');
      return this.getCurrentVersionFromPackageJson();
    }
  }

  /**
   * Get the current SVELTE_MODE environment variable
   */
  getCurrentMode() {
    return process.env.SVELTE_MODE || 'modern';
  }

  /**
   * Set the SVELTE_MODE environment variable
   */
  setMode(mode) {
    process.env.SVELTE_MODE = mode;
  }

  /**
   * Get current version from package.json dependencies
   */
  getCurrentVersionFromPackageJson() {
    try {
      const packageJson = JSON.parse(readFileSync(this.packageJsonPath, 'utf8'));
      const svelteVersion = packageJson.dependencies?.svelte || packageJson.devDependencies?.svelte;
      
      if (svelteVersion) {
        const majorVersion = svelteVersion.match(/^[~^]?(\d+)/);
        return majorVersion ? +majorVersion[1] : null;
      }
      
      return null;
    } catch (error) {
      console.warn('Could not read package.json:', error.message);
      return null;
    }
  }

  /**
   * Switch to Svelte 4 (Legacy mode)
   */
  switchTo4() {
    console.log('🔄 Switching to Svelte 4 (Legacy mode)...');
    
    try {
      // Run pnpm install with legacy mode
      console.log('📦 Installing Svelte 4 dependencies...');
      execSync('pnpm install', { 
        stdio: 'inherit', 
        cwd: this.rootDir,
        env: { ...process.env, SVELTE_MODE: 'legacy' }
      });
      
      console.log('✅ Successfully switched to Svelte 4!');
      return true;
    } catch (error) {
      console.error('❌ Failed to switch to Svelte 4:', error.message);
      return false;
    }
  }

  /**
   * Switch to Svelte 5 (Modern mode) 
   */
  switchTo5() {
    console.log('🔄 Switching to Svelte 5 (Modern mode)...');
    
    try {
      // Run pnpm install with modern mode
      console.log('📦 Installing Svelte 5 dependencies...');
      execSync('pnpm install', { 
        stdio: 'inherit', 
        cwd: this.rootDir,
        env: { ...process.env, SVELTE_MODE: 'modern' }
      });
      
      console.log('✅ Successfully switched to Svelte 5!');
      return true;
    } catch (error) {
      console.error('❌ Failed to switch to Svelte 5:', error.message);
      return false;
    }
  }

  /**
   * Display current version status
   */
  status() {
    try {
      console.log('\n🎯 Current Version Status:');
      console.log('=' + '='.repeat(50));
      
      const installedVersion = this.getInstalledSvelteVersion();
      const currentMode = this.getCurrentMode();
      
      console.log(`📋 Installed Svelte version: ${installedVersion || 'unknown'}`);
      console.log(`🔧 Current SVELTE_MODE: ${currentMode}`);
      
      // Check if mode matches installed version
      const expectedMode = installedVersion === 4 ? 'legacy' : 'modern';
      if (currentMode !== expectedMode) {
        console.log(`⚠️  Mode mismatch detected! Expected "${expectedMode}" for Svelte ${installedVersion}`);
        console.log(`💡 Run "pnpm install" to sync dependencies with current mode`);
      } else {
        console.log(`✅ Mode and version are synchronized`);
      }
      
      // Check pnpmfile.cjs status
      this.checkPnpmfileStatus();
      
    } catch (error) {
      console.error('❌ Error checking status:', error.message);
    }
  }

  /**
   * Check pnpmfile.cjs configuration status
   */
  checkPnpmfileStatus() {
    const pnpmfilePath = join(this.rootDir, 'pnpmfile.cjs');
    
    if (existsSync(pnpmfilePath)) {
      console.log('✅ pnpmfile.cjs found - dynamic configuration enabled');
      
      // Check config dependencies
      const legacyConfigPath = join(this.rootDir, '.config-deps', 'timeless-jewels-legacy-config');
      const modernConfigPath = join(this.rootDir, '.config-deps', 'timeless-jewels-modern-config');
      
      if (existsSync(legacyConfigPath)) {
        console.log('✅ Legacy config found');
      } else {
        console.log('⚠️  Legacy config missing');
      }
      
      if (existsSync(modernConfigPath)) {
        console.log('✅ Modern config found');
      } else {
        console.log('⚠️  Modern config missing');
      }
    } else {
      console.log('❌ pnpmfile.cjs not found - using static package.json');
    }
  }

  /**
   * Get package info for current configuration
   */
  getPackageInfo() {
    try {
      const packageJson = JSON.parse(readFileSync(this.packageJsonPath, 'utf8'));
      const currentMode = this.getCurrentMode();
      
      console.log(`\n📦 Package Configuration (${currentMode} mode):`);
      console.log('=' + '='.repeat(50));
      
      // Show key dependencies
      const dependencies = packageJson.dependencies || {};
      const devDependencies = packageJson.devDependencies || {};
      
      const keyPackages = ['svelte', '@sveltejs/kit', 'vite', 'tailwindcss'];
      
      keyPackages.forEach(pkg => {
        const version = dependencies[pkg] || devDependencies[pkg];
        if (version) {
          console.log(`  ${pkg}: ${version}`);
        }
      });
      
    } catch (error) {
      console.error('❌ Error reading package info:', error.message);
    }
  }
}

// CLI handling
function main() {
  const args = process.argv.slice(2);
  const manager = new VersionManager();

  if (args.length === 0) {
    console.log(`
🎯 Timeless Jewel Generator - Version Manager

Usage:
  node version-manager.js <command>

Commands:
  status      Show current version and configuration status
  switchTo4   Switch to Svelte 4 (Legacy mode)
  switchTo5   Switch to Svelte 5 (Modern mode)
  info        Show detailed package information

Examples:
  node version-manager.js status
  node version-manager.js switchTo5
  node version-manager.js switchTo4
`);
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case 'status':
        manager.status();
        break;
      
      case 'switchTo4':
        manager.switchTo4();
        break;
      
      case 'switchTo5':
        manager.switchTo5();
        break;
      
      case 'info':
        manager.status();
        manager.getPackageInfo();
        break;
      
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('💡 Run without arguments to see usage information');
        process.exit(1);
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default VersionManager;
