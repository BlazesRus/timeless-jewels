/**
 * Web Worker for WASM Computation
 * Offloads heavy WASM computations to prevent UI blocking
 *
 * Copyright (C) 2025 James Armstrong (github.com/BlazesRus)
 * Generated with GitHub Copilot assistance
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import { initGoWasm } from '../wasm/wasm-loader.svelte';

let wasmReady = false;

// Initialize WASM in the worker
self.onmessage = async function (e) {
  const { type, data } = e.data;

  try {
    switch (type) {
      case 'init':
        if (!wasmReady) {
          console.log('🔧 Initializing WASM in Web Worker...');
          await initGoWasm(data.wasmUrl);
          wasmReady = true;
          self.postMessage({ type: 'init', success: true });
        } else {
          self.postMessage({ type: 'init', success: true, message: 'Already initialized' });
        }
        break;

      case 'calculate':
        if (!wasmReady) {
          self.postMessage({
            type: 'calculate',
            success: false,
            error: 'WASM not initialized'
          });
          return;
        }

        const { passiveSkill, seed, jewel, conqueror } = data;

        if ((globalThis as any).Calculate) {
          const result = (globalThis as any).Calculate(passiveSkill, seed, jewel, conqueror);
          self.postMessage({
            type: 'calculate',
            success: true,
            result
          });
        } else {
          self.postMessage({
            type: 'calculate',
            success: false,
            error: 'Calculate function not available'
          });
        }
        break;

      case 'getData':
        if (!wasmReady) {
          self.postMessage({
            type: 'getData',
            success: false,
            error: 'WASM not initialized'
          });
          return;
        }

        const exports = {
          TimelessJewels: (globalThis as any).TimelessJewels,
          PassiveSkills: (globalThis as any).PassiveSkills,
          TimelessJewelConquerors: (globalThis as any).TimelessJewelConquerors
        };

        self.postMessage({
          type: 'getData',
          success: true,
          data: exports
        });
        break;

      default:
        self.postMessage({
          type: 'error',
          error: `Unknown message type: ${type}`
        });
    }
  } catch (error: any) {
    console.error('Worker error:', error);
    self.postMessage({
      type: type,
      success: false,
      error: error.message
    });
  }
};
