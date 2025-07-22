/**
 * WASM Configuration
 * 
 * This project uses the WASI approach for modern, standards-based WASM loading.
 * The ModernWasm folder contains both WASI and legacy Go wasm_exec.js approaches
 * for reusability in other projects.
 */

// WASM file URL for WASI approach
export const WASM_URL = '/main.wasm';

/**
 * Get the WASM URL (WASI-based main.wasm)
 */
export function getWasmUrl(): string {
  return WASM_URL;
}

/**
 * Get the current WASM approach description
 */
export function getWasmApproach(): string {
  return 'WASI-based WASM module (modern standard)';
}
