/**
 * Modern WASM Loader with Svelte 5 Runes
 * Uses rune-based reactive state management for WASM loading and data
 */

// Import Go WASM runtime
import '../../wasm_exec.js';

// Reactive WASM loading state using Svelte 5 runes
export const wasmLoadingState = $state({
  isLoading: true,
  isReady: false,
  error: null as string | null,
  status: 'Initializing...' as string,
  progress: 0,
  data: null as any,
  calculator: null as any
});

// Global WASM promise to prevent duplicate loading
let wasmPromise: Promise<void> | null = null;

/**
 * Wrapper function to handle Go WASM errors with better error reporting
 */
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

/**
 * Modern WASM loader with reactive state management
 */
export async function loadModernWasm(): Promise<void> {
  // Return existing promise if already loading
  if (wasmPromise) {
    return wasmPromise;
  }

  // Return immediately if already loaded
  if (wasmLoadingState.isReady && wasmLoadingState.data && wasmLoadingState.calculator) {
    return;
  }

  wasmPromise = (async () => {
    try {
      wasmLoadingState.isLoading = true;
      wasmLoadingState.error = null;
      wasmLoadingState.status = 'Starting WASM loading...';
      wasmLoadingState.progress = 10;

      console.log('🚀 Starting modern WASM loading with runes...');
      
      // Check if Go is available
      if (typeof (globalThis as any).Go === 'undefined') {
        const errorMsg = 'Go object not found. wasm_exec.js may not have loaded properly.';
        console.error('❌', errorMsg);
        console.log('🔍 Available global objects:', Object.keys(globalThis).filter(k => k.includes('go') || k.includes('Go') || k.includes('wasm')));
        throw new Error(errorMsg);
      }
      
      wasmLoadingState.status = 'Creating Go instance...';
      wasmLoadingState.progress = 20;
      
      console.log('🔧 Creating Go instance...');
      const go = new (globalThis as any).Go();
      
      // Fetch WASM data
      wasmLoadingState.status = 'Fetching WASM module...';
      wasmLoadingState.progress = 30;
      
      // Use relative path from static directory (works in both dev and production)
      // Get the base path from current location
      const basePath = window.location.pathname.includes('/timeless-jewels') 
        ? '/timeless-jewels/calculator.wasm' 
        : '/calculator.wasm';

      let wasmUrl = new URL(basePath, window.location.origin).href;
      console.log('📡 Fetching WASM from:', wasmUrl);
      console.log('🌐 Current location:', window.location.href);
      console.log('🗂️ Base path detected:', basePath);
      
      let wasmResponse: Response | null = await fetch(wasmUrl)
      console.log('📡 WASM fetch response:', wasmResponse.status, wasmResponse.statusText);

      if (!wasmResponse.ok) {
        const errorMsg = `Failed to fetch WASM: ${wasmResponse.status} ${wasmResponse.statusText} from ${wasmUrl}`;
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }
      
      wasmLoadingState.status = 'Loading WASM data...';
      wasmLoadingState.progress = 50;
      
      const wasmArrayBuffer = await wasmResponse.arrayBuffer();
      console.log('📦 WASM data loaded, size:', wasmArrayBuffer.byteLength);
      
      // Instantiate and run WASM
      wasmLoadingState.status = 'Instantiating WASM...';
      wasmLoadingState.progress = 70;
      
      console.log('⚙️ Instantiating WASM...');
      const result = await WebAssembly.instantiate(wasmArrayBuffer, go.importObject);
      
      wasmLoadingState.status = 'Starting Go program...';
      wasmLoadingState.progress = 80;
      
      console.log('🏃 Starting Go program...');
      
      // Wait for the Go program to complete
      console.log('🏃 Waiting for Go program to complete...');
      wasmLoadingState.status = 'Running Go program...';
      wasmLoadingState.progress = 85;
      
      await go.run(result.instance);
      console.log('✅ Go program completed, checking for exports...');
      
      wasmLoadingState.status = 'Checking for Go exports...';
      wasmLoadingState.progress = 90;
      
      // Helper function to find exports in possible locations
      const findExports = () => {
        console.log('🔍 Scanning for Go exports...');
        
        // Debug: Log what's available in globalThis
        const allKeys = Object.keys(globalThis);
        const goRelated = allKeys.filter(k => 
          k.toLowerCase().includes('go') || 
          k.toLowerCase().includes('timeless') || 
          k.toLowerCase().includes('calculate') ||
          k.toLowerCase().includes('wasm')
        );
        console.log('🔍 Go-related keys:', goRelated);
        
        // Check specific locations
        if ((globalThis as any).go) {
          console.log('🔍 globalThis.go keys:', Object.keys((globalThis as any).go));
        }
        
        // Check multiple possible export locations
        const possibleLocations = [
          (globalThis as any)['go'],
          (globalThis as any)['Go'], 
          (window as any)['go'],
          (window as any)['Go'],
          globalThis
        ];
        
        for (const location of possibleLocations) {
          if (location && location['timeless-jewels']) {
            const timelessExports = location['timeless-jewels'];
            console.log('✅ Found timeless-jewels exports:', Object.keys(timelessExports));
            
            if (timelessExports.Calculate && timelessExports.data) {
              console.log('🎯 All required exports found!');
              return {
                calculator: {
                  Calculate: wrap(timelessExports.Calculate),
                  ReverseSearch: timelessExports.ReverseSearch ? wrap(timelessExports.ReverseSearch) : null
                },
                data: timelessExports.data
              };
            }
          }
        }
        
        return null;
      };
      
      // First attempt: Check immediately after Go program completes
      let exportedObjects = findExports();
      
      // If not found immediately, wait a bit and try again (Go might need a moment to set up exports)
      if (!exportedObjects) {
        console.log('⏳ Exports not ready immediately, waiting briefly...');
        wasmLoadingState.status = 'Waiting for exports to initialize...';
        
        // Wait a short time for Go to set up exports
        await new Promise(resolve => setTimeout(resolve, 500));
        exportedObjects = findExports();
        
        // Final fallback: One more brief wait
        if (!exportedObjects) {
          console.log('⏳ Still not ready, final attempt...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          exportedObjects = findExports();
        }
      }
      
      if (!exportedObjects) {
        const error = new Error('Go exports not found after program completion. The Go program may not have exported the required functions.');
        console.error('❌', error.message);
        throw error;
      }
      
      wasmLoadingState.status = 'Initializing data structures...';
      wasmLoadingState.progress = 95;
      
      console.log('📋 Initializing data structures...');
      
      // Update reactive state with loaded data
      wasmLoadingState.calculator = exportedObjects.calculator;
      wasmLoadingState.data = exportedObjects.data;
      wasmLoadingState.isReady = true;
      wasmLoadingState.isLoading = false;
      wasmLoadingState.status = 'WASM loaded successfully!';
      wasmLoadingState.progress = 100;
      
      console.log('🎉 Modern WASM loading completed successfully!');
      console.log('📊 Calculator functions:', Object.keys(exportedObjects.calculator));
      console.log('💾 Data properties:', Object.keys(exportedObjects.data));
      
    } catch (error: any) {
      console.error('❌ Modern WASM loading failed:', error);
      wasmLoadingState.error = error?.message || 'Unknown WASM error';
      wasmLoadingState.status = 'WASM loading failed';
      wasmLoadingState.isLoading = false;
      wasmLoadingState.isReady = false;
      throw error;
    }
  })();

  return wasmPromise;
}

/**
 * Get current WASM loading state (reactive)
 */
export function getWasmState() {
  return wasmLoadingState;
}

/**
 * Check if WASM is ready
 */
export function isWasmReady(): boolean {
  return wasmLoadingState.isReady && !wasmLoadingState.isLoading;
}

/**
 * Get calculator functions (reactive)
 */
export function getCalculator() {
  return wasmLoadingState.calculator;
}

/**
 * Get WASM data (reactive)
 */
export function getWasmData() {
  return wasmLoadingState.data;
}

/**
 * Reset WASM state (for debugging/testing)
 */
export function resetWasmState() {
  wasmLoadingState.isLoading = true;
  wasmLoadingState.isReady = false;
  wasmLoadingState.error = null;
  wasmLoadingState.status = 'Initializing...';
  wasmLoadingState.progress = 0;
  wasmLoadingState.data = null;
  wasmLoadingState.calculator = null;
  wasmPromise = null;
}
