<!-- src/routes/tree/+page.svelte -->
<script lang="ts">
  // 1) Core imports & stores
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  //$state, $effect, $derived are already included without import in latest Svelte 5
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  import SkillTree from '$lib/components/Modern/SkillTree.svelte';
  import type { Node, AlternatePassiveSkillInformation, ConquerorOption, SearchState } from '$lib/skill_tree_types_modern';

  import ModernSelect from '$lib/components/Modern/ModernSelect.svelte';
  import SearchResultsComponent from '$lib/components/Modern/SearchResults.svelte';
  import TradeButton from '$lib/components/Modern/TradeButton.svelte';
  import TradeLinks from '$lib/components/TradeLinks.svelte';

  import { modernWorker } from '$lib/workers/modern-worker';
  import type { SearchConfig, SearchResults as SearchResultsType } from '$lib/workers/modern-worker-types';
  import type { JewelOption } from '$lib/skill_tree_types_modern';
  import { translateStat, constructQueries, getAffectedNodes, type StatConfig } from '$lib/skill_tree_modern';
  import { statValues } from '$lib/values';
  import { debugLog, addDebugMessage } from '$lib/ModernWasm/debugLogger.svelte';
  import { getTimelessJewelsData, isTimelessJewelsDataReady } from '$lib/services/wasiDataService.svelte.ts';

  // 2) Get data from WASI data service (all data is managed internally now)
  if (!isTimelessJewelsDataReady()) {
    throw new Error('WASI data service not ready. Layout should have initialized it.');
  }

  const wasiData = getTimelessJewelsData();
  const { Calculate } = wasiData.wasmFunctions;
  const {
    TreeToPassive,
    TimelessJewels: jewelMap,
    TimelessJewelConquerors: conquerorMap,
    TimelessJewelSeedRanges: seedRanges,
    PassiveSkills: passiveSkillArray,
    PossibleStats: possibleStatsJSON,
    SkillTree: skillTree
  } = wasiData;

  // 3) Build plain arrays from those maps with safe JSON parsing
  const jewels: JewelOption[] = Object.entries(jewelMap as Record<string, string>).map(([id, label]) => ({ value: +id, label: label as string }));

  // Safe JSON parsing for possibleStats
  const possibleStats = (() => {
    try {
      if (typeof possibleStatsJSON !== 'string') {
        console.error('❌ possibleStatsJSON is not a string:', typeof possibleStatsJSON);
        return {};
      }
      console.log('✅ Parsing possibleStats in tree page...');
      return JSON.parse(possibleStatsJSON as string);
    } catch (error) {
      console.error('❌ Failed to parse possibleStats in tree page:', error);
      return {};
    }
  })();

  // 4) Local reactive state

  // URL ↔ state helpers for stats mode
  let selectedJewel = $state<JewelOption>(jewels[0] || { value: 0, label: 'Unknown' });
  let selectedConqueror = $state<ConquerorOption>(jewels[0] && conquerorMap[jewels[0].value] ? { value: conquerorMap[jewels[0].value][0], label: conquerorMap[jewels[0].value][0] } : { value: 'Any', label: 'Any' });

  let circledNode = $state<number | undefined>(undefined);
  let seed = $state<number>(jewels[0] && seedRanges[jewels[0].value] ? seedRanges[jewels[0].value].Min : 0);

  // mode switch: 'seed' vs 'stats'
  let mode = $state<'seed' | 'stats'>('seed');

  // stats mode
  let selectedStats = $state<Record<number, StatConfig>>({});
  let statSelector = $state<any>(null);

  // “disable” toggles for tree nodes
  let disabled = $state<Set<number>>(new Set());

  // “search” context for your TradeLinks
  let showTradeLinks = $state(false);
  let groupResults = $state(browser ? (localStorage.getItem('groupResults') === null ? true : localStorage.getItem('groupResults') === 'true') : true);

  // seed mode result(s)
  let results = $state<any>(null);

  // sliders for stats mode
  let minTotalWeight = $state(0);
  let minTotalStats = $state(0);

  // reverse search mode
  let isSearching = $state(false);
  let currentSeed = $state(0);
  let searchResults = $state<SearchResultsType | undefined>(undefined);
  let searchJewel = $state(1);
  let searchConqueror = $state<string | null>(null);
  let searchParamsInitialized = $state(false);

  // 5) Derive URL searchParams
  const searchParams = $derived(page.url.searchParams);

  // Initialize selections from URL after component mounts
  onMount(() => {
    if (browser) {
      try {
        // Initialize selections from URL params
        if (searchParams.has('jewel')) {
          const foundJewel = jewels.find(j => j.value === parseInt(searchParams.get('jewel') || '0'));
          if (foundJewel) selectedJewel = foundJewel;
        }

        if (searchParams.has('conqueror')) {
          const c = searchParams.get('conqueror')!;
          if (conquerorMap[selectedJewel.value].includes(c)) {
            selectedConqueror = { value: c, label: c };
          }
        }

        if (searchParams.has('seed')) {
          seed = parseInt(searchParams.get('seed') || '0');
        }

        if (searchParams.has('location')) {
          circledNode = parseInt(searchParams.get('location') || '0');
        }

        if (searchParams.has('stat')) {
          searchParams.getAll('stat').forEach(s => {
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
        if (searchParams.has('mode')) {
          const modeParam = searchParams.get('mode') || '';
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

  // 6) Sync URL → state
  $effect(() => {
    if (searchParams.has('jewel')) {
      const id = +searchParams.get('jewel')!;
      selectedJewel = jewels.find(j => j.value === id) ?? selectedJewel;
    }
    if (searchParams.has('conqueror')) {
      const c = searchParams.get('conqueror')!;
      if (conquerorMap[selectedJewel.value].includes(c)) {
        selectedConqueror = { value: c, label: c };
      }
    }
    if (searchParams.has('seed')) {
      seed = +searchParams.get('seed')!;
    }
    if (searchParams.has('location')) {
      circledNode = +searchParams.get('location')!;
    }
    if (searchParams.has('mode')) {
      const m = searchParams.get('mode') as 'seed' | 'stats';
      mode = m;
    }
    // stats in URL would go here…
    for (const id of searchParams.getAll('stat').map(n => +n)) {
      if (!(id in selectedStats)) {
        selectedStats[id] = { id, min: 0, weight: 1, minStatTotal: 0 };
      }
    }
  });

  // 7) Derive conqueror options and reset seed on jewel change
  const conquerorOptions = $derived(selectedJewel && conquerorMap?.[selectedJewel.value] ? Object.keys(conquerorMap[selectedJewel.value] || {}).map((k): ConquerorOption => ({ value: k, label: k })) : [{ value: 'Any', label: 'Any' }]);
  const anyConqueror = $derived(selectedConqueror.value === 'Any');

  const affectedNodes = $derived(circledNode && skillTree.nodes[circledNode] ? getAffectedNodes(skillTree.nodes[circledNode]!).filter(n => !n.isJewelSocket && !n.isMastery) : []);

  const seedResults = $derived(
    !seed || !selectedJewel || !selectedConqueror || !conquerorMap?.[selectedJewel.value] || Object.keys(conquerorMap?.[selectedJewel.value] || {}).indexOf(selectedConqueror.value) < 0
      ? []
      : affectedNodes
          .filter(n => n.skill !== undefined && TreeToPassive?.[n.skill])
          .map(n => ({
            node: n.skill!,
            result: Calculate(TreeToPassive?.[n.skill!]?.Index || 0, seed, selectedJewel!.value, selectedConqueror.value)
          }))
  );

  // 14) URL sync helper
  function updateUrl() {
    if (!browser) return;
    const url = new URL(window.location.origin + window.location.pathname);
    if (selectedJewel) url.searchParams.append('jewel', selectedJewel.value.toString());
    if (selectedConqueror) url.searchParams.append('conqueror', selectedConqueror.value);
    if (seed) url.searchParams.append('seed', seed.toString());
    if (circledNode) url.searchParams.append('location', circledNode.toString());
    if (mode) url.searchParams.append('mode', mode);

    Object.keys(selectedStats).forEach(s => {
      url.searchParams.append('stat', s.toString());
    });

    goto(url.toString());
  }

  const setMode = (newMode: 'seed' | 'stats') => {
    mode = newMode;
    updateUrl();
  };

  let collapsed = $state(false);

  const handleNodeClick = (node: Node) => {
    if (node.skill === undefined) return;

    if (node.isJewelSocket) {
      circledNode = node.skill;
      updateUrl();
    } else if (!node.isMastery) {
      if (disabled.has(node.skill)) {
        disabled.delete(node.skill);
      } else {
        disabled.add(node.skill);
      }
      disabled = new Set(disabled);
    }
    addDebugMessage('Node click:' + node);
  };

  // 8) Stats mode helpers
  const allPossibleStats = $derived(possibleStats || {});

  const availableStats = $derived(!selectedJewel ? [] : Object.keys(allPossibleStats[selectedJewel.value] || {}));

  const statItems = $derived(
    Object.keys(possibleStats[selectedJewel.value] || {})
      .map(id => +id)
      .filter(id => !(id in selectedStats))
      .map(id => ({ value: id, label: translateStat(id) }))
  );

  function addStat(item: { value: number; label: string } | undefined) {
    if (!item) return;
    selectedStats[item.value] = { id: item.value, min: 0, weight: 1, minStatTotal: 0 };
    selectedStats = selectedStats;
    statSelector?.handleClear?.();
    updateUrl();
  }

  function removeStat(id: number) {
    delete selectedStats[id];
    selectedStats = selectedStats;
    updateUrl();
  }

  const changeJewel = () => {
    selectedStats = {};
    updateUrl();
  };

  let highlighted = $state<number[]>([]);

  const highlight = (newSeed: number, passives: number[]) => {
    seed = newSeed;
    highlighted = passives;
    updateUrl();
  };

  const selectAll = () => {
    disabled.clear();
    disabled = disabled;
  };

  const selectAllNotables = () => {
    affectedNodes.forEach(n => {
      if (n.isNotable && n.skill !== undefined) {
        disabled.delete(n.skill);
      }
    });
    disabled = disabled;
  };

  const selectAllPassives = () => {
    affectedNodes.forEach(n => {
      if (!n.isNotable && n.skill !== undefined) {
        disabled.delete(n.skill);
      }
    });
    disabled = disabled;
  };

  const deselectAll = () => {
    affectedNodes.filter(n => !n.isJewelSocket && !n.isMastery && n.skill !== undefined).forEach(n => disabled.add(n.skill!));
    disabled = disabled;
  };

  // Sort options
  const sortResults = [
    { label: 'Count', value: 'count' },
    { label: 'Alphabetical', value: 'alphabet' },
    { label: 'Rarity', value: 'rarity' },
    { label: 'Value', value: 'value' }
  ];

  // Local storage handling with Svelte 5 effects
  $effect(() => {
    if (browser) localStorage.setItem('groupResults', groupResults ? 'true' : 'false');
  });

  let sortOrder = $state(sortResults.find(r => r.value === (browser ? localStorage.getItem('sortOrder') || 'count' : 'count')));

  $effect(() => {
    if (browser && sortOrder) localStorage.setItem('sortOrder', sortOrder.value);
  });

  let colored = $state(browser ? (localStorage.getItem('colored') === null ? true : localStorage.getItem('colored') === 'true') : true);

  $effect(() => {
    if (browser) localStorage.setItem('colored', colored ? 'true' : 'false');
  });

  let split = $state(browser ? (localStorage.getItem('split') === null ? true : localStorage.getItem('split') === 'true') : true);

  $effect(() => {
    if (browser) localStorage.setItem('split', split ? 'true' : 'false');
  });

  // Types
  type CombinedResult = {
    id: string;
    rawStat: string;
    stat: string;
    passives: number[];
  };

  // Color mapping
  export const colorKeys = {
    physical: '#c79d93',
    cast: '#b3f8fe',
    fire: '#ff9a77',
    cold: '#93d8ff',
    lightning: '#f8cb76',
    attack: '#da814d',
    life: '#c96e6e',
    chaos: '#d8a7d3',
    unique: '#af6025',
    critical: '#b2a7d6'
  };

  const colorMessage = (message: string): string => {
    Object.keys(colorKeys).forEach(key => {
      const value = (colorKeys as any)[key];
      message = message.replace(new RegExp(`(${key}(?:$|\\s))|((?:^|\\s)${key})`, 'gi'), `<span style='color: ${value}; font-weight: bold'>$1$2</span>`);
    });

    return message;
  };

  const combineResults = (rawResults: { result: AlternatePassiveSkillInformation; node: number }[], withColors: boolean, only: 'notables' | 'passives' | 'all'): CombinedResult[] => {
    const mappedStats: { [key: number]: number[] } = {};
    rawResults.forEach(r => {
      const node = skillTree.nodes[r.node];
      if (!node || node.isKeystone) {
        return;
      }

      if (only !== 'all') {
        if (only === 'notables' && !node.isNotable) {
          return;
        }

        if (only === 'passives' && node.isNotable) {
          return;
        }
      }

      if (r.result.AlternatePassiveSkill?.StatsKeys) {
        r.result.AlternatePassiveSkill.StatsKeys.forEach((key: number) => {
          mappedStats[key] = [...(mappedStats[key] || []), r.node];
        });
      }

      if (r.result.AlternatePassiveAdditionInformations) {
        r.result.AlternatePassiveAdditionInformations.forEach((info: any) => {
          if (info.AlternatePassiveAddition?.StatsKeys) {
            info.AlternatePassiveAddition.StatsKeys.forEach((key: number) => {
              mappedStats[key] = [...(mappedStats[key] || []), r.node];
            });
          }
        });
      }
    });

    return Object.keys(mappedStats).map(statID => {
      const translated = translateStat(parseInt(statID));
      return {
        stat: withColors ? colorMessage(translated) : translated,
        rawStat: translated,
        id: statID,
        passives: mappedStats[parseInt(statID)] || []
      };
    });
  };

  const sortCombined = (combinedResults: CombinedResult[], order: 'count' | 'alphabet' | 'rarity' | 'value'): CombinedResult[] => {
    switch (order) {
      case 'alphabet':
        return combinedResults.sort((a, b) => a.rawStat.replace(/[#+%]/gi, '').trim().toLowerCase().localeCompare(b.rawStat.replace(/[#+%]/gi, '').trim().toLowerCase()));
      case 'count':
        return combinedResults.sort((a, b) => b.passives.length - a.passives.length);
      case 'rarity':
        return combinedResults.sort((a, b) => (selectedJewel ? (allPossibleStats[selectedJewel.value]?.[a.id] || 0) - (allPossibleStats[selectedJewel.value]?.[b.id] || 0) : 0));
      case 'value':
        return combinedResults.sort((a, b) => {
          const aValue = (statValues as any)[a.id] || 0;
          const bValue = (statValues as any)[b.id] || 0;
          if (aValue != bValue) {
            return bValue - aValue;
          }
          return selectedJewel ? (allPossibleStats[selectedJewel.value]?.[a.id] || 0) - (allPossibleStats[selectedJewel.value]?.[b.id] || 0) : 0;
        });
      default:
        return combinedResults;
    }
  };

  // 10) Paste handler
  const onPaste = (event: ClipboardEvent) => {
    if (event.type !== 'paste') {
      return;
    }

    const paste = (event.clipboardData || (window as any).clipboardData).getData('text');
    const lines = paste.split('\n');

    if (lines.length < 14) {
      return;
    }
    const jewel = jewels.find(j => j.label === lines[2]);
    if (!jewel) {
      return;
    }

    let newSeed: number | undefined;
    let conqueror: string | undefined;
    for (let i = 10; i < lines.length; i++) {
      conqueror = Object.keys(conquerorMap?.[jewel.value] || {}).find(k => lines[i].indexOf(k) >= 0);
      if (conqueror) {
        const matches = /(\d+)/.exec(lines[i]);
        if (!matches || matches.length === 0 || !matches[1]) {
          continue;
        }

        newSeed = parseInt(matches[1]);
        break;
      }
    }

    if (!conqueror || !newSeed) {
      return;
    }

    results = false;
    mode = 'seed';
    seed = newSeed;
    selectedJewel = jewel;
    selectedConqueror = { label: conqueror, value: conqueror };
    updateUrl();
    addDebugMessage('Paste event:' + event);
  };

  // 11) Search / reverse search
  async function handleSearch() {
    if (circledNode == null || !modernWorker) return;
    isSearching = true;
    searchResults = undefined;

    const config: SearchConfig = {
      jewel: selectedJewel.value,
      conqueror: selectedConqueror.value,
      nodes: getAffectedNodes(skillTree.nodes[circledNode])
        .filter(n => !n.isJewelSocket && !n.isMastery)
        .map(n => TreeToPassive[n.skill!].PassiveSkillGraphID),
      stats: Object.values(selectedStats),
      minTotalWeight: 0,
      minTotalStats: 0
    };

    searchResults = await modernWorker.reverseSearch(config, async (s: number): Promise<void> => {
      currentSeed = s;
    });
    isSearching = false;
  }

  // 12) Compute seed mode result
  $effect(() => {
    if (Calculate && circledNode != null && mode === 'seed') {
      const pid = TreeToPassive[circledNode].PassiveSkillGraphID;
      results = Calculate(pid, seed, selectedJewel.value, selectedConqueror.value);
    }
  });

  // 13) Trade queries
  const queries = $derived(searchResults ? constructQueries(selectedJewel.value, selectedConqueror.value, searchResults.raw) : []);
</script>

<svelte:window on:paste={onPaste} />

<SkillTree bind:circledNode={circledNode} clickNode={handleNodeClick} selectedJewel={selectedJewel?.value || 0} selectedConqueror={selectedConqueror?.value || 'Any'} highlighted={highlighted} seed={seed} highlightJewels={!circledNode} disabled={[...disabled]}>
  {#if !collapsed}
    <div class="w-screen md:w-10/12 lg:w-2/3 xl:w-1/2 2xl:w-5/12 3xl:w-1/3 4xl:w-1/4 absolute top-0 left-0 opacity-80 backdrop-blur-sm themed rounded-br-lg max-h-screen" style="background-color: rgba(0,0,0,0.8);">
      <div class="p-4 max-h-screen flex flex-col">
        <div class="flex flex-row justify-between mb-2">
          <div class="flex flex-row items-center">
            <button class="burger-menu mr-3" aria-label="Open menu" onclick={() => (collapsed = true)}>
              <div></div>
              <div></div>
              <div></div>
            </button>

            <h3 class="flex-grow">
              {#if results}
                <span>Results</span>
              {:else}
                <span>Timeless Jewel</span>
              {/if}
            </h3>
          </div>
          {#if searchResults}
            <div class="flex flex-row">
              {#if results}
                <TradeButton queries={queries} bind:showTradeLinks={showTradeLinks} />
                <button class="p-1 px-3 bg-blue-500/40 rounded disabled:bg-blue-900/40 mr-2" class:grouped={groupResults} onclick={() => (groupResults = !groupResults)} disabled={!searchResults}>Grouped</button>
              {/if}
              <button class="bg-neutral-100/20 px-4 p-1 rounded" onclick={() => (results = !results)}>{results ? 'Config' : 'Results'}</button>
            </div>
          {/if}
        </div>
        {#if !results}
          <ModernSelect items={jewels} bind:value={selectedJewel} placeholder="Select jewel..." onchange={changeJewel} />
          {#if selectedJewel}
            <div class="mt-4">
              <h3 class="mb-2">Conqueror</h3>
              <ModernSelect items={conquerorOptions} bind:value={selectedConqueror} placeholder="Select conqueror..." onchange={updateUrl} />
            </div>

            {#if selectedConqueror && conquerorMap?.[selectedJewel.value] && Object.keys(conquerorMap[selectedJewel.value] || {}).indexOf(selectedConqueror.value) >= 0}
              <!-- Mode toggle -->
              <div class="mode-tabs">
                <button class:selected={mode === 'seed'} onclick={() => ((mode = 'seed'), updateUrl())}>Seed</button>
                <button class:selected={mode === 'stats'} onclick={() => ((mode = 'stats'), updateUrl())}>Stats</button>
              </div>

              {#if mode === 'seed'}
                <div class="mt-4">
                  <h3 class="mb-2">Seed</h3>
                  <input type="number" bind:value={seed} placeholder="Seed" onblur={updateUrl} oninput={updateUrl} min={seedRanges?.[selectedJewel.value]?.Min || 0} max={seedRanges?.[selectedJewel.value]?.Max || 999999} />
                  {#if seed < (seedRanges?.[selectedJewel.value]?.Min || 0) || seed > (seedRanges?.[selectedJewel.value]?.Max || 999999)}
                    <div class="mt-2">
                      Seed must be between {seedRanges?.[selectedJewel.value]?.Min || 0}
                      and {seedRanges?.[selectedJewel.value]?.Max || 999999}
                    </div>
                  {/if}
                </div>

                {#if seed >= (seedRanges?.[selectedJewel.value]?.Min || 0) && seed <= (seedRanges?.[selectedJewel.value]?.Max || 999999)}
                  <div class="flex flex-row mt-4 items-end">
                    <div class="flex-grow">
                      <h3 class="mb-2">Sort Order</h3>
                      <ModernSelect items={sortResults} bind:value={sortOrder} />
                    </div>
                    <div class="ml-2">
                      <button class="opacity-50 p-2 px-4 rounded border border-gray-300" class:selected={colored} onclick={() => (colored = !colored)}>Colors</button>
                    </div>
                    <div class="ml-2">
                      <button class="opacity-50 p-2 px-4 rounded border border-gray-300" class:selected={split} onclick={() => (split = !split)}>Split</button>
                    </div>
                  </div>

                  {#if !split}
                    <div class="mt-4 overflow-auto" class:rainbow={colored}>
                      {#each sortCombined(combineResults(seedResults, colored, 'all'), (sortOrder?.value as 'count' | 'alphabet' | 'rarity' | 'value') || 'count') as r}
                        <button class="cursor-pointer block w-full text-left hover:bg-gray-700/30 p-1 rounded" onclick={() => highlight(seed, r.passives)}>
                          <span class="font-bold" class:text-white={((statValues as any)[r.id] || 0) < 3}>
                            ({r.passives.length})
                          </span>
                          <span class="text-white">{@html r.stat}</span>
                        </button>
                      {/each}
                    </div>
                  {:else}
                    <div class="overflow-auto mt-4">
                      <h3>Notables</h3>
                      <div class="mt-1" class:rainbow={colored}>
                        {#each sortCombined(combineResults(seedResults, colored, 'notables'), (sortOrder?.value as 'count' | 'alphabet' | 'rarity' | 'value') || 'count') as r}
                          <button class="cursor-pointer block w-full text-left hover:bg-gray-700/30 p-1 rounded" onclick={() => highlight(seed, r.passives)}>
                            <span class="font-bold" class:text-white={((statValues as any)[r.id] || 0) < 3}>
                              ({r.passives.length})
                            </span>
                            <span class="text-white">{@html r.stat}</span>
                          </button>
                        {/each}
                      </div>

                      <h3 class="mt-2">Smalls</h3>
                      <div class="mt-1" class:rainbow={colored}>
                        {#each sortCombined(combineResults(seedResults, colored, 'passives'), (sortOrder?.value as 'count' | 'alphabet' | 'rarity' | 'value') || 'count') as r}
                          <button class="cursor-pointer block w-full text-left hover:bg-gray-700/30 p-1 rounded" onclick={() => highlight(seed, r.passives)}>
                            <span class="font-bold" class:text-white={((statValues as any)[r.id] || 0) < 3}>
                              ({r.passives.length})
                            </span>
                            <span class="text-white">{@html r.stat}</span>
                          </button>
                        {/each}
                      </div>
                    </div>
                  {/if}
                {/if}
              {:else if mode === 'stats'}
                <!-- Stats mode -->
                <ModernSelect items={statItems} placeholder="Add stat…" bind:this={statSelector} onchange={addStat} />
                {#if Object.keys(selectedStats).length > 0}
                  <div class="mt-4 flex flex-col overflow-auto min-h-[100px]">
                    {#each Object.values(selectedStats) as cfg (cfg.id)}
                      <div class="stat-config">
                        <button onclick={() => removeStat(cfg.id)}>×</button>
                        {translateStat(cfg.id)}
                        <input type="number" bind:value={cfg.min} oninput={updateUrl} />
                        <input type="number" bind:value={cfg.weight} oninput={updateUrl} />
                        <input type="number" bind:value={cfg.minStatTotal} oninput={updateUrl} />
                      </div>
                    {/each}
                  </div>
                  <div class="flex flex-col mt-2">
                    <div class="flex flex-row items-center">
                      <div class="mr-2 min-w-fit">Min Total Weight:</div>
                      <input type="number" min="0" bind:value={minTotalWeight} />
                    </div>
                    <div class="flex flex-row items-center">
                      <div class="mr-2 min-w-fit">Minimum Stat Total:</div>
                      <input type="number" min="0" bind:value={minTotalStats} />
                    </div>
                  </div>
                  <div class="flex flex-col mt-4">
                    <div class="flex flex-row">
                      <button class="p-2 px-2 bg-yellow-500/40 rounded disabled:bg-yellow-900/40 mr-2" onclick={selectAll} disabled={isSearching || disabled.size == 0}>Select All</button>
                      <button class="p-2 px-2 bg-yellow-500/40 rounded disabled:bg-yellow-900/40 mr-2" onclick={selectAllNotables} disabled={isSearching || disabled.size == 0}>Notables</button>
                      <button class="p-2 px-2 bg-yellow-500/40 rounded disabled:bg-yellow-900/40 mr-2" onclick={selectAllPassives} disabled={isSearching || disabled.size == 0}>Passives</button>
                      <button class="p-2 px-2 bg-yellow-500/40 rounded disabled:bg-yellow-900/40 flex-grow" onclick={deselectAll} disabled={isSearching || disabled.size >= affectedNodes.length}>Deselect</button>
                    </div>
                    <div class="flex flex-row mt-2">
                      <button class="p-2 px-3 bg-green-500/40 rounded disabled:bg-green-900/40 flex-grow" onclick={handleSearch} disabled={isSearching}>
                        {#if isSearching}
                          Searching... {currentSeed} / {seedRanges?.[selectedJewel.value]?.Max || 'Unknown'}
                        {:else}
                          Search
                        {/if}
                      </button>
                    </div>
                  </div>
                {/if}
              {/if}

              {#if !circledNode}
                <h2 class="mt-4">Click on a jewel socket</h2>
              {/if}
            {/if}
          {/if}
        {/if}

        {#if searchResults && results}
          {#if showTradeLinks}
            <TradeLinks queries={queries} />
          {/if}
          <SearchResultsComponent searchResults={searchResults} groupResults={groupResults} highlight={highlight} jewel={searchJewel} conqueror={searchConqueror || ''} />
        {/if}
      </div>
    </div>
  {:else}
    <button class="burger-menu absolute top-0 left-0 opacity-80 backdrop-blur-sm rounded-br-lg p-4 pt-5" style="background-color: rgba(0,0,0,0.8);" aria-label="Close menu" onclick={() => (collapsed = false)}>
      <div></div>
      <div></div>
      <div></div>
    </button>
  {/if}

  <div class="footer-links">
    <a href="https://github.com/BlazesRus/timeless-jewels" target="_blank" rel="noopener">Source (Github)</a>
    <span>|</span>
    <a href="/timeless-jewels/licenses.html" target="_blank" rel="noopener">Licenses</a>
  </div>
</SkillTree>

<style lang="postcss">
  @reference "../../app.css";

  .mode-tabs button {
    padding: 0.5rem 1rem;
  }
  .mode-tabs button.selected {
    background: #444;
    color: white;
  }

  .stat-config {
    margin: 0.5rem 0;
    display: flex;
    gap: 0.5rem;
  }

  .footer-links {
    margin-top: 1rem;
    text-align: right;
    font-size: 0.875rem;
  }
  .footer-links a {
    color: var(--accent-color, #f90);
    text-decoration: none;
  }

  .selected {
    @apply bg-neutral-100/20;
  }

  .grouped {
    @apply bg-pink-500/40;
  }

  .grouped:disabled {
    @apply bg-pink-900/40;
  }

  .rainbow {
    animation: colorRotate 2s linear 0s infinite;
  }

  @keyframes colorRotate {
    0% {
      color: hsl(0deg, 100%, 50%);
    }

    25% {
      color: hsl(90deg, 100%, 50%);
    }

    50% {
      color: hsl(180deg, 100%, 50%);
    }

    75% {
      color: hsl(270deg, 100%, 50%);
    }

    100% {
      color: hsl(359deg, 100%, 50%);
    }
  }
</style>
