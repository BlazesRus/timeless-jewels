/**
 * Version configuration for the Timeless Jewel Generator
 * This file contains settings for version-aware functionality
 */

export interface VersionConfig {
  // Default Svelte version to assume if detection fails
  defaultSvelteVersion: string;
  
  // Whether to enable version detection logging
  enableVersionLogging: boolean;
  
  // Fallback strategy when version detection fails
  fallbackStrategy: 'svelte4' | 'svelte5' | 'auto';
  
  // UI library configurations for different Svelte versions
  uiLibraries: {
    svelte4: {
      select: 'svelte-select';
      description: 'Traditional svelte-select component';
    };
    svelte5: {
      select: 'ModernSelect';
      description: 'Modern Svelte 5 compatible select component';
    };
  };
  
  // Feature flags for version-specific features
  features: {
    runes: boolean;           // Svelte 5 runes syntax
    legacyReactivity: boolean; // Svelte 4 reactivity patterns
    modernEvents: boolean;    // Svelte 5 event handling
  };
}

export const versionConfig: VersionConfig = {
  defaultSvelteVersion: '4.2.0',
  enableVersionLogging: true,
  fallbackStrategy: 'svelte4',
  
  uiLibraries: {
    svelte4: {
      select: 'svelte-select',
      description: 'Traditional svelte-select component with CustomEvent API'
    },
    svelte5: {
      select: 'ModernSelect',
      description: 'Modern Svelte 5 compatible select component with runes'
    }
  },
  
  features: {
    runes: false,        // Will be set to true for Svelte 5+
    legacyReactivity: true,  // Will be set to false for Svelte 5+
    modernEvents: false      // Will be set to true for Svelte 5+
  }
};

/**
 * Updates feature flags based on detected Svelte version
 */
export function updateFeatureFlags(majorVersion: number): VersionConfig {
  const config = { ...versionConfig };
  
  if (majorVersion >= 5) {
    config.features.runes = true;
    config.features.legacyReactivity = false;
    config.features.modernEvents = true;
  } else {
    config.features.runes = false;
    config.features.legacyReactivity = true;
    config.features.modernEvents = false;
  }
  
  return config;
}

/**
 * Gets the appropriate UI library configuration for a Svelte version
 */
export function getUILibraryConfig(majorVersion: number) {
  return majorVersion >= 5 ? versionConfig.uiLibraries.svelte5 : versionConfig.uiLibraries.svelte4;
}
