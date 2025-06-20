<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import type { Page } from '@sveltejs/kit';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import ModernSelect from '$lib/components/ModernSelect.svelte';
  import { base, assets } from '$app/paths';  import { data, calculator } from '$lib/types/ModernTypes.js';
  import { get } from 'svelte/store';
  
  // Reactive store values for use in the component with proper typing
  const calculatorValue = $derived(get(calculator) as any);
  const dataValue = $derived(get(data) as any);

  console.log('Main page loading...');

  // State variables with Svelte 5 runes
  let jewels = $state<Array<{ value: number; label: string }>>([]);
  let selectedJewel = $state<{ value: number; label: string } | undefined>(undefined);
  let availableConquerors = $state<Array<{ value: string; label: string }>>([]);
  let selectedConqueror = $state<{ value: string; label: string } | undefined>(undefined);
  let passiveSkills = $state<Array<{ value: number; label: string }>>([]);
  let selectedPassiveSkill = $state<{ value: number; label: string } | undefined>(undefined);
  let seed = $state(0);
  let result = $state<any>(undefined);

  let JewelsAreNotInitialized = $state(true); // Start as true to trigger initial data load
  const searchParams = $derived(browser ? (globalThis as any).$page?.url?.searchParams || new URLSearchParams() : new URLSearchParams());

  // Initialize search params after component mounts
  onMount(() => {
    if (browser) {
      // searchParams is now derived, so no need to assign it here
      // Initialize from URL parameters using the derived searchParams
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

  // Data initialization effect - reactively respond to WASM data loading
  $effect(() => {
    // Use store values directly with $ syntax (works in both Svelte 4 and 5)
    if (calculatorValue && dataValue && browser) {
      console.log('WASM data detected, calculator and data are available');
      
      // Make sure if jewel or passiveskill data breaks that we recreate new data
      if (!JewelsAreNotInitialized && (jewels.length === 0 || passiveSkills.length === 0)) {
        JewelsAreNotInitialized = true;
      }

      if (JewelsAreNotInitialized) {
        console.log('WASM is ready, populating jewel and passive skill UI dataValue...');
          // Initialize jewels
        if (dataValue.TimelessJewels) {
          jewels = Object.keys(dataValue.TimelessJewels).map(k => ({
            value: parseInt(k),
            label: (dataValue.TimelessJewels as any)[k]
          }));
          console.log('Jewels loaded:', jewels.length);
        }
        
        // Initialize passive skills
        if (dataValue.PassiveSkills && Array.isArray(dataValue.PassiveSkills)) {
          passiveSkills = dataValue.PassiveSkills
            .filter(skill => skill !== undefined)
            .map(skill => ({
              value: skill!.PassiveSkillGraphID,
              label: skill!.Name
            }));
          console.log('Passive skills loaded:', passiveSkills.length);
        }

        JewelsAreNotInitialized = false;
      }

      // Restore selections from URL params after data is loaded
      if (searchParams.has('jewel') && jewels.length > 0) {
        const jewelValue = parseInt(searchParams.get('jewel') || '0');
        const foundJewel = jewels.find(j => j.value === jewelValue);
        if (foundJewel && selectedJewel !== foundJewel) {
          selectedJewel = foundJewel;
        }
      }

      if (searchParams.has('passive_skill') && passiveSkills.length > 0) {
        const skillValue = parseInt(searchParams.get('passive_skill') || '0');
        const foundSkill = passiveSkills.find(s => s.value === skillValue);
        if (foundSkill && selectedPassiveSkill !== foundSkill) {
          selectedPassiveSkill = foundSkill;
        }
      }

      if (searchParams.has('seed')) {
        seed = parseInt(searchParams.get('seed') || '0');
      }
    }
  });
  // Conqueror selection effect
  $effect(() => {
    if (selectedJewel && calculatorValue && dataValue?.TimelessJewelConquerors && browser) {
      if (availableConquerors.length === 0) {
        const conquerorData = dataValue.TimelessJewelConquerors[selectedJewel.value];
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
  });

  // Calculation effect
  $effect(() => {
    if (selectedPassiveSkill && seed && selectedJewel && selectedConqueror && calculatorValue) {
      try {
        console.log('Performing calculation...');
        result = calculatorValue.Calculate(selectedPassiveSkill.value, seed, selectedJewel.value, selectedConqueror.value);
        console.log('Calculation result:', result);
      } catch (error) {
        console.error('Calculation error:', error);
        result = undefined;
      }
    }
  });

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
{#if !calculatorValue}
  <div class="flex flex-col items-center justify-center">
    <p class="text-white">Loading WASM data in modern mode, please wait...</p>
    <div class="mt-4">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
    <div class="mt-4 text-sm text-gray-300">
      <p>Calculator available: {calculatorValue ? 'Yes' : 'No'}</p>
      <p>Data available: {dataValue ? 'Yes' : 'No'}</p>
      <p>Browser ready: {browser ? 'Yes' : 'No'}</p>
    </div>
  </div>
{:else}
  <div class="py-10 flex flex-row justify-center w-screen h-screen">
    <div class="flex flex-col justify-between w-1/3">
      <div class="mt-10">
        <h3 class="mb-2">Debug Info:</h3>
        <p>WASM Ready: {calculatorValue ? 'Yes' : 'No'}</p>
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
            <ModernSelect items={jewels} bind:value={selectedJewel} onchange={updateUrl} />

            {#if selectedJewel && availableConquerors.length > 0}
              <div class="mt-4">
                <h3 class="mb-2">Conqueror</h3>
                <ModernSelect items={availableConquerors} bind:value={selectedConqueror} onchange={updateUrl} />
              </div>

              {#if selectedConqueror}
                <div class="mt-4">
                  <h3 class="mb-2">Passive Skill</h3>
                  <ModernSelect items={passiveSkills} bind:value={selectedPassiveSkill} onchange={updateUrl} />
                </div>

                {#if selectedPassiveSkill}
                  <div class="mt-4">
                    <label for="seed">Seed</label>
                    <input type="number" id="seed" bind:value={seed} oninput={updateUrl} class="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" />
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
            <a href="https://discord.gg/mfacademy" target="_blank" rel="noopener noreferrer" class="flex flex-row align-middle">
              <img src="{assets}/mf-academy-logo.png" width="24px" alt="MF Academy" />
              <span class="ml-2">MF Academy</span>
            </a>
            <a href="https://github.com/BlazesRus/timeless-jewels" target="_blank" rel="noopener noreferrer">Source (Github)</a>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
