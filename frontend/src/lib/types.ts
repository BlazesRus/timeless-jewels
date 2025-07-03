/**
 * Legacy Types Export - Svelte 4 Compatibility
 *
 * Provides legacy data and calculator exports for backward compatibility
 *
 * Copyright (C) 2025 James Armstrong (github.com/BlazesRus)
 * Based on original work by the Timeless Jewel Calculator authors
 * Generated with GitHub Copilot assistance
 */

// For legacy compatibility, export data and calculator from globalThis where WASM puts them
export const data = new Proxy(
  {},
  {
    get(target, prop) {
      // Access data from globalThis where Go WASM exports it
      const globalData = globalThis as any;

      switch (prop) {
        case 'TimelessJewels':
          return globalData.TimelessJewels || {};
        case 'TimelessJewelConquerors':
          return globalData.TimelessJewelConquerors || {};
        case 'PassiveSkills':
          return globalData.PassiveSkills || [];
        default:
          return globalData[prop];
      }
    }
  }
);

export const calculator = new Proxy(
  {},
  {
    get(target, prop) {
      // Access calculator from globalThis where Go WASM exports it
      const globalCalc = globalThis as any;

      switch (prop) {
        case 'Calculate':
          return globalCalc.Calculate;
        default:
          return globalCalc[prop];
      }
    }
  }
);

// Legacy exports for backward compatibility
export { data as default };
