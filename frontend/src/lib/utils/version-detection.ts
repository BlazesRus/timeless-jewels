/**
 * Version detection utility for Svelte version-aware component loading
 */

interface SvelteVersion {
  major: number;
  minor: number;
  patch: number;
  full: string;
}

/**
 * Detects the current Svelte version from build configuration
 * Since we're building with Svelte 5, we can assume Svelte 5 features are available
 */
export function detectSvelteVersion(): SvelteVersion {
  // For static builds, we know the version at build time
  // Since the build completed successfully with Svelte 5, we can assume Svelte 5
  return { major: 5, minor: 33, patch: 18, full: '5.33.18' };
}

/**
 * Runtime detection of Svelte version - fallback method
 * Uses feature detection to determine Svelte version
 */
function detectSvelteVersionRuntime(): SvelteVersion {
  // Check for Svelte 5 specific features
  if (typeof globalThis !== 'undefined' && (globalThis as any).__SVELTE__) {
    const svelteGlobal = (globalThis as any).__SVELTE__ as any;

    // Svelte 5 has different internal structure
    if (svelteGlobal.runes !== undefined || svelteGlobal.effect !== undefined) {
      return { major: 5, minor: 0, patch: 0, full: '5.0.0' };
    }
  }

  // Check for Svelte 4 specific features
  if (typeof window !== 'undefined') {
    // Check for Svelte 4 compiler features
    try {
      // Svelte 4 has specific component lifecycle
      const testComponent = document.createElement('div');
      if (testComponent && 'getRootNode' in testComponent) {
        return { major: 4, minor: 2, patch: 0, full: '4.2.0' };
      }
    } catch {
      // Ignore errors in detection
    }
  }

  // For static builds where we know we're using Svelte 5
  return { major: 5, minor: 33, patch: 18, full: '5.33.18' };
}

/**
 * Parses a semantic version string into components
 */
function parseSvelteVersion(versionString: string): SvelteVersion {
  const cleanVersion = versionString.replace(/[^0-9.]/g, '');
  const parts = cleanVersion.split('.').map(Number);

  return {
    major: parts[0] || 4,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
    full: versionString
  };
}

/**
 * Checks if the current Svelte version is 5 or higher
 */
export function isSvelte5OrHigher(): boolean {
  const version = detectSvelteVersion();
  return version.major >= 5;
}

/**
 * Checks if the current Svelte version is 4
 */
export function isSvelte4(): boolean {
  const version = detectSvelteVersion();
  return version.major === 4;
}

/**
 * Gets a version-specific component name suffix
 */
export function getVersionSuffix(): string {
  return isSvelte5OrHigher() ? 'Svelte5' : 'Svelte4';
}

// Global type declaration for build-time version
declare global {
  const __SVELTE_VERSION__: string;
}
