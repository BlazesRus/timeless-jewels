/* eslint-disable */
// @ts-nocheck
import { assets } from '$app/paths';

// Wrapper function to handle Go WASM errors
const wrap = fn => {
  return (...args) => {
    const result = fn.call(undefined, ...args);
    if (globalThis.goInternalError) {
      const error = new Error(globalThis.goInternalError);
      globalThis.goInternalError = undefined;
      throw error;
    }
    return result;
  };
};

let wasmPromise = null;
let wasmData = null;

export async function loadWasm() {
  // Return existing promise if already loading
  if (wasmPromise) {
    return wasmPromise;
  }

  // Return cached data if already loaded
  if (wasmData) {
    return wasmData;
  }

  wasmPromise = (async () => {
    try {
      console.log('Starting dynamic WASM loading...');

      // Check if Go is available
      if (typeof globalThis.Go === 'undefined') {
        throw new Error('Go object not found. wasm_exec.js may not have loaded properly.');
      }

      console.log('Creating Go instance...');
      const go = new globalThis.Go();

      // Fetch WASM data
      const wasmUrl = assets + '/calculator.wasm';
      console.log('Fetching WASM from:', wasmUrl);

      const wasmResponse = await fetch(wasmUrl);
      if (!wasmResponse.ok) {
        throw new Error(`Failed to fetch WASM: ${wasmResponse.status} ${wasmResponse.statusText}`);
      }

      const wasmArrayBuffer = await wasmResponse.arrayBuffer();
      console.log('WASM data loaded, size:', wasmArrayBuffer.byteLength);

      // Instantiate and run WASM
      console.log('Instantiating WASM...');
      const result = await WebAssembly.instantiate(wasmArrayBuffer, go.importObject);

      console.log('Running Go WASM...');
      const runPromise = go.run(result.instance); // Wait for Go exports to be available
      console.log('Waiting for Go exports...');
      const exportedObjects = await new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 100; // 20 seconds timeout
        const checkExports = () => {
          attempts++;

          // Only log every 5th attempt to reduce console spam
          if (attempts % 5 === 1 || attempts <= 3 || attempts >= maxAttempts - 3) {
            console.log(`Checking for Go exports (attempt ${attempts}/${maxAttempts})...`);
          }

          // Debug: Log what's available in globalThis (only on first attempt)
          if (attempts === 1) {
            console.log(
              'Available in globalThis:',
              Object.keys(globalThis).filter(k => k.includes('go') || k.includes('Go'))
            );
            if (globalThis.go) {
              console.log('globalThis.go keys:', Object.keys(globalThis.go));
            }
          }

          // Check different possible export locations
          let tjExports = null;

          // Try different export paths
          if (globalThis.go?.['timeless-jewels']) {
            tjExports = globalThis.go['timeless-jewels'];
            console.log('Found exports at globalThis.go["timeless-jewels"]');
          } else if (globalThis['timeless-jewels']) {
            tjExports = globalThis['timeless-jewels'];
            console.log('Found exports at globalThis["timeless-jewels"]');
          } else if (globalThis.timelessJewels) {
            tjExports = globalThis.timelessJewels;
            console.log('Found exports at globalThis.timelessJewels');
          }

          if (tjExports) {
            console.log('tjExports type:', typeof tjExports);
            console.log('tjExports is array:', Array.isArray(tjExports));
            console.log('tjExports constructor:', tjExports.constructor?.name);
            console.log('Available exports keys:', Object.keys(tjExports));

            // Try to extract calculator and data objects BEFORE checking functions
            let calculatorObj = null;
            let dataObj = null;

            // Method 1: Direct property access
            if (tjExports.calculator && typeof tjExports.calculator === 'object') {
              calculatorObj = tjExports.calculator;
              console.log('Found calculator via direct property access');
            }

            if (tjExports.data && typeof tjExports.data === 'object') {
              dataObj = tjExports.data;
              console.log('Found data via direct property access');
            }

            // Method 2: Check if it's a crystalline structure with nested exports
            if (!calculatorObj && tjExports.calculator && typeof tjExports.calculator === 'function') {
              // If calculator is a function, maybe it's the Calculate function directly
              calculatorObj = { Calculate: tjExports.calculator };
              console.log('Found calculator as direct function');
            }

            // Method 3: Check if functions are directly on tjExports
            if (!calculatorObj && typeof tjExports.Calculate === 'function') {
              calculatorObj = tjExports;
              console.log('Found calculator functions directly on tjExports');
            }

            // Method 4: Check if data is directly on tjExports
            if (!dataObj && tjExports.TimelessJewels) {
              dataObj = tjExports;
              console.log('Found data directly on tjExports');
            }

            console.log('Extracted calculatorObj:', calculatorObj);
            console.log('Extracted dataObj:', dataObj);

            if (calculatorObj) {
              console.log('Calculator object keys:', Object.keys(calculatorObj));
              console.log('Calculate function type:', typeof calculatorObj.Calculate);
            }

            if (dataObj) {
              console.log('Data object keys:', Object.keys(dataObj).slice(0, 10), '...');
            }

            // Check if we have what we need
            const hasCalculate = calculatorObj && typeof calculatorObj.Calculate === 'function';
            const hasData = dataObj && (dataObj.TimelessJewels || dataObj.PassiveSkills);

            console.log('Final validation:');
            console.log('- hasCalculate:', hasCalculate);
            console.log('- hasData:', hasData);

            if (hasCalculate && hasData) {
              console.log('Go exports are ready!');
              resolve({ calculator: calculatorObj, data: dataObj });
              return;
            } else {
              console.log('Still missing required exports - continuing to wait...');
              console.log('Missing Calculate function:', !hasCalculate);
              console.log('Missing data objects:', !hasData);
            }
          } else {
            // Log what we can see to help debug
            console.log('No exports found. Available globals:', Object.keys(globalThis).slice(0, 10));
          }

          if (attempts >= maxAttempts) {
            reject(new Error('Timeout waiting for Go WASM exports'));
            return;
          }

          setTimeout(checkExports, 200);
        };

        setTimeout(checkExports, 200);
      }); // Extract and wrap the exports - use the resolved objects from the promise
      const calculatorExports = exportedObjects.calculator;
      const dataExports = exportedObjects.data;

      console.log('Using resolved calculator exports:', calculatorExports);
      console.log('Using resolved data exports:', dataExports);

      if (!calculatorExports || !dataExports) {
        throw new Error('Missing calculator or data exports in timeless-jewels');
      }

      const calculatorData = {
        Calculate: wrap(calculatorExports.Calculate),
        ReverseSearch: wrap(calculatorExports.ReverseSearch)
      };

      const gameData = {
        GetAlternatePassiveAdditionByIndex: wrap(calculatorExports.GetAlternatePassiveAdditionByIndex || dataExports.GetAlternatePassiveAdditionByIndex),
        GetAlternatePassiveSkillByIndex: wrap(calculatorExports.GetAlternatePassiveSkillByIndex || dataExports.GetAlternatePassiveSkillByIndex),
        GetPassiveSkillByIndex: wrap(calculatorExports.GetPassiveSkillByIndex || dataExports.GetPassiveSkillByIndex),
        GetStatByIndex: wrap(calculatorExports.GetStatByIndex || dataExports.GetStatByIndex),
        PassiveSkillAuraStatTranslationsJSON: dataExports.PassiveSkillAuraStatTranslationsJSON,
        PassiveSkillStatTranslationsJSON: dataExports.PassiveSkillStatTranslationsJSON,
        PassiveSkills: dataExports.PassiveSkills,
        PossibleStats: dataExports.PossibleStats,
        SkillTree: dataExports.SkillTree,
        StatTranslationsJSON: dataExports.StatTranslationsJSON,
        TimelessJewelConquerors: dataExports.TimelessJewelConquerors,
        TimelessJewelSeedRanges: dataExports.TimelessJewelSeedRanges,
        TimelessJewels: dataExports.TimelessJewels,
        TreeToPassive: dataExports.TreeToPassive
      };

      wasmData = {
        calculator: calculatorData,
        data: gameData
      };

      console.log('WASM dynamic loading completed successfully!');
      return wasmData;
    } catch (error) {
      console.error('WASM dynamic loading failed:', error);
      wasmPromise = null; // Reset so it can be retried
      throw error;
    }
  })();

  return wasmPromise;
}
