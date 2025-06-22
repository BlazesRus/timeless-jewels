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
  
  if(!wasmGlobal['go']['timeless-jewels'])
    console.error('timeless-jewels data not found');
  const timelessExports = wasmGlobal['go']['timeless-jewels'];
  const dataExports = timelessExports.data;

  if (wasmGlobal['go']) {
    console.log('Go object keys:', Object.keys(wasmGlobal['go']));
      const timelessExports = wasmGlobal['go']['timeless-jewels'];
      console.log('Timeless jewels keys:', Object.keys(timelessExports));
      console.log('Calculate function type:', typeof timelessExports.Calculate);
      console.log('ReverseSearch function type:', typeof timelessExports.ReverseSearch);
      console.log('data object type:', typeof timelessExports.data);
      if (timelessExports.data) {
        console.log('data keys:', Object.keys(timelessExports.data));
      }
  }
  
  if (!wasmGlobal['go'] || !wasmGlobal['go']['timeless-jewels']) {
    console.error('Go exports not found in globalThis');
    console.log('Available globalThis keys:', Object.keys(wasmGlobal).slice(0, 20));
    return;
  }
  
  if (!timelessExports.Calculate || !timelessExports.ReverseSearch || !dataExports) {
    console.error('Required functions or data not found');
    console.log('Calculate available:', typeof timelessExports.Calculate === 'function');
    console.log('ReverseSearch available:', typeof timelessExports.ReverseSearch === 'function');
    console.log('Data available:', !!dataExports);
    return;
  }
  
  console.log('Creating wrapped functions...');
  const calculatorValue = {
    Calculate: wrap(timelessExports.Calculate),
    ReverseSearch: wrap(timelessExports.ReverseSearch),
  };
  
  const dataValue = {
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
  
  console.log('Calculator functions available:', Object.keys(calculatorValue).filter(k => typeof calculatorValue[k] === 'function'));
  console.log('Data properties available:', Object.keys(dataValue).filter(k => dataValue[k] !== undefined));
  
  // Update the stores
  console.log('Updating stores...');
  calculator.set(calculatorValue);
  data.set(dataValue);
  
  console.log('=== WASM calculator and data initialized and stores updated (Modern/Svelte 5) ===');
};// Original generated code for reference:
/*
/* eslint-disable */
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

export let calculator;
export let data;

export const initializeCrystalline = () => {
  calculator = {
    Calculate: wrap(globalThis['go']['timeless-jewels']['calculator']['Calculate']),
    ReverseSearch: wrap(globalThis['go']['timeless-jewels']['calculator']['ReverseSearch'])
  };
  data = {
    GetAlternatePassiveAdditionByIndex: wrap(globalThis['go']['timeless-jewels']['data']['GetAlternatePassiveAdditionByIndex']),
    GetAlternatePassiveSkillByIndex: wrap(globalThis['go']['timeless-jewels']['data']['GetAlternatePassiveSkillByIndex']),
    GetPassiveSkillByIndex: wrap(globalThis['go']['timeless-jewels']['data']['GetPassiveSkillByIndex']),
    GetStatByIndex: wrap(globalThis['go']['timeless-jewels']['data']['GetStatByIndex']),
    PassiveSkillAuraStatTranslationsJSON: globalThis['go']['timeless-jewels']['data']['PassiveSkillAuraStatTranslationsJSON'],
    PassiveSkillStatTranslationsJSON: globalThis['go']['timeless-jewels']['data']['PassiveSkillStatTranslationsJSON'],
    PassiveSkills: globalThis['go']['timeless-jewels']['data']['PassiveSkills'],
    PossibleStats: globalThis['go']['timeless-jewels']['data']['PossibleStats'],
    SkillTree: globalThis['go']['timeless-jewels']['data']['SkillTree'],
    StatTranslationsJSON: globalThis['go']['timeless-jewels']['data']['StatTranslationsJSON'],
    TimelessJewelConquerors: globalThis['go']['timeless-jewels']['data']['TimelessJewelConquerors'],
    TimelessJewelSeedRanges: globalThis['go']['timeless-jewels']['data']['TimelessJewelSeedRanges'],
    TimelessJewels: globalThis['go']['timeless-jewels']['data']['TimelessJewels'],
    TreeToPassive: globalThis['go']['timeless-jewels']['data']['TreeToPassive']
  };
};
*/