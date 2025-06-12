<script lang="ts">
  import Select from 'svelte-select';
  
  let items = [
    { value: 1, label: 'Option 1' },
    { value: 2, label: 'Option 2' },
    { value: 3, label: 'Option 3' }
  ];
  
  let selectedValue = undefined;
  
  console.log('Select component imported:', Select);
</script>

<div class="p-8">
  <h1>Select Component Test</h1>
  
  <div class="mt-4 themed">
    <h3 class="mb-2">Test Select (Themed)</h3>
    <Select {items} bind:value={selectedValue} placeholder="Choose an option..." />
  </div>
  
  <div class="mt-4">
    <h3 class="mb-2">Test Select (No Theme)</h3>
    <Select {items} bind:value={selectedValue} placeholder="Choose an option..." />
  </div>
  
  <div class="mt-4">
    <p>Selected value: {JSON.stringify(selectedValue)}</p>
  </div>
</div>
