/**
 * Modern WASM Loader with Svelte 5 Runes - Consolidated Version
 * 
 * Copyright (C) 2025 James Armstrong (github.com/BlazesRus)
 * Generated with GitHub Copilot assistance
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * Combines the best features from both versions:
 * - Uses the new modern-wasm-exec.svelte.ts executor with TypeScript/Svelte 5 Go runtime
 * - Comprehensive path resolution with fallbacks
 * - Detailed progress tracking and debugging
 * - Legacy compatibility API
 * Updated: 2025-01-18T16:00:00Z - Consolidated from v1 and v2 loaders
 */

import { browser } from '$app/environment';
import { base } from '$app/paths';
import { getModernWasmExecutor, wasmState } from './modern-wasm-exec.svelte';

// Re-export the reactive state for components
export { wasmState as wasmStatus };

/**
 * Get the correct base path for static files with comprehensive fallback paths
 */
function getStaticPath(filename: string): string {
  return `${base}/${filename}`;
}

/**
 * Get all possible WASM file paths in order of preference
 */
function getPossibleWasmPaths(): string[] {
  return [
    '/timeless-jewels/calculator.wasm',          // HARDCODED: Known working path first
    getStaticPath('calculator.wasm'),            // Primary path using SvelteKit base
    '/timeless-jewels/tools.wasm',               // Alternative name explicit base
    '/calculator.wasm',                          // Fallback without base
    getStaticPath('tools.wasm'),                 // Alternative name with base
    '/tools.wasm',                               // Alternative name without base
    '/timeless-jewels/static/calculator.wasm',   // Production build path with base
    '/static/calculator.wasm',                   // Production build path without base
    '/timeless-jewels/wasm/calculator.wasm',     // Wasm subdirectory with base
    '/wasm/calculator.wasm'                      // Wasm subdirectory without base
  ];
}

/**
 * Modern WASM Loader with Svelte 5 runes and comprehensive error handling
 * Provides reactive state and improved debugging with fallback path support
 */
export async function loadModernWasm(): Promise<boolean> {
	if (!browser) {
		console.warn('WASM loading skipped - not in browser environment');
		return false;
	}

	console.log('🔥 CONSOLIDATED MODERN WASM LOADER - ENHANCED VERSION WITH FALLBACK PATHS');
	console.log('🚀 Starting modern WASM loading with enhanced runes...');
	
	try {
		// Get the modern WASM executor
		const executor = getModernWasmExecutor();
		
		// Try loading from multiple possible paths
		const possiblePaths = getPossibleWasmPaths();
		console.log(`🌐 Current location: ${globalThis.location?.href}`);
		console.log(`🗂️ Base path: ${base}`);
		console.log('🔍 Debug: All possible paths:', possiblePaths);
		
		let success = false;
		let lastError: any = null;
		
		// Try each path until one works
		for (const path of possiblePaths) {
			console.log(`📡 Attempting to load WASM from: ${path}`);
			
			try {
				success = await executor.loadWasm(path);
				if (success) {
					console.log(`✅ Successfully loaded WASM from: ${path}`);
					break;
				} else {
					console.log(`❌ Loading failed for path: ${path}`);
				}
			} catch (error) {
				console.log(`❌ Error loading from ${path}:`, error);
				lastError = error;
			}
		}
		
		if (success) {
			console.log('✅ Modern WASM loaded successfully with consolidated loader!');
			
			// Log available exports
			const exports = executor.getExports();
			console.log('📦 Available exports:', Object.keys(exports));
			
			// Additional debugging info
			console.log('📊 Final state:', {
				isInitialized: wasmState.isInitialized,
				isRunning: wasmState.isRunning,
				hasExited: wasmState.hasExited,
				error: wasmState.error,
				exportCount: Object.keys(exports).length
			});
			
			return true;
		} else {
			console.error('❌ Modern WASM loading failed from all attempted paths');
			if (lastError) {
				console.error('❌ Last error:', lastError);
			}
			return false;
		}
		
	} catch (error) {
		console.error('💥 Modern WASM loading error:', error);
		return false;
	}
}

/**
 * Get the current WASM runtime instance
 */
export function getWasmRuntime() {
	return getModernWasmExecutor();
}

/**
 * Check if a specific WASM function is available
 */
export function hasWasmFunction(name: string): boolean {
	const executor = getModernWasmExecutor();
	const exports = executor.getExports();
	return typeof exports[name] === 'function';
}

/**
 * Call a WASM function with error handling
 */
export function callWasmFunction(name: string, ...args: any[]): any {
	const executor = getModernWasmExecutor();
	return executor.callFunction(name, ...args);
}

/**
 * Get reactive loading progress (0-100)
 */
export function getLoadingProgress(): number {
	const isReady = wasmState.isInitialized && !wasmState.hasExited && !wasmState.error;
	return isReady ? 100 : wasmState.error ? 0 : 50;
}

/**
 * Check if WASM is ready for use
 */
export function isWasmReady(): boolean {
	return wasmState.isInitialized && !wasmState.hasExited && !wasmState.error;
}

/**
 * Get any WASM loading errors
 */
export function getWasmError(): string | null {
	return wasmState.error;
}

/**
 * Get debug logs for troubleshooting
 */
export function getWasmDebugLogs(): string[] {
	return wasmState.logs;
}

// Legacy API compatibility - enhanced reactive state
export const wasmLoadingState = $derived({
	isLoading: wasmState.isRunning && !wasmState.isInitialized,
	isReady: wasmState.isInitialized && !wasmState.hasExited && !wasmState.error,
	error: wasmState.error,
	status: (() => {
		if (wasmState.error) return `Error: ${wasmState.error}`;
		if (wasmState.hasExited) return 'Exited';
		if (wasmState.isInitialized) return 'Ready';
		if (wasmState.isRunning) return 'Loading...';
		return 'Initializing...';
	})(),
	progress: (() => {
		if (wasmState.error) return 0;
		if (wasmState.isInitialized && !wasmState.hasExited) return 100;
		if (wasmState.isRunning) return 50;
		return 10;
	})(),
	data: wasmState.exports,
	calculator: wasmState.exports
});

// Enhanced wrapper function for Go WASM function calls with better error reporting
const wrap = (fn: Function) => {
  return (...args: any[]) => {
    try {
      const result = fn.call(undefined, ...args);
      if ((globalThis as any).goInternalError) {
        const error = new Error((globalThis as any).goInternalError);
        (globalThis as any).goInternalError = undefined;
        throw error;
      }
      return result;
    } catch (error) {
      console.error('WASM function call error:', error);
      throw error;
    }
  };
};

// Legacy compatibility functions that map to the new API
export function getGoExports(): Record<string, any> {
	return wasmState.exports;
}

export function hasGoFunction(name: string): boolean {
	return hasWasmFunction(name);
}

export function callGoFunction(name: string, ...args: any[]): any {
	return callWasmFunction(name, ...args);
}

export function getWasmState() {
	return wasmLoadingState;
}

export function getCalculator() {
	return wasmState.exports;
}

export function getWasmData() {
	return wasmState.exports;
}

export function resetWasmState() {
	// Note: Reset functionality would need to be implemented in the executor
	console.warn('resetWasmState not implemented in consolidated loader');
}
