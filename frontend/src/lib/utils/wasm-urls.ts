/**
 * WASM URL Configuration
 * Centralized URL management for WASM files across modern and legacy modes
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

import { base, assets } from '$app/paths';

/**
 * Get the properly formatted WASM URL for the calculator
 * Uses SvelteKit's asset path handling for proper base path support
 */
export function getCalculatorWasmUrl(): string {
  // Use assets path for static files, falls back to base path
  const assetPath = assets || base;
  return `${assetPath}/calculator.wasm`;
}

/**
 * Get WASM URL with explicit base path (for production builds)
 */
export function getCalculatorWasmUrlWithBase(basePath: string = ''): string {
  return `${basePath}/calculator.wasm`;
}

/**
 * Format URL for worker contexts where $app/paths might not be available
 */
export function getWorkerWasmUrl(baseUrl?: string): string {
  if (baseUrl) {
    return `${baseUrl}/calculator.wasm`;
  }

  // In worker context, try to detect from location
  if (typeof location !== 'undefined') {
    const { protocol, host, pathname } = location;
    const basePath = pathname.includes('/timeless-jewels') ? '/timeless-jewels' : '';
    return `${protocol}//${host}${basePath}/calculator.wasm`;
  }

  // Fallback
  return '/calculator.wasm';
}

/**
 * Development vs Production URL handling
 * Uses global __CALC_WASM_URL__ if available (set in layout module context)
 */
export function getEnvironmentWasmUrl(): string {
  // First, try to use the global URL set in layout module context
  if (typeof globalThis !== 'undefined' && (globalThis as any).__CALC_WASM_URL__) {
    return (globalThis as any).__CALC_WASM_URL__;
  }

  // Fallback to environment detection
  if (typeof window !== 'undefined') {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isDev ? '/calculator.wasm' : getCalculatorWasmUrl();
  }

  return getCalculatorWasmUrl();
}
