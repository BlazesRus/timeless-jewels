#!/usr/bin/env node

/**
 * Package Version Manager for Timeless Jewel Generator
 * Manages switching between Svelte 4 and Svelte 5 dependencies based on INI configuration
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class VersionManager {
  constructor() {
    this.rootDir = join(__dirname, '..');
    this.configPath = join(this.rootDir, 'version.ini');
    this.packageJsonPath = join(this.rootDir, 'package.json');
    this.config = this.loadConfig();
  }

  /**
   * Parse INI file into configuration object
   */
  loadConfig() {
    if (!existsSync(this.configPath)) {
      throw new Error(`Configuration file not found: ${this.configPath}`);
    }

    const content = readFileSync(this.configPath, 'utf8');
    const config = {};
    let currentSection = null;

    content.split('\n').forEach(line => {
      line = line.trim();
      
      // Skip comments and empty lines
      if (line.startsWith('#') || line === '') return;
      
      // Section headers
      if (line.startsWith('[') && line.endsWith(']')) {
        currentSection = line.slice(1, -1);
        config[currentSection] = {};
        return;
      }
      
      // Key-value pairs
      if (currentSection && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        config[currentSection][key.trim()] = value;
      }
    });

    return config;
  }

  /**
   * Get the target Svelte version from configuration
   */
  getTargetVersion() {
    const version = this.config.svelte?.version || '5';
    if (!['4', '5'].includes(version)) {
      console.warn(`Invalid Svelte version "${version}" in config. Using default: 5`);
      return '5';
    }
    return version;
  }

  /**
   * Get the current Svelte version from package.json
   */
  getCurrentVersion() {
    try {
      const packageJson = JSON.parse(readFileSync(this.packageJsonPath, 'utf8'));
      const svelteVersion = packageJson.devDependencies?.svelte;
      
      if (!svelteVersion) return null;
      
      // Extract major version
      const match = svelteVersion.match(/(\^|~)?(\d+)/);
      return match ? match[2] : null;
    } catch (error) {
      console.warn('Could not determine current Svelte version:', error.message);
      return null;
    }
  }

  /**
   * Create backup of current package.json
   */
  createBackup() {
    if (this.config.options?.backup_current === 'true') {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = join(this.rootDir, `package.json.backup.${timestamp}`);
      copyFileSync(this.packageJsonPath, backupPath);
      console.log(`📦 Backup created: ${backupPath}`);
    }
  }

  /**
   * Switch to the target package configuration
   */
  switchPackage() {
    const targetVersion = this.getTargetVersion();
    const currentVersion = this.getCurrentVersion();

    console.log(`🎯 Target Svelte version: ${targetVersion}`);
    console.log(`📋 Current Svelte version: ${currentVersion || 'unknown'}`);

    if (currentVersion === targetVersion) {
      console.log(`✅ Already using Svelte ${targetVersion}. No changes needed.`);
      return false;
    }

    // Determine source package file
    const sourcePackage = targetVersion === '5' 
      ? this.config.packages?.svelte5_package || 'package.json'
      : this.config.packages?.svelte4_package || 'LegacyPackage.json';

    const sourcePath = join(this.rootDir, sourcePackage);

    if (!existsSync(sourcePath)) {
      throw new Error(`Source package file not found: ${sourcePath}`);
    }

    // Create backup before switching
    this.createBackup();

    // Copy the appropriate package file
    copyFileSync(sourcePath, this.packageJsonPath);
    console.log(`📦 Switched to ${sourcePackage} (Svelte ${targetVersion})`);

    return true;
  }

  /**
   * Install dependencies after package switch
   */
  installDependencies() {
    if (this.config.options?.auto_install === 'true') {
      console.log('📥 Installing dependencies...');
      try {
        execSync('pnpm install', { stdio: 'inherit', cwd: this.rootDir });
        console.log('✅ Dependencies installed successfully');
      } catch (error) {
        console.error('❌ Failed to install dependencies:', error.message);
        console.log('💡 Run "pnpm install" manually to complete the setup');
      }
    } else {
      console.log('💡 Run "pnpm install" to install the new dependencies');
    }
  }

  /**
   * Update version detection config for runtime
   */
  updateVersionConfig() {
    const targetVersion = this.getTargetVersion();
    const configPath = join(this.rootDir, 'src', 'lib', 'utils', 'version-config.ts');
    
    if (existsSync(configPath)) {
      let content = readFileSync(configPath, 'utf8');
      
      // Update the default version in the config
      content = content.replace(
        /export const DEFAULT_SVELTE_VERSION = '[45]'/,
        `export const DEFAULT_SVELTE_VERSION = '${targetVersion}'`
      );
      
      writeFileSync(configPath, content);
      console.log(`🔧 Updated version-config.ts to default to Svelte ${targetVersion}`);
    }
  }

  /**
   * Run the complete package switching process
   */
  run() {
    try {
      console.log('🚀 Starting package version management...');
      console.log('📖 Reading configuration from version.ini...');
      
      const switched = this.switchPackage();
      
      if (switched) {
        this.updateVersionConfig();
        this.installDependencies();
        console.log('🎉 Package switching completed successfully!');
        console.log(`📌 Now using Svelte ${this.getTargetVersion()}`);
      }
      
    } catch (error) {
      console.error('❌ Error during package switching:', error.message);
      process.exit(1);
    }
  }
  /**
   * Switch explicitly to Svelte 4 (only if not already using Svelte 4)
   */
  switchTo4() {
    const currentVersion = this.getCurrentVersion();
    
    console.log(`🎯 Target: Svelte 4`);
    console.log(`📋 Current: Svelte ${currentVersion || 'unknown'}`);

    if (currentVersion === '4') {
      console.log('✅ Already using Svelte 4. No changes needed.');
      return false;
    }

    const sourcePackage = 'LegacyPackage.json';
    const sourcePath = join(this.rootDir, sourcePackage);

    if (!existsSync(sourcePath)) {
      throw new Error(`Svelte 4 package file not found: ${sourcePath}`);
    }

    // Create backup before switching
    this.createBackup();

    // Copy the Svelte 4 package file
    copyFileSync(sourcePath, this.packageJsonPath);
    console.log(`📦 Switched to ${sourcePackage} (Svelte 4)`);

    // Update version config
    this.updateVersionConfigTo('4');
    
    // Install dependencies if configured
    this.installDependencies();
    
    console.log('🎉 Successfully switched to Svelte 4!');
    return true;
  }

  /**
   * Switch explicitly to Svelte 5 (only if not already using Svelte 5)
   */
  switchTo5() {
    const currentVersion = this.getCurrentVersion();
    
    console.log(`🎯 Target: Svelte 5`);
    console.log(`📋 Current: Svelte ${currentVersion || 'unknown'}`);

    if (currentVersion === '5') {
      console.log('✅ Already using Svelte 5. No changes needed.');
      return false;
    }

    const sourcePackage = 'Svelte5Package.json';
    const sourcePath = join(this.rootDir, sourcePackage);

    if (!existsSync(sourcePath)) {
      throw new Error(`Svelte 5 package file not found: ${sourcePath}`);
    }

    // Create backup before switching
    this.createBackup();

    // Copy the Svelte 5 package file
    copyFileSync(sourcePath, this.packageJsonPath);
    console.log(`📦 Switched to ${sourcePackage} (Svelte 5)`);

    // Update version config
    this.updateVersionConfigTo('5');
    
    // Install dependencies if configured
    this.installDependencies();
    
    console.log('🎉 Successfully switched to Svelte 5!');
    return true;
  }

  /**
   * Update version detection config for specific version
   */
  updateVersionConfigTo(targetVersion) {
    const configPath = join(this.rootDir, 'src', 'lib', 'utils', 'version-config.ts');
    
    if (existsSync(configPath)) {
      let content = readFileSync(configPath, 'utf8');
      
      // Update the default version in the config
      content = content.replace(
        /export const DEFAULT_SVELTE_VERSION = '[45]'/,
        `export const DEFAULT_SVELTE_VERSION = '${targetVersion}'`
      );
      
      writeFileSync(configPath, content);
      console.log(`🔧 Updated version-config.ts to default to Svelte ${targetVersion}`);
    }
  }

  /**
   * Show current configuration status
   */
  status() {
    console.log('📊 Current Version Configuration:');
    console.log('==================================');
    console.log(`Target Svelte Version: ${this.getTargetVersion()}`);
    console.log(`Current Svelte Version: ${this.getCurrentVersion() || 'unknown'}`);
    console.log(`Auto Install: ${this.config.options?.auto_install || 'false'}`);
    console.log(`Backup Current: ${this.config.options?.backup_current || 'false'}`);
    console.log(`Loading Strategy: ${this.config.components?.loading_strategy || 'dynamic'}`);
    console.log(`Fallback Version: ${this.config.components?.fallback_version || '5'}`);
  }
}

// CLI handling
const args = process.argv.slice(2);
const command = args[0];

const manager = new VersionManager();

switch (command) {
  case 'switch':
  case 'update':
    manager.run();
    break;
  case 'switchTo4':
    try {
      console.log('🚀 Switching to Svelte 4...');
      manager.switchTo4();
    } catch (error) {
      console.error('❌ Error switching to Svelte 4:', error.message);
      process.exit(1);
    }
    break;
  case 'switchTo5':
    try {
      console.log('🚀 Switching to Svelte 5...');
      manager.switchTo5();
    } catch (error) {
      console.error('❌ Error switching to Svelte 5:', error.message);
      process.exit(1);
    }
    break;
  case 'status':
    manager.status();
    break;
  case 'help':
  case '--help':
  case '-h':
    console.log(`
Timeless Jewel Generator - Version Manager

Usage:
  node scripts/version-manager.js [command]

Commands:
  switch      Switch package.json based on version.ini configuration
  switchTo4   Explicitly switch to Svelte 4 (only if not already using Svelte 4)
  switchTo5   Explicitly switch to Svelte 5 (only if not already using Svelte 5)
  status      Show current version configuration status
  help        Show this help message

Configuration:
  Edit version.ini to change Svelte version and options
`);
    break;
  default:
    if (command) {
      console.log(`Unknown command: ${command}`);
      console.log('Run "node scripts/version-manager.js help" for usage information');
      process.exit(1);
    } else {
      // No command provided, run switch by default
      manager.run();
    }
}
