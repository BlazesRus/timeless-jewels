/* eslint-disable */
// @ts-nocheck
import { writable } from 'svelte/store';

// Use Svelte stores for reactivity in Svelte 4
export const calculator = writable(null);
export const data = writable(null);

export const initializeCrystalline = () => {
  // Access WASM exports through globalThis
  const wasmGlobal = /** @type {any} */ (globalThis);
  
  const calculatorValue = {
    Calculate: wasmGlobal["go"]["timeless-jewels"]["calculator"]["Calculate"],
    ReverseSearch: wasmGlobal["go"]["timeless-jewels"]["calculator"]["ReverseSearch"],
  };
  
  const dataValue = {
    GetAlternatePassiveAdditionByIndex: wasmGlobal["go"]["timeless-jewels"]["data"]["GetAlternatePassiveAdditionByIndex"],
    GetAlternatePassiveSkillByIndex: wasmGlobal["go"]["timeless-jewels"]["data"]["GetAlternatePassiveSkillByIndex"],
    GetPassiveSkillByIndex: wasmGlobal["go"]["timeless-jewels"]["data"]["GetPassiveSkillByIndex"],
    GetStatByIndex: wasmGlobal["go"]["timeless-jewels"]["data"]["GetStatByIndex"],
    PassiveSkillAuraStatTranslationsJSON: wasmGlobal["go"]["timeless-jewels"]["data"]["PassiveSkillAuraStatTranslationsJSON"],
    PassiveSkillStatTranslationsJSON: wasmGlobal["go"]["timeless-jewels"]["data"]["PassiveSkillStatTranslationsJSON"],
    PassiveSkills: wasmGlobal["go"]["timeless-jewels"]["data"]["PassiveSkills"],
    PossibleStats: wasmGlobal["go"]["timeless-jewels"]["data"]["PossibleStats"],
    SkillTree: wasmGlobal["go"]["timeless-jewels"]["data"]["SkillTree"],
    StatTranslationsJSON: wasmGlobal["go"]["timeless-jewels"]["data"]["StatTranslationsJSON"],
    TimelessJewelConquerors: wasmGlobal["go"]["timeless-jewels"]["data"]["TimelessJewelConquerors"],
    TimelessJewelSeedRanges: wasmGlobal["go"]["timeless-jewels"]["data"]["TimelessJewelSeedRanges"],
    TimelessJewels: wasmGlobal["go"]["timeless-jewels"]["data"]["TimelessJewels"],
    TreeToPassive: wasmGlobal["go"]["timeless-jewels"]["data"]["TreeToPassive"],
  };
  
  // Update the stores
  calculator.set(calculatorValue);
  data.set(dataValue);
  
  console.log('WASM calculator and data initialized and stores updated (Legacy/Svelte 4)');
};