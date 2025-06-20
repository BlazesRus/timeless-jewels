<!-- Version-aware Layout - Dynamically loads appropriate layout based on Svelte version -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { detectSvelteVersion, isSvelte5OrHigher } from '$lib/utils/version-detection';

  // Dynamic imports for version-specific layouts
  let LayoutComponent: any = null;
  let isLoading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      const svelteVersion = detectSvelteVersion();
      console.log(`Detected Svelte version: ${svelteVersion.full}`);
      
      if (isSvelte5OrHigher()) {
        console.log('Loading Modern (Svelte 5) layout implementation...');
        try {
          const module = await import('./ModernLayout.svelte');
          LayoutComponent = module.default;
        } catch (modernErr) {
          console.warn('Modern layout not available, using fallback');
          error = 'Modern layout component not available in this build';
        }
      } else {
        console.log('Loading Legacy (Svelte 4) layout implementation...');
        try {
          const module = await import('./LegacyLayout.svelte');
          LayoutComponent = module.default;
        } catch (legacyErr) {
          console.warn('Legacy layout not available, trying modern fallback');
          try {
            const module = await import('./ModernLayout.svelte');
            LayoutComponent = module.default;
          } catch (fallbackErr) {
            error = 'No compatible layout component available';
          }
        }
      }
      
      isLoading = false;
    } catch (err) {
      console.error('Failed to load layout component:', err);
      error = err instanceof Error ? err.message : 'Unknown error occurred';
      isLoading = false;
    }
  });
</script>

{#if isLoading}
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <p>Loading layout...</p>
  </div>
{:else if error}
  <div class="error-container">
    <h2>Error Loading Layout</h2>
    <p>{error}</p>
    <p>Please refresh the page to try again.</p>
  </div>
{:else if LayoutComponent}
  <svelte:component this={LayoutComponent}>
    <slot />
  </svelte:component>
{/if}

<style>
  .loading-container, .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    text-align: center;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error-container {
    color: #dc3545;
  }

  .error-container h2 {
    margin-bottom: 1rem;
  }
</style>
