<script lang="ts">
  import Select from 'svelte-select';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { base, assets } from '$app/paths';
  import { calculator, data } from '../lib/types';

  const searchParams = $page.url.searchParams;

  // Reactive state using Svelte 5 patterns
  let selectedJewel = $state<{ value: number; label: string } | undefined>(undefined);
  let selectedConqueror = $state<{ value: string; label: string } | undefined>(undefined);
  let selectedPassiveSkill = $state<{ value: number; label: string } | undefined>(undefined);
  let seed = $state<string | number>(0);
  let result = $state<data.AlternatePassiveSkillInformation | undefined>(undefined);

  // Direct data access - mimicking the working version(depends on WASM loading)
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

  let passiveSkills = $derived(() => {
    if (!data?.PassiveSkills) return [];
    return Object.values(data.PassiveSkills)
      .filter((passive) => passive != null)
      .map((passive) => ({
        value: passive!.Index,
        label: passive!.Name + ' (' + passive!.ID + ')'
      }));
  });

  // Initialize from URL parameters - only after jewels are available
  $effect(() => {
    if (jewels().length === 0) return;

    if (searchParams.has('jewel') && !selectedJewel) {
      const jewelParam = searchParams.get('jewel');
      if (jewelParam) {
        const jewel = jewels().find((j) => j.value === parseInt(jewelParam));
        if (jewel) selectedJewel = jewel;
      }
    }
  });

  $effect(() => {
    if (conquerors().length === 0) return;

    if (searchParams.has('conqueror') && !selectedConqueror) {
      const conquerorParam = searchParams.get('conqueror');
      if (conquerorParam) {
        selectedConqueror = {
          value: conquerorParam,
          label: conquerorParam
        };
      }
    }
  });

  $effect(() => {
    if (passiveSkills().length === 0) return;

    if (searchParams.has('passive_skill') && !selectedPassiveSkill) {
      const skillParam = searchParams.get('passive_skill');
      if (skillParam) {
        const skill = passiveSkills().find((j) => j.value === parseInt(skillParam));
        if (skill) selectedPassiveSkill = skill;
      }
    }

    if (searchParams.has('seed') && seed === 0) {
      const seedParam = searchParams.get('seed');
      if (seedParam) seed = seedParam;
    }
  });

  // Calculate result when all parameters are available
  $effect(() => {
    if (selectedPassiveSkill && seed && selectedJewel && selectedConqueror && calculator?.Calculate) {
      const seedNum = typeof seed === 'string' ? parseInt(seed) : seed;
      if (!isNaN(seedNum)) {
        result = calculator.Calculate(
          selectedPassiveSkill.value,
          seedNum,
          selectedJewel.value,
          selectedConqueror.value
        );
      }
    } else {
      result = undefined;
    }
  });

  const updateUrl = () => {
    if (browser) {
      const params: Record<string, string | number> = {};
      if (selectedJewel) params.jewel = selectedJewel.value;
      if (selectedConqueror) params.conqueror = selectedConqueror.value;
      if (selectedPassiveSkill) params.passive_skill = selectedPassiveSkill.value;
      seed && (params.seed = seed);

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
        <Select items={jewels()} bind:value={selectedJewel} on:select={updateUrl} />

        {#if selectedJewel}
          <div class="mt-4">
            <h3 class="mb-2">Conqueror</h3>
            <Select items={conquerors()} bind:value={selectedConqueror} on:select={updateUrl} />
          </div>

          {#if selectedConqueror && data?.TimelessJewelConquerors?.[selectedJewel.value]}
            {@const conquerorData = data.TimelessJewelConquerors[selectedJewel.value]}
            {#if conquerorData && Object.keys(conquerorData).includes(selectedConqueror.value)}
              <div class="mt-4">
                <h3 class="mb-2">Passive Skill</h3>
                <Select items={passiveSkills()} bind:value={selectedPassiveSkill} on:select={updateUrl} />
              </div>

              {#if selectedPassiveSkill && data?.TimelessJewelSeedRanges?.[selectedJewel.value]}
                <div class="mt-4">
                  <h3 class="mb-2">Seed</h3>
                  <input
                    type="number"
                    bind:value={seed}
                    class="seed"
                    onblur={updateUrl}
                    min={data.TimelessJewelSeedRanges[selectedJewel.value].Min}
                    max={data.TimelessJewelSeedRanges[selectedJewel.value].Max} />
                  {#if typeof seed === 'string' ? parseInt(seed) < data.TimelessJewelSeedRanges[selectedJewel.value].Min || parseInt(seed) > data.TimelessJewelSeedRanges[selectedJewel.value].Max : seed < data.TimelessJewelSeedRanges[selectedJewel.value].Min || seed > data.TimelessJewelSeedRanges[selectedJewel.value].Max}
                    <div class="mt-2">
                      Seed must be between {data.TimelessJewelSeedRanges[selectedJewel.value].Min} and {data
                        .TimelessJewelSeedRanges[selectedJewel.value].Max}
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
                    </div>

                    {#if result.StatRolls && Object.keys(result.StatRolls).length > 0 && result.AlternatePassiveSkill.StatsKeys}
                      <ol class="mt-4 list-decimal pl-8">
                        {#each Object.keys(result.StatRolls) as roll, i}
                          {@const stat = data.GetStatByIndex(result.AlternatePassiveSkill.StatsKeys[i])}
                          {#if stat}
                            <li>{stat.Text || '<no name>'} ({stat.ID}) - {result.StatRolls[parseInt(roll)]}</li>
                          {/if}
                        {/each}
                      </ol>
                    {/if}
                  {/if}

                  {#if result.AlternatePassiveAdditionInformations && result.AlternatePassiveAdditionInformations.length > 0}
                    <div class="mt-4">
                      <h3>Additions</h3>
                      <ul class="list-disc pl-8">
                        {#each result.AlternatePassiveAdditionInformations as info}
                          {#if info.AlternatePassiveAddition}
                            <li class="mt-4">
                              <span>{info.AlternatePassiveAddition.ID} ({info.AlternatePassiveAddition.Index})</span>

                              {#if info.StatRolls && Object.keys(info.StatRolls).length > 0 && info.AlternatePassiveAddition.StatsKeys}
                                <ol class="list-decimal pl-8">
                                  {#each Object.keys(info.StatRolls) as roll, i}
                                    {@const stat = data.GetStatByIndex(info.AlternatePassiveAddition.StatsKeys[i])}
                                    {#if stat}
                                      <li>{stat.Text || '<no name>'} ({stat.ID}) - {info.StatRolls[parseInt(roll)]}</li>
                                    {/if}
                                  {/each}
                                </ol>
                              {/if}
                            </li>
                          {/if}
                        {/each}
                      </ul>
                    </div>
                  {/if}
                {/if}
              {/if}
            {/if}
          {/if}
        {/if}
      </div>
    </div>

    <div class="flex justify-between">
      <div class="text-right text-orange-500">
        <a
          href="https://discord.gg/mfacademy"
          target="_blank"
          rel="noopener noreferrer"
          class="flex flex-row align-middle">
          <img src="{assets}/mf-academy-logo.png" width="24px" alt="MF Academy" />
          <span class="ml-2">MF Academy</span>
        </a>
      </div>

      <div class="text-orange-500">
        <a href="https://github.com/Vilsol/timeless-jewels" target="_blank" rel="noopener noreferrer">
          Official Branch Source (Github)
        </a>
        <a href="https://github.com/BlazesRus/timeless-jewels" target="_blank" rel="noopener noreferrer">
          Source (Github)
        </a>
      </div>
    </div>
  </div>
</div>
