/**
 * Timeless Jewels Data Service
 * 
 * This service handles the specific data structures and initialization
 * for the Timeless Jewels calculator project. It uses the generic
 * ModernWasm infrastructure but adds project-specific logic.
 */

import { getModernWasmExecutor } from '$lib/ModernWasm/wasm-exec.svelte';
import { getEnvironmentWasmUrl } from '$lib/utils/wasm-urls';

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
  // Functions from WASM
  Calculate: Function;
  ReverseSearch: Function;
  GetStatByIndex: Function;
  GetAlternatePassiveSkillByIndex: Function;
  GetAlternatePassiveAdditionByIndex: Function;
  GetPassiveSkillByIndex: Function;

  // Timeless Jewels specific data structures
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
}

// Global state to ensure single initialization
let timelessJewelsData: TimelessJewelsData | null = null;
let isInitializing = false;
let initializationPromise: Promise<TimelessJewelsData> | null = null;

/**
 * Initialize the Timeless Jewels data service
 * This should be called once from the layout load function
 */
export async function initializeTimelessJewelsData(): Promise<TimelessJewelsData> {
  // If already initialized, return the existing service
  if (timelessJewelsData) {
    return timelessJewelsData;
  }

  // If currently initializing, return the existing promise
  if (isInitializing && initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  isInitializing = true;
  initializationPromise = performTimelessJewelsInitialization();

  try {
    timelessJewelsData = await initializationPromise;
    return timelessJewelsData;
  } finally {
    isInitializing = false;
    initializationPromise = null;
  }
}

/**
 * Get the initialized Timeless Jewels data service
 * Throws an error if not yet initialized
 */
export function getTimelessJewelsData(): TimelessJewelsData {
  if (!timelessJewelsData) {
    throw new Error('Timeless Jewels data service not initialized. Call initializeTimelessJewelsData() first.');
  }
  return timelessJewelsData;
}

/**
 * Check if the Timeless Jewels data service is ready
 */
export function isTimelessJewelsDataReady(): boolean {
  return timelessJewelsData !== null;
}

/**
 * Internal initialization logic specific to Timeless Jewels
 */
async function performTimelessJewelsInitialization(): Promise<TimelessJewelsData> {
  console.log('Initializing Timeless Jewels data service...');

  // Get the generic WASM executor (should already be loaded by layout or other initialization)
  const executor = getModernWasmExecutor();

  // If WASM isn't loaded yet, load it now
  if (!executor.isReady()) {
    const wasmUrl = getEnvironmentWasmUrl();
    await executor.loadWasm(wasmUrl);
    
    if (!executor.isReady()) {
      throw new Error('WASM failed to initialize');
    }
  }

  // Get all exports including functions (these are generic WASM exports)
  const exports = executor.getExports();
  console.log('WASM exports available:', Object.keys(exports));

  // Extract Timeless Jewels specific functions from the generic exports
  const {
    Calculate,
    ReverseSearch,
    GetStatByIndex,
    GetAlternatePassiveSkillByIndex,
    GetAlternatePassiveAdditionByIndex,
    GetPassiveSkillByIndex
  } = exports;

  // Check if Timeless Jewels data is available on globalThis
  // This data should have been registered by the Go WASM during its initialization
  const raw = (globalThis as any).data as Record<string, any>;

  if (!raw) {
    console.error('No data found on globalThis.data');
    console.log('Available exports:', Object.keys(exports));
    throw new Error('Timeless Jewels WASM data not properly exposed to globalThis');
  }

  console.log('Available Timeless Jewels data keys:', Object.keys(raw));

  // Extract and transform Timeless Jewels specific data from globalThis
  const timelessJewelsData = extractTimelessJewelsData(raw);

  console.log('Timeless Jewels data service initialized successfully');

  return {
    // Generic WASM functions (could be used by other projects too)
    Calculate,
    ReverseSearch,
    GetStatByIndex,
    GetAlternatePassiveSkillByIndex,
    GetAlternatePassiveAdditionByIndex,
    GetPassiveSkillByIndex,

    // Timeless Jewels specific data structures
    ...timelessJewelsData
  };
}

/**
 * Extract and transform Timeless Jewels specific data from the raw globalThis data
 * This function contains all the Timeless Jewels specific data processing logic
 */
function extractTimelessJewelsData(raw: Record<string, any>) {
  // Check if required Timeless Jewels data exists
  const requiredKeys = ['TimelessJewels', 'TimelessJewelConquerors', 'PassiveSkills', 'StatTranslationsJSON'];
  for (const key of requiredKeys) {
    if (!(key in raw)) {
      console.error(`Missing required Timeless Jewels data key: ${key}`);
      throw new Error(`Missing required Timeless Jewels data: ${key}`);
    }
  }

  // Transform Timeless Jewels data structures
  const jewels = Object.entries(raw.TimelessJewels as Record<string, string>)
    .map(([id, label]) => ({ value: Number(id), label }));

  const conquerors = raw.TimelessJewelConquerors as Record<string, string[]>;
  const seedRanges = raw.TimelessJewelSeedRanges as Record<string, SeedRange>;

  const passiveSkills = (raw.PassiveSkills as Array<{ PassiveSkillGraphID: number; Name: string }>)
    .map(s => ({ value: s.PassiveSkillGraphID, label: s.Name }));

  const treeToPassive = raw.TreeToPassive as Record<string, { PassiveSkillGraphID: number; Name: string }>;

  // Parse Timeless Jewels specific JSON data with error handling
  const parsedJsonData = parseTimelessJewelsJsonData(raw);

  return {
    jewels,
    conquerors,
    seedRanges,
    passiveSkills,
    treeToPassive,
    ...parsedJsonData
  };
}

/**
 * Parse all JSON data specific to Timeless Jewels with proper error handling
 */
function parseTimelessJewelsJsonData(raw: Record<string, any>) {
  let statTranslations, passiveStatTranslations, auraStatTranslations, possibleStats, skillTree;

  try {
    statTranslations = JSON.parse(raw.StatTranslationsJSON as string);
  } catch (error) {
    console.error('Failed to parse StatTranslationsJSON:', error);
    throw new Error('Failed to parse stat translations data for Timeless Jewels');
  }

  try {
    passiveStatTranslations = JSON.parse(raw.PassiveSkillStatTranslationsJSON as string);
  } catch (error) {
    console.error('Failed to parse PassiveSkillStatTranslationsJSON:', error);
    throw new Error('Failed to parse passive skill stat translations data for Timeless Jewels');
  }

  try {
    auraStatTranslations = JSON.parse(raw.PassiveSkillAuraStatTranslationsJSON as string);
  } catch (error) {
    console.error('Failed to parse PassiveSkillAuraStatTranslationsJSON:', error);
    throw new Error('Failed to parse aura stat translations data for Timeless Jewels');
  }

  try {
    possibleStats = JSON.parse(raw.PossibleStatsJSON as string);
  } catch (error) {
    console.error('Failed to parse PossibleStatsJSON:', error);
    throw new Error('Failed to parse possible stats data for Timeless Jewels');
  }

  try {
    skillTree = JSON.parse(raw.SkillTreeJSON as string);
  } catch (error) {
    console.error('Failed to parse SkillTreeJSON:', error);
    throw new Error('Failed to parse skill tree data for Timeless Jewels');
  }

  return {
    statTranslations,
    passiveStatTranslations,
    auraStatTranslations,
    possibleStats,
    skillTree
  };
}
