<!-- Test page for cross-origin isolation and WASM debugging -->
<script lang="ts">
  import { onMount } from 'svelte';
  import crossOriginCheck, { getDetailedStatus } from '$lib/utils/cross-origin-check';

  let checkResults = {
    hasSharedArrayBuffer: false,
    isIsolated: false,
    isProperlyConfigured: false
  };

  let wasmTestResults = {
    wasmerSdkLoaded: false,
    wasmLoaded: false,
    wasiCreated: false,
    error: null as string | null
  };

  let pwaStatus = {
    serviceWorkerSupported: false,
    serviceWorkerRegistered: false,
    isOnline: true,
    wasmCached: false,
    error: null as string | null
  };

  onMount(async () => {
    // Run cross-origin check
    checkResults = getDetailedStatus();
    
    // Check PWA status
    pwaStatus.serviceWorkerSupported = 'serviceWorker' in navigator;
    pwaStatus.isOnline = navigator.onLine;

    if (pwaStatus.serviceWorkerSupported) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        pwaStatus.serviceWorkerRegistered = !!registration;
        
        // Check if WASM is cached
        if ('caches' in window) {
          const cache = await caches.open('wasm-cache');
          const cachedWasm = await cache.match('/calculator.wasm');
          pwaStatus.wasmCached = !!cachedWasm;
        }
      } catch (error) {
        pwaStatus.error = `PWA check failed: ${error}`;
      }
    }
    
    // Test WASM loading with enhanced loader
    try {
      console.log('🧪 Testing enhanced WASM loading...');
      
      // Test 1: Load enhanced WASI loader
      const { wasiLoader } = await import('../../lib/ModernWasm/enhanced-wasi-loader');
      wasmTestResults.wasmerSdkLoaded = true;
      console.log('✅ Enhanced WASI loader imported');

      // Test 2: Try loading WASM module
      try {
        const wasmExports = await wasiLoader.loadWasiModule();
        wasmTestResults.wasmLoaded = true;
        wasmTestResults.wasiCreated = true;
        console.log('✅ WASM module loaded successfully with enhanced loader');
        console.log('🔍 Available exports:', Object.keys(wasmExports));
      } catch (error) {
        console.warn('⚠️ Enhanced WASM loading failed:', error);
        wasmTestResults.error = `Enhanced WASM loading failed: ${error}`;
        wasmTestResults.wasmLoaded = false;
        wasmTestResults.wasiCreated = false;
      }

    } catch (error) {
      console.error('❌ WASM test failed:', error);
      wasmTestResults.error = `WASM test failed: ${error}`;
    }
  });
</script>

<svelte:head>
  <title>Cross-Origin Isolation & WASM Test</title>
</svelte:head>

<div class="container mx-auto p-8 max-w-4xl">
  <h1 class="text-3xl font-bold mb-6">Cross-Origin Isolation & WASM Test</h1>
  
  <div class="grid gap-6">
    <!-- Cross-Origin Isolation Status -->
    <div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
      <h2 class="text-xl font-semibold mb-4">Cross-Origin Isolation Status</h2>
      
      <div class="space-y-2">
        <div class="flex items-center space-x-2">
          <span class="w-4 h-4 rounded-full {checkResults.hasSharedArrayBuffer ? 'bg-green-500' : 'bg-red-500'}"></span>
          <span>SharedArrayBuffer Available: {checkResults.hasSharedArrayBuffer ? 'YES' : 'NO'}</span>
        </div>
        
        <div class="flex items-center space-x-2">
          <span class="w-4 h-4 rounded-full {checkResults.isIsolated ? 'bg-green-500' : 'bg-red-500'}"></span>
          <span>Cross-Origin Isolated: {checkResults.isIsolated ? 'YES' : 'NO'}</span>
        </div>
        
        <div class="flex items-center space-x-2">
          <span class="w-4 h-4 rounded-full {checkResults.isProperlyConfigured ? 'bg-green-500' : 'bg-red-500'}"></span>
          <span>Properly Configured: {checkResults.isProperlyConfigured ? 'YES' : 'NO'}</span>
        </div>
      </div>
      
      {#if !checkResults.isProperlyConfigured}
        <div class="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded text-sm">
          <strong>Fix needed:</strong> Add these headers to your Vite server configuration:
          <pre class="mt-2 text-xs">
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin</pre>
        </div>
      {/if}
    </div>

    <!-- PWA Status -->
    <div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
      <h2 class="text-xl font-semibold mb-4">PWA & Offline Status</h2>
      
      <div class="space-y-2">
        <div class="flex items-center space-x-2">
          <span class="w-4 h-4 rounded-full {pwaStatus.serviceWorkerSupported ? 'bg-green-500' : 'bg-red-500'}"></span>
          <span>Service Worker Support: {pwaStatus.serviceWorkerSupported ? 'YES' : 'NO'}</span>
        </div>
        
        <div class="flex items-center space-x-2">
          <span class="w-4 h-4 rounded-full {pwaStatus.serviceWorkerRegistered ? 'bg-green-500' : 'bg-yellow-500'}"></span>
          <span>Service Worker Registered: {pwaStatus.serviceWorkerRegistered ? 'YES' : 'NO'}</span>
        </div>
        
        <div class="flex items-center space-x-2">
          <span class="w-4 h-4 rounded-full {pwaStatus.isOnline ? 'bg-green-500' : 'bg-orange-500'}"></span>
          <span>Online Status: {pwaStatus.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
        
        <div class="flex items-center space-x-2">
          <span class="w-4 h-4 rounded-full {pwaStatus.wasmCached ? 'bg-green-500' : 'bg-yellow-500'}"></span>
          <span>WASM Cached: {pwaStatus.wasmCached ? 'YES' : 'NO'}</span>
        </div>
      </div>
      
      {#if pwaStatus.error}
        <div class="mt-4 p-4 bg-red-100 dark:bg-red-900 rounded text-sm">
          <strong>Error:</strong> {pwaStatus.error}
        </div>
      {/if}
    </div>

    <!-- WASM Test Results -->
    <div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
      <h2 class="text-xl font-semibold mb-4">WASM Loading Test</h2>
      
      <div class="space-y-2">
        <div class="flex items-center space-x-2">
          <span class="w-4 h-4 rounded-full {wasmTestResults.wasmerSdkLoaded ? 'bg-green-500' : 'bg-gray-400'}"></span>
          <span>Wasmer SDK Loaded: {wasmTestResults.wasmerSdkLoaded ? 'YES' : 'NO'}</span>
        </div>
        
        <div class="flex items-center space-x-2">
          <span class="w-4 h-4 rounded-full {wasmTestResults.wasmLoaded ? 'bg-green-500' : 'bg-gray-400'}"></span>
          <span>WASM Module Loaded: {wasmTestResults.wasmLoaded ? 'YES' : 'NO'}</span>
        </div>
        
        <div class="flex items-center space-x-2">
          <span class="w-4 h-4 rounded-full {wasmTestResults.wasiCreated ? 'bg-green-500' : 'bg-gray-400'}"></span>
          <span>WASI Instance Created: {wasmTestResults.wasiCreated ? 'YES' : 'NO'}</span>
        </div>
      </div>
      
      {#if wasmTestResults.error}
        <div class="mt-4 p-4 bg-red-100 dark:bg-red-900 rounded text-sm">
          <strong>Error:</strong> {wasmTestResults.error}
        </div>
      {/if}
    </div>

    <!-- Instructions -->
    <div class="bg-blue-100 dark:bg-blue-900 p-6 rounded-lg">
      <h2 class="text-xl font-semibold mb-4">Instructions</h2>
      <ol class="list-decimal list-inside space-y-2 text-sm">
        <li>If cross-origin isolation shows as "NO", restart your dev server after the Vite config changes</li>
        <li>Open browser DevTools and check the Network tab for the document request headers</li>
        <li>Look for "Cross-Origin-Embedder-Policy" and "Cross-Origin-Opener-Policy" headers</li>
        <li>If headers are missing, verify the Vite configuration was saved correctly</li>
        <li>Clear browser cache and hard refresh if needed</li>
        <li><strong>PWA:</strong> Service Worker should register automatically and cache WASM files</li>
        <li><strong>Offline:</strong> Once WASM is cached, the app should work offline</li>
        <li><strong>Testing:</strong> Use DevTools → Application → Service Workers to inspect cache</li>
      </ol>
    </div>

    <!-- Debug Console -->
    <div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
      <h2 class="text-xl font-semibold mb-4">Debug Console</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Open browser DevTools console to see detailed logging from the tests above.
        You can also run <code>crossOriginCheck</code> manually in the console.
      </p>
    </div>
  </div>
</div>

<style>
  pre {
    font-family: monospace;
    background: rgba(0, 0, 0, 0.1);
    padding: 0.5rem;
    border-radius: 0.25rem;
    overflow-x: auto;
  }
</style>
