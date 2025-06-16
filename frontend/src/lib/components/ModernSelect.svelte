<!-- 
Modern Select Component for Svelte 5
This is a placeholder implementation that provides the same API as svelte-select
but uses modern Svelte 5 features and could be replaced with a proper UI library
-->
<script lang="ts">
  interface SelectItem {
    value: any;
    label: string;
  }

  interface Props {
    items: SelectItem[];
    value?: SelectItem;
    placeholder?: string;
    onchange?: (item: SelectItem | undefined) => void;
  }

  let { items, value = $bindable(), placeholder, onchange }: Props = $props();

  let isOpen = $state(false);
  let searchTerm = $state('');
  
  const filteredItems = $derived(
    items.filter(item => 
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSelect = (item: SelectItem) => {
    value = item;
    isOpen = false;
    searchTerm = '';
    onchange?.(item);
  };

  const clear = () => {
    value = undefined;
    onchange?.(undefined);
  };

  // Expose clear method for parent components
  const selectRef = {
    clear,
    handleClear: clear // For compatibility with svelte-select API
  };

  // Bind this reference to the component
  export { selectRef as this };
</script>

<div class="modern-select relative">
  <button 
    class="modern-select-trigger w-full p-2 border border-gray-300 rounded bg-white text-left flex justify-between items-center"
    onclick={() => isOpen = !isOpen}
    type="button"
  >
    <span class="modern-select-value">
      {value?.label || placeholder || 'Select...'}
    </span>
    <svg 
      class="w-4 h-4 transition-transform"
      class:rotate-180={isOpen}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if isOpen}
    <div class="modern-select-dropdown absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
      <div class="p-2 border-b">
        <input
          type="text"
          bind:value={searchTerm}
          placeholder="Search..."
          class="w-full p-1 border border-gray-200 rounded text-sm"
        />
      </div>
      
      <div class="modern-select-options">
        {#if value}
          <button
            class="w-full p-2 text-left hover:bg-gray-100 text-red-600 border-b"
            onclick={clear}
            type="button"
          >
            Clear selection
          </button>
        {/if}
        
        {#each filteredItems as item}
          <button
            class="w-full p-2 text-left hover:bg-gray-100"
            class:bg-blue-50={value?.value === item.value}
            onclick={() => handleSelect(item)}
            type="button"
          >
            {item.label}
          </button>
        {/each}
        
        {#if filteredItems.length === 0}
          <div class="p-2 text-gray-500 text-sm">
            No items found
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- Click outside to close -->
<svelte:window onclick={(e) => {
  if (!e.target?.closest('.modern-select')) {
    isOpen = false;
  }
}} />

<style>
  .modern-select {
    /* Base styles handled by Tailwind classes */
  }
  
  .modern-select-dropdown {
    /* Additional styles if needed */
    max-height: 240px;
  }
</style>
