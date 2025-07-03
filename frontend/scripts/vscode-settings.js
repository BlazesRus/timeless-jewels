/**
 * VSCode Settings Manager for Version-Aware Development
 * Manages VSCode workspace settings based on current Svelte version
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class VSCodeSettingsManager {
  constructor() {
    this.rootDir = join(__dirname, '..');
    // VSCode settings should be in workspace root, not frontend folder
    this.vscodeDir = join(this.rootDir, '..', '.vscode');
    this.settingsPath = join(this.vscodeDir, 'settings.json');
  }

  /**
   * Get current Svelte version from runtime detection
   */
  getCurrentVersion() {
    try {
      // Try runtime detection first
      const { VERSION } = require('svelte/compiler');
      return +VERSION.split('.')[0]; // Return major version as number
    } catch (error) {
      console.warn('Could not detect installed Svelte version, defaulting to Svelte 5...');
      return 5; // Default to Svelte 5
    }
  }

  /**
   * Get current SVELTE_MODE environment variable
   */
  getCurrentMode() {
    return process.env.SVELTE_MODE || 'modern';
  }

  /**
   * Get current VSCode settings or create default
   */
  getCurrentSettings() {
    if (!existsSync(this.settingsPath)) {
      return {};
    }

    try {
      const content = readFileSync(this.settingsPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('Invalid VSCode settings.json, creating new one');
      return {};
    }
  }

  /**
   * Update VSCode settings based on current version
   */
  updateSettings() {
    const version = this.getCurrentVersion();
    const settings = this.getCurrentSettings();

    // Ensure .vscode directory exists
    if (!existsSync(this.vscodeDir)) {
      mkdirSync(this.vscodeDir, { recursive: true });
    } // Configure file exclusions based on version
    if (version === 5) {
      // Modern Mode (Svelte 5) - Hide legacy ESLint config
      settings['files.exclude'] = {
        ...settings['files.exclude'],
        'frontend/.eslintrc.cjs': true,
        'frontend/.eslintignore': true,
        'frontend/version-manager-old.js': true
      };

      // Set ESLint to use flat config
      settings['eslint.useFlatConfig'] = true;

      console.log('🔧 VSCode configured for Modern Mode (Svelte 5)');
      console.log('   - Hidden: frontend/.eslintrc.cjs, frontend/.eslintignore');
      console.log('   - ESLint: Using flat config (eslint.config.js)');
    } else {
      // Legacy Mode (Svelte 4) - Hide modern configs
      settings['files.exclude'] = {
        ...settings['files.exclude'],
        'frontend/eslint.config.js': true,
        'frontend/version-manager-old.js': true
      };

      // Delete the legacy ESLint files from exclusions if they exist
      if (settings['files.exclude']?.['frontend/.eslintrc.cjs']) {
        delete settings['files.exclude']['frontend/.eslintrc.cjs'];
      }
      if (settings['files.exclude']?.['frontend/.eslintignore']) {
        delete settings['files.exclude']['frontend/.eslintignore'];
      }

      // Set ESLint to use legacy config
      settings['eslint.useFlatConfig'] = false;

      console.log('🔧 VSCode configured for Legacy Mode (Svelte 4)');
      console.log('   - Hidden: frontend/eslint.config.js');
      console.log('   - ESLint: Using legacy config (.eslintrc.cjs, .eslintignore)');
    }

    // Write updated settings
    writeFileSync(this.settingsPath, JSON.stringify(settings, null, 2));
    console.log('✅ VSCode settings updated successfully');
  }

  /**
   * Show current configuration status
   */
  showStatus() {
    const version = this.getCurrentVersion();
    const settings = this.getCurrentSettings();

    console.log(`\n🎯 Current Configuration:`);
    console.log(`   Svelte Version: ${version}`);
    console.log(`   Mode: ${version === '5' ? 'Modern' : 'Legacy'}`);
    console.log(`   ESLint Config: ${version === '5' ? 'eslint.config.js (flat)' : '.eslintrc.cjs (legacy)'}`);

    if (settings['files.exclude']) {
      console.log(`\n📁 Hidden Files:`);
      Object.keys(settings['files.exclude']).forEach(file => {
        if (settings['files.exclude'][file]) {
          console.log(`   - ${file}`);
        }
      });
    }
  }
}

// CLI Interface
const manager = new VSCodeSettingsManager();
const command = process.argv[2];

switch (command) {
  case 'update':
    manager.updateSettings();
    break;
  case 'status':
    manager.showStatus();
    break;
  default:
    console.log('VSCode Settings Manager');
    console.log('Usage:');
    console.log('  node scripts/vscode-settings.js update  - Update VSCode settings for current version');
    console.log('  node scripts/vscode-settings.js status  - Show current configuration status');
}
