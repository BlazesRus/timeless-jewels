/* eslint-disable */
// TypeScript definitions for LegacyTypes.js
import { Writable } from 'svelte/store';

export interface LegacyCalculator {
  Calculate: (passiveIndex: number, seed: number, jewelId: number, conquerorId: number) => any;
  ReverseSearch: (config: any) => any;
}

export interface LegacyDataAPI {
  GetAlternatePassiveAdditionByIndex: (index: number) => any;
  GetAlternatePassiveSkillByIndex: (index: number) => any;
  GetPassiveSkillByIndex: (index: number) => any;
  GetStatByIndex: (index: number) => any;
  PassiveSkillAuraStatTranslationsJSON: () => string;
  PassiveSkillStatTranslationsJSON: () => string;
  PassiveSkills: any[];
  PossibleStats: any[];
  SkillTree: () => string;
  StatTranslationsJSON: () => string;
  TimelessJewelConquerors: any;
  TimelessJewelSeedRanges: any;
  TimelessJewels: () => string;
  TreeToPassive: Record<number, any>;
}

export const calculator: Writable<LegacyCalculator | null>;
export const data: Writable<LegacyDataAPI | null>;
export const initializeCrystalline: () => void;
