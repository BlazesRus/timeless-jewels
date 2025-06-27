<!-- 
Advanced Modern Component Showcase
Demonstrates Svelte 5 runes, Vite 7 features, and Node.js 22 patterns
-->
<script lang="ts">
  import { tick } from 'svelte';
  import { 
    createViewportTracker, 
    createPerformanceObserver, 
    createIntersectionObserver,
    createReactiveStorage,
    createThemeManager,
    createDebouncer
  } from '$lib/utils/modern-utilities.js';

  interface Props {
    title?: string;
    items?: Array<{ id: string; label: string; value: any }>;
    autoOptimize?: boolean;
  }

  let { 
    title = 'Modern Component', 
    items = [],
    autoOptimize = true
  }: Props = $props();

  // Advanced state management with Svelte 5 runes
  let componentState = $state({
    isActive: false,
    selectedItems: [] as string[],
    searchQuery: '',
    lastUpdate: Date.now()
  });

  // Modern utilities integration
  const viewport = createViewportTracker();
  const performance = createPerformanceObserver();
  const theme = createThemeManager();
  const storage = createReactiveStorage('component-preferences', {
    selectedItems: [] as string[],
    theme: 'auto' as 'light' | 'dark' | 'auto'
  });

  // Advanced derived state with performance optimization
  const filteredItems = $derived.by(() => {
    if (!componentState.searchQuery.trim()) return items;
    
    performance.startMeasure('filter-items');
    const query = componentState.searchQuery.toLowerCase();
    const result = items.filter(item => 
      item.label.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query)
    );
    performance.endMeasure('filter-items');
    
    return result;
  });

  const responsiveClass = $derived(`
    modern-component
    ${viewport.viewport().isMobile ? 'mobile' : ''}
    ${viewport.viewport().isTablet ? 'tablet' : ''}
    ${viewport.viewport().isDesktop ? 'desktop' : ''}
    ${theme.resolvedTheme()}
  `.trim());

  // Modern debounced search
  const debouncedSearch = createDebouncer(300);
  const handleSearch = debouncedSearch((query: string) => {
    componentState.searchQuery = query;
    componentState.lastUpdate = Date.now();
  });

  // Advanced intersection observer for lazy loading
  const intersection = createIntersectionObserver(0.1);
  let containerRef = $state<HTMLDivElement>();

  // Modern lifecycle management with $effect
  $effect(() => {
    if (containerRef) {
      intersection.observe(containerRef);
    }
  });

  // Auto-optimization effect
  $effect(() => {
    if (autoOptimize && intersection.isVisible()) {
      // Perform optimizations when component is visible
      performance.startMeasure('optimization');
      
      // Example: Pre-load next page data, optimize rendering, etc.
      const optimizationTasks = [
        () => console.log('Optimizing rendering...'),
        () => console.log('Pre-loading resources...'),
        () => console.log('Cleaning up unused data...')
      ];

      // Use modern Promise patterns
      Promise.allSettled(optimizationTasks.map(task => 
        new Promise(resolve => {
          setTimeout(() => {
            task();
            resolve(null);
          }, 16); // One frame
        })
      )).then(() => {
        performance.endMeasure('optimization');
      });
    }
  });

  // Modern event handlers with advanced patterns
  const handleItemToggle = (itemId: string) => {
    componentState.selectedItems = componentState.selectedItems.includes(itemId)
      ? componentState.selectedItems.filter(id => id !== itemId)
      : [...componentState.selectedItems, itemId];
    
    // Sync with storage
    storage.setValue(prev => ({
      ...prev,
      selectedItems: componentState.selectedItems
    }));
  };

  const handleThemeToggle = () => {
    theme.toggleTheme();
    storage.setValue(prev => ({
      ...prev,
      theme: theme.currentTheme()
    }));
  };

  // Modern cleanup
  $effect(() => {
    return () => {
      viewport.cleanup();
      performance.cleanup();
    };
  });

  // Advanced reactive declarations
  const stats = $derived({
    totalItems: items.length,
    filteredCount: filteredItems.length,
    selectedCount: componentState.selectedItems.length,
    visibilityRatio: intersection.intersectionRatio(),
    renderTime: performance.metrics().renderTime,
    viewport: {
      width: viewport.viewport().width,
      height: viewport.viewport().height,
      orientation: viewport.viewport().orientation
    }
  });
</script>

<!-- Modern template with advanced patterns -->
<div 
  bind:this={containerRef}
  class={responsiveClass}
  data-visible={intersection.isVisible()}
  role="region"
  aria-label={title}
>
  <!-- Header with theme controls -->
  <header class="component-header">
    <h2>{title}</h2>
    <div class="controls">
      <button 
        class="theme-toggle"
        onclick={handleThemeToggle}
        aria-label="Toggle theme"
      >
        {theme.resolvedTheme() === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  </header>

  <!-- Advanced search with modern patterns -->
  <div class="search-section">
    <input
      type="text"
      placeholder="Search items..."
      oninput={(e) => handleSearch(e.currentTarget.value)}
      class="search-input"
      aria-label="Search items"
    />
    {#if componentState.searchQuery}
      <span class="search-results">
        {filteredItems.length} of {items.length} items
      </span>
    {/if}
  </div>

  <!-- Dynamic content with performance optimizations -->
  <main class="component-content">
    {#if intersection.isVisible()}
      {#each filteredItems as item (item.id)}
        <article 
          class="item"
          class:selected={componentState.selectedItems.includes(item.id)}
        >
          <button
            class="item-button"
            onclick={() => handleItemToggle(item.id)}
            aria-pressed={componentState.selectedItems.includes(item.id)}
          >
            <span class="item-label">{item.label}</span>
            <span class="item-value">{item.value}</span>
          </button>
        </article>
      {/each}
    {:else}
      <div class="placeholder">
        Component not visible - optimized rendering
      </div>
    {/if}
  </main>

  <!-- Performance stats (dev only) -->
  {#if import.meta.env.DEV}
    <footer class="debug-stats">
      <details>
        <summary>Performance Stats</summary>
        <dl>
          <dt>Render Time:</dt>
          <dd>{stats.renderTime.toFixed(2)}ms</dd>
          
          <dt>Items:</dt>
          <dd>{stats.totalItems} total, {stats.filteredCount} filtered, {stats.selectedCount} selected</dd>
          
          <dt>Viewport:</dt>
          <dd>{stats.viewport.width} × {stats.viewport.height} ({stats.viewport.orientation})</dd>
          
          <dt>Visibility:</dt>
          <dd>{(stats.visibilityRatio * 100).toFixed(1)}%</dd>
        </dl>
      </details>
    </footer>
  {/if}
</div>

<style>
  /* Modern CSS with advanced features */
  .modern-component {
    /* CSS custom properties for theming */
    --primary-color: light-dark(#3b82f6, #60a5fa);
    --background: light-dark(#ffffff, #1a1a1a);
    --text: light-dark(#1a1a1a, #ffffff);
    --border: light-dark(#e5e7eb, #374151);
    
    /* Modern layout */
    container-type: inline-size;
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    gap: 1rem;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--text);
    
    /* Modern transitions */
    transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
  }

  /* Responsive design with container queries */
  @container (min-width: 768px) {
    .modern-component {
      padding: 1.5rem;
      gap: 1.5rem;
    }
  }

  @container (min-width: 1024px) {
    .modern-component {
      grid-template-columns: 1fr 300px;
      grid-template-rows: auto 1fr auto;
    }
  }

  /* Component header */
  .component-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.5rem;
  }

  .theme-toggle {
    background: none;
    border: 1px solid var(--border);
    border-radius: 0.25rem;
    padding: 0.5rem;
    cursor: pointer;
    font-size: 1.2em;
    transition: all 0.2s ease;
  }

  .theme-toggle:hover {
    background: var(--primary-color);
    color: white;
  }

  /* Search section */
  .search-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .search-input {
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--background);
    color: var(--text);
    font-size: 1rem;
    transition: border-color 0.2s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 20%, transparent);
  }

  .search-results {
    font-size: 0.875rem;
    color: color-mix(in srgb, var(--text) 70%, transparent);
  }

  /* Content area */
  .component-content {
    display: grid;
    gap: 0.5rem;
    max-height: 400px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .item {
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .item:hover {
    border-color: var(--primary-color);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px color-mix(in srgb, var(--primary-color) 20%, transparent);
  }

  .item.selected {
    border-color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 10%, transparent);
  }

  .item-button {
    width: 100%;
    padding: 1rem;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .item-label {
    font-weight: 500;
  }

  .item-value {
    font-size: 0.875rem;
    color: color-mix(in srgb, var(--text) 70%, transparent);
  }

  /* Debug stats */
  .debug-stats {
    font-size: 0.75rem;
    color: color-mix(in srgb, var(--text) 60%, transparent);
    border-top: 1px solid var(--border);
    padding-top: 0.5rem;
  }

  .debug-stats dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.25rem 0.5rem;
    margin: 0;
  }

  .debug-stats dt {
    font-weight: 500;
  }

  .debug-stats dd {
    margin: 0;
  }

  /* Mobile optimizations */
  .modern-component.mobile {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .modern-component.mobile .component-content {
    max-height: 300px;
  }

  /* Dark theme optimizations */
  .modern-component.dark {
    /* Enhanced dark mode styling */
    box-shadow: 0 4px 6px color-mix(in srgb, black 30%, transparent);
  }

  /* Placeholder for non-visible content */
  .placeholder {
    text-align: center;
    padding: 2rem;
    color: color-mix(in srgb, var(--text) 50%, transparent);
    font-style: italic;
  }

  /* Modern focus styles */
  .modern-component :focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .modern-component,
    .modern-component * {
      transition: none !important;
      animation: none !important;
    }
  }
</style>
