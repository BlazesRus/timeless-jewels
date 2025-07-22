/*
  Simple WASM Debug Script

  MIT License

  Copyright (c) 2025 James Armstrong (github.com/BlazesRus)

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
    
  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
    
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.

  .SYNOPSIS
   This script loads the current WASM file and checks what exports it has
   to verify it's the correct WASI build.
*/

async function debugWasmModule() {
  try {
    console.log('🔍 Loading WASM module for inspection...');

    // Fetch the WASM file
    const response = await fetch('/calculator.wasm');
    const wasmBuffer = await response.arrayBuffer();

    console.log(`📁 WASM file size: ${wasmBuffer.byteLength} bytes`);

    // Compile the module to get its exports
    const module = await WebAssembly.compile(wasmBuffer);

    // Get module imports and exports
    const imports = WebAssembly.Module.imports(module);
    const exports = WebAssembly.Module.exports(module);

    console.log('📋 WASM Module Analysis:');
    console.log('');

    console.log('📥 Imports:');
    imports.forEach(imp => {
      console.log(`  ${imp.module}.${imp.name} (${imp.kind})`);
    });

    console.log('');
    console.log('📤 Exports:');
    exports.forEach(exp => {
      console.log(`  ${exp.name} (${exp.kind})`);
    });

    // Check for specific exports we expect
    const expectedExports = [
      'GetTimelessJewelsData',
      'getMemoryPointer',
      'getMemorySize',
      'memory',
      '_start'
    ];

    console.log('');
    console.log('✅ Expected exports check:');
    expectedExports.forEach(name => {
      const found = exports.find(exp => exp.name === name);
      if (found) {
        console.log(`  ✅ ${name} (${found.kind})`);
      } else {
        console.log(`  ❌ ${name} - MISSING`);
      }
    });

    // Check if this looks like a WASI module or wasm_exec module
    const hasWasiImports = imports.some(imp =>
      imp.module === 'wasi_snapshot_preview1' ||
      imp.module === 'wasi_unstable'
    );

    const hasGoImports = imports.some(imp =>
      imp.module === 'go' ||
      imp.module === 'gojs'
    );

    console.log('');
    console.log('🔍 Module type analysis:');
    console.log(`  WASI imports: ${hasWasiImports ? '✅ Found' : '❌ Not found'}`);
    console.log(`  Go/wasm_exec imports: ${hasGoImports ? '⚠️ Found (legacy)' : '✅ Not found'}`);

    if (hasWasiImports && !hasGoImports) {
      console.log('  📝 Result: This appears to be a WASI module ✅');
    } else if (hasGoImports && !hasWasiImports) {
      console.log('  📝 Result: This appears to be a wasm_exec module ❌');
      console.log('  💡 Action: Need to rebuild with WASI target');
    } else {
      console.log('  📝 Result: Unknown or hybrid module type ⚠️');
    }

  } catch (error) {
    console.error('❌ Error debugging WASM module:', error);
  }
}

// Run the debug
debugWasmModule();
