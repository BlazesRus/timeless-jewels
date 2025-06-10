<script lang="ts">
  import { run } from 'svelte/legacy';

  
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { assets, base } from '$app/paths';
  import { calculator, data } from '$lib/types';
  import Select from 'svelte-select';

  const searchParams = page.url.searchParams;

  // Defensive: fallback to empty object if undefined
  const timelessJewels = data.TimelessJewels ?? {};
  const timelessJewelConquerors = data.TimelessJewelConquerors ?? {};
  const timelessJewelSeedRanges = data.TimelessJewelSeedRanges ?? {};
  const passiveSkillsArr = (data.PassiveSkills ?? []).filter(Boolean);

  const jewels = Object.keys(timelessJewels).map((k) => ({
    value: Number(k),
    label: timelessJewels[Number(k)]
  }));

  let selectedJewel = $state((searchParams.has('jewel') && jewels.find((j) => j.value === Number(searchParams.get('jewel')))) || undefined);

  let conquerors = $derived(selectedJewel && timelessJewelConquerors[selectedJewel.value]
    ? Object.keys(timelessJewelConquerors[selectedJewel.value] ?? {}).map((k) => ({
        value: k,
        label: k
      }))
    : []);

  let selectedConqueror = $derived(() => {
    if (searchParams.has('conqueror')) {
      const val = searchParams.get('conqueror');
      return conquerors.find((c) => c.value === val) || undefined;
    }
    return undefined;
  });

  // Helper to get the value directly for template and logic
  function selectedConquerorValue(): string | undefined {
    const sc = selectedConqueror();
    return sc ? sc.value : undefined;
  }

  const passiveSkills = passiveSkillsArr
    .filter((passive): passive is NonNullable<typeof passive> => !!passive)
    .map((passive) => ({
    value: passive.Index,
      label: `${passive.Name} (${passive.ID})`
  }));

  let selectedPassiveSkill: { label: string; value: number } | undefined = $state((searchParams.has('passive_skill') && passiveSkills.find((j) => j.value === Number(searchParams.get('passive_skill')))) || undefined);

  let seed: number = $state(searchParams.has('seed') ? Number(searchParams.get('seed')) : 0);

  let result: undefined | data.AlternatePassiveSkillInformation = $state();
  run(() => {
    if (selectedPassiveSkill && seed && selectedJewel && selectedConquerorValue()) {
      const conquerorValue = selectedConquerorValue();
      if (conquerorValue) {
        result = calculator.Calculate(
          selectedPassiveSkill.value,
          seed,
          selectedJewel.value,
          conquerorValue
        );
      }
    }
  });
  const updateUrl = () => {
    if (browser) {
      const params: Record<string, string | number> = {};
      if (selectedJewel) params.jewel = selectedJewel.value;
      const conquerorValue = selectedConquerorValue();
      if (conquerorValue) params.conqueror = conquerorValue;
      if (selectedPassiveSkill) params.passive_skill = selectedPassiveSkill.value;
      if (seed) params.seed = seed;

      const resultQuery = Object.keys(params)
        .map((key) => key + '=' + encodeURIComponent(params[key]))
        .join('&');

      goto(page.url.pathname + '?' + resultQuery);
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

          {#if selectedConqueror && selectedConqueror() && selectedJewel && timelessJewelConquerors[selectedJewel.value] && Object.keys(timelessJewelConquerors[selectedJewel.value] ?? {}).indexOf(selectedConqueror()?.value ?? '') >= 0}
            <div class="mt-4">
              <h3 class="mb-2">Passive Skill</h3>
              <Select items={passiveSkills} bind:value={selectedPassiveSkill} on:select={updateUrl} />
            </div>

            {#if selectedPassiveSkill}
              <div class="mt-4">
                <h3 class="mb-2">Seed</h3>
                <input
                  type="number"
                  bind:value={seed}
                  class="seed"
                  onblur={updateUrl}
                  min={selectedJewel && timelessJewelSeedRanges[selectedJewel.value]?.Min}
                  max={selectedJewel && timelessJewelSeedRanges[selectedJewel.value]?.Max} />
                {#if selectedJewel && (seed < (timelessJewelSeedRanges[selectedJewel.value]?.Min ?? -Infinity) || seed > (timelessJewelSeedRanges[selectedJewel.value]?.Max ?? Infinity))}
                  <div class="mt-2">
                    Seed must be between {selectedJewel && timelessJewelSeedRanges[selectedJewel.value]?.Min} and {selectedJewel && timelessJewelSeedRanges[selectedJewel.value]?.Max}
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

                  {#if result.StatRolls && Object.keys(result.StatRolls ?? {}).length > 0}
                    <ol class="mt-4 list-decimal pl-8">
                      {#each Object.keys(result.StatRolls ?? {}) as roll, i (roll)}
                        <li>
                          {
                            result.AlternatePassiveSkill?.StatsKeys && typeof result.AlternatePassiveSkill.StatsKeys[i] === 'number'
                              ? `${data.GetStatByIndex(result.AlternatePassiveSkill.StatsKeys[i])?.Text || '<no name>'} (${data.GetStatByIndex(result.AlternatePassiveSkill.StatsKeys[i])?.ID}) - ${result.StatRolls[Number(roll)]}`
                              : `<no name> () - ${result.StatRolls[Number(roll)]}`
                          }
                        </li>
                      {/each}
                    </ol>
                  {/if}
                {/if}

                {#if Array.isArray(result.AlternatePassiveAdditionInformations) && result.AlternatePassiveAdditionInformations.length > 0}
                  <div class="mt-4">
                    <h3>Additions</h3>
                    <ul class="list-disc pl-8">
                      {#each result.AlternatePassiveAdditionInformations as info (info?.AlternatePassiveAddition?.ID)}
                        <li class="mt-4">
                          <span>{info?.AlternatePassiveAddition?.ID} ({info?.AlternatePassiveAddition?.Index})</span>

                          {#if info?.StatRolls && Object.keys(info.StatRolls).length > 0}
                            <ol class="list-decimal pl-8">
                              {#each Object.keys(info.StatRolls) as roll, i (roll)}
                                <li>
                                  {
                                    info?.AlternatePassiveAddition?.StatsKeys && typeof info.AlternatePassiveAddition.StatsKeys[i] === 'number'
                                      ? `${data.GetStatByIndex(info.AlternatePassiveAddition.StatsKeys[i])?.Text || '<no name>'} (${data.GetStatByIndex(info.AlternatePassiveAddition.StatsKeys[i])?.ID}) - ${info.StatRolls[Number(roll)]}`
                                      : `<no name> () - ${info.StatRolls[Number(roll)]}`
                                  }
                                </li>
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
