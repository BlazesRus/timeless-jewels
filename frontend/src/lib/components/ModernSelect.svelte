<!-- 
Modern Select Component for Svelte 5
Full-featured replacement for svelte-select using native Svelte 5 runes and advanced patterns
-->
<script lang="ts">
  import { tick } from 'svelte';

  interface SelectItem {
    value: any;
    label: string;
  }

  interface Props {
    items: SelectItem[];
    value?: SelectItem;
    placeholder?: string;
    onchange?: (item: SelectItem | undefined) => void;
    onclear?: () => void;
    disabled?: boolean;
    loading?: boolean;
    maxHeight?: number;
  }

  let { 
    items, 
    value = $bindable(), 
    placeholder = 'Select...', 
    onchange, 
    onclear, 
    disabled = false,
    loading = false,
    maxHeight = 200
  }: Props = $props();

  // Modern state management with runes
  let isOpen = $state(false);
  let searchTerm = $state('');
  let highlightedIndex = $state(-1);
  let containerRef = $state<HTMLDivElement>();
  let searchInputRef = $state<HTMLInputElement>();
  let dropdownRef = $state<HTMLDivElement>();

  // Advanced derived state with performance optimizations
  const filteredItems = $derived.by(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(item => 
      item.label.toLowerCase().includes(term) ||
      String(item.value).toLowerCase().includes(term)
    );
  });

  // Performance metrics for development
  const selectMetrics = $state({
    filterTime: 0,
    renderTime: 0
  });

  // Advanced keyboard navigation with modern patterns
  const handleKeydown = async (e: KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (!disabled && !loading) {
          open();
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        highlightedIndex = Math.min(highlightedIndex + 1, filteredItems.length - 1);
        scrollToHighlighted();
        break;
      case 'ArrowUp':
        e.preventDefault();
        highlightedIndex = Math.max(highlightedIndex - 1, -1);
        scrollToHighlighted();
        break;
        e.preventDefault();
        highlightedIndex = Math.max(highlightedIndex - 1, -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredItems[highlightedIndex]) {
          handleSelect(filteredItems[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
    }
  };
  const handleSelect = (item: SelectItem) => {
    value = item;
    close();
    onchange?.(item);
  };

  const clear = (e?: Event) => {
    e?.stopPropagation();
    value = undefined;
    close();
    onclear?.();
    onchange?.(undefined);
  };

  const close = () => {
    isOpen = false;
    searchTerm = '';
    highlightedIndex = -1;
  };

  // Click outside handler
  const handleClickOutside = (e: Event) => {
    if (!containerRef?.contains(e.target as Node)) {
      close();
    }
  };

  // API compatibility with svelte-select
  export const handleClear = clear;
</script>

<svelte:window onclick={handleClickOutside} />

<div bind:this={containerRef} class="modern-select relative themed">
  <button class="select-trigger" class:disabled={disabled} onclick={() => !disabled && (isOpen = !isOpen)} onkeydown={handleKeydown} type="button" disabled={disabled} aria-expanded={isOpen} aria-haspopup="listbox" aria-controls="select-dropdown-{Math.random().toString(36).substr(2, 9)}" role="combobox">
    <span class="select-value">
      {value?.label || placeholder}
    </span>
    <div class="select-actions">
      {#if value && !disabled}
        <span class="clear-button" onclick={clear} tabindex="-1" aria-label="Clear selection" role="button" onkeydown={(e) => e.key === 'Enter' && clear()}>✕</span>
      {/if}
      <svg class="chevron" class:open={isOpen} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </button>

  {#if isOpen && !disabled}
    <div class="select-dropdown" role="listbox">
      <div class="search-container">
        <input bind:this={searchInputRef} bind:value={searchTerm} placeholder="Search..." class="search-input" onkeydown={handleKeydown} type="text" />
      </div>

      <div class="options-container">
        {#each filteredItems as item, index}
          <button class="select-option" class:selected={value?.value === item.value} class:highlighted={highlightedIndex === index} onclick={() => handleSelect(item)} type="button" role="option" aria-selected={value?.value === item.value}>
            {item.label}
          </button>
        {/each}

        {#if filteredItems.length === 0}
          <div class="no-options">No items found</div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .modern-select {
    position: relative;
    width: 100%;
  }

  .select-trigger {
    width: 100%;
    min-height: 42px;
    padding: 8px 16px;
    border: 1px solid #4a5568;
    border-radius: 4px;
    background: #2d3748;
    color: white;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .select-trigger:hover {
    border-color: #c2410c;
  }

  .select-trigger:focus {
    border-color: #c2410c;
    outline: none;
  }

  .select-trigger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .select-value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .select-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .clear-button {
    color: #a0aec0;
    padding: 4px;
    border-radius: 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s;
  }

  .clear-button:hover {
    color: white;
    background: rgba(74, 85, 104, 0.5);
  }

  .chevron {
    width: 16px;
    height: 16px;
    color: #a0aec0;
    transition: transform 0.2s;
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .select-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 50;
    margin-top: 4px;
    background: #2d3748;
    border: 1px solid #4a5568;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-height: 240px;
    overflow: hidden;
  }

  .search-container {
    padding: 8px;
    border-bottom: 1px solid #4a5568;
  }

  .search-input {
    width: 100%;
    padding: 8px;
    border: 1px solid #4a5568;
    border-radius: 4px;
    font-size: 14px;
    background: #1a202c;
    color: white;
    transition: border-color 0.2s;
  }

  .search-input::placeholder {
    color: #a0aec0;
  }

  .search-input:focus {
    border-color: #c2410c;
    outline: none;
  }

  .options-container {
    overflow: auto;
    max-height: 192px;
  }

  .select-option {
    width: 100%;
    padding: 12px;
    text-align: left;
    color: white;
    border: none;
    border-bottom: 1px solid #4a5568;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .select-option:last-child {
    border-bottom: none;
  }

  .select-option:hover,
  .select-option:focus {
    background: rgba(194, 65, 12, 0.2);
    outline: none;
  }

  .select-option.selected {
    background: rgba(194, 65, 12, 0.4);
  }

  .select-option.highlighted {
    background: rgba(194, 65, 12, 0.3);
  }

  .no-options {
    padding: 12px;
    color: #a0aec0;
    font-size: 14px;
    text-align: center;
  }

  /* Dark theme compatibility - matches existing app styles */
  .themed .select-trigger {
    background: var(--background, #393939);
    border: var(--border, 1px solid #696969);
    color: var(--input-color, #ffffff);
  }

  .themed .select-trigger:hover {
    border-color: var(--border-hover, #c2410c);
  }

  .themed .select-trigger:focus {
    border-color: var(--border-focus, #c2410c);
  }

  .themed .select-dropdown {
    background: var(--list-background, #393939);
    border: var(--list-border, 1px solid #696969);
  }

  .themed .search-input {
    background: var(--background, #393939);
    border: var(--border, 1px solid #696969);
    color: var(--input-color, #ffffff);
  }

  .themed .search-input:focus {
    border-color: var(--border-focus, #c2410c);
  }

  .themed .select-option:hover {
    background: var(--item-hover-bg, #c2410c);
    color: var(--item-hover-color, #ffffff);
  }
</style>
