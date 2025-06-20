<!-- Version-aware Home Page - Dynamically loads appropriate implementation based on Svelte version -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { detectSvelteVersion, isSvelte5OrHigher } from '$lib/utils/version-detection';

  // Dynamic imports for version-specific components
  let HomePageComponent: any = null;
  let isLoading = true;
  let error: string | null = null;
  onMount(async () => {
    try {
      const svelteVersion = detectSvelteVersion();
      console.log(`Detected Svelte version: ${svelteVersion.full}`);
      if (isSvelte5OrHigher()) {
        console.log('Loading Modern (Svelte 5) home page implementation...');
        try {
          const module = await import('./ModernHomePage.svelte');
          HomePageComponent = module.default;
        } catch (modernErr) {
          console.warn('Modern component not available, using fallback');
          // Fallback to a basic component or error page
          error = 'Modern home page component not available in this build';
        }
      } else {
        console.log('Loading Legacy (Svelte 4) home page implementation...');
        try {
          const module = await import('./LegacyHomePage.svelte');
          HomePageComponent = module.default;
        } catch (legacyErr) {
          console.warn('Legacy component not available, trying modern fallback');
          try {
            const module = await import('./ModernHomePage.svelte');
            HomePageComponent = module.default;
          } catch (fallbackErr) {
            error = 'No compatible home page component available';
          }
        }
      }

      isLoading = false;
    } catch (err) {
      console.error('Failed to load home page component:', err);
      error = `Failed to load home page: ${err instanceof Error ? err.message : 'Unknown error'}`;
      isLoading = false;
    }
  });
</script>

{#if isLoading}
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
    <div class="bg-white/10 rounded-lg p-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
      <h2 class="text-xl text-white mb-2">Loading Timeless Jewel Calculator</h2>
      <p class="text-white/70">Detecting Svelte version and loading appropriate implementation...</p>
    </div>
  </div>
{:else if error}
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
    <div class="bg-red-500/20 border border-red-500 rounded-lg p-8 text-center max-w-md">
      <h2 class="text-xl text-red-400 mb-4">Error Loading Application</h2>
      <p class="text-white mb-4">{error}</p>
      <button class="bg-red-500/40 hover:bg-red-500/60 px-4 py-2 rounded text-white" on:click={() => window.location.reload()}>Reload Page</button>
    </div>
  </div>
{:else if HomePageComponent}
  <svelte:component this={HomePageComponent} />
{:else}
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
    <div class="bg-yellow-500/20 border border-yellow-500 rounded-lg p-8 text-center">
      <h2 class="text-xl text-yellow-400 mb-4">No Component Loaded</h2>
      <p class="text-white">The home page component could not be determined.</p>
    </div>
  </div>
{/if}
