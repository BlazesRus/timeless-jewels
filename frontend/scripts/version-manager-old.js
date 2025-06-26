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
   * Get the target Svelte version from configuration or runtime detection
   */
  getTargetVersion() {
    // First try to get from runtime (installed version)
    const installedVersion = this.getInstalledSvelteVersion();
    if (installedVersion) {
      return installedVersion.toString();
    }

    // Fallback to config if available
    const version = this.config.svelte?.version || '5';
    if (!['4', '5'].includes(version)) {
      console.warn(`Invalid Svelte version "${version}" in config. Using default: 5`);
      return '5';
    }
    return version;
  }

  /**
   * Get the current Svelte version from package.json (fallback method)
   */
  getCurrentVersionFromPackageJson() {
    try {
      const packageJson = JSON.parse(readFileSync(this.packageJsonPath, 'utf8'));
      const svelteVersion = packageJson.devDependencies?.svelte;

      if (!svelteVersion) return null;

      // Extract major version
      const match = svelteVersion.match(/(\^|~)?(\d+)/);
      return match ? +match[2] : null;
    } catch (error) {
      console.warn('Could not determine current Svelte version:', error.message);
      return null;
    }
  }

  /**
   * Get the current Svelte version (prefers runtime detection)
   */
  getCurrentVersion() {
    const installedVersion = this.getInstalledSvelteVersion();
    if (installedVersion) return installedVersion;
    
    const packageJsonVersion = this.getCurrentVersionFromPackageJson();
    return packageJsonVersion || 5; // Default to 5 if all else fails
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

    // Skip validation if configured to do so
    if (this.config.options?.skip_version_validation === 'true') {
      console.log('⏭️ Version validation skipped (skip_version_validation = true)');
      return false;
    } 
    
    // Check if we should respect current mode (prevent switching during testing)
    if (this.config.options?.respect_current_mode === 'true' && currentVersion.toString() === targetVersion) {
      console.log(`🔒 Respect Current Mode: Already using Svelte ${targetVersion}. Staying in current mode.`);
      return false;
    }

    // Check testing mode (prevents any version switching during testing)
    if (this.config.options?.testing_mode === 'true') {
      console.log('🧪 Testing Mode: Version switching disabled during testing operations.');
      console.log(`💡 Currently using Svelte ${currentVersion || 'unknown'}, tests will run against this version.`);
      return false;
    }

    if (currentVersion.toString() === targetVersion) {
      console.log(`✅ Already using Svelte ${targetVersion}. No changes needed.`);
      return false;
    }

    // Determine source package file
    const sourcePackage = targetVersion === '5' ? this.config.packages?.svelte5_package || 'Svelte5Package.json' : this.config.packages?.svelte4_package || 'LegacyPackage.json';

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
  } /**
   * Update version detection config for runtime
   */
  updateVersionConfig() {
    const targetVersion = this.getTargetVersion();

    // Update version.ini to reflect the current target version
    this.updateVersionIni(targetVersion);

    // Update file hiding based on the target version
    this.updateFileHiding(targetVersion);
  } /**
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
  switchTo4() {
    // Check testing mode only (allow manual switching unless in testing mode)
    if (this.config.options?.testing_mode === 'true') {
      console.log('🧪 Testing Mode: Version switching disabled during testing operations.');
      return false;
    }

    const currentVersion = this.getCurrentVersion();

    console.log(`🎯 Target: Svelte 4 (Legacy mode via pnpmfile.cjs)`);
    console.log(`📋 Current: Svelte ${currentVersion || 'unknown'}`);

    if (currentVersion === '4') {
      console.log('✅ Already using Svelte 4. No changes needed.');
      return false;
    }

    try {
      console.log('🔄 Switching to Svelte 4 via configDependencies system...');
      
      // Set environment variable for pnpmfile.cjs
      const env = { ...process.env, SVELTE_MODE: 'legacy' };
      
      // Install dependencies with legacy config
      console.log('📦 Installing legacy dependencies...');
      execSync('pnpm install', { 
        stdio: 'inherit', 
        cwd: this.rootDir,
        env
      });
      
      console.log('🎉 Successfully switched to Svelte 4 (Legacy mode)!');
      console.log('💡 To persist this mode, set SVELTE_MODE=legacy in your environment');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to switch to Svelte 4:', error.message);
      throw error;
    }
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
    this.createBackup(); // Copy the Svelte 5 package file
    copyFileSync(sourcePath, this.packageJsonPath);
    console.log(`📦 Switched to ${sourcePackage} (Svelte 5)`);

    // Update version config
    this.updateVersionConfigTo('5');

    // Install dependencies if configured
    this.installDependencies();

    console.log('🎉 Successfully switched to Svelte 5!');
    return true;
  } /**
   * Update version detection config for specific version
   */
  updateVersionConfigTo(targetVersion) {
    // Update version.ini to reflect the specified target version
    this.updateVersionIni(targetVersion);

    // Update VS Code file hiding based on version
    this.updateFileHiding(targetVersion);

    // Update TypeScript configuration for the new version
    this.updateTypeScriptConfig(targetVersion);

    // Update VSCode settings for the new version
    this.updateVSCodeSettings();
  }

  /**
   * Update the version.ini file with the specified target version
   */
  updateVersionIni(targetVersion) {
    try {
      let content = readFileSync(this.configPath, 'utf8');

      // Update the version in the [svelte] section
      content = content.replace(/^version\s*=\s*[45]$/m, `version = ${targetVersion}`);

      writeFileSync(this.configPath, content);
      console.log(`🔧 Updated version.ini to version = ${targetVersion}`);
    } catch (error) {
      console.warn(`⚠️ Could not update version.ini: ${error.message}`);
    }
  }

  /**
   * Update VS Code settings to hide incompatible files based on Svelte version
   */
  updateFileHiding(targetVersion) {
    const vsCodeSettingsPath = join(this.rootDir, '..', '.vscode', 'settings.json');

    if (!existsSync(vsCodeSettingsPath)) {
      console.log('⚠️ VS Code settings.json not found, skipping file hiding update');
      return;
    }

    try {
      let content = readFileSync(vsCodeSettingsPath, 'utf8');

      // Remove comments for JSON parsing
      const jsonContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
      let settings = JSON.parse(jsonContent);

      // Update files.exclude based on version
      if (!settings['files.exclude']) {
        settings['files.exclude'] = {};
      }

      // Clear previous version-specific exclusions
      delete settings['files.exclude']['**/components/Legacy/**'];
      delete settings['files.exclude']['**/*Legacy*'];
      delete settings['files.exclude']['**/*Svelte4*'];
      delete settings['files.exclude']['**/LegacyPackage*.json'];
      delete settings['files.exclude']['**/components/Svelte5/**'];
      delete settings['files.exclude']['**/*Svelte5*'];
      delete settings['files.exclude']['**/*Modern*'];
      delete settings['files.exclude']['**/Svelte5Package*.json'];

      // Add new exclusions based on target version
      if (targetVersion === '5') {
        // Hide Svelte 4/Legacy files when using Svelte 5
        settings['files.exclude']['**/components/Legacy/**'] = true;
        settings['files.exclude']['**/*Legacy*'] = true;
        settings['files.exclude']['**/*Svelte4*'] = true;
        settings['files.exclude']['**/LegacyPackage*.json'] = true;
      } else {
        // Hide Svelte 5/Modern files when using Svelte 4
        settings['files.exclude']['**/components/Svelte5/**'] = true;
        settings['files.exclude']['**/*Svelte5*'] = true;
        settings['files.exclude']['**/*Modern*'] = true;
        settings['files.exclude']['**/Svelte5Package*.json'] = true;
      }

      // Update Copilot file filtering if it exists
      if (settings['github.copilot.chat.experimental.codeGeneration.fileFiltering']) {
        if (targetVersion === '5') {
          settings['github.copilot.chat.experimental.codeGeneration.fileFiltering'].excludePatterns = ['**/components/Legacy/**', '**/*Legacy*', '**/*Svelte4*', '**/LegacyPackage*.json'];
        } else {
          settings['github.copilot.chat.experimental.codeGeneration.fileFiltering'].excludePatterns = ['**/components/Svelte5/**', '**/*Svelte5*', '**/*Modern*', '**/Svelte5Package*.json'];
        }
      }

      // Write back the settings with proper formatting
      const updatedContent = JSON.stringify(settings, null, 2);
      writeFileSync(vsCodeSettingsPath, updatedContent);
      console.log(`🔧 Updated VS Code file hiding for Svelte ${targetVersion} mode`);
    } catch (error) {      console.error('⚠️ Failed to update VS Code file hiding:', error.message);
      console.log('💡 You may need to manually update .vscode/settings.json');
    }
  }
  /**
   * Update TypeScript configuration to use mode-specific settings via VS Code workspace
   */  updateTypeScriptConfig(targetVersion) {
    try {
      console.log(`🔧 Updating TypeScript workspace configuration for Svelte ${targetVersion} mode...`);
      
      // Determine which config file to reference (no file modification)
      const configFile = targetVersion === '4' ? 
        'tsconfig.legacy-mode.json' : 
        'tsconfig.modern-mode.json';
      
      // Update VS Code settings to use the appropriate TypeScript configuration
      const vsCodeSettingsPath = join(this.rootDir, '..', '.vscode', 'settings.json');
      
      if (existsSync(vsCodeSettingsPath)) {
        const settingsContent = readFileSync(vsCodeSettingsPath, 'utf8');
        const settings = JSON.parse(settingsContent);
        
        // Set TypeScript configuration to use mode-specific config
        settings['typescript.preferences.project'] = `frontend/${configFile}`;
        
        // Enable workspace-aware TypeScript
        settings['typescript.preferences.includePackageJsonAutoImports'] = 'auto';
        
        // Mode-specific TypeScript settings
        if (targetVersion === '4') {
          // Legacy mode - more permissive
          settings['typescript.suggest.completeFunctionCalls'] = false;
          settings['typescript.reportStyleChecksAsWarnings'] = false;
        } else {
          // Modern mode - more strict  
          settings['typescript.suggest.completeFunctionCalls'] = true;
          settings['typescript.reportStyleChecksAsWarnings'] = true;
        }
        
        // Write back the updated settings
        const updatedContent = JSON.stringify(settings, null, 2);
        writeFileSync(vsCodeSettingsPath, updatedContent);
        
        console.log(`✅ TypeScript workspace configured to use ${configFile} (zero tsconfig.json modifications)`);
      } else {
        console.log('⚠️ VS Code settings not found, TypeScript will use default tsconfig.json');
      }
      
    } catch (error) {
      console.error('⚠️ Failed to update TypeScript workspace configuration:', error.message);
      console.log('💡 TypeScript will fall back to default tsconfig.json');
    }
  }

  /**
   * Update VSCode settings using the dedicated settings manager
   */
  updateVSCodeSettings() {
    try {
      console.log('🔧 Updating VSCode settings for current version...');
      const settingsScript = join(__dirname, 'vscode-settings.js');
      execSync(`node "${settingsScript}" update`, {
        cwd: this.rootDir,
        stdio: 'inherit'
      });
    } catch (error) {
      console.warn(`⚠️ Could not update VSCode settings: ${error.message}`);
      console.log('💡 You can manually run: node scripts/vscode-settings.js update');
    }
  }
  /**
   * Show current configuration status
   */ 
  status() {
    const installedVersion = this.getInstalledSvelteVersion();
    const packageVersion = this.getCurrentVersionFromPackageJson();
    const targetVersion = this.getTargetVersion();
    
    console.log('📊 Current Version Configuration:');
    console.log('==================================');
    console.log(`🚀 Runtime Detected Version: ${installedVersion || 'not available'}`);
    console.log(`📦 Package.json Version: ${packageVersion || 'unknown'}`);
    console.log(`🎯 Target Version: ${targetVersion}`);
    console.log(`📋 Effective Version: ${this.getCurrentVersion()}`);
    console.log(`🔧 PostCSS Config: ${this.getPostCSSStatus()}`);
    console.log(`🔄 Auto Install: ${this.config.options?.auto_install || 'false'}`);
    console.log(`🔒 Respect Current Mode: ${this.config.options?.respect_current_mode || 'false'}`);
    console.log(`🧪 Testing Mode: ${this.config.options?.testing_mode || 'false'}`);
    console.log(`⏭️ Skip Version Validation: ${this.config.options?.skip_version_validation || 'false'}`);
    console.log(`💾 Backup Current: ${this.config.options?.backup_current || 'false'}`);
    console.log(`⚡ Loading Strategy: ${this.config.components?.loading_strategy || 'dynamic'}`);
    console.log(`🔧 Fallback Version: ${this.config.components?.fallback_version || '5'}`);

    console.log('');
    console.log('💡 Version Detection Strategy:');
    if (installedVersion) {
      console.log('   ✅ Using runtime detection (svelte/compiler)');
      console.log('   📋 This is the most accurate method');
    } else {
      console.log('   📦 Using package.json fallback');
      console.log('   💡 Install dependencies for runtime detection');
    }

    if (this.config.options?.respect_current_mode === 'true') {
      console.log('');
      console.log('🔒 RESPECT CURRENT MODE ENABLED');
      console.log('   • Tests and development will use current version');
      console.log('   • Prevents switching away from current mode during testing');
      console.log('   • Avoids unnecessary package reinstalls');
    }

    if (this.config.options?.testing_mode === 'true') {
      console.log('');
      console.log('🧪 TESTING MODE ENABLED');
      console.log('   • All version switching is disabled');
      console.log('   • Tests will run against currently installed version');
    }
  }  /**
   * Get current PostCSS configuration status based on Svelte version
   */
  getPostCSSStatus() {
    const currentVersion = this.getCurrentVersion();
    const targetVersion = this.getTargetVersion();

    // Determine the correct PostCSS config path based on Svelte version
    const configPath = join(this.rootDir, 'postcss.config.cjs');

    const modeName = currentVersion >= 5 ? 'Modern' : 'Legacy';
    const expectedPath = 'postcss.config.cjs';

    if (!existsSync(configPath)) {
      return `${expectedPath} not found`;
    }

    try {
      const content = readFileSync(configPath, 'utf8');

      // Check if PostCSS config matches current Svelte version
      const hasModernConfig = content.includes('@tailwindcss/postcss');
      const hasLegacyConfig = content.includes('tailwindcss: {}');

      if (currentVersion >= 5 && hasModernConfig) {
        return `${expectedPath} (✅ Modern Mode)`;
      } else if (currentVersion < 5 && hasLegacyConfig) {
        return `${expectedPath} (✅ Legacy Mode)`;
      } else {
        return `${expectedPath} (⚠️ config mismatch)`;
      }
    } catch (error) {
      return `${expectedPath} (error reading)`;
    }
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
