<!--
  Modern Home Page - Svelte 5 Component
  Based on original +page.svelte, modernized for Svelte 5 with enhanced debug features

  Copyright (C) Original Timeless Jewel Calculator authors
  Modernized by James Armstrong (github.com/BlazesRus) with GitHub Copilot assistance

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.
-->

<!-- CACHE BUST 2025-07-01T06:20:00Z - Reverted to SvelteKit routing -->
<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { base, assets } from '$app/paths';
  import { page } from '$app/state';
  // Modern WASM loader from ModernWasm folder (Microsoft Copilot's streamlined approach)
  import { loadWasm, enhancedWasmState, getWasmExecutor } from '$lib/ModernWasm/wasm-loader.svelte';
  // Modern types and functions
  import { useCalculator, useData, initializeCrystalline } from '$lib/types/ModernTypes.svelte';
  // Modern Select component
  import ModernSelect from '$lib/components/Modern/ModernSelect.svelte';
  // WASM URL configuration
  import { getCalculatorWasmUrl, getEnvironmentWasmUrl } from '$lib/utils/wasm-urls';
  // Debug logging and error handling
  import { debugLog, captureError, wasmDebug } from '$lib/utils/debugLogger';

  // Using enhancedWasmState from the new loader instead of local state

  async function startWasm() {
    if (enhancedWasmState.isLoading || enhancedWasmState.isReady) return; // Prevent multiple loads

    try {
      debugLog.info("Starting modern WASM loader with Copilot's fixes...", 'MainPage');
      debugLog.info("Starting modern WASM loader with Copilot's fixes...", 'MainPage-WasmStart');

      // Use the modern loader with properly formatted WASM URL
      const wasmUrl = getEnvironmentWasmUrl();
      debugLog.info(`Using WASM URL: ${wasmUrl}`, 'MainPage');
      debugLog.info(`Using WASM URL: ${wasmUrl}`, 'MainPage-WasmStart');
      const success = await loadWasm(wasmUrl);

      if (success) {
        debugLog.info("Modern WASM loader is ready with Copilot's approach!", 'MainPage');
        debugLog.info("Modern WASM loader is ready with Copilot's approach!", 'MainPage-WasmStart');

        // Initialize the app now that WASM is ready
        await initializeCrystalline();
      } else {
        throw new Error("Failed to load WASM using Copilot's enhanced loader");
      }
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      captureError(error, 'MainPage-startWasm');
      console.error('❌ WASM loading failed:', e);
    }
  }

  debugLog.info('Main page loading...', 'MainPage-Init');

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
  const searchParams = $derived(browser && page?.url?.searchParams ? page.url.searchParams : new URLSearchParams());

  // Initialize search params after component mounts
  onMount(() => {
    if (browser) {
      // Auto-start WASM loading
      startWasm();

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
  let hasInitializedData = $state(false);

  $effect(() => {
    // Only initialize if WASM is ready and we haven't initialized yet
    if (enhancedWasmState.isReady && enhancedWasmState.executor && browser && !hasInitializedData) {
      (async () => {
        debugLog.info('WASM ready, checking for data availability...', 'MainPage-DataInit');
        debugLog.info('WASM ready, checking for data availability...', 'MainPage-DataInit');

        // Small delay to ensure WASM exports are fully populated
        await new Promise(resolve => setTimeout(resolve, 100));

        // Debug: Check what's actually available in globalThis
        debugLog.debug('=== GlobalThis Debug ===', 'MainPage-DataInit');
        debugLog.debug('globalThis keys: ' + Object.keys(globalThis).filter(k => !k.startsWith('webkit') && !k.startsWith('chrome')).join(', '), 'MainPage-DataInit');
        debugLog.debug('globalThis.data available: ' + (!!(globalThis as any).data), 'MainPage-DataInit');
        if ((globalThis as any).data) {
          debugLog.debug('globalThis.data keys: ' + Object.keys((globalThis as any).data).join(', '), 'MainPage-DataInit');
        }
        debugLog.debug('Functions available: Calculate=' + typeof (globalThis as any).Calculate + ', ReverseSearch=' + typeof (globalThis as any).ReverseSearch, 'MainPage-DataInit');
        debugLog.debug('========================', 'MainPage-DataInit');

        try {
        // Initialize jewels from globalThis where Go exports them (under data namespace)
        const timelessJewelsData = (globalThis as any).data?.TimelessJewels;
        if (timelessJewelsData && typeof timelessJewelsData === 'object') {
          jewels = Object.keys(timelessJewelsData).map(k => ({
            value: parseInt(k),
            label: timelessJewelsData[k]
          }));
          debugLog.info(`Jewels loaded: ${jewels.length}`, 'MainPage-DataInit');
          debugLog.info(`Jewels loaded: ${jewels.length}`, 'MainPage-DataInit');
        } else {
          debugLog.warn('TimelessJewels data not available in globalThis.data', 'MainPage-DataInit');
          debugLog.warn('Available globalThis.data keys: ' + Object.keys((globalThis as any).data || {}).join(', '), 'MainPage-DataInit');
        }

        // Initialize passive skills from globalThis where Go exports them (under data namespace)
        const passiveSkillsData = (globalThis as any).data?.PassiveSkills;
        if (passiveSkillsData && Array.isArray(passiveSkillsData)) {
          passiveSkills = passiveSkillsData
            .filter((skill: any) => skill !== undefined && skill !== null)
            .map((skill: any) => ({
              value: skill!.PassiveSkillGraphID,
              label: skill!.Name
            }));
          debugLog.info(`Passive skills loaded: ${passiveSkills.length}`, 'MainPage-DataInit');
          debugLog.info(`Passive skills loaded: ${passiveSkills.length}`, 'MainPage-DataInit');
        } else {
          debugLog.warn('PassiveSkills data not available in globalThis.data', 'MainPage-DataInit');
          debugLog.warn('Available globalThis.data keys: ' + Object.keys((globalThis as any).data || {}).join(', '), 'MainPage-DataInit');
        }

        JewelsAreNotInitialized = false;
        hasInitializedData = true;
        debugLog.info('Data initialization completed successfully', 'MainPage-DataInit');
        debugLog.info('Data initialization completed successfully', 'MainPage-DataInit');

        // Restore selections from URL params after data is loaded
        if (searchParams.has('jewel') && jewels.length > 0) {
          const jewelValue = parseInt(searchParams.get('jewel') || '0');
          const foundJewel = jewels.find(j => j.value === jewelValue);
          if (foundJewel) {
            selectedJewel = foundJewel;
            debugLog.info(`Restored jewel from URL: ${foundJewel.label}`, 'MainPage-URLRestore');
          }
        }

        if (searchParams.has('passive') && passiveSkills.length > 0) {
          const skillValue = parseInt(searchParams.get('passive') || '0');
          const foundSkill = passiveSkills.find(s => s.value === skillValue);
          if (foundSkill) {
            selectedPassiveSkill = foundSkill;
            debugLog.info(`Restored passive skill from URL: ${foundSkill.label}`, 'MainPage-URLRestore');
          }
        }

        if (searchParams.has('seed')) {
          seed = parseInt(searchParams.get('seed') || '0');
          debugLog.info(`Restored seed from URL: ${seed}`, 'MainPage-URLRestore');
        }        } catch (error) {
          captureError(error instanceof Error ? error : new Error(String(error)), 'MainPage-DataInit');
          console.error('Error during data initialization:', error);
          hasInitializedData = true; // Still mark as attempted to prevent infinite retries
        }
        })(); // Close the async IIFE
    }
  });

  // Conqueror selection effect
  $effect(() => {
    if (selectedJewel && enhancedWasmState.isReady && (globalThis as any).data?.TimelessJewelConquerors && browser) {
      if (availableConquerors.length === 0) {
        const conquerorData = (globalThis as any).data.TimelessJewelConquerors[selectedJewel.value];
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
    if (selectedPassiveSkill && seed && selectedJewel && selectedConqueror && (globalThis as any).Calculate) {
      try {
        debugLog.info(`Performing calculation: Jewel=${selectedJewel.label}, Conqueror=${selectedConqueror.label}, Passive=${selectedPassiveSkill.label}, Seed=${seed}`, 'MainPage-Calculation');
        debugLog.info('Performing calculation...', 'MainPage-Calculation');
        result = (globalThis as any).Calculate(selectedPassiveSkill.value, seed, selectedJewel.value, selectedConqueror.value);
        debugLog.info(`Calculation completed successfully`, 'MainPage-Calculation');
        debugLog.debug('Calculation result: ' + JSON.stringify(result), 'MainPage-Calculation');
      } catch (error: any) {
        captureError(error instanceof Error ? error : new Error(String(error)), 'MainPage-Calculation');
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

    // Update URL without page reload (SvelteKit style)
    goto(url.toString(), { replaceState: true });
  };
</script>

<svelte:head>
  <title>Timeless Jewel Calculator</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-row justify-center mb-8">
      <h1 class="text-3xl font-bold text-center">Timeless Jewel Calculator</h1>
    </div>

    {#if enhancedWasmState.isLoading}
      <div class="flex flex-col items-center justify-center min-h-96">
        <p class="text-white text-lg mb-4">Loading WASM data in modern mode, please wait...</p>
        <div class="mb-6">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
        <div class="text-sm text-gray-300 space-y-2 text-center">
          <p>Status: {enhancedWasmState.isLoading ? 'Loading...' : enhancedWasmState.isReady ? 'Ready' : 'Initializing...'}</p>
          <p>Progress: {Math.round(enhancedWasmState.progress || 0)}%</p>
          {#if enhancedWasmState.error}
            <p class="text-red-400">Error: {enhancedWasmState.error}</p>
          {/if}
          <p>Data Ready: {enhancedWasmState.isReady ? 'Yes' : 'No'}</p>
          <p>Browser ready: {browser ? 'Yes' : 'No'}</p>
          <p>WASM Ready: {enhancedWasmState.isReady ? 'Yes' : 'No'}</p>
          <p>WASM Loading: {enhancedWasmState.isLoading ? 'Yes' : 'No'}</p>
          <div class="mt-2">
            <div class="w-full bg-gray-700 rounded-full h-2">
              <div class="bg-orange-500 h-2 rounded-full transition-all duration-300" style="width: {Math.round(enhancedWasmState.progress || 0)}%"></div>
            </div>
          </div>
          <p class="text-xs mt-2">Check browser console for detailed loading progress...</p>
        </div>
      </div>
    {:else}
      <div class="py-10 flex flex-row justify-center w-screen h-screen">
        <div class="flex flex-col justify-between w-1/3">
          <!-- Skill Tree View Link -->
          <div class="text-center">
            <a href="{base}/tree" class="inline-block">
              <h2 class="text-orange-500 text-xl underline hover:text-orange-400 transition-colors">Skill Tree View</h2>
            </a>
          </div>

          <!-- Debug Info (don't remove until functional production build that works at least as well as original) -->
          <div class="bg-gray-800 p-4 rounded-lg text-sm">
            <h3 class="mb-2 font-semibold">Debug Info:</h3>
            <div class="space-y-1 text-gray-300">
              <p>Browser: {browser ? 'Available' : 'Not available'}</p>
              <p>WASM Ready: {enhancedWasmState.isReady ? 'Yes' : 'No'}</p>
              <p>Data Ready: {enhancedWasmState.isReady ? 'Yes' : 'No'}</p>
              <p>Jewels loaded: {jewels.length}</p>
              <p>Passive skills loaded: {passiveSkills.length}</p>
              <p>Available conquerors: {availableConquerors.length}</p>

              <!-- Enhanced WASM Debug Info with Copilot's state -->
              <div class="mt-3 pt-2 border-t border-gray-600">
                <p class="font-semibold text-yellow-400">WASM State (Copilot's Enhanced):</p>
                <p>Status: {enhancedWasmState.isLoading ? 'Loading...' : enhancedWasmState.isReady ? 'Ready' : 'Initializing...'}</p>
                <p>Progress: {enhancedWasmState.progress}%</p>
                <p>Is Loading: {enhancedWasmState.isLoading ? 'Yes' : 'No'}</p>
                <p>Is Ready: {enhancedWasmState.isReady ? 'Yes' : 'No'}</p>
                <p>Has Executor: {enhancedWasmState.executor ? 'Yes' : 'No'}</p>
                {#if enhancedWasmState.error}
                  <p class="text-red-400">WASM Error: {enhancedWasmState.error}</p>
                {/if}

                <div class="mt-2 space-x-2">
                  <button
                    class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                    onclick={() => {
                      debugLog.info("Manual WASM reload triggered with Copilot's approach...", 'MainPage-Manual');
                      debugLog.info("Manual WASM reload triggered with Copilot's approach...", 'MainPage-Manual');
                      startWasm();
                    }}>
                    Retry WASM Load
                  </button>
                  <button
                    class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                    onclick={() => {
                      debugLog.info("Manual error test triggered", 'MainPage-ErrorTest');
                      captureError(new Error("This is a test error to demonstrate the error page"), 'MainPage-ErrorTest');
                      throw new Error("Test error - check the error page!");
                    }}>
                    Test Error Page
                  </button>
                </div>

                <p class="text-xs text-gray-400 mt-2">Using Copilot's ?url approach - check browser console (F12) for detailed logs</p>
              </div>
            </div>
          </div>

          <!-- Calculator Interface -->
          <div class="bg-gray-800 p-6 rounded-lg space-y-4">
            <div>
              <h3 class="mb-2 text-lg font-semibold">Timeless Jewel</h3>
              <ModernSelect items={jewels} bind:value={selectedJewel} onchange={updateUrl} />
            </div>

            {#if selectedJewel && availableConquerors.length > 0}
              <div>
                <h3 class="mb-2 text-lg font-semibold">Conqueror</h3>
                <ModernSelect items={availableConquerors} bind:value={selectedConqueror} onchange={updateUrl} />
              </div>

              {#if selectedConqueror}
                <div>
                  <h3 class="mb-2 text-lg font-semibold">Passive Skill</h3>
                  <ModernSelect items={passiveSkills} bind:value={selectedPassiveSkill} onchange={updateUrl} />
                </div>

                {#if selectedPassiveSkill}
                  <div>
                    <label for="seed" class="block mb-2 text-lg font-semibold">Seed</label>
                    <input type="number" id="seed" bind:value={seed} oninput={e => updateUrl()} class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none" placeholder="Enter seed value" />
                  </div>

                  {#if result}
                    <div class="bg-gray-700 p-4 rounded">
                      <h3 class="mb-2 text-lg font-semibold">Result</h3>
                      <pre class="text-xs text-gray-300 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
                    </div>
                  {/if}
                {/if}
              {/if}
            {/if}
          </div>

          <!-- Footer Links -->
          <div class="flex justify-center pt-8">
            <div class="text-center text-orange-500 space-y-2">
              <a href="https://discord.gg/mfacademy" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center space-x-2 hover:text-orange-400 transition-colors">
                <img src="{assets}/mf-academy-logo.png" width="24" alt="MF Academy" class="rounded" />
                <span>MF Academy</span>
              </a>
              <div class="flex justify-center space-x-4">
                <a href="https://github.com/BlazesRus/timeless-jewels" target="_blank" rel="noopener noreferrer" class="hover:text-orange-400 transition-colors">Source (Github)</a>
                <a href="{base}/licenses.html" target="_blank" class="hover:text-orange-400 transition-colors">📄 Licenses</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
