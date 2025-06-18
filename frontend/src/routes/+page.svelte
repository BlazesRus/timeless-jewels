<script lang="ts">
  import { browser } from '$app/environment';
  import { getCurrentSvelteVersion } from '$lib/utils/version-detection.js';
  
  let currentVersion = '5'; // Default to Svelte 5
  
  // Detect version when component loads
  if (browser) {
    currentVersion = getCurrentSvelteVersion();
  }
    // Re-export components based on version
  $: componentPath = currentVersion === '4' ? './LegacyHomePage.svelte' : './ModernHomePage.svelte';
</script>

<!-- Version-aware routing -->
{#if currentVersion === '4'}
  {#await import('./LegacyHomePage.svelte') then { default: LegacyPage }}
    <LegacyPage />
  {/await}
{:else}
  {#await import('./ModernHomePage.svelte') then { default: ModernPage }}
    <ModernPage />
  {/await}
{/if}
