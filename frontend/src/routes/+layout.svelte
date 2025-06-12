<script lang="ts">
  import '../app.scss';
  import '../wasm_exec.js';
  import { assets } from '$app/paths';
  import { browser } from '$app/environment';
  import { loadSkillTree } from '../lib/skill_tree';
  import { modernWorker } from '../lib/modern-worker';
  import { initializeCrystalline, isWasmReady } from '../lib/types';

  // Test if basic SvelteKit imports work
  import { page } from '$app/stores';
  import { base, assets } from '$app/paths';

  console.log('Basic imports successful');
  console.log('Page store:', $page);
  console.log('Base path:', base);
  console.log('Assets path:', assets);

  // Test if Select component works
  import Select from 'svelte-select';

  let items = [
    { value: 1, label: 'Option 1' },
    { value: 2, label: 'Option 2' },
    { value: 3, label: 'Option 3' }
  ];
  
  let selectedValue = undefined;
  
  console.log('Select component imported:', Select);

  let wasmLoading = true;
  let initializationError: string | null = null;

  // eslint-disable-next-line no-undef
  const go = new (globalThis as any).Go();

  if (browser) {
    const initializeApp = async () => {
      try {
        console.log('Starting application initialization...');
        
        // Fetch WASM data
        console.log('Fetching WASM data from:', assets + '/calculator.wasm');
        const wasmResponse = await fetch(assets + '/calculator.wasm');
        if (!wasmResponse.ok) {
          throw new Error(`Failed to fetch WASM: ${wasmResponse.status} ${wasmResponse.statusText}`);
        }
        const wasmData = await wasmResponse.arrayBuffer();
        console.log('WASM data loaded, size:', wasmData.byteLength);
        
        // Initialize main thread WASM
        console.log('Instantiating WASM module...');
        const result = await WebAssembly.instantiate(wasmData.slice(0), go.importObject);
        console.log('Running Go program...');
        go.run(result.instance);
        console.log('Go program started');
        
        // Initialize main thread data structures
        console.log('Initializing crystalline data structures...');
        initializeCrystalline();
        console.log('Loading skill tree...');
        loadSkillTree();
        console.log('Main thread initialization complete');
        
        // Initialize modern worker with WASM data
        if (modernWorker) {
          console.log('Initializing modern worker...');
          await modernWorker.boot(wasmData.slice(0)); // Clone for worker
          console.log('Modern worker initialized successfully');
        }
        
        console.log('Application initialization complete');
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
            <div>
               <h3>App Paths Test:</h3>
               <p>Base: {base}</p>
               <p>Assets: {assets}</p>
            </div>
            <div class="mt-4 themed">
               <h3 class="mb-2">Test Select (Themed)</h3>
               <Select {items} bind:value={selectedValue} placeholder="Choose an option..." />
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{:else}
  <slot />
{/if}

<style>
  div {
    margin: 1rem 0;
    padding: 1rem;
    border: 1px solid #ccc;
  }
</style>