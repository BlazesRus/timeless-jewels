<script lang="ts">
  import '../app.scss';
  import '../wasm_exec.js';
  import { assets } from '$app/paths';
  import { browser } from '$app/environment';
  import { loadSkillTree } from '../lib/skill_tree';
  import { modernWorker } from '../lib/modern-worker';
  import { initializeCrystalline } from '../lib/types';

  let wasmLoading = true;
  let initializationError: string | null = null;

  // eslint-disable-next-line no-undef
  const go = new (globalThis as any).Go();

  if (browser) {
    const initializeApp = async () => {
      try {
        // Fetch WASM data
        const wasmResponse = await fetch(assets + '/calculator.wasm');
        const wasmData = await wasmResponse.arrayBuffer();
        
        // Initialize main thread WASM
        const result = await WebAssembly.instantiate(wasmData.slice(0), go.importObject);
        go.run(result.instance);
        
        // Initialize main thread data structures
        initializeCrystalline();
        loadSkillTree();
        
        // Initialize modern worker with WASM data
        if (modernWorker) {
          await modernWorker.boot(wasmData.slice(0)); // Clone for worker
          console.log('Modern worker initialized successfully');
        }
        
        wasmLoading = false;
      } catch (error) {
        console.error('Application initialization failed:', error);
        initializationError = error instanceof Error ? error.message : 'Unknown initialization error';
        wasmLoading = false;
      }
    };
    
    initializeApp();
  }
</script>

{#if wasmLoading}
  <div class="flex flex-row justify-center h-screen">
    <div class="flex flex-col">
      <div class="py-10 flex flex-col justify-between">
        <div>
          <h1 class="text-white mb-10 text-center">Timeless Calculator</h1>

          {#if initializationError}
            <div class="text-red-500 text-center">
              <h2>Initialization Error</h2>
              <p class="mt-2 text-sm">{initializationError}</p>
              <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" on:click={() => window.location.reload()}>Retry</button>
            </div>
          {:else}
            <h2 class="text-center">Loading...</h2>
          {/if}
        </div>
      </div>
    </div>
  </div>
{:else}
  <slot />
{/if}
