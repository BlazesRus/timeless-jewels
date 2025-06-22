<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { base, assets } from '$app/paths';
  import { page } from '$app/state'; 

  import ModernSelect from '$lib/components/ModernSelect.svelte';
  import { data, calculator } from '$lib/types/ModernTypes.js';
  // Dynamic WASM loading - only importing initial value from ModernTypes
  // We'll load the WASM module dynamically in an effect

  // State variables with Svelte 5 runes
  let wasmStatus = $state<string>('Initializing...');
  let lastError = $state<string>('');
  let isWasmLoading = $state(true);

  //Attempting to initialize state from ModernTypes in case wasm load takes too long
  //Will attempt to load during wasm initialization in case initial value fails
  let calculatorValue = $state<any>(calculator ?? undefined);
  let dataValue = $state<any>(data ?? undefined);

  // Listen for WASM errors
  if (browser) {
    window.addEventListener('error', (e) => {
      if (e.message?.includes('wasm') || e.message?.includes('WASM') || e.message?.includes('Go')) {
        lastError = e.message;
        wasmStatus = 'WASM Error: ' + e.message;
      }
    });
  }

  // Initialize WASM dynamically
  $effect(() => {
    if (browser) {
      console.log('Starting dynamic WASM import...');
      wasmStatus = 'Loading WASM module...';
      // Dynamic import of WASM loader
      import('$lib/wasm/wasm-loader.js').then(async ({ loadWasm }) => {        
        try {
          wasmStatus = 'Initializing WASM...';
          const exports = await loadWasm();
          //Debugging to make sure calculator value gets imported
          if (!exports.calculator || exports.calculator == undefined) {
            console.log('Failed to load calculator value on wasm initialization');
          } else if (calculatorValue == undefined) {
            calculatorValue = exports.calculator;
            console.log('Calculator functions:', Object.keys(calculatorValue));
          } else {
            console.log('Already loaded calculator functions during initial load:', Object.keys(calculatorValue));
          }
          //Debugging to make sure gets data value gets imported
          if (!exports.data || exports.data == undefined) {
            console.log('Failed to load data value on wasm initialization');
          } else if (dataValue == undefined) {
            dataValue = exports.data;
            console.log('Data properties:', Object.keys(dataValue));
          } else {
            console.log('Already loaded data properties during initial load:', Object.keys(dataValue));
          }
          wasmStatus = 'WASM loaded successfully!';
          isWasmLoading = false;  
          console.log('WASM loaded successfully via dynamic import');
        } catch (error: any) {
          console.error('WASM loading failed:', error);
          lastError = error?.message || 'Unknown WASM error';
          wasmStatus = 'WASM loading failed';
          isWasmLoading = false;
        }
      }).catch((error: any) => {
        console.error('Failed to import WASM loader:', error);
        lastError = error?.message || 'Unknown import error';
        wasmStatus = 'Failed to load WASM module';
        isWasmLoading = false;
      });
    }
  });

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
  const searchParams = $derived(browser && page?.url?.searchParams ? page.url.searchParams : new URLSearchParams());

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
            .filter((skill: any) => skill !== undefined)
            .map((skill: any) => ({
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
      } catch (error: any) {
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

<!-- Dark background container matching CorrectFrontPage.png -->
<div class="min-h-screen bg-gray-900 text-white">
  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-row justify-center mb-8">
      <h1 class="text-3xl font-bold text-center">Timeless Jewel Calculator</h1>
    </div>
    
    {#if isWasmLoading}
      <div class="flex flex-col items-center justify-center min-h-96">
        <p class="text-white text-lg mb-4">Loading WASM data in modern mode, please wait...</p>
        <div class="mb-6">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
        <div class="text-sm text-gray-300 space-y-2 text-center">
          <p>Status: {wasmStatus}</p>
          {#if lastError}
            <p class="text-red-400">Error: {lastError}</p>
          {/if}
          <p>Calculator available: {calculatorValue ? 'Yes' : 'No'}</p>
          <p>Data available: {dataValue ? 'Yes' : 'No'}</p>
          <p>Browser ready: {browser ? 'Yes' : 'No'}</p>
          <p>Go object: {typeof (globalThis as any).Go !== 'undefined' ? 'Available' : 'Not found'}</p>
          <p>Go exports: {typeof (globalThis as any)['go'] !== 'undefined' ? 'Available' : 'Not found'}</p>
          <p>Timeless Jewels: {typeof (globalThis as any)['go']?.['timeless-jewels'] !== 'undefined' ? 'Available' : 'Not found'}</p>
          <button 
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onclick={(e) => {
              console.log('Manual debug check triggered');
              console.log('globalThis keys:', Object.keys(globalThis).filter(k => k.includes('go') || k.includes('Go')));
              console.log('globalThis.go:', (globalThis as any)['go']);
              console.log('globalThis.Go:', (globalThis as any).Go);
              if ((globalThis as any)['go']) {
                console.log('go keys:', Object.keys((globalThis as any)['go']));
              }
            }}
          >
            Debug GlobalThis
          </button>
          <p class="text-xs mt-2">Check browser console for detailed loading progress...</p>
        </div>
      </div>
    {:else}
      <!-- Main interface centered like CorrectFrontPage.png -->
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
              <p>WASM Ready: {calculatorValue ? 'Yes' : 'No'}</p>
              <p>Data loaded: {dataValue ? 'Yes' : 'No'}</p>
              <p>Jewels loaded: {jewels.length}</p>
              <p>Passive skills loaded: {passiveSkills.length}</p>
              <p>Available conquerors: {availableConquerors.length}</p>
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
                    <input type="number" id="seed" bind:value={seed} oninput={(e) => updateUrl()}
                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                      placeholder="Enter seed value"
                    />
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
              <a href="https://github.com/BlazesRus/timeless-jewels" target="_blank" rel="noopener noreferrer" class="block hover:text-orange-400 transition-colors">Source (Github)</a>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
