<script lang="ts">
  import type { SearchResults, SearchWithSeed } from '../skill_tree';
  import SearchResult from './SearchResult.svelte';

  interface Props {
    searchResults: SearchResults;
    highlight: (newSeed: number, passives: number[]) => void;
    groupResults?: boolean;
    jewel: number;
    conqueror: string;
  }

  let {
    searchResults,
    highlight,
    groupResults = true,
    jewel,
    conqueror
  }: Props = $props();

  //const computeSize = (r: SearchWithSeed) =>
  //  8 + 48 + r.skills.reduce((o, s) => o + 32 + Object.keys(s.stats).length * 24, 0);

  let expandedGroup = $state("");
</script>

{#if groupResults}
  <div class="flex flex-col overflow-auto">
    {#each Object.keys(searchResults.grouped)
      .map((x) => parseInt(x, 10))
      .sort((a, b) => a - b)
      .reverse() as number[] as k (k)}
      <button
        class="text-lg w-full p-2 px-4 bg-neutral-500/30 rounded flex flex-row justify-between mb-2"
        onclick={() => (expandedGroup === String(k) ? expandedGroup = "" : expandedGroup = String(k))}>
        <span>
          {k} Match{k > 1 ? 'es' : ''} [{searchResults.grouped[k].length}]
        </span>
        <span>
          {expandedGroup === String(k) ? '^' : 'V'}
        </span>
      </button>

      {#if expandedGroup === String(k)}
        <div class="flex flex-col overflow-auto min-h-[200px] mb-2">
          {#each searchResults.grouped[k] as item, index (index)}
            <div>
              <SearchResult set={item} {highlight} {jewel} {conqueror} />
            </div>
          {/each}
        </div>
      {/if}
    {/each}
  </div>
{:else}
  <div class="mt-4 flex flex-col overflow-auto">
    {#each searchResults.raw as item, index (index)}
      <div>
        <SearchResult set={item} {highlight} {jewel} {conqueror} />
      </div>
    {/each}
  </div>
{/if}
