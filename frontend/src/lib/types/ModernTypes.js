/* eslint-disable */
// @ts-nocheck
import { writable } from 'svelte/store';

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

export const initializeCrystalline = () => {
  console.log('=== Starting initializeCrystalline ===');
  
  // Access WASM exports through globalThis
  const wasmGlobal = /** @type {any} */ (globalThis);
  
  console.log('Checking Go exports...');
  console.log('globalThis keys:', Object.keys(wasmGlobal).filter(k => k.includes('go') || k.includes('Go')));
  console.log('globalThis.go:', typeof wasmGlobal['go']);
  console.log('globalThis.go["timeless-jewels"]:', typeof wasmGlobal['go']?.['timeless-jewels']);
  
  if (wasmGlobal['go']) {
    console.log('Go object keys:', Object.keys(wasmGlobal['go']));
    if (wasmGlobal['go']['timeless-jewels']) {
      console.log('Timeless jewels keys:', Object.keys(wasmGlobal['go']['timeless-jewels']));
      console.log('calculator:', typeof wasmGlobal['go']['timeless-jewels']['calculator']);
      console.log('data:', typeof wasmGlobal['go']['timeless-jewels']['data']);
    }
  }
  
  if (!wasmGlobal['go'] || !wasmGlobal['go']['timeless-jewels']) {
    console.error('Go exports not found in globalThis');
    console.log('Available globalThis keys:', Object.keys(wasmGlobal).slice(0, 20));
    return;
  }
  
  const calculatorExports = wasmGlobal['go']['timeless-jewels']['calculator'];
  const dataExports = wasmGlobal['go']['timeless-jewels']['data'];
  
  if (!calculatorExports || !dataExports) {
    console.error('Calculator or data exports not found');
    console.log('Available calculator functions:', Object.keys(calculatorExports || {}));
    console.log('Available data functions:', Object.keys(dataExports || {}));
    return;
  }
  
  console.log('Creating wrapped functions...');
  const calculatorValue = {
    Calculate: wrap(calculatorExports.Calculate),
    ReverseSearch: wrap(calculatorExports.ReverseSearch),
  };
  
  const dataValue = {
    GetAlternatePassiveAdditionByIndex: wrap(dataExports.GetAlternatePassiveAdditionByIndex),
    GetAlternatePassiveSkillByIndex: wrap(dataExports.GetAlternatePassiveSkillByIndex),
    GetPassiveSkillByIndex: wrap(dataExports.GetPassiveSkillByIndex),
    GetStatByIndex: wrap(dataExports.GetStatByIndex),
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
  
  console.log('Calculator functions available:', Object.keys(calculatorValue).filter(k => typeof calculatorValue[k] === 'function'));
  console.log('Data properties available:', Object.keys(dataValue).filter(k => dataValue[k] !== undefined));
  
  // Update the stores
  console.log('Updating stores...');
  calculator.set(calculatorValue);
  data.set(dataValue);
  
  console.log('=== WASM calculator and data initialized and stores updated (Modern/Svelte 5) ===');
};