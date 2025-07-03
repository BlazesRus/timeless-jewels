<!--
  Version-aware Home Page Router - Dynamically loads appropriate implementation based on Svelte version
  
  Router variant that loads modernized versions of original routes/+page
  or optionally falls back to legacy implementations if not using modern svelte.
  Copyright (C) 2025 James Armstrong (github.com/BlazesRus)
  Generated with GitHub Copilot assistance
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.
-->

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
      console.log(`__SVELTE_BUILD_VERSION__ constant:`, (globalThis as any).__SVELTE_BUILD_VERSION__);
      console.log(`isSvelte5OrHigher():`, isSvelte5OrHigher());
      
      if (isSvelte5OrHigher()) {
        console.log('Loading Modern (Svelte 5) home page implementation...');
        try {
          console.log('🔄 Attempting to import ./ModernHomePage.svelte...');
          const module = await import('./ModernHomePage.svelte');
          console.log('📦 Module loaded:', module);
          HomePageComponent = module.default;
          console.log('✅ Modern component loaded successfully:', HomePageComponent);
        } catch (modernErr: any) {
          console.error('❌ Failed to load modern component - Full error details:', modernErr);
          console.error('❌ Error message:', modernErr?.message);
          console.error('❌ Error stack:', modernErr?.stack);
          console.warn('Modern component not available, using fallback');
          // Fallback to a basic component or error page
          error = `Modern home page component failed to load: ${modernErr?.message || 'Unknown modern page error'}`;
        }
      } else {
        console.log('Loading Legacy (Svelte 4) home page implementation...');
        try {
          // Only attempt to load legacy component if it exists (development mode)
          if (typeof import.meta.env !== 'undefined' && import.meta.env.DEV) {
            const module = await import('./LegacyHomePage.svelte');
            HomePageComponent = module.default;
          } else {
            // In production modern mode, skip legacy component
            throw new Error('Legacy component not available in production modern mode');
          }
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
  <div class="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center">
    <div class="bg-white bg-opacity-10 rounded-lg p-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
      <h2 class="text-xl text-white mb-2">Loading Timeless Jewel Calculator</h2>
      <p class="text-white text-opacity-70">Detecting Svelte version and loading appropriate implementation...</p>
    </div>
  </div>
{:else if error}
  <div class="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center">
    <div class="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-8 text-center max-w-md">
      <h2 class="text-xl text-red-400 mb-4">Error Loading Application</h2>
      <p class="text-white mb-4">{error}</p>
      <button class="bg-red-500 bg-opacity-40 hover:bg-red-500 hover:bg-opacity-60 px-4 py-2 rounded text-white" on:click={() => window.location.reload()}>Reload Page</button>
    </div>
  </div>
{:else if HomePageComponent}
  <svelte:component this={HomePageComponent} />
{:else}
  <div class="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center">
    <div class="bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg p-8 text-center">
      <h2 class="text-xl text-yellow-400 mb-4">No Component Loaded</h2>
      <p class="text-white">The home page component could not be determined.</p>
    </div>
  </div>
{/if}
