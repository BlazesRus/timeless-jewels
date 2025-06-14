import { browser } from '$app/environment';
import { wrap, proxy, transfer } from 'comlink';
import type { Remote } from 'comlink';
import type { ModernTimelessWorker, SearchProgressCallback } from './modern-worker-types';

/**
 * Modern worker wrapper with better error handling and lifecycle management
 */
class ModernWorkerManager {
  private worker: Worker | null = null;
  private workerApi: Remote<ModernTimelessWorker> | null = null;
  private initialized = false;

  /**
   * Initialize the worker
   */
  async init(): Promise<void> {
    if (!browser) {
      throw new Error('Worker can only be initialized in browser environment');
    }

    if (this.worker) {
      console.warn('Worker already initialized, terminating existing worker');
      this.terminate();
    }

    try {
      // Import the worker using Vite's worker import syntax
      const ModernWorker = await import('./modern-sync-worker?worker');
      this.worker = new ModernWorker.default();
        // Wrap the worker with Comlink
      this.workerApi = wrap<ModernTimelessWorker>(this.worker);
      
      console.log('Modern worker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize modern worker:', error);
      throw new Error(`Worker initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Boot the worker with WASM data
   */
  async boot(wasmBuffer: ArrayBuffer): Promise<void> {
    if (!this.workerApi) {
      await this.init();
    }

    if (!this.workerApi) {
      throw new Error('Worker not available');
    }

    try {
      // Transfer the ArrayBuffer to the worker for better performance
      await this.workerApi.initialize({
        wasmBuffer: transfer(wasmBuffer, [wasmBuffer])
      });
      
      this.initialized = true;
      console.log('Worker booted successfully');
    } catch (error) {
      console.error('Worker boot failed:', error);
      throw new Error(`Worker boot failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Perform reverse search with progress callback
   */
  async reverseSearch(
    config: Parameters<ModernTimelessWorker['reverseSearch']>[0],
    onProgress?: SearchProgressCallback
  ): Promise<ReturnType<ModernTimelessWorker['reverseSearch']>> {
    if (!this.workerApi || !this.initialized) {
      throw new Error('Worker not initialized. Call boot() first.');
    }

    try {
      // Create a proxied progress callback if provided
      const progressProxy = onProgress ? proxy(onProgress) : undefined;
      const result = await this.workerApi.reverseSearch(config, progressProxy);
      
      // Proxy cleanup is handled automatically by Comlink
      
      return result;
    } catch (error) {
      console.error('Reverse search failed:', error);
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get worker status
   */
  async getStatus(): Promise<{ initialized: boolean; ready: boolean }> {
    if (!this.workerApi) {
      return { initialized: false, ready: false };
    }

    try {
      return await this.workerApi.getStatus();
    } catch (error) {
      console.error('Failed to get worker status:', error);
      return { initialized: false, ready: false };
    }
  }

  /**
   * Check if worker is ready
   */
  isReady(): boolean {
    return this.initialized && this.workerApi !== null;
  }

  /**
   * Terminate the worker
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.workerApi = null;
      this.initialized = false;
      console.log('Worker terminated');
    }
  }

  /**
   * Cleanup method for proper resource management
   */
  dispose(): void {
    this.terminate();
  }
}

// Create singleton instance
let workerManager: ModernWorkerManager | null = null;

/**
 * Get the modern worker manager instance
 */
export function getModernWorkerManager(): ModernWorkerManager {
  if (!workerManager) {
    workerManager = new ModernWorkerManager();
  }
  return workerManager;
}

/**
 * Initialize and get the modern worker (convenience function)
 */
export async function initializeModernWorker(): Promise<ModernWorkerManager> {
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
