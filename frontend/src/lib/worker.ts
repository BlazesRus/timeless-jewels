/* Modernized for Svelte 5*/
import { browser } from '$app/environment';
import { ModernWorkerManager, createWorkerManager } from '$lib/ModernWasm/ModernWorkerManager';
import type { ModernTimelessWorker, SearchConfig, SearchResults, SearchProgressCallback } from './modern-worker-types';

/**
 * Modern worker wrapper with better error handling and lifecycle management
 * Uses the new ModernWorkerManager template
 */
export type ModernTimelessWorkerManager = ModernWorkerManager<ModernTimelessWorker, SearchConfig, SearchResults, SearchProgressCallback>;

// Create singleton instance using the template
let workerManager: ModernTimelessWorkerManager | null = null;

/**
 * Get the modern worker manager instance
 */
export function getModernWorkerManager(): ModernTimelessWorkerManager {
  if (!workerManager) {
    workerManager = createWorkerManager<ModernTimelessWorker, SearchConfig, SearchResults, SearchProgressCallback>('./modern-sync-worker?worker', 'ModernTimelessWorker');
  }
  return workerManager;
}

/**
 * Initialize and get the modern worker (convenience function)
 */
export async function initializeModernWorker(): Promise<ModernTimelessWorkerManager> {
  const manager = getModernWorkerManager();
  if (!manager.isReady()) {
    await manager.init();
  }
  return manager;
}

// Export for backward compatibility and easy access
export const modernWorker = browser ? getModernWorkerManager() : null;

// Export types
export type { ModernTimelessWorker, SearchProgressCallback } from './modern-worker-types';

// Re-export the manager class for direct usage
export { ModernWorkerManager, createWorkerManager } from '$lib/ModernWasm/ModernWorkerManager';
