<!--
  Modern Error Page - Enhanced error display with debug logs
  Shows the last 20 debug messages and detailed error information
-->
<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { debugMessages, lastError, clearDebugMessages, clearLastError, wasmDebug } from '$lib/utils/debugLogger';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  // Get error details from page data or store - Svelte 5 runes
  const error = $derived($page?.error || $lastError);
  const status = $derived($page?.status || 500);

  // WASM memory inspection
  let wasmMemoryInfo = $state<any>(null);

  // Load WASM memory info when component mounts
  if (browser) {
    wasmMemoryInfo = wasmDebug.inspectMemory();
  }

  // Type guard to check if error has our custom properties
  function isCustomError(err: any): err is { message: string; context?: string; timestamp?: string; stack?: string } {
    return err && typeof err === 'object' && typeof err.message === 'string';
  }

  function getErrorTitle(status: number): string {
    switch (status) {
      case 404:
        return 'Page Not Found';
      case 500:
        return 'Internal Server Error';
      case 403:
        return 'Access Forbidden';
      default:
        return 'An Error Occurred';
    }
  }

  function getErrorDescription(status: number): string {
    switch (status) {
      case 404:
        return 'The page you are looking for does not exist.';
      case 500:
        return 'An unexpected error occurred while processing your request.';
      case 403:
        return 'You do not have permission to access this resource.';
      default:
        return 'Something went wrong. Please try again later.';
    }
  }

  function formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString();
  }

  function getLevelIcon(level: string): string {
    switch (level) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'debug':
        return '🔧';
      default:
        return 'ℹ️';
    }
  }

  function getLevelColor(level: string): string {
    switch (level) {
      case 'error':
        return 'text-red-400';
      case 'warn':
        return 'text-yellow-400';
      case 'debug':
        return 'text-blue-400';
      default:
        return 'text-gray-300';
    }
  }

  function handleRetry() {
    clearLastError();
    clearDebugMessages();
    goto(page.url.pathname);
  }

  function handleGoHome() {
    clearLastError();
    clearDebugMessages();
    goto(`${base}/`);
  }
</script>

<svelte:head>
  <title>Error - Timeless Jewel Calculator</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
  <div class="container mx-auto px-4 py-8">
    <!-- Error Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-red-500 mb-4">
        {getErrorTitle(status)}
      </h1>
      <p class="text-xl text-gray-300 mb-6">
        {getErrorDescription(status)}
      </p>

      <!-- Action Buttons -->
      <div class="flex justify-center space-x-4 mb-8">
        <button
          onclick={handleRetry}
          class="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
          🔄 Retry
        </button>
        <button
          onclick={handleGoHome}
          class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
          🏠 Go Home
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <!-- Error Details -->
      {#if error}
        <div class="bg-gray-800 rounded-lg p-6">
          <h2 class="text-2xl font-semibold text-red-400 mb-4">
            🚨 Error Details
          </h2>

          <div class="space-y-4">
            <div>
              <h3 class="font-semibold text-gray-300 mb-2">Message:</h3>
              <p class="text-red-300 bg-red-900/20 p-3 rounded border border-red-800">
                {error.message || 'Unknown error'}
              </p>
            </div>

            {#if isCustomError(error) && error.context}
              <div>
                <h3 class="font-semibold text-gray-300 mb-2">Context:</h3>
                <p class="text-yellow-300 bg-yellow-900/20 p-3 rounded border border-yellow-800">
                  {error.context}
                </p>
              </div>
            {/if}

            {#if isCustomError(error) && error.timestamp}
              <div>
                <h3 class="font-semibold text-gray-300 mb-2">Occurred at:</h3>
                <p class="text-gray-400">
                  {new Date(error.timestamp).toLocaleString()}
                </p>
              </div>
            {/if}

            {#if error && ((error as any).stack || (isCustomError(error) && error.stack))}
              <div>
                <h3 class="font-semibold text-gray-300 mb-2">Stack Trace:</h3>
                <pre class="text-xs text-gray-400 bg-gray-900 p-4 rounded overflow-auto max-h-64 border border-gray-700">{(error as any).stack || (isCustomError(error) ? error.stack : '')}</pre>
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Debug Messages -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-2xl font-semibold text-blue-400 mb-4">
          🔧 Debug Log (Last {$debugMessages.length} messages)
        </h2>

        {#if $debugMessages.length > 0}
          <div class="space-y-2 max-h-96 overflow-y-auto">
            {#each $debugMessages as msg}
              <div class="bg-gray-900 p-3 rounded border border-gray-700 text-sm">
                <div class="flex items-start justify-between mb-1">
                  <span class="font-mono text-xs text-gray-500">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                  <span class="{getLevelColor(msg.level)} font-semibold">
                    {getLevelIcon(msg.level)} {msg.level.toUpperCase()}
                  </span>
                </div>

                <p class="text-gray-300 mb-1">
                  {msg.message}
                </p>

                {#if msg.context}
                  <p class="text-xs text-gray-500">
                    Context: {msg.context}
                  </p>
                {/if}
              </div>
            {/each}
          </div>

          <div class="mt-4 text-center">
            <button
              onclick={() => clearDebugMessages()}
              class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors">
              🗑️ Clear Debug Log
            </button>
          </div>
        {:else}
          <p class="text-gray-500 text-center py-8">
            No debug messages captured yet.
          </p>
        {/if}
      </div>

      <!-- WASM Memory Inspection -->
      {#if wasmMemoryInfo}
        <div class="bg-gray-800 rounded-lg p-6">
          <h2 class="text-2xl font-semibold text-green-400 mb-4">
            🧠 WASM Memory State
          </h2>

          <div class="space-y-4 text-sm">
            {#if wasmMemoryInfo.memoryInfo && Object.keys(wasmMemoryInfo.memoryInfo).length > 0}
              <div>
                <h3 class="font-semibold text-gray-300 mb-2">Browser Memory:</h3>
                <div class="bg-gray-900 p-3 rounded border border-gray-700">
                  <p class="text-green-300">Used: {wasmMemoryInfo.memoryInfo.usedMB}MB</p>
                  <p class="text-blue-300">Total: {wasmMemoryInfo.memoryInfo.totalMB}MB</p>
                  <p class="text-yellow-300">Limit: {Math.round(wasmMemoryInfo.memoryInfo.jsHeapSizeLimit / 1024 / 1024)}MB</p>
                </div>
              </div>
            {/if}

            {#if wasmMemoryInfo.globalThis}
              <div>
                <h3 class="font-semibold text-gray-300 mb-2">WASM Globals:</h3>
                <div class="bg-gray-900 p-3 rounded border border-gray-700">
                  <p class="text-purple-300">Exports: {wasmMemoryInfo.globalThis.totalExports}</p>
                  <p class="text-cyan-300">Calculate: {wasmMemoryInfo.globalThis.hasCalculate ? '✅' : '❌'}</p>
                  <p class="text-cyan-300">TimelessJewels: {wasmMemoryInfo.globalThis.hasTimelessJewels ? '✅' : '❌'}</p>
                  <p class="text-cyan-300">PassiveSkills: {wasmMemoryInfo.globalThis.hasPassiveSkills ? '✅' : '❌'}</p>
                  {#if wasmMemoryInfo.globalThis.wasmExports && wasmMemoryInfo.globalThis.wasmExports.length > 0}
                    <details class="mt-2">
                      <summary class="cursor-pointer text-gray-400 hover:text-white">View Exports</summary>
                      <div class="mt-2 pl-4 text-xs text-gray-500">
                        {wasmMemoryInfo.globalThis.wasmExports.join(', ')}
                      </div>
                    </details>
                  {/if}
                </div>
              </div>
            {/if}

            {#if wasmMemoryInfo.wasmInstance}
              <div>
                <h3 class="font-semibold text-gray-300 mb-2">WASM Instance:</h3>
                <div class="bg-gray-900 p-3 rounded border border-gray-700">
                  <p class="text-orange-300">Exports: {wasmMemoryInfo.wasmInstance.exportCount}</p>
                  <p class="text-orange-300">Memory: {wasmMemoryInfo.wasmInstance.hasMemory ? '✅' : '❌'}</p>
                  <p class="text-orange-300">Pages: {wasmMemoryInfo.wasmInstance.memoryPages}</p>
                </div>
              </div>
            {/if}

            {#if wasmMemoryInfo.error}
              <div>
                <h3 class="font-semibold text-red-400 mb-2">Inspection Error:</h3>
                <p class="text-red-300 bg-red-900/20 p-3 rounded border border-red-800 text-xs">
                  {wasmMemoryInfo.error}
                </p>
              </div>
            {/if}

            <div class="text-center pt-4">
              <button
                onclick={() => { wasmMemoryInfo = wasmDebug.inspectMemory(); }}
                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                🔄 Refresh Memory State
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- System Information -->
    <div class="mt-8 bg-gray-800 rounded-lg p-6">
      <h2 class="text-xl font-semibold text-gray-300 mb-4">
        📊 System Information
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span class="text-gray-500">Status Code:</span>
          <span class="text-white ml-2">{status}</span>
        </div>
        <div>
          <span class="text-gray-500">URL:</span>
          <span class="text-white ml-2 break-all">{$page?.url?.pathname || 'Unknown'}</span>
        </div>
        <div>
          <span class="text-gray-500">User Agent:</span>
          <span class="text-white ml-2 break-all">{browser ? navigator.userAgent : 'Server'}</span>
        </div>
        <div>
          <span class="text-gray-500">Timestamp:</span>
          <span class="text-white ml-2">{new Date().toLocaleString()}</span>
        </div>
        <div>
          <span class="text-gray-500">Browser:</span>
          <span class="text-white ml-2">{browser ? 'Yes' : 'No'}</span>
        </div>
        <div>
          <span class="text-gray-500">Route:</span>
          <span class="text-white ml-2">Modern</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-8 text-center text-gray-500 text-sm">
      <p>If this problem persists, please check the browser console for additional details.</p>
    </div>
  </div>
</div>
