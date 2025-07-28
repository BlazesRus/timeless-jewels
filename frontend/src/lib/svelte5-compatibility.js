/**
 * Svelte 5 Library Compatibility Configuration
 *
 * This file defines which third-party libraries need special handling
 * when using Svelte 5 with runes mode enabled.
 */

// Libraries that are built for Svelte 3/4.x and need compatibility mode
export const svelte4Libraries = [
  'svelte-tiny-virtual-list' // Virtual scrolling list (built with Svelte 3.31.0)
];

// Libraries that are Svelte 5 compatible
export const svelte5Libraries = [
  '@humanspeak/svelte-virtual-list',//Replacement for svelte-tiny-virtual-list but needs some changes
  'svelte-canvas' // Canvas drawing component (supports Svelte ^5.0.0)
];

// Component mapping for gradual migration
export const componentMigrations = {
  // Now that svelte-canvas supports Svelte 5, enable runes for it
  'svelte-canvas': {
    legacy: 'svelte-canvas',
    runes: true,
    notes: 'Canvas component now supports Svelte 5 with runes'
  },

  // Virtual list - consider upgrading to @tanstack/svelte-virtual
  'svelte-tiny-virtual-list': {
    legacy: 'svelte-tiny-virtual-list',
    modern: '@humanspeak/svelte-virtual-list', // Future upgrade path
    runes: false,
    notes: 'Works in compatibility mode, consider upgrading to @humanspeak/svelte-virtual-list or @tanstack/svelte-virtual'
  }
};

// ESLint ignore patterns for third-party libraries
export const eslintIgnorePatterns = ['node_modules/svelte-tiny-virtual-list/**'];

// Prettier ignore patterns for third-party Svelte 3/4 libraries
export const prettierIgnorePatterns = ['node_modules/svelte-tiny-virtual-list/**'];

/**
 * Check if a file path belongs to a Svelte 4.x library
 * @param filePath The file path to check
 * @returns boolean indicating if it's a Svelte 4.x library
 */
export function isSvelte4Library(filePath) {
  return svelte4Libraries.some(lib => filePath?.includes(`node_modules/${lib}`) || filePath?.includes(`/${lib}/`));
}

/**
 * Get compiler options for a specific file
 * @param filePath The file path to get options for
 * @returns Compiler options object
 */
export function getCompilerOptions(filePath) {
  if (isSvelte4Library(filePath)) {
    return {
      runes: false,
      compatibility: { componentApi: 4 },
      generate: 'dom'
    };
  }

  return {
    runes: true,
    generate: 'dom'
  };
}
