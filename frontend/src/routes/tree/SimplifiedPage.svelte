<script lang="ts">
  import SkillTree from '../../lib/components/SkillTree.svelte';
  import Select from 'svelte-select';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { Node } from '../../lib/skill_tree_types';
  import { getAffectedNodes, skillTree, translateStat, constructQueries } from '../../lib/skill_tree';
  import type { SearchResults } from '../../lib/skill_tree';
  import { modernWorker } from '../../lib/modern-worker';
  import type {
    Query,
    SearchConfig,
    StatConfig
  } from '../../lib/modern-worker-types';
  import SearchResultsComponent from '../../lib/components/SearchResults.svelte';
  import { statValues } from '../../lib/values';
  import { data, calculator } from '$lib/types';
  import TradeButton from '../../lib/components/TradeButton.svelte';
  import TradeLinks from '../../lib/components/TradeLinks.svelte';
  import { onMount } from 'svelte';
  // Store search params as reactive variable
  let searchParams: URLSearchParams;
  
  const jewels = Object.keys(data.TimelessJewels || {}).map((k) => ({
    value: parseInt(k),
    label: data.TimelessJewels[k]
  }));
  let selectedJewel: any = undefined;
  let searchParamsInitialized = false;
  let dropdownConqueror: any = undefined;
  let seed: number = 0;
  let circledNode: number | undefined = undefined;
  let selectedStats: Record<number, StatConfig> = {};
  let mode = '';

  // Initialize selections from URL after component mounts
  onMount(() => {
    if (browser) {
      try {
        const pageStore = $page;
        if (pageStore?.url?.searchParams) {
          searchParams = pageStore.url.searchParams;
          
          // Initialize selections from URL params
          if (searchParams.has('jewel')) {
            selectedJewel = jewels.find((j) => j.value === parseInt(searchParams.get('jewel') || '0'));
          }
          
          if (searchParams.has('conqueror')) {
            dropdownConqueror = {
              value: searchParams.get('conqueror') || '',
              label: searchParams.get('conqueror') || ''
            };
          }
          
          if (searchParams.has('seed')) {
            seed = parseInt(searchParams.get('seed') || '0');
          }
          
          if (searchParams.has('location')) {
            circledNode = parseInt(searchParams.get('location') || '0');
          }
          
          if (searchParams.has('stat')) {
            searchParams.getAll('stat').forEach((s) => {
              const nStat = parseInt(s);
              if (statValues[nStat]) {
                selectedStats[nStat] = {
                  id: nStat,
                  min: 1,
                  weight: 1,
                  minStatTotal: 1
                };
              }
            });
          }
          
          if (searchParams.has('mode')) {
            mode = searchParams.get('mode') || '';
          }
          
          searchParamsInitialized = true;
        }
      } catch (error) {
        console.warn('Could not access page store during SSR:', error);
      }
    }
  });

  $: conquerors = selectedJewel && data.TimelessJewelConquerors?.[selectedJewel.value]
    ? Object.keys(data.TimelessJewelConquerors[selectedJewel.value]).map((k) => ({
        value: k,
        label: k
      }))
    : [];
  $: dropdownConqs = conquerors.concat([{ value: 'Any', label: 'Any' }]);

  $: anyConqueror = dropdownConqueror?.value === 'Any';

  $: selectedConqueror = dropdownConqueror?.value === 'Any' ? conquerors[0] : dropdownConqueror;

  $: affectedNodes = circledNode
    ? getAffectedNodes(skillTree.nodes[circledNode]).filter((n) => !n.isJewelSocket && !n.isMastery)
    : [];

  $: seedResults =
    !seed ||
    !selectedJewel ||
    !selectedConqueror ||
    !data.TimelessJewelConquerors?.[selectedJewel.value] ||
    Object.keys(data.TimelessJewelConquerors[selectedJewel.value]).indexOf(selectedConqueror.value) < 0
      ? []
      : affectedNodes
          .filter((n) => data.TreeToPassive?.[n.skill])
          .map((n) => ({
            node: n.skill,
            result: calculator.Calculate(            data.TreeToPassive[n.skill].Index,
              seed,
              selectedJewel.value,
              selectedConqueror.value
            )
          }));

  const updateUrl = () => {
    if (!browser) return;
    
    const url = new URL(window.location.origin + window.location.pathname);
    if (selectedJewel) url.searchParams.append('jewel', selectedJewel.value.toString());
    if (dropdownConqueror) url.searchParams.append('conqueror', dropdownConqueror.value);
    if (seed) url.searchParams.append('seed', seed.toString());
    if (circledNode) url.searchParams.append('location', circledNode.toString());
    if (mode) url.searchParams.append('mode', mode);

    Object.keys(selectedStats).forEach((s) => {
      url.searchParams.append('stat', s.toString());
    });

    goto(url.toString());
  };

  const handleNodeClick = (node: Node) => {
    if (node.isJewelSocket) {
      circledNode = node.skill;
      updateUrl();
    }
  };// Add missing functions and variables that are referenced in the template
  let searchConfig: SearchConfig;
  let queries: Query[] = [];
  let searchResults: SearchResults = { grouped: {}, raw: [] };
  let isSearching = false;
  let showTradeLinks = false;

  // Generate trade queries from search results
  $: if (searchResults.raw.length > 0 && selectedJewel && selectedConqueror) {
    queries = constructQueries(
      selectedJewel.value,
      anyConqueror ? null : selectedConqueror.value,
      searchResults.raw
    );
  } else {
    queries = [];
  }

  const onPaste = (event: ClipboardEvent) => {
    // Handle paste event
    console.log('Paste event:', event);
  };

  const handleSearch = () => {
    // Implement search functionality
    isSearching = true;
    // ... search logic
    isSearching = false;
  };
</script>

<svelte:window on:paste={onPaste} />

<SkillTree
  bind:circledNode
  clickNode={handleNodeClick}
  selectedJewel={selectedJewel?.value || 0}
  selectedConqueror={selectedConqueror?.value || ''}
  seed={seed}
  highlighted={affectedNodes.map(n => n.skill)}
/>

<div class="controls">
  <Select
    items={jewels}
    bind:value={selectedJewel}
    placeholder="Select jewel..."
    on:change={updateUrl}
  />

  <Select
    items={dropdownConqs}
    bind:value={dropdownConqueror}
    placeholder="Select conqueror..."
    disabled={!selectedJewel}
    on:change={updateUrl}
  />

  <input
    type="number"
    bind:value={seed}
    placeholder="Seed"
    on:input={updateUrl}
  />

  <button on:click={handleSearch} disabled={isSearching}>
    {isSearching ? 'Searching...' : 'Search'}
  </button>
</div>

{#if searchResults.raw.length > 0}
  <SearchResultsComponent 
    {searchResults} 
    highlight={(newSeed, passives) => {
      seed = newSeed;
      // highlight logic
    }}
    jewel={selectedJewel?.value || 0}
    conqueror={selectedConqueror?.value || ''} 
  />
{/if}

<TradeButton {queries} bind:showTradeLinks />
{#if showTradeLinks}
  <TradeLinks {queries} />
{/if}

<style lang="postcss">
  .controls {
    @apply flex gap-4 p-4;
  }
</style>