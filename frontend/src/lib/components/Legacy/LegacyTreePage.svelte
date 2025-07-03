<!-- Svelte 4 specific implementation of the tree page -->
<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import SkillTree from '$lib/components/Legacy/SkillTree.svelte';
  import type { Node } from '$lib/skill_tree_types_legacy';
  import { getAffectedNodes, skillTree, translateStat, constructQueries } from '$lib/skill_tree_legacy';

  import { syncWorker, syncWrap } from '$lib/worker_legacy';
  import type { WorkerType } from '$lib/sync_worker_legacy';
  import type { Query, Filter, SearchWithSeed, ReverseSearchConfig, SearchResults, StatConfig } from '$lib/skill_tree_legacy';

  import SearchResultsComponent from '$lib/components/SearchResults.svelte';
  import { statValues } from '$lib/values';
  import { data, calculator } from '$lib/types/LegacyTypes.js';

  import TradeButton from '$lib/components/TradeButton.svelte';
  import TradeLinks from '$lib/components/TradeLinks.svelte';
  import Select from 'svelte-select';

  interface JewelOption {
    value: number;
    label: string;
  }

  interface ConquerorOption {
    value: string;
    label: string;
  }

  interface SearchState {
    seed: number;
    location: number;
    stats: Array<{ id: number; min: number; weight: number; minStatTotal: number }>;
  }

  let dataValue: any;
  let calculatorValue: any;

  // Legacy Svelte 4 store subscriptions
  const unsubscribeData = data.subscribe(value => {
    dataValue = value;
  });

  const unsubscribeCalculator = calculator.subscribe(value => {
    calculatorValue = value;
  });

  // Cleanup subscriptions on destroy
  import { onDestroy } from 'svelte';
  onDestroy(() => {
    unsubscribeData();
    unsubscribeCalculator();
  });

  // Derived jewel options
  $: jewels = Object.keys(dataValue?.TimelessJewels || {}).map(k => ({
    value: parseInt(k),
    label: dataValue?.TimelessJewels?.[k] || ''
  }));

  // State variables
  let selectedJewel: JewelOption | undefined = undefined;
  let searchParamsInitialized = false;
  let dropdownConqueror: ConquerorOption | undefined = undefined;
  let seed = 0;
  let circledNode: number | undefined = undefined;
  let selectedStats: Record<number, StatConfig> = {};
  let mode: 'seed' | 'stats' | '' = '';

  // Initialize selections from URL after component mounts
  onMount(() => {
    if (browser) {
      try {
        // Initialize selections from URL params
        if ($page.url.searchParams.has('jewel')) {
          selectedJewel = jewels.find(j => j.value === parseInt($page.url.searchParams.get('jewel') || '0'));
        }

        if ($page.url.searchParams.has('conqueror')) {
          dropdownConqueror = {
            value: $page.url.searchParams.get('conqueror') || '',
            label: $page.url.searchParams.get('conqueror') || ''
          };
        }

        if ($page.url.searchParams.has('seed')) {
          seed = parseInt($page.url.searchParams.get('seed') || '0');
        }

        if ($page.url.searchParams.has('location')) {
          circledNode = parseInt($page.url.searchParams.get('location') || '0');
        }

        if ($page.url.searchParams.has('stat')) {
          $page.url.searchParams.getAll('stat').forEach(s => {
            const nStat = parseInt(s);
            if ((statValues as any)[nStat]) {
              selectedStats[nStat] = {
                id: nStat,
                min: 1,
                weight: 1,
                minStatTotal: 1
              };
            }
          });
        }
        if ($page.url.searchParams.has('mode')) {
          const modeParam = $page.url.searchParams.get('mode') || '';
          if (modeParam === 'seed' || modeParam === 'stats') {
            mode = modeParam;
          }
        }

        searchParamsInitialized = true;
      } catch (error) {
        console.warn('Could not access page store during SSR:', error);
      }
    }
  });

  const updateUrl = () => {
    if (!browser) return;

    const url = new URL(window.location.href);
    url.searchParams.delete('jewel');
    url.searchParams.delete('conqueror');
    url.searchParams.delete('seed');
    url.searchParams.delete('location');
    url.searchParams.delete('mode');
    url.searchParams.delete('stat');

    if (selectedJewel) url.searchParams.append('jewel', selectedJewel.value.toString());
    if (dropdownConqueror) url.searchParams.append('conqueror', dropdownConqueror.value);
    if (seed) url.searchParams.append('seed', seed.toString());
    if (circledNode) url.searchParams.append('location', circledNode.toString());
    if (mode) url.searchParams.append('mode', mode);

    Object.keys(selectedStats).forEach(s => {
      url.searchParams.append('stat', s.toString());
    });

    goto(url.toString());
  };

  const setMode = (newMode: 'seed' | 'stats') => {
    mode = newMode;
    updateUrl();
  };

  let disabled = new Set<number>();
  const handleNodeClick = (node: Node) => {
    if (node.skill === undefined) return;

    if (node.isJewelSocket) {
      circledNode = node.skill;
      updateUrl();
    } else {
      if (disabled.has(node.skill)) {
        disabled.delete(node.skill);
      } else {
        disabled.add(node.skill);
      }
      disabled = disabled;
    }
  };

  // Rest of the component logic...
  // (I'll continue with the remaining parts in the next response due to length)
</script>

<!-- Legacy Tree Page HTML will be added here -->
<div class="min-h-screen bg-gray-900 text-white">
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center mb-8">Legacy Tree View</h1>

    <!-- Jewel Selection -->
    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">Timeless Jewel</label>
      <Select items={jewels} bind:value={selectedJewel} on:change={updateUrl} />
    </div>

    <!-- Conqueror Selection -->
    {#if selectedJewel}
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Conqueror</label>
        <Select bind:value={dropdownConqueror} on:change={updateUrl} />
      </div>
    {/if}

    <!-- Seed Input -->
    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">Seed</label>
      <input type="number" bind:value={seed} on:input={updateUrl} class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" />
    </div>

    <!-- Mode Selection -->
    <div class="mb-4">
      <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded mr-2" class:bg-blue-800={mode === 'seed'} on:click={() => setMode('seed')}>Seed Mode</button>
      <button class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded" class:bg-green-800={mode === 'stats'} on:click={() => setMode('stats')}>Stats Mode</button>
    </div>

    <!-- Skill Tree Component -->
    {#if skillTree && selectedJewel}
      <SkillTree skillTree={skillTree} highlightedNodes={[]} disabled={disabled} circledNode={circledNode} on:nodeClick={e => handleNodeClick(e.detail)} />
    {/if}
  </div>
</div>
