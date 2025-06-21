<!-- Svelte 5 Modern Layout - Uses children prop instead of slot -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import '../app.scss';

  // Svelte 5 children prop instead of slot  
  let { children }: { children: Snippet } = $props();
</script>

<!-- Always show the main content, WASM loads dynamically in components (if screen is white, then children likely failed to load)-->
<div class="layout-wrapper">
  {@render children()}
</div>

<style>
  /* Modern Layout specific styles */
  .layout-wrapper {
    min-height: 100vh;
    width: 100%;
  }
</style>
