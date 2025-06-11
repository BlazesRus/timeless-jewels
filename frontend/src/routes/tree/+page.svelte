<script lang="ts">
  import SkillTree from '../../lib/components/SkillTree.svelte';
  import Select from 'svelte-select';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { Node } from '../../lib/skill_tree_types';
  import { getAffectedNodes, skillTree, translateStat, constructQueries } from '../../lib/skill_tree';
  import { syncWrap } from '../../lib/worker';
  import { proxy } from 'comlink';
  import type {
    Query,
    ReverseSearchConfig,
    StatConfig,
    SearchResults as SearchResultsType
  } from '../../lib/skill_tree';
  import SearchResults from '../../lib/components/SearchResults.svelte';
  import { statValues } from '../../lib/values';
  import { data, calculator } from '../../lib/types';
  import TradeButton from '$lib/components/TradeButton.svelte';
  import TradeLinks from '$lib/components/TradeLinks.svelte';

  const searchParams = $page.url.searchParams;

  // Reactive state using Svelte 5 patterns
  let selectedJewel = $state<{ value: number; label: string } | undefined>(undefined);
  let selectedConqueror = $state<{ value: string; label: string } | undefined>(undefined);
  let dropdownConqueror = $state<{ value: string | null; label: string | null } | undefined>(undefined);
  let seed = $state<number>(0);
  let circledNode = $state<number | undefined>(undefined);
  let selectedStats = $state<Record<number, StatConfig>>({});
  let mode = $state<string>('');
  let disabled = $state(new Set<number>());
  let results = $state<boolean>(false);
  let minTotalWeight = $state<number>(0);
  let minTotalStats = $state<number>(0);
  let searching = $state<boolean>(false);
  let currentSeed = $state<number>(0);
  let searchResults = $state<SearchResultsType | undefined>(undefined);
  let searchJewel = $state<number>(1);
  let searchConqueror = $state<string | null>(null);
  let highlighted = $state<number[]>([]);
  let groupResults = $state<boolean>(true);
  // Component reference
  let statSelector = $state<Select>();

  // Derived data that depends on WASM loading
  let jewels = $derived(() => {
    if (!data?.TimelessJewels) return [];
    return Object.keys(data.TimelessJewels).map((k) => ({
      value: parseInt(k),
      label: data.TimelessJewels![parseInt(k)]
    }));
  });

  let conquerors = $derived(() => {
    if (!selectedJewel || !data?.TimelessJewelConquerors?.[selectedJewel.value]) return [];
    const conquerorData = data.TimelessJewelConquerors[selectedJewel.value];
    if (!conquerorData) return [];
    return Object.keys(conquerorData).map((k) => ({
      value: k,
      label: k
    }));
  });

  let dropdownConqs = $derived(() => conquerors().concat([{ value: 'Any', label: 'Any' }]));

  let anyConqueror = $derived(() => dropdownConqueror?.value === 'Any');

  // Initialize from URL parameters when data is available
  $effect(() => {
    if (!data?.TimelessJewels || jewels().length === 0) return;

    if (searchParams.has('jewel') && !selectedJewel) {
      const jewelParam = searchParams.get('jewel');
      if (jewelParam) {
        const jewel = jewels().find((j) => j.value === parseInt(jewelParam));
        if (jewel) selectedJewel = jewel;
      }
    }

    if (searchParams.has('conqueror') && !dropdownConqueror) {
      const conquerorParam = searchParams.get('conqueror');
      if (conquerorParam) {
        dropdownConqueror = {
          value: conquerorParam,
          label: conquerorParam
        };
      }
    }

    if (searchParams.has('seed') && seed === 0) {
      const seedParam = searchParams.get('seed');
      if (seedParam) {
        const parsedSeed = parseInt(seedParam);
        if (!isNaN(parsedSeed)) seed = parsedSeed;
      }
    }

    if (searchParams.has('location') && !circledNode) {
      const locationParam = searchParams.get('location');
      if (locationParam) {
        const parsedLocation = parseInt(locationParam);
        if (!isNaN(parsedLocation)) circledNode = parsedLocation;
      }
    }

    if (searchParams.has('mode') && !mode) {
      const modeParam = searchParams.get('mode');
      if (modeParam) mode = modeParam;
    }

    if (searchParams.has('stat') && Object.keys(selectedStats).length === 0) {
      const newStats: Record<number, StatConfig> = {};
      searchParams.getAll('stat').forEach((s) => {
        const nStat = parseInt(s);
        if (!isNaN(nStat)) {
          newStats[nStat] = {
            weight: 1,
            min: 0,
            minStatTotal: 0,
            id: nStat
          };
        }
      });
      selectedStats = newStats;
    }

    // Initialize localStorage groupResults
    const storedGroupResults = localStorage.getItem('groupResults');
    if (storedGroupResults !== null) {
      groupResults = storedGroupResults === 'true';
    }
  });

  // Update selectedConqueror based on dropdownConqueror
  $effect(() => {
    if (anyConqueror() && conquerors().length > 0) {
      selectedConqueror = conquerors()[0];
    } else if (dropdownConqueror && dropdownConqueror.value !== 'Any') {
      selectedConqueror = dropdownConqueror as { value: string; label: string };
    }
  });
  // Derived computed values
  let affectedNodes = $derived(() => {
    if (!circledNode || !skillTree?.nodes?.[circledNode]) return [];
    return getAffectedNodes(skillTree.nodes[circledNode]).filter((n) => !n.isJewelSocket && !n.isMastery);
  });
  let seedResults = $derived(() => {
    if (!seed || !selectedJewel || !selectedConqueror || !data?.TimelessJewelConquerors?.[selectedJewel.value]) {
      return [];
    }

    const conquerorData = data.TimelessJewelConquerors[selectedJewel.value];
    if (!conquerorData || !Object.keys(conquerorData).includes(selectedConqueror.value)) {
      return [];
    }

    if (!data?.TreeToPassive) return [];

    return affectedNodes()
      .filter((n) => n.skill !== undefined && data.TreeToPassive![n.skill])
      .map((n) => ({
        node: n.skill!,
        result: calculator.Calculate(
          data.TreeToPassive![n.skill!]?.Index || 0,
          seed,
          selectedJewel!.value,
          selectedConqueror!.value
        )
      }));
  });

  let allPossibleStats = $derived(() => {
    if (!data?.PossibleStats) return {};
    return JSON.parse(data.PossibleStats) as { [key: string]: { [key: string]: number } };
  });

  let availableStats = $derived(() => {
    if (!selectedJewel || !allPossibleStats()[selectedJewel.value]) return [];
    return Object.keys(allPossibleStats()[selectedJewel.value]);
  });

  let statItems = $derived(() => {
    return availableStats()
      .map((statId) => {
        const id = parseInt(statId);
        return {
          label: translateStat(id),
          value: id
        };
      })
      .filter((s) => !(s.value in selectedStats));
  });

  // Save to localStorage when groupResults changes
  $effect(() => {
    localStorage.setItem('groupResults', groupResults ? 'true' : 'false');
  });

  const updateUrl = () => {
    const url = new URL(window.location.origin + window.location.pathname);
    if (selectedJewel) url.searchParams.append('jewel', selectedJewel.value.toString());
    if (dropdownConqueror?.value) url.searchParams.append('conqueror', dropdownConqueror.value);
    if (seed) url.searchParams.append('seed', seed.toString());
    if (circledNode) url.searchParams.append('location', circledNode.toString());
    if (mode) url.searchParams.append('mode', mode);

    Object.keys(selectedStats).forEach((s) => {
      url.searchParams.append('stat', s.toString());
    });

    goto(url.toString());
  };
  const setMode = (newMode: string) => {
    mode = newMode;
    updateUrl();
  };
  const clickNode = (node: Node) => {
    if (node.isJewelSocket) {
      circledNode = node.skill;
      updateUrl();
    } else if (!node.isMastery && node.skill !== undefined) {
      const newDisabled = new Set(disabled);
      if (newDisabled.has(node.skill)) {
        newDisabled.delete(node.skill);
      } else {
        newDisabled.add(node.skill);
      }
      disabled = newDisabled;
    }
  };

  const selectStat = (stat: CustomEvent) => {
    const newStats = { ...selectedStats };
    newStats[stat.detail.value] = {
      weight: 1,
      min: 0,
      minStatTotal: 0,
      id: stat.detail.value
    };
    selectedStats = newStats;
    statSelector?.handleClear();
    updateUrl();
  };

  const removeStat = (id: number) => {
    const newStats = { ...selectedStats };
    delete newStats[id];
    selectedStats = newStats;
    updateUrl();
  };

  const changeJewel = () => {
    selectedStats = {};
    updateUrl();
  };

  const search = () => {
    if (!circledNode || !selectedJewel || !selectedConqueror) {
      return;
    }

    searchJewel = selectedJewel.value;
    searchConqueror = anyConqueror() ? null : selectedConqueror.value;
    searching = true;
    searchResults = undefined;

    if (!data?.TreeToPassive) return;
    const query: ReverseSearchConfig = {
      jewel: selectedJewel.value,
      conqueror: selectedConqueror.value,
      nodes: affectedNodes()
        .filter((n) => n.skill !== undefined && !disabled.has(n.skill))
        .map((n) => data.TreeToPassive![n.skill!])
        .filter((n) => !!n)
        .map((n) => n.Index),
      stats: Object.values(selectedStats),
      minTotalWeight,
      minTotalStats
    };

    syncWrap
      .search(
        query,
        proxy((s: number) => (currentSeed = s))
      )
      .then((result: SearchResultsType) => {
        searchResults = result;
        searching = false;
        results = true;
      });
  };
  const highlight = (newSeed: number, passives: number[]) => {
    seed = newSeed;
    highlighted = passives;
    updateUrl();
  };

  const selectAll = () => {
    disabled = new Set();
  };
  const selectAllNotables = () => {
    const newDisabled = new Set(disabled);
    affectedNodes().forEach((n) => {
      if (n.isNotable && n.skill !== undefined) {
        newDisabled.delete(n.skill);
      }
    });
    disabled = newDisabled;
  };

  const selectAllPassives = () => {
    const newDisabled = new Set(disabled);
    affectedNodes().forEach((n) => {
      if (!n.isNotable && n.skill !== undefined) {
        newDisabled.delete(n.skill);
      }
    });
    disabled = newDisabled;
  };

  const deselectAll = () => {
    const newDisabled = new Set<number>();
    affectedNodes()
      .filter((n) => !n.isJewelSocket && !n.isMastery && n.skill !== undefined)
      .forEach((n) => newDisabled.add(n.skill!));
    disabled = newDisabled;
  };

  type CombinedResult = {
    id: string;
    rawStat: string;
    stat: string;
    passives: number[];
  };
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
  } as const;
  const colorMessage = (message: string): string => {
    Object.keys(colorKeys).forEach((key) => {
      const value = colorKeys[key as keyof typeof colorKeys];
      message = message.replace(
        new RegExp(`(${key}(?:$|\\s))|((?:^|\\s)${key})`, 'gi'),
        `<span style='color: ${value}; font-weight: bold'>$1$2</span>`
      );
    });

    return message;
  };

  const combineResults = (
    rawResults: { result: data.AlternatePassiveSkillInformation; node: number }[],
    withColors: boolean,
    only: 'notables' | 'passives' | 'all'
  ): CombinedResult[] => {
    const mappedStats: { [key: number]: number[] } = {};
    rawResults.forEach((r) => {
      if (skillTree.nodes[r.node].isKeystone) {
        return;
      }

      if (only !== 'all') {
        if (only === 'notables' && !skillTree.nodes[r.node].isNotable) {
          return;
        }

        if (only === 'passives' && skillTree.nodes[r.node].isNotable) {
          return;
        }
      }

      if (r.result.AlternatePassiveSkill?.StatsKeys) {
        r.result.AlternatePassiveSkill.StatsKeys.forEach((key) => {
          mappedStats[key] = [...(mappedStats[key] || []), r.node];
        });
      }

      if (r.result.AlternatePassiveAdditionInformations) {
        r.result.AlternatePassiveAdditionInformations.forEach((info) => {
          if (info.AlternatePassiveAddition?.StatsKeys) {
            info.AlternatePassiveAddition.StatsKeys.forEach((key) => {
              mappedStats[key] = [...(mappedStats[key] || []), r.node];
            });
          }
        });
      }
    });

    return Object.keys(mappedStats).map((statID) => {
      const translated = translateStat(parseInt(statID));
      return {
        stat: withColors ? colorMessage(translated) : translated,
        rawStat: translated,
        id: statID,
        passives: mappedStats[parseInt(statID)]
      };
    });
  };
  const sortCombined = (
    combinedResults: CombinedResult[],
    order: 'count' | 'alphabet' | 'rarity' | 'value'
  ): CombinedResult[] => {
    if (!selectedJewel) return combinedResults;

    switch (order) {
      case 'alphabet':
        return combinedResults.sort((a, b) =>
          a.rawStat
            .replace(/[#+%]/gi, '')
            .trim()
            .toLowerCase()
            .localeCompare(b.rawStat.replace(/[#+%]/gi, '').trim().toLowerCase())
        );
      case 'count':
        return combinedResults.sort((a, b) => b.passives.length - a.passives.length);
      case 'rarity':
        const jewel = selectedJewel;
        if (!jewel) return combinedResults;
        return combinedResults.sort(
          (a, b) => (allPossibleStats()[jewel.value]?.[a.id] || 0) - (allPossibleStats()[jewel.value]?.[b.id] || 0)
        );
      case 'value':
        const jewelForValue = selectedJewel;
        if (!jewelForValue) return combinedResults;
        return combinedResults.sort((a, b) => {
          const aValue = (statValues as any)[a.id] || 0;
          const bValue = (statValues as any)[b.id] || 0;
          if (aValue != bValue) {
            return bValue - aValue;
          }
          return (
            (allPossibleStats()[jewelForValue.value]?.[a.id] || 0) -
            (allPossibleStats()[jewelForValue.value]?.[b.id] || 0)
          );
        });
    }

    return combinedResults;
  };

  const sortResults = [
    {
      label: 'Count',
      value: 'count'
    },
    {
      label: 'Alphabetical',
      value: 'alphabet'
    },
    {
      label: 'Rarity',
      value: 'rarity'
    },
    {
      label: 'Value',
      value: 'value'
    }
  ] as const;

  let sortOrder = $state<(typeof sortResults)[number] | undefined>(undefined);
  let colored = $state<boolean>(true);
  let split = $state<boolean>(true);

  // Initialize localStorage values
  $effect(() => {
    const storedSortOrder = localStorage.getItem('sortOrder') || 'count';
    sortOrder = sortResults.find((r) => r.value === storedSortOrder);

    const storedColored = localStorage.getItem('colored');
    colored = storedColored === null ? true : storedColored === 'true';

    const storedSplit = localStorage.getItem('split');
    split = storedSplit === null ? true : storedSplit === 'true';
  });

  // Save to localStorage when values change
  $effect(() => {
    if (sortOrder) localStorage.setItem('sortOrder', sortOrder.value);
  });

  $effect(() => {
    localStorage.setItem('colored', colored ? 'true' : 'false');
  });

  $effect(() => {
    localStorage.setItem('split', split ? 'true' : 'false');
  });
  const onPaste = (event: ClipboardEvent) => {
    if (event.type !== 'paste') {
      return;
    }

    const paste = event.clipboardData?.getData('text') || '';
    const lines = paste.split('\n');

    if (lines.length < 14) {
      return;
    }

    const jewel = jewels().find((j) => j.label === lines[2]);
    if (!jewel) {
      return;
    }

    let newSeed: number | undefined;
    let conqueror: string | undefined;

    if (!data?.TimelessJewelConquerors?.[jewel.value]) return;

    for (let i = 10; i < lines.length; i++) {
      conqueror = Object.keys(data.TimelessJewelConquerors[jewel.value] || {}).find((k) => lines[i].indexOf(k) >= 0);
      if (conqueror) {
        const matches = /(\d+)/.exec(lines[i]);
        if (!matches || matches.length === 0) {
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
    dropdownConqueror = { label: conqueror, value: conqueror };
    updateUrl();
  };

  let collapsed = $state(false);
  let showTradeLinks = $state(false);
  // Derived queries for trade functionality
  let queries = $derived(() => {
    if (!searchResults || !searchJewel || !searchConqueror) return [];
    return constructQueries(searchJewel, searchConqueror, searchResults.raw);
  });

  // Reset showTradeLinks when queries change
  $effect(() => {
    if (queries().length === 1) {
      showTradeLinks = false;
    }
  });
</script>

<svelte:window on:paste={onPaste} />

<SkillTree
  {clickNode}
  {circledNode}
  selectedJewel={selectedJewel?.value ?? 0}
  selectedConqueror={selectedConqueror?.value ?? ''}
  {highlighted}
  {seed}
  highlightJewels={!circledNode}
  disabled={Array.from(disabled)}>
  {#if !collapsed}
    <div
      class="w-screen md:w-10/12 lg:w-2/3 xl:w-1/2 2xl:w-5/12 3xl:w-1/3 4xl:w-1/4 absolute top-0 left-0 bg-black/80 backdrop-blur-sm themed rounded-br-lg max-h-screen">
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
                <TradeButton queries={queries()} bind:showTradeLinks />
                <button
                  class="p-1 px-3 bg-blue-500/40 rounded disabled:bg-blue-900/40 mr-2"
                  class:grouped={groupResults}
                  onclick={() => (groupResults = !groupResults)}
                  disabled={!searchResults}>
                  Grouped
                </button>
              {/if}
              <button class="bg-neutral-100 opacity-20 px-4 p-1 rounded" onclick={() => (results = !results)}>
                {results ? 'Config' : 'Results'}
              </button>
            </div>
          {/if}
        </div>

        {#if !results}
          <Select items={jewels()} bind:value={selectedJewel} on:change={changeJewel} />

          {#if selectedJewel}
            <div class="mt-4">
              <h3 class="mb-2">Conqueror</h3>
              <Select items={dropdownConqs()} bind:value={dropdownConqueror} on:change={updateUrl} />
            </div>

            {#if selectedConqueror && data?.TimelessJewelConquerors?.[selectedJewel.value] && Object.keys(data.TimelessJewelConquerors[selectedJewel.value] || {}).includes(selectedConqueror.value)}
              <div class="mt-4 w-full flex flex-row">
                <button class="selection-button" class:selected={mode === 'seed'} onclick={() => setMode('seed')}>
                  Enter Seed
                </button>
                <button class="selection-button" class:selected={mode === 'stats'} onclick={() => setMode('stats')}>
                  Select Stats
                </button>
              </div>
              {#if mode === 'seed'}
                <div class="mt-4">
                  <h3 class="mb-2">Seed</h3>
                  <input
                    type="number"
                    bind:value={seed}
                    onblur={updateUrl}
                    min={data?.TimelessJewelSeedRanges?.[selectedJewel.value]?.Min}
                    max={data?.TimelessJewelSeedRanges?.[selectedJewel.value]?.Max} />
                  {#if data?.TimelessJewelSeedRanges?.[selectedJewel.value] && (seed < data.TimelessJewelSeedRanges[selectedJewel.value].Min || seed > data.TimelessJewelSeedRanges[selectedJewel.value].Max)}
                    <div class="mt-2">
                      Seed must be between {data.TimelessJewelSeedRanges[selectedJewel.value].Min}
                      and {data.TimelessJewelSeedRanges[selectedJewel.value].Max}
                    </div>
                  {/if}
                </div>

                {#if data?.TimelessJewelSeedRanges?.[selectedJewel.value] && seed >= data.TimelessJewelSeedRanges[selectedJewel.value].Min && seed <= data.TimelessJewelSeedRanges[selectedJewel.value].Max}
                  <div class="flex flex-row mt-4 items-end">
                    <div class="flex-grow">
                      <h3 class="mb-2">Sort Order</h3>
                      <Select items={sortResults} bind:value={sortOrder} />
                    </div>
                    <div class="ml-2">
                      <button
                        class="bg-neutral-500 opacity-20 p-2 px-4 rounded"
                        class:selected={colored}
                        onclick={() => (colored = !colored)}>
                        Colors
                      </button>
                    </div>
                    <div class="ml-2">
                      <button
                        class="bg-neutral-500 opacity-20 p-2 px-4 rounded"
                        class:selected={split}
                        onclick={() => (split = !split)}>
                        Split
                      </button>
                    </div>
                  </div>

                  {#if !split}
                    <ul class="mt-4 overflow-auto" class:rainbow={colored}>
                      {#each sortCombined(combineResults(seedResults(), colored, 'all'), sortOrder?.value ?? 'count') as r}
                        <li>
                          <button 
                            class="cursor-pointer w-full text-left" 
                            onclick={() => highlight(seed, r.passives)}
                            onkeydown={(e) => e.key === 'Enter' && highlight(seed, r.passives)}>
                            <span class="font-bold" class:text-white={((statValues as any)[r.id] || 0) < 3}>
                              ({r.passives.length})
                            </span>
                            <span class="text-white">{@html r.stat}</span>
                          </button>
                        </li>
                      {/each}
                    </ul>
                  {:else}
                    <div class="overflow-auto mt-4">
                      <h3>Notables</h3>
                      <ul class="mt-1" class:rainbow={colored}>
                        {#each sortCombined(combineResults(seedResults(), colored, 'notables'), sortOrder?.value ?? 'count') as r}
                          <li>
                            <button 
                              class="cursor-pointer w-full text-left" 
                              onclick={() => highlight(seed, r.passives)}
                              onkeydown={(e) => e.key === 'Enter' && highlight(seed, r.passives)}>
                              <span class="font-bold" class:text-white={((statValues as any)[r.id] || 0) < 3}>
                                ({r.passives.length})
                              </span>
                              <span class="text-white">{@html r.stat}</span>
                            </button>
                          </li>
                        {/each}
                      </ul>

                      <h3 class="mt-2">Smalls</h3>
                      <ul class="mt-1" class:rainbow={colored}>
                        {#each sortCombined(combineResults(seedResults(), colored, 'passives'), sortOrder?.value ?? 'count') as r}
                          <li>
                            <button 
                              class="cursor-pointer w-full text-left" 
                              onclick={() => highlight(seed, r.passives)}
                              onkeydown={(e) => e.key === 'Enter' && highlight(seed, r.passives)}>
                              <span class="font-bold" class:text-white={((statValues as any)[r.id] || 0) < 3}>
                                ({r.passives.length})
                              </span>
                              <span class="text-white">{@html r.stat}</span>
                            </button>
                          </li>
                        {/each}
                      </ul>
                    </div>
                  {/if}
                {/if}
              {:else if mode === 'stats'}
                <div class="mt-4">
                  <h3 class="mb-2">Add Stat</h3>
                  <Select items={statItems()} on:change={selectStat} bind:this={statSelector} />
                </div>
                {#if Object.keys(selectedStats).length > 0}
                  <div class="mt-4 flex flex-col overflow-auto min-h-[100px]">
                    {#each Object.keys(selectedStats) as s}
                      <div class="mb-4 flex flex-row items-start flex-col border-neutral-100 border-opacity-40 border-b pb-4">
                        <div>
                          <button
                            class="p-2 px-4 bg-red-500/40 rounded mr-2"
                            onclick={() => removeStat(selectedStats[parseInt(s)].id)}>
                            -
                          </button>
                          <span>{translateStat(selectedStats[parseInt(s)].id)}</span>
                        </div>
                        <div class="mt-2 flex flex-row">
                          <div class="mr-4 flex flex-row items-center">
                            <div class="mr-2">Min:</div>
                            <input type="number" min="0" bind:value={selectedStats[parseInt(s)].min} />
                          </div>
                          <div class="flex flex-row items-center">
                            <div class="mr-2">Weight:</div>
                            <input type="number" min="0" bind:value={selectedStats[parseInt(s)].weight} />
                          </div>
                          <div class="flex flex-row items-center">
                            <div class="mr-2">Minimum Stat Total:</div>
                            <input type="number" min="0" bind:value={selectedStats[parseInt(s)].minStatTotal} />
                          </div>
                        </div>
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
                      <button
                        class="p-2 px-2 bg-yellow-500/40 rounded disabled:bg-yellow-900/40 mr-2"
                        onclick={selectAll}
                        disabled={searching || disabled.size == 0}>
                        Select All
                      </button>
                      <button
                        class="p-2 px-2 bg-yellow-500/40 rounded disabled:bg-yellow-900/40 mr-2"
                        onclick={selectAllNotables}
                        disabled={searching || disabled.size == 0}>
                        Notables
                      </button>
                      <button
                        class="p-2 px-2 bg-yellow-500/40 rounded disabled:bg-yellow-900/40 mr-2"
                        onclick={selectAllPassives}
                        disabled={searching || disabled.size == 0}>
                        Passives
                      </button>
                      <button
                        class="p-2 px-2 bg-yellow-500/40 rounded disabled:bg-yellow-900/40 flex-grow"
                        onclick={deselectAll}
                        disabled={searching || disabled.size >= affectedNodes().length}>
                        Deselect
                      </button>
                    </div>
                    <div class="flex flex-row mt-2">
                      <button
                        class="p-2 px-3 bg-green-500/40 rounded disabled:bg-green-900/40 flex-grow"
                        onclick={() => search()}
                        disabled={searching}>
                        {#if searching}
                          {currentSeed} / {data?.TimelessJewelSeedRanges?.[selectedJewel.value]?.Max}
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
            <TradeLinks queries={queries()} />
          {/if}
          <SearchResults
            {searchResults}
            {groupResults}
            {highlight}
            jewel={searchJewel}
            conqueror={searchConqueror || ''} />
        {/if}
      </div>
    </div>
  {:else}
    <button
      class="burger-menu absolute top-0 left-0 bg-black/80 backdrop-blur-sm rounded-br-lg p-4 pt-5"
      aria-label="Close menu"
      onclick={() => (collapsed = false)}>
      <div></div>
      <div></div>
      <div></div>
    </button>
  {/if}

  <div class="text-orange-500 absolute bottom-0 right-0 m-2">
    <a href="https://github.com/Vilsol/timeless-jewels" target="_blank" rel="noopener noreferrer">
      Official Branch Source (Github)
    </a>
    <a href="https://github.com/BlazesRus/timeless-jewels" target="_blank" rel="noopener noreferrer">Source (Github)</a>
  </div>
</SkillTree>

<style lang="postcss">
  .selection-button {
    @apply bg-neutral-500 opacity-20 p-2 px-4 flex-grow;
  }

  .selection-button:first-child {
    @apply rounded-l border-r-2 border-black;
  }

  .selection-button:last-child {
    @apply rounded-r;
  }

  .selected {
    @apply bg-neutral-100 opacity-20;
  }

  .grouped {
    @apply bg-pink-500/40;
    disabled: bg-pink-900/40;
  }

  .rainbow {
    animation: colorRotate 2s linear 0s infinite;
  }

  @keyframes colorRotate {
    from {
      color: hsl(0, 100%, 50%);
    }
    25% {
      color: hsl(90, 100%, 50%);
    }
    50% {
      color: hsl(180, 100%, 50%);
    }
    75% {
      color: hsl(270, 100%, 50%);
    }
    100% {
      color: hsl(359, 100%, 50%);
    }
  }
</style>
