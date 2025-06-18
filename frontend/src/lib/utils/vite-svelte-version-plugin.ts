/**
 * Vite plugin to inject Svelte version information at build time
 * This enables runtime version detection for the version-aware system
 */

import type { Plugin } from 'vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';

interface SvelteVersionPluginOptions {
  /**
   * Custom path to package.json if not in standard location
   */
  packageJsonPath?: string;

  /**
   * Global variable name to inject the version into
   * @default '__SVELTE_VERSION__'
   */
  globalName?: string;
}

export function svelteVersionPlugin(options: SvelteVersionPluginOptions = {}): Plugin {
  const { packageJsonPath, globalName = '__SVELTE_VERSION__' } = options;

  return {
    name: 'svelte-version-injection',
    config(config, { command }) {
      try {
        // Determine package.json path
        const pkgPath = packageJsonPath || resolve(process.cwd(), 'package.json');
        const packageJson = JSON.parse(readFileSync(pkgPath, 'utf-8'));

        // Get Svelte version from dependencies or devDependencies
        const svelteVersion = packageJson.dependencies?.svelte || packageJson.devDependencies?.svelte || '4.2.0'; // fallback

        // Clean the version string (remove ^ ~ etc.)
        const cleanVersion = svelteVersion.replace(/[^\d.]/g, '');

        console.log(`[svelte-version-plugin] Detected Svelte version: ${cleanVersion}`);

        // Inject version as a global define
        config.define = config.define || {};
        config.define[globalName] = JSON.stringify(cleanVersion);
      } catch (error) {
        console.warn(`[svelte-version-plugin] Failed to read Svelte version:`, error);

        // Fallback to default version
        config.define = config.define || {};
        config.define[globalName] = JSON.stringify('4.2.0');
      }
    }
  };
}

export default svelteVersionPlugin;
