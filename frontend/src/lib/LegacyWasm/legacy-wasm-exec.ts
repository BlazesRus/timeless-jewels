// Legacy WASM Executor for Svelte 4 compatibility
// This provides the same interface as the modern version but uses traditional reactive patterns

import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// Legacy reactive state using Svelte stores
export const wasmState = writable({
  isReady: false,
  isLoading: false,
  error: null as string | null,
  progress: 0,
  goInstance: null as any,
  exports: {} as Record<string, any>,
  debugLogs: [] as string[]
});

// Debug logging with store updates
function debugLog(message: string) {
  if (browser) {
    console.log(`🔧 WASM: ${message}`);
    wasmState.update(state => ({
      ...state,
      debugLogs: [...state.debugLogs.slice(-19), `${new Date().toISOString()}: ${message}`]
    }));
  }
}

// Legacy Go WASM Runtime class
export class LegacyGoWasmRuntime {
  private go: any = null;
  private wasmInstance: any = null;
  private exitPromise: Promise<any> | null = null;

  constructor() {
    debugLog('Initializing Legacy Go WASM Runtime');
    this.setupGoRuntime();
  }

  private setupGoRuntime() {
    if (!browser) {
      debugLog('Not in browser environment, skipping setup');
      return;
    }

    if (typeof globalThis.Go === 'undefined') {
      const errorMsg = 'Go WASM runtime not loaded. Make sure wasm_exec.js is included.';
      wasmState.update(state => ({ ...state, error: errorMsg }));
      debugLog('ERROR: Go WASM runtime not available');
      return;
    }

    try {
      this.go = new globalThis.Go();
      wasmState.update(state => ({ ...state, goInstance: this.go }));
      debugLog('Go runtime instance created successfully');
      this.setupGoEnvironment();
    } catch (error) {
      const errorMsg = `Failed to create Go runtime: ${error}`;
      wasmState.update(state => ({ ...state, error: errorMsg }));
      debugLog(`ERROR: ${errorMsg}`);
    }
  }

  private setupGoEnvironment() {
    if (!this.go) return;

    this.go.env = Object.assign(this.go.env || {}, {
      GOOS: 'js',
      GOARCH: 'wasm',
      GO_WASM_DEBUG: 'true'
    });

    this.go.argv = ['wasm'];
    debugLog('Go environment configured');
  }

  async loadWasm(wasmPath: string): Promise<boolean> {
    if (!browser || !this.go) {
      debugLog('Cannot load WASM: browser or Go runtime not available');
      return false;
    }

    try {
      wasmState.update(state => ({
        ...state,
        isLoading: true,
        progress: 10,
        error: null
      }));

      debugLog(`Starting WASM load from: ${wasmPath}`);

      // Fetch WASM file
      wasmState.update(state => ({ ...state, progress: 20 }));
      const response = await fetch(wasmPath);

      if (!response.ok) {
        throw new Error(`Failed to fetch WASM: ${response.status} ${response.statusText}`);
      }

      wasmState.update(state => ({ ...state, progress: 40 }));
      debugLog(`WASM fetch successful: ${response.status}`);

      // Get WASM bytes
      const wasmBytes = await response.arrayBuffer();
      wasmState.update(state => ({ ...state, progress: 60 }));
      debugLog(`WASM bytes loaded: ${wasmBytes.byteLength} bytes`);

      // Instantiate WASM
      wasmState.update(state => ({ ...state, progress: 70 }));
      const result = await WebAssembly.instantiate(wasmBytes, this.go.importObject);
      this.wasmInstance = result.instance;

      wasmState.update(state => ({ ...state, progress: 80 }));
      debugLog('WASM instantiated successfully');

      // Start Go program (non-blocking)
      this.startGoProgram();

      wasmState.update(state => ({ ...state, progress: 90 }));
      debugLog('Go program started');

      // Wait for exports to become available
      await this.waitForExports();

      wasmState.update(state => ({
        ...state,
        progress: 100,
        isReady: true,
        isLoading: false
      }));
      debugLog('WASM loading complete - exports available');

      return true;
    } catch (error) {
      const errorMsg = `WASM loading failed: ${error}`;
      wasmState.update(state => ({
        ...state,
        error: errorMsg,
        isLoading: false,
        progress: 0
      }));
      debugLog(`ERROR: ${errorMsg}`);
      return false;
    }
  }

  private startGoProgram() {
    if (!this.go || !this.wasmInstance) {
      debugLog('Cannot start Go program: missing Go runtime or WASM instance');
      return;
    }

    try {
      this.exitPromise = this.go.run(this.wasmInstance);

      if (this.exitPromise) {
        this.exitPromise
          .then(() => {
            debugLog('Go program exited');
            wasmState.update(state => ({ ...state, isReady: false }));
          })
          .catch(error => {
            debugLog(`Go program error: ${error}`);
            wasmState.update(state => ({
              ...state,
              error: `Go program error: ${error}`,
              isReady: false
            }));
          });
      }

      debugLog('Go program execution started');
    } catch (error) {
      debugLog(`Failed to start Go program: ${error}`);
      throw error;
    }
  }

  private async waitForExports(maxAttempts = 50, intervalMs = 100): Promise<void> {
    debugLog('Waiting for Go exports to become available...');

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const hasExports = this.checkForExports();

      if (hasExports) {
        debugLog(`Exports detected on attempt ${attempt}`);
        this.updateExports();
        return;
      }

      debugLog(`Attempt ${attempt}/${maxAttempts}: Exports not ready yet`);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    debugLog('WARNING: Exports not detected after maximum attempts');
    this.updateExports();
  }

  private checkForExports(): boolean {
    const checkLocations = [globalThis, globalThis.Module, globalThis.go, this.go, this.wasmInstance?.exports].filter(Boolean);

    for (const location of checkLocations) {
      const functionNames = ['calculateJewel', 'Calculate', 'getPassiveSkills', 'GetPassiveSkills', 'loadData', 'LoadData'];

      for (const name of functionNames) {
        if (typeof location[name] === 'function') {
          debugLog(`Found export function: ${name} in ${location.constructor?.name || 'unknown'}`);
          return true;
        }
      }
    }

    return false;
  }

  private updateExports() {
    const exports: Record<string, any> = {};

    if (typeof globalThis === 'object') {
      const functionNames = Object.getOwnPropertyNames(globalThis)
        .filter(name => typeof globalThis[name] === 'function')
        .filter(name => name.toLowerCase().includes('calculate') || name.toLowerCase().includes('jewel') || name.toLowerCase().includes('passive'));

      functionNames.forEach(name => {
        exports[name] = globalThis[name];
        debugLog(`Exported function: ${name}`);
      });
    }

    if (this.wasmInstance?.exports) {
      Object.keys(this.wasmInstance.exports).forEach(name => {
        if (typeof this.wasmInstance.exports[name] === 'function') {
          exports[name] = this.wasmInstance.exports[name];
          debugLog(`WASM export: ${name}`);
        }
      });
    }

    wasmState.update(state => ({ ...state, exports }));
    debugLog(`Total exports collected: ${Object.keys(exports).length}`);
  }

  // Public API methods
  getExports() {
    let currentExports = {};
    wasmState.subscribe(state => (currentExports = state.exports))();
    return currentExports;
  }

  hasFunction(name: string): boolean {
    const exports = this.getExports();
    return typeof exports[name] === 'function';
  }

  callFunction(name: string, ...args: any[]): any {
    if (!this.hasFunction(name)) {
      throw new Error(`Function ${name} not available`);
    }

    try {
      debugLog(`Calling function: ${name} with ${args.length} arguments`);
      const exports = this.getExports();
      const result = exports[name](...args);
      debugLog(`Function ${name} completed successfully`);
      return result;
    } catch (error) {
      const errorMsg = `Function ${name} failed: ${error}`;
      debugLog(`ERROR: ${errorMsg}`);
      throw new Error(errorMsg);
    }
  }

  destroy() {
    debugLog('Destroying WASM runtime');
    wasmState.update(state => ({
      ...state,
      isReady: false,
      isLoading: false,
      error: null,
      progress: 0,
      exports: {}
    }));

    if (this.exitPromise) {
      debugLog('Go program cleanup requested');
    }

    this.go = null;
    this.wasmInstance = null;
    this.exitPromise = null;
  }
}

// Global instance for the legacy WASM runtime
let legacyWasmRuntime: LegacyGoWasmRuntime | null = null;

export function getLegacyWasmRuntime(): LegacyGoWasmRuntime {
  if (!legacyWasmRuntime) {
    legacyWasmRuntime = new LegacyGoWasmRuntime();
  }
  return legacyWasmRuntime;
}

export async function loadLegacyWasm(wasmPath: string): Promise<boolean> {
  const runtime = getLegacyWasmRuntime();
  return await runtime.loadWasm(wasmPath);
}

// Export state for compatibility
export { wasmState as wasmStatus };
