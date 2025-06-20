<!-- Svelte 5 Modern Layout - Uses children prop instead of slot -->
<script lang="ts">
  import { browser } from '$app/environment';
  import type { Snippet } from 'svelte';
  import '../app.scss';

  import { assets } from '$app/paths';
  import { loadSkillTree } from '../lib/skill_tree';
  import { initializeCrystalline } from '../lib/types/ModernTypes';
  import { modernWorker } from '../lib/modern-worker';
  // Svelte 5 children prop instead of slot  
  let { children }: { children: Snippet } = $props();

  // Initialize WASM in the background without blocking the UI
  if (browser) {
    const initializeApp = async () => {
      try {        console.log('Starting background WASM initialization...');
        
        // Check if Go is available
        console.log('Checking Go availability...');
        console.log('globalThis type:', typeof globalThis);
        console.log('globalThis.Go type:', typeof (globalThis as any).Go);
        
        if (typeof (globalThis as any).Go === 'undefined') {
          throw new Error('Go object not found. wasm_exec.js may not have loaded properly.');
        }
        
        console.log('Creating Go instance...');
        // eslint-disable-next-line no-undef
        const go = new (globalThis as any).Go();
        console.log('Go instance created successfully');// Fetch WASM data
        const wasmUrl = assets + '/calculator.wasm';
        console.log('Fetching WASM from:', wasmUrl);
        console.log('Base path:', assets);
        
        const wasmResponse = await fetch(wasmUrl);
        console.log('WASM fetch response status:', wasmResponse.status);
        if (!wasmResponse.ok) {
          throw new Error(`Failed to fetch WASM: ${wasmResponse.status} ${wasmResponse.statusText}`);
        }
        const wasmData = await wasmResponse.arrayBuffer();
        console.log('WASM data loaded, size:', wasmData.byteLength);

        // Initialize main thread WASM
        console.log('Instantiating WASM...');
        const result = await WebAssembly.instantiate(wasmData.slice(0), go.importObject);
        console.log('Running Go WASM...');
        go.run(result.instance);

        // Initialize main thread data structures
        console.log('Initializing data structures...');
        initializeCrystalline();
        loadSkillTree();

        // Initialize modern worker with WASM data
        if (modernWorker) {
          console.log('Initializing worker...');
          await modernWorker.boot(wasmData.slice(0));
        }

        console.log('WASM initialization complete');
      } catch (error: unknown) {
        console.error('WASM initialization failed:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message, error.stack);
        }
      }
    };

    // Start initialization but don't wait for it
    initializeApp();
    console.log('Modern Layout loading in browser...');
  }
</script>

<!-- Always show the main content, WASM loads in background (Disable the link and selector until data finishes loading)-->
<div class="layout-wrapper">
  {@render children()}
</div>

<style>
  /* Modern Layout specific styles */
  .layout-wrapper {
    min-height: 100vh;
  }
  
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
