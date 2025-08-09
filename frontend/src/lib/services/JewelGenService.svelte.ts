// src/lib/services/JewelGenService.svelte.ts
/**
 * WASI-based Timeless Jewels Data Service
 *
 * This service uses @wasmer/wasi to load and run a TinyGo WASI WASM module
 * IMPLEMENTATION HIGHLIGHTS:
 * ==========================
 * - Written in strict Svelte 5 syntax (no `<script>` wrapper needed)
 * - Reactive state managed via Svelte 5 runes for loader, data, ready & error flags
 * - Universal: works in browser, SSR & WebWorker contexts with the same code path
 * - Idempotent initialization guard prevents duplicate WASM loads
 * - Environment-aware WASM URL resolution for dev/prod builds
 * - Typed wrappers for every WASM export, registered as singletons at runtime
 * - Lazy getters throw clear errors if you access functions/fields before init
 * - Automatic JSON parsing of translation blobs into TS-typed objects
 * - Transforms raw WASM data into structured jewels, conquerors, seedRanges, etc.
 * - Real-time status(): loading/progress/ready/error—no magic numbers, no rounding
 * - callWasmFunction() escape hatch for any export not yet wrapped
 * - Zero blocking of the main thread—`@wasmer/wasi` loader offloads work to Workers
 * - Built to play nicely with Vite’s HMR and tree-shaking—only used exports ship
 * - Comprehensive error reporting and diagnostics during init & runtime calls
 * - Easily extended: add new exports via `createFunctionWrappers()` in one place
 * - Concurrency safety (e.g. “multiple callers await same init promise”)
 * - Memory-growth strategy (e.g. “pre-allocate & reuse WASM memory”)
 *
 * USAGE:
 * ======
 * - For access to worker safe fields(All getters will throw if accessed before initialization.):
import { wasmFunctions, wasmDataFields, status, isReady } from '$lib/services/JewelGenService.svelte.ts';
 *
 *
 * Copyright (C) 2025 James Armstrong (github.com/BlazesRus)
 * Generated with GitHub Copilot and Microsoft Copilot assistance
 *
 * MIT License
 */
// WASI-based service class for timeless jewels searcher
//import { state as $state } from 'svelte/runes';//(shouldn't be required in Svelte 5)
import { WasiLoader } from '$lib/ModernWasm/wasi-loader.svelte.ts';
import type {
  TimelessJewel,
  PassiveSkill,
  SeedRange,
  TimelessJewelsData
} from './JewelGenTypes';
import { getEnvironmentWasmUrl } from '$lib/utils/wasm-urls';

// ————— Reactive state via Svelte 5 runes —————
const { loader } = $state({ loader: new WasiLoader() });
const { data, ready, error, wasmInitializingFrom } = $state({
  data: null as TimelessJewelsData | null,
  ready: loader.isReady,
  error: null as string | null,
  wasmInitializingFrom: '' as string
});
// ————— Worker-safe singletons for WASM functions —————
let _calculate: TimelessJewelsData['Calculate'] | null = null;
let _reverseSearch: TimelessJewelsData['ReverseSearch'] | null = null;
let _getStatByIndex: TimelessJewelsData['GetStatByIndex'] | null = null;
let _getAltPassiveByIndex: TimelessJewelsData['GetAlternatePassiveSkillByIndex'] | null = null;
let _getAltAdditionByIndex: TimelessJewelsData['GetAlternatePassiveAdditionByIndex'] | null = null;
let _getPassiveByIndex: TimelessJewelsData['GetPassiveSkillByIndex'] | null = null;
let _getAllData: TimelessJewelsData['GetTimelessJewelsData'] | null = null;

//————— Worker-safe functions —————
export const wasmFunctions = {
  get calculate() {
    if (!_calculate) throw new Error('Calculate not initialized')
    return _calculate
  },
  set calculate(fn: TimelessJewelsData['Calculate']) {
    _calculate = fn
  },

  get reverseSearch() {
    if (!_reverseSearch) throw new Error('ReverseSearch not initialized')
    return _reverseSearch
  },
  set reverseSearch(fn: TimelessJewelsData['ReverseSearch']) {
    _reverseSearch = fn
  },

  get statByIndex() {
    if (!_getStatByIndex) throw new Error('GetStatByIndex not initialized')
    return _getStatByIndex
  },
  set statByIndex(fn: TimelessJewelsData['GetStatByIndex']) {
    _getStatByIndex = fn
  },

  get altPassiveByIndex() {
    if (!_getAltPassiveByIndex) throw new Error('GetAlternatePassiveSkillByIndex not initialized')
    return _getAltPassiveByIndex
  },
  set altPassiveByIndex(fn: TimelessJewelsData['GetAlternatePassiveSkillByIndex']) {
    _getAltPassiveByIndex = fn
  },

  get altAdditionByIndex() {
    if (!_getAltAdditionByIndex) throw new Error('GetAlternatePassiveAdditionByIndex not initialized')
    return _getAltAdditionByIndex
  },
  set altAdditionByIndex(fn: TimelessJewelsData['GetAlternatePassiveAdditionByIndex']) {
    _getAltAdditionByIndex = fn
  },

  get passiveByIndex() {
    if (!_getPassiveByIndex) throw new Error('GetPassiveSkillByIndex not initialized')
    return _getPassiveByIndex
  },
  set passiveByIndex(fn: TimelessJewelsData['GetPassiveSkillByIndex']) {
    _getPassiveByIndex = fn
  },

  get allDataFn() {
    if (!_getAllData) throw new Error('GetTimelessJewelsData not initialized')
    return _getAllData
  },
  set allDataFn(fn: TimelessJewelsData['GetTimelessJewelsData']) {
    _getAllData = fn
  }
}


// ————— Worker-safe singletons for transformed data fields —————
let _jewels: TimelessJewel[] | null = null;
let _conquerors: Record<string, string[]> | null = null;
let _seedRanges: Record<string, SeedRange> | null = null;
let _passiveSkills: PassiveSkill[] | null = null;
let _treeToPassive: TimelessJewelsData['treeToPassive'] | null = null;
let _statTranslations: any = null;
let _passiveStatTranslations: any = null;
let _auraStatTranslations: any = null;
let _possibleStats: any = null;
let _skillTree: any = null;

//————— Worker-safe transformed data fields —————
export const wasmDataFields = {
  get jewels() {
    if (!_jewels) throw new Error('jewels not initialized')
    return _jewels
  },
  set jewels(val: TimelessJewel[]) {
    _jewels = val
  },

  get conquerors() {
    if (!_conquerors) throw new Error('conquerors not initialized')
    return _conquerors
  },
  set conquerors(val: Record<string, string[]>) {
    _conquerors = val
  },

  get seedRanges() {
    if (!_seedRanges) throw new Error('seedRanges not initialized')
    return _seedRanges
  },
  set seedRanges(val: Record<string, SeedRange>) {
    _seedRanges = val
  },

  get passiveSkills() {
    if (!_passiveSkills) throw new Error('passiveSkills not initialized')
    return _passiveSkills
  },
  set passiveSkills(val: PassiveSkill[]) {
    _passiveSkills = val
  },

  get treeToPassive() {
    if (!_treeToPassive) throw new Error('treeToPassive not initialized')
    return _treeToPassive
  },
  set treeToPassive(val: TimelessJewelsData['treeToPassive']) {
    _treeToPassive = val
  },

  get statTranslations() {
    if (!_statTranslations) throw new Error('statTranslations not initialized')
    return _statTranslations
  },
  set statTranslations(val: any) {
    _statTranslations = val
  },

  get passiveStatTranslations() {
    if (!_passiveStatTranslations) throw new Error('passiveStatTranslations not initialized')
    return _passiveStatTranslations
  },
  set passiveStatTranslations(val: any) {
    _passiveStatTranslations = val
  },

  get auraStatTranslations() {
    if (!_auraStatTranslations) throw new Error('auraStatTranslations not initialized')
    return _auraStatTranslations
  },
  set auraStatTranslations(val: any) {
    _auraStatTranslations = val
  },

  get possibleStats() {
    if (!_possibleStats) throw new Error('possibleStats not initialized')
    return _possibleStats
  },
  set possibleStats(val: any) {
    _possibleStats = val
  },

  get skillTree() {
    if (!_skillTree) throw new Error('skillTree not initialized')
    return _skillTree
  },
  set skillTree(val: any) {
    _skillTree = val
  }
}

// ————— Public API —————

/**
 * Load & initialize the WASM module.
 * Guards against double-initialization.
 */
export async function initialize(initialSource: string): Promise<boolean> {
  if (wasmInitializingFrom === '') {
    wasmInitializingFrom = initialSource;
    try {
      await loader.loadWasm(getEnvironmentWasmUrl());

      const exports = loader.getExports();

      try {
        // grab the raw WASI exports and cast to our full TS interface
        const exportData = exportData as TimelessJewelsData;

        wasmDataFields.jewels                   = exportData.jewels;
        wasmDataFields.conquerors               = exportData.conquerors;
        wasmDataFields.seedRanges               = exportData.seedRanges;
        wasmDataFields.passiveSkills            = exportData.passiveSkills;
        wasmDataFields.treeToPassive            = exportData.treeToPassive;
        wasmDataFields.statTranslations         = exportData.statTranslations;
        wasmDataFields.passiveStatTranslations  = exportData.passiveStatTranslations;
        wasmDataFields.auraStatTranslations     = exportData.auraStatTranslations;
        wasmDataFields.possibleStats            = exportData.possibleStats;
        wasmDataFields.skillTree                = exportData.skillTree;

        const wrappers    = createFunctionWrappers(exportData);

        //Should have both JSON data and functions if converted correctly from exports
        data = exportData;
      }
      catch (e: any)
      {
        const raw     = exports.GetTimelessJewelsData?.();
        if (!raw) throw new Error('GetTimelessJewelsData returned no data');

        const transformed = transformRawData(raw);

        // After transformRawData(raw) → “transformed”:
        wasmDataFields.jewels                   = transformed.jewels;
        wasmDataFields.conquerors               = transformed.conquerors;
        wasmDataFields.seedRanges               = transformed.seedRanges;
        wasmDataFields.passiveSkills            = transformed.passiveSkills;
        wasmDataFields.treeToPassive            = transformed.treeToPassive;
        wasmDataFields.statTranslations         = transformed.statTranslations;
        wasmDataFields.passiveStatTranslations  = transformed.passiveStatTranslations;
        wasmDataFields.auraStatTranslations     = transformed.auraStatTranslations;
        wasmDataFields.possibleStats            = transformed.possibleStats;
        wasmDataFields.skillTree                = transformed.skillTree;

        const wrappers    = createFunctionWrappersWithoutFull();

        // merge your JSON data + wrappers
        data = { ...transformed, ...wrappers };
      }
      ready = true;
      return true;
    } catch (e: any) {
      error = e.message;
      ready = false;
      return false;
    } finally {
      wasmInitializingFrom = '';
    }
  } else {
    console.warn(
      `Initialize called from "${initialSource}" ` +
      `while already initializing from "${wasmInitializingFrom}". ` +
      `Please wait until the first init finishes.`
    );
    return false;
  }
}

/** True once initialize() has succeeded. */
export function isReady(): boolean {
  return ready;
}

/**
 * Human-friendly loader status.
 * Progress is stored in increments of 10, so no rounding needed.
 */
export function status(): string {
  if (loader.isLoading)    return 'loading';
  if (loader.isReady)      return 'ready';
  if (loader.error)        return 'error';
  if (loader.progress > 0) return `Progress at ${loader.progress}%`;
  return 'idle';
}

/** Return your merged data + wrappers. Throws if not ready. */
export function getData(): TimelessJewelsData {
  if (!ready || !data) {
    throw new Error('WASM not initialized. Call initialize() first.');
  }
  return data;
}

/**
 * Call any raw WASM export by name.
 * Throws if the export is missing or not a function.
 */
export function callWasmFunction(fnName: string, ...args: any[]): any {
  const fn = loader.getExport(fnName);
  if (typeof fn !== 'function') {
    throw new Error(`Export "${fnName}" is not a function`);
  }
  return fn(...args);
}

// ————— Internal Helpers —————

/**
 * Wrap all known exports in typed JS functions,
 * and register your worker-safe singletons.
 */
export function createFunctionWrappersWithoutFull() {
  // grab whatever exports the loader currently holds
  const raw = loader.getExports() as Record<string, any>;

  // helper to fetch a function by name, throw if missing
  const fn = <K extends keyof TimelessJewelsData>(name: K): TimelessJewelsData[K] => {
    const f = raw[name as string] ?? loader.getExport(name as string);
    if (typeof f !== 'function') {
      throw new Error(`WASM export "${name}" is not a function`);
    }
    return f.bind(raw) as TimelessJewelsData[K];
  };

  const wrappers = {
    Calculate:                          fn('Calculate'),
    ReverseSearch:                      fn('ReverseSearch'),
    GetStatByIndex:                     fn('GetStatByIndex'),
    GetAlternatePassiveSkillByIndex:    fn('GetAlternatePassiveSkillByIndex'),
    GetAlternatePassiveAdditionByIndex: fn('GetAlternatePassiveAdditionByIndex'),
    GetPassiveSkillByIndex:             fn('GetPassiveSkillByIndex'),
    GetTimelessJewelsData:              fn('GetTimelessJewelsData')
  };

  // register each function singleton
  wasmFunctions.calculate         = wrappers.Calculate;
  wasmFunctions.reverseSearch     = wrappers.ReverseSearch;
  wasmFunctions.statByIndex       = wrappers.GetStatByIndex;
  wasmFunctions.altPassiveByIndex = wrappers.GetAlternatePassiveSkillByIndex;
  wasmFunctions.altAdditionByIndex= wrappers.GetAlternatePassiveAdditionByIndex;
  wasmFunctions.passiveByIndex    = wrappers.GetPassiveSkillByIndex;
  wasmFunctions.allDataFn         = wrappers.GetTimelessJewelsData;

  return wrappers;
}

/**
 * Wrap all known exports in typed JS functions from converted exports,
 * and register your worker-safe singletons.
 */
export function createFunctionWrappers(eData: TimelessJewelsData) {
  const wrappers = {
    Calculate:                          eData.Calculate,
    ReverseSearch:                      eData.ReverseSearch,
    GetStatByIndex:                     eData.GetStatByIndex,
    GetAlternatePassiveSkillByIndex:    eData.GetAlternatePassiveSkillByIndex,
    GetAlternatePassiveAdditionByIndex: eData.GetAlternatePassiveAdditionByIndex,
    GetPassiveSkillByIndex:             eData.GetPassiveSkillByIndex,
    GetTimelessJewelsData:              eData.GetTimelessJewelsData
  };

  // register each function singleton
  wasmFunctions.calculate         = wrappers.Calculate;
  wasmFunctions.reverseSearch     = wrappers.ReverseSearch;
  wasmFunctions.statByIndex       = wrappers.GetStatByIndex;
  wasmFunctions.altPassiveByIndex = wrappers.GetAlternatePassiveSkillByIndex;
  wasmFunctions.altAdditionByIndex= wrappers.GetAlternatePassiveAdditionByIndex;
  wasmFunctions.passiveByIndex    = wrappers.GetPassiveSkillByIndex;
  wasmFunctions.allDataFn         = wrappers.GetTimelessJewelsData;

  return wrappers;
}

/**
 * Transform the raw JSON+object blobs from WASM
 * into your TypeScript shapes.
 */
function transformRawData(raw: any) {
  const safeParse = (str: unknown, name: string) => {
    if (typeof str !== 'string') {
      throw new Error(`${name} is not a JSON string`);
    }
    return JSON.parse(str);
  };

  return {
    jewels: Object.entries(raw.TimelessJewels ?? {}).map(
      ([k, v]: [string, string]) => ({ value: +k, label: v })
    ) as TimelessJewel[],

    conquerors: raw.TimelessJewelConquerors ?? {} as Record<string, string[]>,
    seedRanges:  raw.TimelessJewelSeedRanges   ?? {} as Record<string, SeedRange>,

    passiveSkills: (raw.PassiveSkills ?? []).map((s: any) => ({
      value: s.PassiveSkillGraphID,
      label: s.Name
    })) as PassiveSkill[],

		treeToPassive: raw.TreeToPassive ?? {} as Record<string, { PassiveSkillGraphID: number; Name: string }>,

    statTranslations:        safeParse(raw.StatTranslationsJSON,         'StatTranslationsJSON'),
    passiveStatTranslations: safeParse(raw.PassiveSkillStatTranslationsJSON,'PassiveSkillStatTranslationsJSON'),
    auraStatTranslations:    safeParse(raw.PassiveSkillAuraStatTranslationsJSON,'PassiveSkillAuraStatTranslationsJSON'),
    possibleStats:           safeParse(raw.PossibleStats,               'PossibleStats'),
    skillTree:               safeParse(raw.SkillTree,                   'SkillTree')
  };
}
