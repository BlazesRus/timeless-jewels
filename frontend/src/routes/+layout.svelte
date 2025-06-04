<script lang="ts">
  // @ts-nocheck Heavy DOM usage, so we disable type checking for this file
  /* global window WebAssembly fetch alert */

  import '../app.scss';
  import '../wasm_exec.js';
  import { assets } from '$app/paths';
  import { browser } from '$app/environment';
  import { loadSkillTree } from '../lib/skill_tree';
  import { syncWrap } from '../lib/worker';
  import { initializeCrystalline } from '../lib/types';

  let wasmLoading = true;

  let go: { importObject: Record<string, unknown>; run: (instance: WebAssembly.Instance) => void } | undefined;
  let GoConstructor: { new(): { importObject: Record<string, unknown>; run: (instance: WebAssembly.Instance) => void } } | undefined;

  if (browser) {
    // Use type assertion for window
    GoConstructor = (window as typeof window & { Go: typeof GoConstructor }).Go;
    if (GoConstructor) {
      go = new GoConstructor();
    } else {
      // Optionally replace with a custom error handler if you want to avoid no-console
      if (typeof alert !== 'undefined') {
        alert('GoConstructor is undefined');
      }
    }

    fetch(assets + '/calculator.wasm')
      .then((data) => data.arrayBuffer())
      .then(async (data: ArrayBuffer) => {
        // Use WebAssembly only in browser
        const wasmModule = await (window as typeof window & { WebAssembly: typeof WebAssembly }).WebAssembly.instantiate(
          data,
          go?.importObject as WebAssembly.Imports
        );
        go?.run(wasmModule.instance);
        initializeCrystalline();
        loadSkillTree();
        wasmLoading = false;

        if (syncWrap) {
          syncWrap.boot(data);
        }
      });
  }
</script>

{#if wasmLoading}
  <div class="flex flex-row justify-center h-screen">
    <div class="flex flex-col">
      <div class="py-10 flex flex-col justify-between">
        <h1 class="text-white mb-10 text-center">Timeless Calculator</h1>
        <h2 class="text-center">Loading...</h2>
      </div>
    </div>
  </div>
{:else}
  <slot />
{/if}