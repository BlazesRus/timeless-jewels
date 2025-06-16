<!-- Version-aware Tree Page - Dynamically loads appropriate implementation based on Svelte version -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { detectSvelteVersion, isSvelte5OrHigher } from '$lib/utils/version-detection';
  
  // Dynamic imports for version-specific components
  let TreePageComponent: any = null;
  let isLoading = true;
  let error: string | null = null;
  
  onMount(async () => {
    try {
      const svelteVersion = detectSvelteVersion();
      console.log(`Detected Svelte version: ${svelteVersion.full}`);
      
      if (isSvelte5OrHigher()) {
        console.log('Loading Svelte 5 tree page implementation...');
        const module = await import('./TreePageSvelte5.svelte');
        TreePageComponent = module.default;
      } else {
        console.log('Loading Svelte 4 tree page implementation...');
        const module = await import('./TreePageSvelte4.svelte');
        TreePageComponent = module.default;
      }
      
      isLoading = false;
    } catch (err) {
      console.error('Failed to load tree page component:', err);
      error = `Failed to load tree page: ${err instanceof Error ? err.message : 'Unknown error'}`;
      isLoading = false;
      
      // Fallback to Svelte 4 implementation
      try {
        console.log('Attempting fallback to Svelte 4 implementation...');
        const module = await import('./TreePageSvelte4.svelte');
        TreePageComponent = module.default;
        error = null;
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        error = 'Unable to load any tree page implementation';
      }
    }
  });</script>

{#if isLoading}
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
    <div class="bg-white/10 rounded-lg p-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
      <h2 class="text-xl text-white mb-2">Loading Tree Page</h2>
      <p class="text-white/70">Detecting Svelte version and loading appropriate implementation...</p>
    </div>
  </div>
{:else if error}
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
    <div class="bg-red-500/20 border border-red-500 rounded-lg p-8 text-center max-w-md">
      <h2 class="text-xl text-red-400 mb-4">Error Loading Tree Page</h2>
      <p class="text-white mb-4">{error}</p>
      <button 
        class="bg-red-500/40 hover:bg-red-500/60 px-4 py-2 rounded text-white"
        on:click={() => window.location.reload()}
      >
        Reload Page
      </button>
    </div>
  </div>
{:else if TreePageComponent}
  <svelte:component this={TreePageComponent} />
{:else}
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
    <div class="bg-yellow-500/20 border border-yellow-500 rounded-lg p-8 text-center">
      <h2 class="text-xl text-yellow-400 mb-4">No Component Loaded</h2>
      <p class="text-white">The tree page component could not be determined.</p>
    </div>
  </div>
{/if}