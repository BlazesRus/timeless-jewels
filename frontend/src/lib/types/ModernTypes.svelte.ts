/* eslint-disable */
// @ts-nocheck
import { writable } from 'svelte/store';
import { getWasmState, getCalculator, getWasmData } from '$lib/wasm/modern-wasm-loader.svelte';

// Wrapper function to handle Go WASM errors
const wrap = (fn) => {
  return (...args) => {
    const result = fn.call(undefined, ...args);
    if (globalThis.goInternalError) {
      const error = new Error(globalThis.goInternalError);
      globalThis.goInternalError = undefined;
      throw error;
    }
    return result;
  }
};

// Use Svelte stores for reactivity in Svelte 5 (for cross-component compatibility)
export const calculator = writable(null);
export const data = writable(null);

// Get the reactive WASM state from the modern loader
const wasmState = getWasmState();

// Reactive state using runes for Svelte 5
let calculatorRune = $state(null);
let dataRune = $state(null);

// Modern rune-based state exports for Svelte 5
export const calculatorState = {
  get current() {
    return wasmState.calculator;
  },
  set current(value) {
    wasmState.calculator = value;
    calculatorRune = value;
    calculator.set(value);
  }
};

export const dataState = {
  get current() {
    return wasmState.data;
  },
  set current(value) {
    wasmState.data = value;
    dataRune = value;
    data.set(value);
  }
};

// Rune-based reactive utilities that use the modern WASM loader
export function useCalculator() {
  return {
    get current() {
      return calculatorRune;
    }
  };
}

export function useData() {
  return {
    get current() {
      return dataRune;
    }
  };
}

// Modern initialization function with improved logging and error checking
export const initializeCrystalline = () => {
  console.log('=== Starting Modern initializeCrystalline (Svelte 5) ===');
  
  // Access WASM exports through globalThis
  const wasmGlobal = /** @type {any} */ (globalThis);
  
  console.log('Checking Go exports...');
  console.log('globalThis keys:', Object.keys(wasmGlobal).filter(k => k.includes('go') || k.includes('Go')));
  console.log('globalThis.go:', typeof wasmGlobal['go']);
  console.log('globalThis.go["timeless-jewels"]:', typeof wasmGlobal['go']?.['timeless-jewels']);
  
  if (!wasmGlobal['go'] || !wasmGlobal['go']['timeless-jewels']) {
    console.error('Go exports not found in globalThis');
    console.log('Available globalThis keys:', Object.keys(wasmGlobal).slice(0, 20));
    
    // Check if WASM loader has the data ready
    if (wasmState.isReady && wasmState.calculator && wasmState.data) {
      console.log('✅ WASM already loaded via modern loader, syncing state...');
      calculatorRune = wasmState.calculator;
      dataRune = wasmState.data;
      calculator.set(wasmState.calculator);
      data.set(wasmState.data);
      return;
    }
    
    console.log('⏳ WASM not ready yet, state will sync automatically when loaded');
    return;
  }
  
  const timelessExports = wasmGlobal['go']['timeless-jewels'];
  const dataExports = timelessExports.data;

  if (wasmGlobal['go']) {
    console.log('Go object keys:', Object.keys(wasmGlobal['go']));
    console.log('Timeless jewels keys:', Object.keys(timelessExports));
    console.log('Calculate function type:', typeof timelessExports.Calculate);
    console.log('ReverseSearch function type:', typeof timelessExports.ReverseSearch);
    console.log('data object type:', typeof timelessExports.data);
    if (timelessExports.data) {
      console.log('data keys:', Object.keys(timelessExports.data));
    }
  }
  
  if (!timelessExports.Calculate || !timelessExports.ReverseSearch || !dataExports) {
    console.error('Required functions or data not found');
    console.log('Calculate available:', typeof timelessExports.Calculate === 'function');
    console.log('ReverseSearch available:', typeof timelessExports.ReverseSearch === 'function');
    console.log('Data available:', !!dataExports);
    return;
  }
  
  console.log('Creating wrapped functions...');
  const calculatorFunctions = {
    Calculate: wrap(timelessExports.Calculate),
    ReverseSearch: wrap(timelessExports.ReverseSearch),
  };
  
  const dataFunctions = {
    GetAlternatePassiveAdditionByIndex: wrap(timelessExports.GetAlternatePassiveAdditionByIndex),
    GetAlternatePassiveSkillByIndex: wrap(timelessExports.GetAlternatePassiveSkillByIndex),
    GetPassiveSkillByIndex: wrap(timelessExports.GetPassiveSkillByIndex),
    GetStatByIndex: wrap(timelessExports.GetStatByIndex),
    PassiveSkillAuraStatTranslationsJSON: dataExports.PassiveSkillAuraStatTranslationsJSON,
    PassiveSkillStatTranslationsJSON: dataExports.PassiveSkillStatTranslationsJSON,
    PassiveSkills: dataExports.PassiveSkills,
    PossibleStats: dataExports.PossibleStats,
    SkillTree: dataExports.SkillTree,
    StatTranslationsJSON: dataExports.StatTranslationsJSON,
    TimelessJewelConquerors: dataExports.TimelessJewelConquerors,
    TimelessJewelSeedRanges: dataExports.TimelessJewelSeedRanges,
    TimelessJewels: dataExports.TimelessJewels,
    TreeToPassive: dataExports.TreeToPassive,
  };
  
  console.log('Calculator functions available:', Object.keys(calculatorFunctions).filter(k => typeof calculatorFunctions[k] === 'function'));
  console.log('Data properties available:', Object.keys(dataFunctions).filter(k => dataFunctions[k] !== undefined));
  
  // Update rune state (Svelte 5)
  calculatorRune = calculatorFunctions;
  dataRune = dataFunctions;
  
  // Update the WASM state for consistency
  wasmState.calculator = calculatorFunctions;
  wasmState.data = dataFunctions;
  
  // Update the stores for backward compatibility
  calculator.set(calculatorFunctions);
  data.set(dataFunctions);
  
  console.log('=== WASM calculator and data initialized with runes and stores (Modern/Svelte 5) ===');
};