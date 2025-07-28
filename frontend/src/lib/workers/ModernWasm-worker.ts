/**
 * Web Worker for Modern WASM Computation
 * Offloads heavy WASM computations to prevent UI blocking
 *
 * Copyright (C) 2025 James Armstrong (github.com/BlazesRus)
 * Generated with GitHub Copilot assistance
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { loadWasm } from '../ModernWasm/wasm-loader.svelte';
import { addDebugMessage, captureError } from '$lib/ModernWasm/wasmLogger.svelte';

let wasmReady = false;

// Initialize WASM in the worker
self.onmessage = async function (e) {
  const { type, data } = e.data;

  try {
    switch (type) {
      case 'init':
        if (!wasmReady) {
          addDebugMessage('🔧 Initializing WASM in Web Worker...');
          await loadWasm(data.wasmUrl);
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
