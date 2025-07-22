/**
 * Modern Types with Svelte 5 Runes - Fully Reactive WASM Integration
 * Central reactive store for all WASM calculator and data functions
 *
 * Copyright (C) 2025 James Armstrong (github.com/BlazesRus)
 * Generated with GitHub Copilot assistance and Microsoft Copilot assistance
 *
 * MIT License
 */

import { loadWasm, enhancedWasmState } from '$lib/ModernWasm/wasm-loader.svelte';
import { getEnvironmentWasmUrl } from '$lib/utils/wasm-urls';
import { captureError } from '$lib/ModernWasm/debugLogger.svelte';

// Central reactive store for all of your "Modern Types" surface:
export const modernTypes = $state({
  // Mirror loader state
  get isLoading() { return enhancedWasmState.isLoading },
  get isReady()   { return enhancedWasmState.isReady   },
  get error()     { return enhancedWasmState.error     },

  // Human-friendly status
  get status() {
    if (this.isLoading) return 'loading';
    if (this.isReady)   return 'ready';
    if (this.error)     return 'error';
    return 'idle';
  },

  // Raw exports object from the executor
  get exports() {
    return enhancedWasmState.executor?.getExports() ?? {};
  },

  // Alias for calculator exports
  get calculator() {
    return this.exports;
  },

  // Alias for data exports
  get data() {
    return this.exports;
  },

  // Additional computed properties for convenience
  get hasExports() {
    return Object.keys(this.exports).length > 0;
  },

  get exportNames() {
    return Object.keys(this.exports);
  },

  // Progress information
  get progress() {
    return enhancedWasmState.progress;
  },

  get progressHistory() {
    return enhancedWasmState.progressHistory;
  }
});

// Manual WASM initialization function (call this from components)
export async function initializeWasm() {
  // Only run once - check if we haven't started loading yet
  if (!modernTypes.isLoading && !modernTypes.isReady && modernTypes.error === null) {
    try {
      await loadWasm(getEnvironmentWasmUrl());
    } catch (err) {
      captureError(
        err instanceof Error ? err : new Error(String(err)), 
        'ModernTypesWasmInit'
      );
    }
  }
}

// Legacy function aliases for compatibility with existing components
export const useCalculator = () => modernTypes.calculator;
export const useData = () => modernTypes.data;
export const initializeCrystalline = initializeWasm;

// Export only the reactive modernTypes store - pure Svelte 5 runes approach
// Components should use: modernTypes.isLoading, modernTypes.calculator, etc.
// No legacy function exports - embrace the reactive paradigm!
