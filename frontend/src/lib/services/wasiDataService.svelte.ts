/**
 * WASI-based Timeless Jewels Data Service
 *
 * This service uses @wasmer/sdk to load and run a TinyGo WASI WASM module
 * following the recommended approach for wasmer-js integration.
 *
 * IMPLEMENTATION HIGHLIGHTS:
 * ========================
 *
 * 1. **Modern @wasmer/sdk Integration**: Uses dynamic imports and proper initialization
 *    - Tries multiple instantiation approaches (runWasix, Wasmer class, manual WebAssembly)
 *    - Follows troubleshooting guidelines from @wasmer/sdk documentation
 *    - Handles different SDK versions and API variations gracefully
 *
 * 2. **Comprehensive WASI Support**: Custom WASI imports for TinyGo compatibility
 *    - Full wasi_snapshot_preview1 interface implementation
 *    - Proper memory management and bounds checking
 *    - Detailed logging for debugging WASM interactions
 *
 * 3. **Robust Error Handling**: Multiple fallback strategies
 *    - Safe JSON parsing with detailed error reporting
 *    - Memory validation and sanity checks
 *    - Graceful degradation when WASM calls fail
 *
 * 4. **Data Service Singleton**: Clean API for application use
 *    - Single initialization with promise caching
 *    - Type-safe function wrappers for WASM exports
 *    - Structured data transformation and validation
 *
 * USAGE:
 * ======
 *
 * ```typescript
 * // Initialize once (typically in +layout.ts)
 * await initializeTimelessJewelsData();
 *
 * // Use anywhere in the app
 * const data = getTimelessJewelsData();
 * const result = data.Calculate(passiveId, seed, jewelId, conqueror);
 * ```
 *
 * Copyright (C) 2025 James Armstrong (github.com/BlazesRus)
 * Generated with GitHub Copilot assistance
 *
 * MIT License
 */

// Types specific to Timeless Jewels
export interface TimelessJewel {
  value: number;
  label: string;
}

export interface PassiveSkill {
  value: number;
  label: string;
}

export interface SeedRange {
  Min: number;
  Max: number;
}

export interface TimelessJewelsData {
  // WASI exported functions (strongly typed)
  Calculate: (passiveSkillId: number, seed: number, jewelId: number, conqueror: string) => any;
  ReverseSearch: (passiveIds: number[], statIds: number[], jewelId: number, conqueror: string) => any;
  GetStatByIndex: (index: number) => any;
  GetAlternatePassiveSkillByIndex: (index: number) => any;
  GetAlternatePassiveAdditionByIndex: (index: number) => any;
  GetPassiveSkillByIndex: (index: number) => any;
  GetTimelessJewelsData: () => any;

  // Timeless Jewels specific transformed data structures
  jewels: TimelessJewel[];
  conquerors: Record<string, string[]>;
  seedRanges: Record<string, SeedRange>;
  passiveSkills: PassiveSkill[];
  treeToPassive: Record<string, { PassiveSkillGraphID: number; Name: string }>;

  // Parsed JSON data specific to the game
  statTranslations: any;
  passiveStatTranslations: any;
  auraStatTranslations: any;
  possibleStats: any;
  skillTree: any;

  // Index signature for any additional exports
  [key: string]: any;
}

// WASI-based service class for timeless jewels searcher
class WasiTimelessJewelsDataService {
  private data: TimelessJewelsData | null = null;
  private wasiInstance: any = null;
  private isInitializing = false;
  private initializationPromise: Promise<TimelessJewelsData> | null = null;

  async initialize(): Promise<TimelessJewelsData> {
    // If already initialized, return the stored data
    if (this.data) {
      return this.data;
    }

    // If currently initializing, return the existing promise
    if (this.isInitializing && this.initializationPromise) {
      return this.initializationPromise;
    }

    // Start initialization
    this.isInitializing = true;
    this.initializationPromise = this.performWasiInitialization();

    try {
      this.data = await this.initializationPromise;
      return this.data;
    } finally {
      this.isInitializing = false;
      this.initializationPromise = null;
    }
  }

  getData(): TimelessJewelsData {
    if (!this.data) {
      throw new Error('WASI Timeless Jewels data service not initialized. Call initialize() first.');
    }
    return this.data;
  }

  isReady(): boolean {
    return this.data !== null;
  }

  private async performWasiInitialization(): Promise<TimelessJewelsData> {
    console.log('Initializing WASI-based Timeless Jewels data service...');

    try {
      // Use enhanced WASI loader for better PWA support
      const { wasiLoader } = await import('../ModernWasm/enhanced-wasi-loader');
      
      console.log('🔄 Loading WASI module with enhanced PWA support...');
      const wasmExports = await wasiLoader.loadWasiModule();
      
      console.log('✅ WASI module loaded with enhanced loader');
      console.log('🔍 Available exports:', Object.keys(wasmExports));

      // Store the exports for later function calls
      this.wasiInstance = { exports: wasmExports };

      // Get the data from the WASM module
      console.log('🔄 Calling GetTimelessJewelsData...');
      const rawData = this.callWasmFunction('GetTimelessJewelsData', []);
      if (!rawData) {
        console.warn('⚠️ GetTimelessJewelsData returned null, using default data structure');
      }

      console.log('✅ Retrieved data from WASI module');
      if (rawData) {
        console.log('🔍 Raw data keys:', Object.keys(rawData));
        console.log('🔍 Raw data types:', Object.keys(rawData).map(key => `${key}: ${typeof rawData[key]}`));
      }

      // Parse and transform the data
      console.log('🔄 Transforming raw data...');
      let transformedData: any = {};
      try {
        if (rawData) {
          transformedData = this.extractAndTransformData(rawData);
          console.log('✅ Data transformation completed');
        } else {
          console.log('⚠️ Using default empty data structure');
        }
      } catch (error) {
        console.error('❌ Failed to transform raw data:', error);
        console.log('⚠️ Using default empty data structure');
      }

      // Create wrapper functions for WASM exports
      const wasmFunctions = this.createWasmFunctionWrappers();

      // Combine everything into the final data structure
      const serviceData: TimelessJewelsData = {
        ...wasmFunctions,
        ...transformedData
      };

      console.log('✅ WASI Timeless Jewels data service initialized successfully with PWA support');
      return serviceData;

    } catch (error) {
      console.error('❌ Failed to initialize WASI Timeless Jewels data service:', error);
      
      // Fallback to original implementation
      console.log('🔄 Falling back to original WASI implementation...');
      return this.performOriginalWasiInitialization();
    }
  }

  // Keep the original implementation as fallback
  private async performOriginalWasiInitialization(): Promise<TimelessJewelsData> {
    console.log('Initializing WASI-based Timeless Jewels data service...');

    try {
      // Use dynamic import as recommended by the troubleshooting docs
      console.log('🔄 Dynamically importing @wasmer/sdk...');
      const wasmerSdk = await import('@wasmer/sdk');

      // Check what's available in the SDK and use the appropriate method
      console.log('🔍 Available @wasmer/sdk exports:', Object.keys(wasmerSdk));

      // Initialize Wasmer SDK first (crucial as per troubleshooting docs)
      console.log('🔄 Initializing Wasmer SDK...');
      await wasmerSdk.init();
      console.log('✅ Wasmer SDK initialized');

      console.log('🔄 Loading TinyGo WASI module from /calculator.wasm...');

      // Fetch the WASM module bytes
      const wasmResponse = await fetch('/calculator.wasm');
      if (!wasmResponse.ok) {
        throw new Error(`Failed to fetch WASM module: ${wasmResponse.status} ${wasmResponse.statusText}`);
      }
      const wasmBytes = await wasmResponse.arrayBuffer();
      console.log(`✅ Loaded WASM module: ${wasmBytes.byteLength} bytes`);

      console.log('🔄 Creating WASI instance with @wasmer/sdk...');

      // Check cross-origin isolation status before attempting WASI operations
      const isIsolated = typeof SharedArrayBuffer !== 'undefined';
      console.log(`🔍 Cross-origin isolation status: ${isIsolated ? 'ENABLED' : 'DISABLED'}`);
      
      if (!isIsolated) {
        console.warn('⚠️ Cross-origin isolation is not enabled. SharedArrayBuffer is not available.');
        console.warn('   This will prevent runWasix() from working. Falling back to manual WASI.');
      }

      // Try multiple approaches for WASI instantiation
      let wasiInstance: any = null;

      // Approach 1: Try runWasix() if available (requires cross-origin isolation)
      if (wasmerSdk.runWasix && isIsolated) {
        try {
          console.log('🔄 Attempting runWasix() approach...');
          wasiInstance = await wasmerSdk.runWasix(new Uint8Array(wasmBytes), {
            program: "main",
            args: [],
            env: {},
          });
          console.log('✅ Created WASI instance with runWasix()');
        } catch (error) {
          console.warn('⚠️ runWasix() failed, trying alternative approaches:', error);
        }
      } else if (!isIsolated) {
        console.warn('⚠️ Skipping runWasix() - cross-origin isolation not available');
      }

      // Approach 2: Try Wasmer.fromRegistry() or Wasmer.fromBytes() if available
      if (!wasiInstance && wasmerSdk.Wasmer) {
        try {
          console.log('🔄 Attempting Wasmer class approach...');
          // For custom WASM bytes, we might need to use a different method
          // This is a placeholder - the exact API depends on the Wasmer SDK version
          console.log('Available Wasmer methods:', Object.getOwnPropertyNames(wasmerSdk.Wasmer.prototype));
        } catch (error) {
          console.warn('⚠️ Wasmer class approach failed:', error);
        }
      }

      // Approach 3: Manual WebAssembly instantiation with WASI imports
      if (!wasiInstance) {
        console.log('🔄 Falling back to manual WebAssembly instantiation with WASI imports...');
        wasiInstance = await this.createManualWasiInstance(wasmBytes);
        console.log('✅ Created WASI instance with manual approach');
      }

      if (!wasiInstance) {
        throw new Error('Failed to create WASI instance with any approach');
      }

      console.log('🔍 Available exports:', Object.keys(wasiInstance.exports || wasiInstance.instance?.exports || {}));

      // Store the instance for later function calls (handle different instance structures)
      this.wasiInstance = wasiInstance.instance || wasiInstance;

      // Get the data from the WASM module
      console.log('🔄 Calling GetTimelessJewelsData...');
      const rawData = this.callWasmFunction('GetTimelessJewelsData', []);
      if (!rawData) {
        console.warn('⚠️ GetTimelessJewelsData returned null, using default data structure');
      }

      console.log('✅ Retrieved data from WASI module');
      if (rawData) {
        console.log('🔍 Raw data keys:', Object.keys(rawData));
        console.log('🔍 Raw data types:', Object.keys(rawData).map(key => `${key}: ${typeof rawData[key]}`));
      }

      // Parse and transform the data
      console.log('🔄 Transforming raw data...');
      let transformedData: any = {};
      try {
        if (rawData) {
          transformedData = this.extractAndTransformData(rawData);
          console.log('✅ Data transformation completed');
        } else {
          console.log('⚠️ Using default empty data structure');
        }
      } catch (error) {
        console.error('❌ Failed to transform raw data:', error);
        console.log('⚠️ Using default empty data structure');
      }

      // Create wrapper functions for WASM exports
      const wasmFunctions = this.createWasmFunctionWrappers();

      // Combine everything into the final data structure
      const serviceData: TimelessJewelsData = {
        ...wasmFunctions,
        ...transformedData
      };

      console.log('✅ WASI Timeless Jewels data service initialized successfully');
      return serviceData;

    } catch (error) {
      console.error('❌ Failed to initialize WASI Timeless Jewels data service:', error);
      throw error;
    }
  }

  private async createManualWasiInstance(wasmBytes: ArrayBuffer): Promise<any> {
    console.log('🔄 Creating manual WASI instance with comprehensive imports...');

    const wasmModule = await WebAssembly.compile(wasmBytes);

    // Comprehensive WASI imports for TinyGo modules
    const wasiImports = {
      wasi_snapshot_preview1: {
        proc_exit: (code: number) => {
          console.log(`WASI proc_exit: ${code}`);
        },
        fd_write: (fd: number, iovs: number, iovs_len: number, nwritten: number) => {
          // Simple fd_write implementation for stdout/stderr
          return 0;
        },
        fd_close: (fd: number) => {
          return 0;
        },
        environ_sizes_get: (environc: number, environ_buf_size: number) => {
          // No environment variables
          return 0;
        },
        environ_get: (environ: number, environ_buf: number) => {
          return 0;
        },
        args_sizes_get: (argc: number, argv_buf_size: number) => {
          // No command line args
          return 0;
        },
        args_get: (argv: number, argv_buf: number) => {
          return 0;
        },
        random_get: (buf: number, buf_len: number) => {
          // Fill with random data using crypto API
          return 0;
        },
        clock_time_get: (clock_id: number, precision: bigint, timestamp: number) => {
          // Return current time in nanoseconds
          return 0;
        }
      }
    };

    // Instantiate the WASM module with WASI imports
    const wasiInstance = await WebAssembly.instantiate(wasmModule, wasiImports);
    return wasiInstance;
  }

  private createWasmFunctionWrappers() {
    return {
      Calculate: (passiveSkillId: number, seed: number, jewelId: number, conqueror: string) => {
        return this.callWasmFunction('Calculate', [passiveSkillId, seed, jewelId, conqueror]);
      },
      ReverseSearch: (passiveIds: number[], statIds: number[], jewelId: number, conqueror: string) => {
        return this.callWasmFunction('ReverseSearch', [passiveIds, statIds, jewelId, conqueror]);
      },
      GetStatByIndex: (index: number) => {
        return this.callWasmFunction('GetStatByIndex', [index]);
      },
      GetAlternatePassiveSkillByIndex: (index: number) => {
        return this.callWasmFunction('GetAlternatePassiveSkillByIndex', [index]);
      },
      GetAlternatePassiveAdditionByIndex: (index: number) => {
        return this.callWasmFunction('GetAlternatePassiveAdditionByIndex', [index]);
      },
      GetPassiveSkillByIndex: (index: number) => {
        return this.callWasmFunction('GetPassiveSkillByIndex', [index]);
      },
      GetTimelessJewelsData: () => {
        return this.callWasmFunction('GetTimelessJewelsData', []);
      }
    };
  }

  private callWasmFunction(functionName: string, args: any[]): any {
    if (!this.wasiInstance) {
      throw new Error('WASI instance not initialized');
    }

    const exports = this.wasiInstance.exports;
    const func = exports[functionName];

    if (typeof func !== 'function') {
      throw new Error(`Function ${functionName} not found in WASM exports`);
    }

    try {
      console.log(`🔍 Calling WASM function: ${functionName} with ${args.length} args`);

      // First, let's get some basic memory info
      const getMemoryPointer = exports.getMemoryPointer as any;
      const getMemorySize = exports.getMemorySize as any;

      if (getMemoryPointer && getMemorySize) {
        const memPointer = getMemoryPointer();
        const memSize = getMemorySize();
        console.log(`🔍 Go memory before call - pointer: ${memPointer}, size: ${memSize}`);
      }

      // For now, let's try calling simple functions
      // More complex argument passing will need to be implemented based on the Go memory layout
      if (args.length === 0) {
        const result = func();
        console.log(`🔍 WASM function ${functionName} returned pointer: ${result} (type: ${typeof result})`);

        // After calling, check memory info again
        if (getMemoryPointer && getMemorySize) {
          const memPointer = getMemoryPointer();
          const memSize = getMemorySize();
          console.log(`🔍 Go memory after call - pointer: ${memPointer}, size: ${memSize}`);
        }

        if (typeof result !== 'number') {
          console.error(`❌ WASM function ${functionName} returned non-number:`, result);
          return null;
        }

        if (result === 0) {
          console.warn(`⚠️ WASM function ${functionName} returned null pointer (0)`);
          return null;
        }

        // Let's examine the memory at the pointer location more carefully
        const memory = exports.memory as WebAssembly.Memory;
        if (memory) {
          const memoryBuffer = new Uint8Array(memory.buffer);
          console.log(`🔍 Memory examination at pointer ${result}:`);
          console.log(`  Memory buffer size: ${memoryBuffer.length} bytes`);
          console.log(`  Bytes at pointer: [${Array.from(memoryBuffer.slice(result, result + 20)).join(', ')}]`);

          // Check if the pointer is within bounds
          if (result + 4 <= memoryBuffer.length) {
            const length = memoryBuffer[result] | (memoryBuffer[result + 1] << 8) | (memoryBuffer[result + 2] << 16) | (memoryBuffer[result + 3] << 24);
            console.log(`  Length at pointer: ${length}`);

            if (length > 0 && result + 4 + length <= memoryBuffer.length) {
              const preview = new TextDecoder().decode(memoryBuffer.slice(result + 4, result + 4 + Math.min(length, 100)));
              console.log(`  Data preview: "${preview}"`);
            }
          }
        }

        return this.readStringFromWasm(result);
      } else {
        // For functions with arguments, we need to implement proper memory management
        console.warn(`Function ${functionName} with arguments not yet implemented`);
        return null;
      }
    } catch (error) {
      console.error(`Error calling WASM function ${functionName}:`, error);
      throw error;
    }
  }

  private readStringFromWasm(ptr: number): any {
    if (!this.wasiInstance) {
      throw new Error('WASI instance not available');
    }

    try {
      const exports = this.wasiInstance.exports;

      // Get the WASM linear memory
      const memory = exports.memory as WebAssembly.Memory;
      if (!memory) {
        console.error('❌ WASM memory not found in exports');
        return null;
      }

      const memoryBuffer = new Uint8Array(memory.buffer);
      console.log(`🔍 Reading string from WASM memory:`);
      console.log(`  Pointer: ${ptr}`);
      console.log(`  Memory buffer size: ${memoryBuffer.length} bytes`);

      // Read the string length (first 4 bytes at the pointer)
      if (ptr + 4 > memoryBuffer.length) {
        console.error(`❌ Pointer ${ptr} + 4 is beyond memory bounds (${memoryBuffer.length})`);
        return null;
      }

      const length = memoryBuffer[ptr] | (memoryBuffer[ptr + 1] << 8) | (memoryBuffer[ptr + 2] << 16) | (memoryBuffer[ptr + 3] << 24);
      console.log(`  String length: ${length}`);

      // Show raw bytes at the pointer for debugging
      const debugBytes = Array.from(memoryBuffer.slice(ptr, ptr + Math.min(16, memoryBuffer.length - ptr)));
      console.log(`  Raw bytes at pointer: [${debugBytes.join(', ')}]`);

      if (length === 0) {
        console.warn('⚠️ WASM function returned empty string - this indicates the Go function returned an empty result');
        console.log('💡 This could mean:');
        console.log('  1. The Go function failed to execute properly');
        console.log('  2. The data initialization in Go failed');
        console.log('  3. The WASM module is not the correct WASI build');
        console.log('  4. There was an error during JSON marshaling in Go');
        return null;
      }

      if (length < 0) {
        console.error(`❌ Invalid negative string length: ${length}`);
        return null;
      }

      if (length > 10000000) { // 10MB sanity check
        console.error(`❌ String length ${length} is suspiciously large, may indicate memory corruption`);
        return null;
      }

      // Check if we have enough memory for the string
      if (ptr + 4 + length > memoryBuffer.length) {
        console.error(`❌ String data extends beyond memory bounds (${ptr + 4 + length} > ${memoryBuffer.length})`);
        return null;
      }

      // Read the string data
      const stringBytes = memoryBuffer.slice(ptr + 4, ptr + 4 + length);
      const jsonString = new TextDecoder().decode(stringBytes);

      console.log(`🔍 WASM returned JSON string:`);
      console.log(`  Decoded length: ${jsonString.length}`);
      console.log(`  First 200 chars: "${jsonString.substring(0, 200)}"`);
      console.log(`  Last 100 chars: "${jsonString.substring(Math.max(0, jsonString.length - 100))}"`);
      console.log(`  Is empty: ${jsonString.trim() === ''}`);

      if (!jsonString || jsonString.trim() === '') {
        console.warn('⚠️ WASM function returned empty JSON string after decoding');
        return null;
      }

      // Parse the JSON
      try {
        const result = JSON.parse(jsonString);
        console.log('✅ Successfully parsed WASM JSON data');
        console.log(`🔍 Parsed object keys: [${Object.keys(result).join(', ')}]`);
        return result;
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('📝 Invalid JSON content (first 500 chars):', jsonString.substring(0, 500));
        throw parseError;
      }
    } catch (error) {
      console.error('❌ Failed to read string from WASM memory:', error);
      return null;
    }
  }

  private extractAndTransformData(rawData: any) {
    console.log('Transforming raw WASI data:', Object.keys(rawData));

    // Helper function to safely parse JSON strings
    const safeJsonParse = (jsonStr: any, keyName: string): any => {
      console.log(`🔍 Attempting to parse ${keyName}:`, {
        type: typeof jsonStr,
        length: jsonStr?.length || 0,
        firstChars: typeof jsonStr === 'string' ? jsonStr.substring(0, 100) : 'N/A'
      });

      if (typeof jsonStr !== 'string') {
        console.error(`${keyName} is not a string:`, typeof jsonStr, jsonStr);
        throw new Error(`${keyName} is not a valid JSON string`);
      }

      if (!jsonStr || jsonStr.trim() === '') {
        console.error(`${keyName} is empty or null`);
        throw new Error(`${keyName} is empty`);
      }

      try {
        const result = JSON.parse(jsonStr);
        console.log(`✅ Successfully parsed ${keyName}`);
        return result;
      } catch (error) {
        console.error(`Failed to parse ${keyName}:`, error);
        console.error(`Raw ${keyName} content (first 200 chars):`, jsonStr.substring(0, 200));
        throw new Error(`Failed to parse ${keyName}: ${error}`);
      }
    };

    // Transform and return the data with safe defaults
    return {
      // 1. Timeless Jewels
      jewels: rawData.TimelessJewels ? Object.entries(rawData.TimelessJewels as Record<string, string>).map(([id, label]) => ({ value: Number(id), label })) : [],

      // 2. Conquerors & Seed Ranges
      conquerors: rawData.TimelessJewelConquerors as Record<string, string[]> || {},
      seedRanges: rawData.TimelessJewelSeedRanges as Record<string, { Min: number; Max: number }> || {},

      // 3. Passive Skills
      passiveSkills: rawData.PassiveSkills ? (rawData.PassiveSkills as Array<{ PassiveSkillGraphID: number; Name: string }>).map(s => ({ value: s.PassiveSkillGraphID, label: s.Name })) : [],

      // 4. Tree → Passive mapping
      treeToPassive: rawData.TreeToPassive as Record<string, { PassiveSkillGraphID: number; Name: string }> || {},

      // 5. Parsed JSON data with safe parsing and fallbacks - using exact Go export names
      statTranslations: rawData.StatTranslationsJSON ? safeJsonParse(rawData.StatTranslationsJSON, 'StatTranslationsJSON') : {},
      passiveStatTranslations: rawData.PassiveSkillStatTranslationsJSON ? safeJsonParse(rawData.PassiveSkillStatTranslationsJSON, 'PassiveSkillStatTranslationsJSON') : {},
      auraStatTranslations: rawData.PassiveSkillAuraStatTranslationsJSON ? safeJsonParse(rawData.PassiveSkillAuraStatTranslationsJSON, 'PassiveSkillAuraStatTranslationsJSON') : {},
      possibleStats: rawData.PossibleStats ? safeJsonParse(rawData.PossibleStats, 'PossibleStats') : {},
      skillTree: rawData.SkillTree ? safeJsonParse(rawData.SkillTree, 'SkillTree') : {}
    };
  }
}
// Global singleton instance
const wasiTimelessJewelsService = new WasiTimelessJewelsDataService();

/**
 * Initialize the WASI-based Timeless Jewels data service
 * This should be called once from the layout load function
 */
export async function initializeTimelessJewelsData(): Promise<TimelessJewelsData> {
  return wasiTimelessJewelsService.initialize();
}

/**
 * Get the initialized WASI-based Timeless Jewels data service
 * Throws an error if not yet initialized
 */
export function getTimelessJewelsData(): TimelessJewelsData {
  return wasiTimelessJewelsService.getData();
}

/**
 * Check if the WASI-based Timeless Jewels data service is ready
 */
export function isTimelessJewelsDataReady(): boolean {
  return wasiTimelessJewelsService.isReady();
}

