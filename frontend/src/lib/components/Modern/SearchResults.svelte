<script lang="ts">
  import type { SearchResults, SearchWithSeed } from '$lib/skill_tree_modern';
  import SearchResult from '$lib/components/Modern/SearchResult.svelte';
  import VirtualList from 'svelte-tiny-virtual-list';

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
          <VirtualList height="auto" overscanCount={10} itemCount={searchResults.grouped[k]?.length || 0} itemSize={searchResults.grouped[k]?.map(computeSize) || []}>
            <div slot="item" let:index let:style style={style}>
              {#if searchResults.grouped[k]?.[index]}
                <SearchResult set={searchResults.grouped[k][index]} highlight={highlight} jewel={jewel} conqueror={conqueror} />
              {/if}
            </div>
          </VirtualList>
        </div>
      {/if}
    {/each}
  </div>
{:else}
  <div class="mt-4 flex flex-col overflow-auto">
    <VirtualList height="auto" overscanCount={15} itemCount={searchResults.raw.length} itemSize={searchResults.raw.map(computeSize)}>
      <div slot="item" let:index let:style style={style}>
        {#if searchResults.raw[index]}
          <SearchResult set={searchResults.raw[index]} highlight={highlight} jewel={jewel} conqueror={conqueror} />
        {/if}
      </div>
    </VirtualList>
  </div>
{/if}
