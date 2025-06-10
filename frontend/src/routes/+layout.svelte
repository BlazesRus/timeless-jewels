<script lang="ts">  import '../app.scss';
  import '../wasm_exec.js';
  import { assets } from '$app/paths';
  import { browser } from '$app/environment';
  import { loadSkillTree } from '$lib/skill_tree';
  import { syncWrap } from '$lib/worker';
  import { initializeCrystalline, data } from '$lib/types';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  let wasmLoading = $state(true);

  // @ts-expect-error - Go class from WASM runtime
  const go = new Go();
  if (browser) {
    fetch(assets + '/calculator.wasm')
      .then((response) => response.arrayBuffer())
      .then((wasmData) => {
        WebAssembly.instantiate(wasmData, go.importObject).then((result) => {
          go.run(result.instance);
          wasmLoading = false;
          initializeCrystalline();          // Wait for data.SkillTree to be available before loading
          const waitForSkillTree = () => {
            if (typeof data.SkillTree === 'string' && data.SkillTree.length > 10) {
              loadSkillTree();
            } else {
              setTimeout(waitForSkillTree, 50);
            }
          };
          waitForSkillTree();
        });

        if (syncWrap)
            syncWrap.boot(wasmData);
      });
  }
</script>

{#if wasmLoading}
  <div class="flex flex-row justify-center h-screen">
    <div class="flex flex-col">
      <div class="py-10 flex flex-col justify-between">
        <div>
          <h1 class="text-white mb-10 text-center">Timeless Calculator</h1>

          <h2 class="text-center">Loading...</h2>
        </div>
      </div>
    </div>
  </div>
{:else}
  {@render children?.()}
{/if}