<script lang="ts">
  import Select from 'svelte-select';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { base, assets } from '$app/paths';
  import { calculator, data } from '../lib/types';
  const searchParams = $page.url.searchParams;
  // Check if WASM data is available
  let isDataReady = $derived(data?.TimelessJewels && data?.TimelessJewelConquerors && data?.PassiveSkills);
  // Make jewels reactive to data loading
  let jewels = $derived(isDataReady && data.TimelessJewels ? Object.keys(data.TimelessJewels).map((k) => ({
    value: parseInt(k),
    label: data.TimelessJewels?.[parseInt(k)] || k
  })) : []);

  let selectedJewel = $state(undefined as { value: number; label: string } | undefined);

  // Initialize selectedJewel when jewels are loaded
  $effect(() => {
    if (jewels.length > 0 && !selectedJewel && searchParams.has('jewel')) {
      selectedJewel = jewels.find((j) => j.value == parseInt(searchParams.get('jewel') || '0'));
    }
  });
  let conquerors = $derived(selectedJewel && isDataReady && data.TimelessJewelConquerors && data.TimelessJewelConquerors[selectedJewel.value]
    ? Object.keys(data.TimelessJewelConquerors[selectedJewel.value] || {}).map((k) => ({
        value: k,
        label: k
      }))
    : []);

  let selectedConqueror = $state(undefined as { value: string; label: string } | undefined);

  // Initialize selectedConqueror when conquerors are loaded
  $effect(() => {
    if (conquerors.length > 0 && !selectedConqueror && searchParams.has('conqueror')) {
      const conquerorValue = searchParams.get('conqueror');
      if (conquerorValue) {
        selectedConqueror = {
          value: conquerorValue,
          label: conquerorValue
        };
      }
    }
  });
  let passiveSkills = $derived(isDataReady && data.PassiveSkills ? Object.values(data.PassiveSkills).filter(passive => passive != null).map((passive) => ({
    value: passive?.Index || 0,
    label: (passive?.Name || '') + ' (' + (passive?.ID || '') + ')'
  })) : []);

  let selectedPassiveSkill: { label: string; value: number } | undefined = $state(undefined);

  // Initialize selectedPassiveSkill when passiveSkills are loaded
  $effect(() => {
    if (passiveSkills.length > 0 && !selectedPassiveSkill && searchParams.has('passive_skill')) {
      selectedPassiveSkill = passiveSkills.find((j) => j.value == parseInt(searchParams.get('passive_skill') || '0'));
    }
  });
  let seed = $state(searchParams.has('seed') ? parseInt(searchParams.get('seed') || '0') : 0);
  let result: undefined | data.AlternatePassiveSkillInformation = $state();
  $effect(() => {
    if (selectedPassiveSkill && seed && selectedJewel && selectedConqueror && calculator?.Calculate) {
      result = calculator.Calculate(
        selectedPassiveSkill.value,
        typeof seed === 'string' ? parseInt(seed) : seed,
        selectedJewel.value,
        selectedConqueror.value || ''
      );
    }
  });
  const updateUrl = () => {
    if (browser) {
      const params: Record<string, string | number> = {};
      if (selectedJewel) params.jewel = selectedJewel.value;
      if (selectedConqueror?.value) params.conqueror = selectedConqueror.value;
      if (selectedPassiveSkill) params.passive_skill = selectedPassiveSkill.value;
      if (seed) params.seed = seed;

      const resultQuery = Object.keys(params)
        .map((key) => key + '=' + encodeURIComponent(params[key]))
        .join('&');

      goto($page.url.pathname + '?' + resultQuery);
    }
  };
</script>

<div class="py-10 flex flex-row justify-center w-screen h-screen">
  <div class="flex flex-col justify-between w-1/3">
    <div>
      <h1 class="text-white mb-10 text-center">Timeless Calculator</h1>

      <a href="{base}/tree">
        <h2 class="text-white mb-10 text-center underline text-orange-500">Skill Tree View</h2>
      </a>

      <div class="themed">
        <h3 class="mb-2">Timeless Jewel</h3>
        <Select items={jewels} bind:value={selectedJewel} on:select={updateUrl} />

        {#if selectedJewel}
          <div class="mt-4">
            <h3 class="mb-2">Conqueror</h3>
            <Select items={conquerors} bind:value={selectedConqueror} on:select={updateUrl} />
          </div>

          {#if selectedConqueror && selectedJewel && isDataReady && data.TimelessJewelConquerors && data.TimelessJewelConquerors[selectedJewel.value] && selectedConqueror.value && Object.keys(data.TimelessJewelConquerors[selectedJewel.value] || {}).indexOf(selectedConqueror.value) >= 0}
            <div class="mt-4">
              <h3 class="mb-2">Passive Skill</h3>
              <Select items={passiveSkills} bind:value={selectedPassiveSkill} on:select={updateUrl} />
            </div>

            {#if selectedPassiveSkill}
              <div class="mt-4">
                <h3 class="mb-2">Seed</h3>
                <input
                  type="number"                  bind:value={seed}
                  class="seed"
                  onblur={updateUrl}                  min={selectedJewel && isDataReady && data.TimelessJewelSeedRanges && data.TimelessJewelSeedRanges[selectedJewel.value] ? data.TimelessJewelSeedRanges[selectedJewel.value].Min : 0}
                  max={selectedJewel && isDataReady && data.TimelessJewelSeedRanges && data.TimelessJewelSeedRanges[selectedJewel.value] ? data.TimelessJewelSeedRanges[selectedJewel.value].Max : 0} />                {#if selectedJewel && isDataReady && data.TimelessJewelSeedRanges && data.TimelessJewelSeedRanges[selectedJewel.value] && typeof seed === 'number' && (seed < data.TimelessJewelSeedRanges[selectedJewel.value].Min || seed > data.TimelessJewelSeedRanges[selectedJewel.value].Max)}
                  <div class="mt-2">                    Seed must be between {data.TimelessJewelSeedRanges?.[selectedJewel.value]?.Min} and {data
                      .TimelessJewelSeedRanges?.[selectedJewel.value]?.Max}
                  </div>
                {/if}
              </div>

              {#if result}
                {#if result.AlternatePassiveSkill}
                  <div class="mt-4">
                    <h3>Alternate Passive Skill</h3>
                    <span>
                      {result.AlternatePassiveSkill.Name} ({result.AlternatePassiveSkill.ID})
                    </span>
                  </div>                  {#if result.StatRolls && Object.keys(result.StatRolls).length > 0}
                    <ol class="mt-4 list-decimal pl-8">                      {#each Object.keys(result.StatRolls) as roll, i (roll)}
                        {#if result.AlternatePassiveSkill?.StatsKeys?.[i]}
                          {@const stat = data.GetStatByIndex(result.AlternatePassiveSkill.StatsKeys[i])}
                          <li>{stat?.Text || '<no name>'} ({stat?.ID}) - {Object.values(result.StatRolls)[i]}</li>
                        {/if}
                      {/each}
                    </ol>
                  {/if}
                {/if}                {#if 'AlternatePassiveAdditionInformations' in result && result.AlternatePassiveAdditionInformations && result.AlternatePassiveAdditionInformations.length > 0}
                  <div class="mt-4">
                    <h3>Additions</h3>                    <ul class="list-disc pl-8">
                      {#each result.AlternatePassiveAdditionInformations as info (info.AlternatePassiveAddition?.ID || Math.random())}
                        <li class="mt-4">
                          <span>{info.AlternatePassiveAddition?.ID} ({info.AlternatePassiveAddition?.Index})</span>                          {#if info.StatRolls && Object.keys(info.StatRolls).length > 0}
                            <ol class="list-decimal pl-8">
                              {#each Object.keys(info.StatRolls) as roll, i (roll)}
                                {#if info.AlternatePassiveAddition?.StatsKeys?.[i]}
                                  {@const stat = data.GetStatByIndex(info.AlternatePassiveAddition.StatsKeys[i])}
                                  <li>{stat?.Text || '<no name>'} ({stat?.ID}) - {(info.StatRolls as Record<string, number>)[roll]}</li>
                                {/if}
                              {/each}
                            </ol>
                          {/if}
                        </li>
                      {/each}
                    </ul>
                  </div>
                {/if}
              {/if}
            {/if}
          {/if}
        {/if}
      </div>
    </div>

    <div class="flex justify-between">
      <div class="text-right text-orange-500">
        <a href="https://discord.gg/mfacademy" target="_blank" rel="noopener noreferrer" class="flex flex-row align-middle">
          <img src="{assets}/mf-academy-logo.png" width="24px" alt="MF Academy"/>
          <span class="ml-2">MF Academy</span>
        </a>
      </div>

      <div class="text-orange-500">
        <a href="https://github.com/Vilsol/timeless-jewels" target="_blank" rel="noopener noreferrer">Official Branch Source (Github)</a>
        <a href="https://github.com/BlazesRus/timeless-jewels" target="_blank" rel="noopener noreferrer">Source (Github)</a>
        <a href="https://github.com/ImHamba/timeless-jewels" target="_blank" rel="noopener noreferrer">ImHamba Branch Source (Github)</a>
      </div>
    </div>
  </div>
</div>
