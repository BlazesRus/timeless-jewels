<!-- 
Client-only ModernSelect wrapper - completely disables SSR for modern select functionality
Uses standard Svelte patterns with proper browser detection

 * Copyright (C) 2025 James Armstrong (github.com/BlazesRus)
 * Generated with GitHub Copilot assistance and Microsoft Copilot assistance
 *
 * MIT License
-->
<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  interface SelectItem {
    value: any;
    label: string;
  }

  // Export all props to pass through to the actual component
  export let items: SelectItem[] = [];
  export let value: SelectItem | undefined = undefined;
  export let placeholder: string = 'Select...';
  export let onchange: ((item: SelectItem | undefined) => void) | undefined = undefined;
  export let onclear: (() => void) | undefined = undefined;
  export let disabled: boolean = false;
  export let loading: boolean = false;
  export let maxHeight: number = 200;

  // Component loading state
  let mounted = false;

  onMount(() => {
    mounted = true;
  });

  // Handle selection changes for fallback select
  const handleFallbackChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const selectedValue = target.value;

    if (!selectedValue) {
      value = undefined;
      if (onchange) onchange(undefined);
      return;
    }

    const selectedItem = items.find(item => String(item.value) === selectedValue);
    if (selectedItem) {
      value = selectedItem;
      if (onchange) onchange(selectedItem);
    }
  };
</script>

{#if browser && mounted}
  <!-- Import and render the runes-based component only on client -->
  {#await import('./ModernSelectRunes.svelte') then { default: ModernSelectRunes }}
    <ModernSelectRunes items={items} bind:value={value} placeholder={placeholder} onchange={onchange} onclear={onclear} disabled={disabled} loading={loading} maxHeight={maxHeight} />
  {:catch error}
    <!-- Fallback to simple select on import error -->
    <select class="select-trigger-fallback" disabled={disabled} on:change={handleFallbackChange} value={value?.value || ''}>
      <option value="">{placeholder}</option>
      {#each items as item}
        <option value={item.value} selected={value?.value === item.value}>
          {item.label}
        </option>
      {/each}
    </select>
  {/await}
{:else}
  <!-- SSR fallback - simple select -->
  <select class="select-trigger-fallback" disabled={disabled} on:change={handleFallbackChange} value={value?.value || ''}>
    <option value="">{placeholder}</option>
    {#each items as item}
      <option value={item.value} selected={value?.value === item.value}>
        {item.label}
      </option>
    {/each}
  </select>
{/if}

<style>
  .select-trigger-fallback {
    width: 100%;
    min-height: 42px;
    padding: 8px 16px;
    border: 1px solid #4a5568;
    border-radius: 4px;
    background: #2d3748;
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .select-trigger-fallback:hover {
    border-color: #c2410c;
  }

  .select-trigger-fallback:focus {
    border-color: #c2410c;
    outline: none;
  }

  .select-trigger-fallback:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .select-trigger-fallback option {
    background: #2d3748;
    color: white;
    padding: 8px;
  }

  /* Dark theme compatibility */
  .select-trigger-fallback {
    background: var(--background, #393939);
    border: var(--border, 1px solid #696969);
    color: var(--input-color, #ffffff);
  }

  .select-trigger-fallback:hover {
    border-color: var(--border-hover, #c2410c);
  }

  .select-trigger-fallback:focus {
    border-color: var(--border-focus, #c2410c);
  }

  .select-trigger-fallback option {
    background: var(--background, #393939);
    color: var(--input-color, #ffffff);
  }
</style>
