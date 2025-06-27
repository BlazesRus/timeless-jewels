<!-- Svelte 5 Modern Layout - Uses children prop and advanced runes -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import '../app.css';
  import { onMount } from 'svelte';

  // Svelte 5 children prop with proper typing
  let { children }: { children: Snippet } = $props();

  // Modern performance tracking with runes
  let layoutMetrics = $state({
    mountTime: 0,
    renderTime: 0,
    isHydrated: false
  });

  // Use $effect for lifecycle management (Svelte 5 replacement for onMount)
  $effect(() => {
    const startTime = performance.now();
    layoutMetrics.mountTime = startTime;
    
    // Modern hydration detection
    if (typeof window !== 'undefined') {
      layoutMetrics.isHydrated = true;
      layoutMetrics.renderTime = performance.now() - startTime;
      
      // Log performance in development
      if (import.meta.env.DEV) {
        console.log(`🚀 Modern Layout rendered in ${layoutMetrics.renderTime.toFixed(2)}ms`);
      }
    }
  });

  // Modern viewport tracking with runes
  let viewport = $state({
    width: 0,
    height: 0,
    isMobile: false
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

  // Derived responsive classes using $derived
  const layoutClasses = $derived(`layout-wrapper ${viewport.isMobile ? 'mobile' : 'desktop'}`);
</script>

<!-- Always show the main content, WASM loads dynamically in components -->
<div class={layoutClasses} data-hydrated={layoutMetrics.isHydrated}>
  {@render children()}
</div>

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
  .layout-wrapper[data-hydrated="false"] {
    opacity: 0.95;
  }

  .layout-wrapper[data-hydrated="true"] {
    opacity: 1;
  }
</style>
