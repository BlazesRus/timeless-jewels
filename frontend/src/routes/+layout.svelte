<!-- src/routes/+layout.svelte -->
<!-- Modernized for Svelte 5-->
<script lang="ts">
  import '../app.css';
  import { Snippet } from 'svelte';
  import {
    $props,
    $state,
    $effect,
    $derived
  } from 'svelte/runes';

  import {
    initialize,
    status,
    isReady
  } from '$lib/services/JewelGenService.svelte.ts';

  import { loadSkillTree } from '../lib/skill_tree';
  import Spinner from '$lib/components/Spinner.svelte';

  // children prop
  let { children }: { children: Snippet } = $props();

  // layout performance metrics
  const layoutMetrics = $state({
    mountTime: 0,
    renderTime: 0,
    isHydrated: false
  });

  // Modern viewport tracking with runes
  let viewport = $state({
    width: 0,
    height: 0,
    isMobile: false
  });

  // CSS classes based on viewport
  const layoutClasses = $derived(
    () => `layout-wrapper ${viewport.isMobile ? 'mobile' : 'desktop'}`
  );

  const skillLoaded = $state(false);

  // Initialization & hydration
  $effect(() => {
    // record mount/hydration
    const t0 = performance.now();
    layoutMetrics.mountTime = t0;

    if (typeof window !== 'undefined') {
      layoutMetrics.isHydrated = true;
      layoutMetrics.renderTime = performance.now() - t0;

      // Log performance in development
      if (import.meta.env.DEV) {
        console.log(`?? Modern Layout rendered in ${layoutMetrics.renderTime.toFixed(2)}ms`);
      }

      // async WASM init
      (async () => {
        try {
          await initialize('layout');
          await loadSkillTree();
          skillLoaded = true;
        }
    		catch (err) {
          console.error('Initialization error:', err, status());
    		}
      })();
    }
  });

  // Responsive viewport tracking
  $effect(() => {
    if (typeof window !== 'undefined') {
      const updateViewport = () => {
        viewport.width = window.innerWidth;
        viewport.height = window.innerHeight;
        viewport.isMobile = window.innerWidth < 768;
      };

      updateViewport();
      window.addEventListener('resize', updateViewport);

      return () => window.removeEventListener('resize', updateViewport);
    }
    // Return a no-op cleanup function for server-side rendering
    return () => {};
  });
</script>

<svelte:head>
  <!-- PWA Meta Tags -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#f97316" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black" />
  <meta name="apple-mobile-web-app-title" content="TJ Calculator" />
  
  <!-- PWA Manifest -->
  <link rel="manifest" href="/manifest.json" />
  
  <!-- Icons -->
  <link rel="icon" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/favicon.png" />
  
  <!-- Description -->
  <meta name="description" content="Path of Exile Timeless Jewel Calculator - Calculate passive tree modifications offline" />
</svelte:head>

{#if !isReady() || !skillLoaded()}
  <div class="loading">
    <Spinner /> Loading WASM… (status: {status()})
  </div>
{:else}
  <div class={layoutClasses} data-hydrated={layoutMetrics.isHydrated}>
    {@render children}
  </div>
{/if}

<style>
  /* Modern Layout specific styles with CSS custom properties */
  .layout-wrapper {
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;

    /* CSS custom properties for dynamic theming */
    --layout-padding: 1rem;
    --layout-gap: 1.5rem;

    /* Modern CSS features */
    container-type: inline-size;

    /* Smooth transitions */
    transition: all 0.2s ease-in-out;
  }

  .layout-wrapper.mobile {
    --layout-padding: 0.75rem;
    --layout-gap: 1rem;
  }

  .layout-wrapper.desktop {
    --layout-padding: 1.5rem;
    --layout-gap: 2rem;
  }

  /* Modern CSS container queries */
  @container (min-width: 768px) {
    .layout-wrapper {
      --layout-padding: 2rem;
    }
  }

  /* Performance optimization: reduce layout shift */
  .layout-wrapper[data-hydrated='false'] {
    opacity: 0.95;
  }

  .layout-wrapper[data-hydrated='true'] {
    opacity: 1;
  }
</style>
