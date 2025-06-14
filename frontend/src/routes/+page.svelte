<script lang="ts">

  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import type { Page } from '@sveltejs/kit';
  import { goto } from '$app/navigation';

  import Select from 'svelte-select';

  import { base, assets } from '$app/paths';
  import { data, calculator, isWasmReady } from '$lib/types/index.js';

  console.log('Main page loading...');

  // State variables
  let jewels: Array<{value: number, label: string}> = [];
  let selectedJewel: {value: number, label: string} | undefined = undefined;
  let availableConquerors: Array<{value: string, label: string}> = [];
  let selectedConqueror: {value: string, label: string} | undefined = undefined;
  let passiveSkills: Array<{value: number, label: string}> = [];
  let selectedPassiveSkill: {value: number, label: string} | undefined = undefined;
  let seed = 0;
  let result: any = undefined;

  let JewelsAreNotInitialized: boolean = false;
  
  // Initialize search params reactively instead of at module level
  $: searchParams = browser ? $page.url.searchParams : new URLSearchParams();
  
  // Initialize search params after component mounts
  onMount(() => {
    if (browser) {
      searchParams = $page.url.searchParams;
      // Initialize from URL parameters
      if (searchParams.has('jewel')) {
        const jewelId = parseInt(searchParams.get('jewel') || '0');
        selectedJewel = jewels.find(j => j.value === jewelId);
      }
      if (searchParams.has('conqueror')) {
        const conquerorValue = searchParams.get('conqueror');
        selectedConqueror = availableConquerors.find(c => c.value === conquerorValue);
      }
      if (searchParams.has('passive')) {
        const passiveId = parseInt(searchParams.get('passive') || '0');
        selectedPassiveSkill = passiveSkills.find(p => p.value === passiveId);
      }
      if (searchParams.has('seed')) {
        seed = parseInt(searchParams.get('seed') || '0');
      }
    }
  });

  // Only populate data when WASM is ready
  $: if (isWasmReady() && data && browser) {
    //Make sure if jewel or passiveskill data breaks that recreate new data 
    if(!JewelsAreNotInitialized && (jewels==undefined || passiveSkills==undefined))
      JewelsAreNotInitialized = true;

    if(JewelsAreNotInitialized)
    {
      console.log('WASM is ready, populating jewel and passive skill UI data...');

      // Initialize jewels
      jewels = Object.keys(data.TimelessJewels || {}).map(k => ({
        value: parseInt(k),
        label: data.TimelessJewels[k]
      }));
      console.log('Jewels loaded:', jewels.length);

      // Initialize passive skills
      passiveSkills = (data.PassiveSkills || []).filter(skill => skill !== undefined)
        .map(skill => ({
          value: skill.Index,
          label: skill.Name}));
      console.log('Passive skills loaded:', passiveSkills.length);

      JewelsAreNotInitialized = false;
    }
 
    // Populate passive skills
    if (data.PassiveSkills && Array.isArray(data.PassiveSkills)) {
      passiveSkills = data.PassiveSkills.map((skill) => ({
        value: skill.PassiveSkillGraphID,
        label: skill.Name
      }));
      console.log('Passive skills loaded:', passiveSkills.length);
    }
    
    // Restore selections from URL params
    if (searchParams.has('jewel') && jewels.length > 0) {
      const jewelValue = parseInt(searchParams.get('jewel') || '0');
      selectedJewel = jewels.find(j => j.value === jewelValue);
    }
    
    if (searchParams.has('passive_skill') && passiveSkills.length > 0) {
      const skillValue = parseInt(searchParams.get('passive_skill') || '0');
      selectedPassiveSkill = passiveSkills.find(s => s.value === skillValue);
    }

    if (searchParams.has('seed')) {
      seed = parseInt(searchParams.get('seed') || '0');
    }
  }

  // Update available conquerors when jewel selection changes
  $: if (selectedJewel && isWasmReady() && data.TimelessJewelConquerors && browser) {
    if(availableConquerors==[])
    {
      const conquerorData = data.TimelessJewelConquerors[selectedJewel.value];
      if (conquerorData) {
        availableConquerors = Object.keys(conquerorData).map(k => ({
          value: k,
          label: k
        }));
      }
    }

    // Set initial conqueror from URL params
    if (searchParams.has('conqueror')) {
      const conquerorValue = searchParams.get('conqueror');
      selectedConqueror = availableConquerors.find(c => c.value === conquerorValue);
    }
  } else {
    availableConquerors = [];
  }

  // Reactive calculation
  $: if (selectedPassiveSkill && seed && selectedJewel && selectedConqueror && isWasmReady()) {
    try {
      console.log('Performing calculation...');
      result = calculator.Calculate(
        selectedPassiveSkill.value,
        seed,
        selectedJewel.value,
        selectedConqueror.value
      );
      console.log('Calculation result:', result);
    } catch (error) {
      console.error('Calculation error:', error);
      result = undefined;
    }
  }

  const updateUrl = () => {
    if (!browser) return;
    
    const url = new URL(window.location.href);
    url.searchParams.delete('jewel');
    url.searchParams.delete('conqueror');
    url.searchParams.delete('passive');
    url.searchParams.delete('seed');

    if (selectedJewel) url.searchParams.set('jewel', selectedJewel.value.toString());
    if (selectedConqueror) url.searchParams.set('conqueror', selectedConqueror.value);
    if (selectedPassiveSkill) url.searchParams.set('passive', selectedPassiveSkill.value.toString());
    if (seed) url.searchParams.set('seed', seed.toString());

    goto(url.toString(), { replaceState: true });
  };
</script>

<svelte:head>
  <title>Timeless Jewel Calculator</title>
</svelte:head>

<div class="flex flex-row justify-center">
  <h1 class="text-3xl font-bold mb-6">Timeless Jewel Calculator</h1>
</div>
{#if !isWasmReady()}
  <div class="flex flex-row justify-center">
    <p class="text-white">Loading WASM data, please wait...</p>
    <div class="mt-4">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  </div>
{:else}
<div class="py-10 flex flex-row justify-center w-screen h-screen">
  <div class="flex flex-col justify-between w-1/3">
    <div class="mt-10">
      <h3 class="mb-2">Debug Info:</h3>
      <p>WASM Ready: {isWasmReady()}</p>
      <p>Browser: {browser ? 'Available' : 'Not available'}</p>
      <p>Jewels loaded: {jewels.length}</p>
      <p>Passive skills loaded: {passiveSkills.length}</p>
      <p>Available conquerors: {availableConquerors.length}</p>
    </div>
    <div></div>
    <div class="flex flex-col">
      <div class="py-10 flex flex-col justify-between">
        <a href="{base}/tree">
          <h2 class="text-white mb-10 text-center underline text-orange-500">Skill Tree View</h2>
        </a>

        <div class="themed">
            <h3 class="mb-2">Timeless Jewel</h3>
            <Select items={jewels} bind:value={selectedJewel} on:select={updateUrl} />

            {#if selectedJewel && availableConquerors.length > 0}
              <div class="mt-4">
                <h3 class="mb-2">Conqueror</h3>
                <Select items={availableConquerors} bind:value={selectedConqueror} on:select={updateUrl} />
              </div>

              {#if selectedConqueror}
                <div class="mt-4">
                  <h3 class="mb-2">Passive Skill</h3>
                  <Select items={passiveSkills} bind:value={selectedPassiveSkill} on:select={updateUrl} />
                </div>

                {#if selectedPassiveSkill}
                  <div class="mt-4">
                    <label for="seed">Seed</label>
                    <input type="number" id="seed" bind:value={seed} on:input={updateUrl}
                      class="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"/>
                  </div>

                  {#if result}
                    <div class="mt-4">
                      <h3 class="mb-2">Result</h3>
                      <pre class="text-xs">{JSON.stringify(result, null, 2)}</pre>
                    </div>
                  {/if}
                {/if}
              {/if}
            {/if}
        </div>
    </div>

    <div class="flex justify-between pt-10">
      <div class="text-right text-orange-500">
        <a href="https://discord.gg/mfacademy" target="_blank" rel="noopener noreferrer" 
        class="flex flex-row align-middle"><img src="{assets}/mf-academy-logo.png" width="24px" alt="MF Academy" /><span class="ml-2">MF Academy</span></a>
        <a href="https://github.com/BlazesRus/timeless-jewels" target="_blank" rel="noopener noreferrer">Source (Github)</a>
      </div>
    </div>
  </div>
</div>
{/if}