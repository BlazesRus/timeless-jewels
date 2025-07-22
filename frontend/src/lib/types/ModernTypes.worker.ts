/**
 * Worker-compatible version of ModernTypes
 * This file provides the same functionality as ModernTypes.svelte.ts but without SvelteKit dependencies
 * for use in web workers.
 */

// Global state for the calculator and data (worker environment)
let calculatorInstance: any = null;
let dataInstance: any = null;

/**
 * Get the calculator instance (worker-safe)
 */
export function getCalculator() {
  return calculatorInstance;
}

/**
 * Get the data instance (worker-safe)
 */
export function getData() {
  return dataInstance;
}

/**
 * Set the calculator instance (worker-safe)
 */
export function setCalculator(calc: any) {
  calculatorInstance = calc;
}

/**
 * Set the data instance (worker-safe)
 */
export function setData(data: any) {
  dataInstance = data;
}

/**
 * Initialize crystalline (worker-safe)
 */
export function initializeCrystalline() {
  if (typeof (globalThis as any).initCrystalline === 'function') {
    (globalThis as any).initCrystalline();
  } else {
    console.warn('initCrystalline function not available in worker context');
  }
}

/**
 * Provide calculator access for workers
 */
export const calculator = {
  get: getCalculator,
  set: setCalculator
};

/**
 * Provide data access for workers  
 */
export const data = {
  get: getData,
  set: setData
};
