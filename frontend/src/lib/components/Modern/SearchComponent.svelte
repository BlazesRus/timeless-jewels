<!-- Modern Svelte 5 Component Example with Performance Optimizations -->
<script lang="ts">
  import { onMount } from 'svelte';
  
  // Modern Svelte 5 runes for state management
  let searchQuery = $state('');
  let searchResults = $state<Array<any>>([]);
  let isLoading = $state(false);
  let abortController = $state<AbortController | null>(null);
  
  // Modern derived values with performance optimization
  const filteredResults = $derived.by(() => {
    if (!searchQuery.trim()) return [];
    return searchResults.filter(result => 
      result.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  const resultCount = $derived(filteredResults.length);
  const hasResults = $derived(resultCount > 0);
  
  // Modern props with $bindable for two-way binding
  interface Props {
    data: Array<any>;
    onSelect?: (item: any) => void;
    placeholder?: string;
    maxResults?: number;
    children?: import('svelte').Snippet<[any]>;
  }
  
  let {
    data = $bindable([]),
    onSelect,
    placeholder = 'Search...',
    maxResults = 50,
    children
  }: Props = $props();
  
  // Modern effect with cleanup and abortable operations
  $effect(() => {
    if (searchQuery.length < 2) {
      searchResults = [];
      return;
    }
    
    // Cancel previous search
    abortController?.abort();
    abortController = new AbortController();
    
    const currentController = abortController;
    
    // Modern debounced search with AbortController
    const timeoutId = setTimeout(async () => {
      if (currentController.signal.aborted) return;
      
      isLoading = true;
      try {
        // Simulate async search with modern fetch patterns
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
          signal: currentController.signal
        });
        
        if (!currentController.signal.aborted) {
          const results = await response.json();
          searchResults = results.slice(0, maxResults);
        }
      } catch (error) {
        if (!currentController.signal.aborted) {
          console.error('Search failed:', error);
          searchResults = [];
        }
      } finally {
        if (!currentController.signal.aborted) {
          isLoading = false;
        }
      }
    }, 300);
    
    // Modern cleanup with Symbol.dispose pattern
    return () => {
      clearTimeout(timeoutId);
      currentController.abort();
    };
  });
  
  // Modern intersection observer for lazy loading
  let containerElement = $state<HTMLElement>();
  let isVisible = $state(false);
  
  onMount(() => {
    if (!containerElement) return;
    
    // Modern performance observer
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? false;
      },
      { threshold: 0.1 }
    );
    
    observer.observe(containerElement);
    
    // Modern cleanup
    return () => observer.disconnect();
  });
  
  // Modern event handlers with proper typing
  const handleSelect = (item: any) => {
    onSelect?.(item);
    searchQuery = '';
  };
  
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      searchQuery = '';
      abortController?.abort();
    }
  };
</script>

<!-- Modern HTML with container queries and accessibility -->
<div 
  bind:this={containerElement}
  class="modern-search-container"
  style="container-type: inline-size;"
  role="search"
  aria-label="Search interface"
>
  <div class="search-input-wrapper">
    <input
      bind:value={searchQuery}
      onkeydown={handleKeydown}
      type="search"
      {placeholder}
      class="modern-search-input"
      aria-label="Search input"
      aria-controls="search-results"
      autocomplete="off"
    />
    
    {#if isLoading}
      <div class="loading-indicator" aria-label="Loading search results">
        <div class="modern-spinner"></div>
      </div>
    {/if}
  </div>
  
  {#if hasResults && isVisible}
    <ul 
      id="search-results"
      class="search-results"
      role="listbox"
      aria-label="Search results"
    >
      {#each filteredResults as result, index (result.id || index)}
        <li 
          class="search-result-item"
          role="option"
          aria-selected="false"
          tabindex="0"
          onclick={() => handleSelect(result)}
          onkeydown={(e) => e.key === 'Enter' && handleSelect(result)}
        >
          {#if children}
            {@render children(result)}
          {:else}
            <span class="result-name">{result.name}</span>
            <span class="result-meta">{result.type}</span>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
  
  {#if searchQuery && !isLoading && !hasResults}
    <div class="no-results" role="status">
      No results found for "{searchQuery}"
    </div>
  {/if}
</div>

<style>
  .modern-search-container {
    position: relative;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    overflow: hidden;
  }
  
  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .modern-search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    background: transparent;
    color: inherit;
    font-size: 1rem;
    outline: none;
  }
  
  .modern-search-input:focus-visible {
    box-shadow: inset 0 0 0 2px var(--color-focus);
  }
  
  .loading-indicator {
    position: absolute;
    right: 1rem;
    display: flex;
    align-items: center;
  }
  
  .modern-spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid var(--color-border);
    border-top: 2px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .search-results {
    max-height: 300px;
    overflow-y: auto;
    border-top: 1px solid var(--color-border);
  }
  
  .search-result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    cursor: pointer;
    border-bottom: 1px solid var(--color-border);
    transition: background-color 0.15s ease;
  }
  
  .search-result-item:hover,
  .search-result-item:focus-visible {
    background: var(--color-hover);
    outline: none;
  }
  
  .result-name {
    font-weight: 500;
  }
  
  .result-meta {
    font-size: 0.875rem;
    color: var(--color-secondary);
  }
  
  .no-results {
    padding: 2rem 1rem;
    text-align: center;
    color: var(--color-secondary);
    font-style: italic;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  /* Modern container queries for responsive behavior */
  @container (min-width: 600px) {
    .search-result-item {
      padding: 1rem 1.5rem;
    }
    
    .result-meta {
      font-size: 1rem;
    }
  }
  
  /* Modern reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .modern-spinner {
      animation: none;
    }
    
    .search-result-item {
      transition: none;
    }
  }
</style>
