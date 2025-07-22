/*
 *
 * Copyright (C) 2025 James Armstrong (github.com/BlazesRus)
 * Generated with GitHub Copilot assistance
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
