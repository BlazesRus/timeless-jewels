<script lang="ts">
  import type { SearchResults, SearchWithSeed } from '$lib/skill_tree';
  import SearchResult from './SearchResult.svelte';
  import SvelteVirtualList from '@humanspeak/svelte-virtual-list';

  interface Props {
    searchResults: SearchResults;
    highlight: (newSeed: number, passives: number[]) => void;
    groupResults?: boolean;
    jewel: number;
    conqueror: string;
  }

  let { searchResults, highlight, groupResults = true, jewel, conqueror }: Props = $props();

  const computeSize = (r: SearchWithSeed) => 8 + 48 + r.skills.reduce((o, s) => o + 32 + Object.keys(s.stats).length * 24, 0);

  let expandedGroup = $state<number | null>(null);
</script>

{#if groupResults}
  <div class="flex flex-col overflow-auto">
    {#each Object.keys(searchResults.grouped)
      .map(x => parseInt(x))
      .sort((a, b) => a - b)
      .reverse() as k}
      <button class="text-lg w-full p-2 px-4 bg-gray-500 bg-opacity-30 rounded flex flex-row justify-between mb-2" onclick={() => (expandedGroup = expandedGroup === k ? null : k)}>
        <span>
          {k} Match{k > 1 ? 'es' : ''} [{searchResults.grouped[k]?.length || 0}]
        </span>
        <span>
          {expandedGroup === k ? '^' : 'V'}
        </span>
      </button>

      {#if expandedGroup === k}
        <div class="flex flex-col overflow-auto min-h-[200px] mb-2">
          <SvelteVirtualList 
            items={searchResults.grouped[k] || []} 
            defaultItemHeight={120}
            containerStyle="height: auto;"
            bufferSize={10}
          >
            {#snippet renderItem(item)}
              <SearchResult set={item} highlight={highlight} jewel={jewel} conqueror={conqueror} />
            {/snippet}
          </SvelteVirtualList>
        </div>
      {/if}
    {/each}
  </div>
{:else}
  <div class="mt-4 flex flex-col overflow-auto">
    <SvelteVirtualList 
      items={searchResults.raw}
      defaultItemHeight={120}
      containerStyle="height: auto;"
      bufferSize={15}
    >
      {#snippet renderItem(item)}
        <SearchResult set={item} highlight={highlight} jewel={jewel} conqueror={conqueror} />
      {/snippet}
    </SvelteVirtualList>
  </div>
{/if}
