<script lang="ts">
  import { run } from 'svelte/legacy';
  import { openQueryTrade, type Query } from '../../utils/trade_utils';

  export let queries: Query[];
  export let showTradeLinks: boolean;

  run(() => {
    console.log(showTradeLinks);
  });

  let hasMultipleQueries = $derived(queries.length > 1);

  const handleOnClick = () => {
    if (queries.length === 1) {
      openQueryTrade(queries[0]);
    } else if (hasMultipleQueries) {
      showTradeLinks = !showTradeLinks;
    }
  };
</script>

<button
  class="p-1 px-3 bg-blue-500/40 rounded disabled:bg-blue-900/40 mr-2"
  on:click={handleOnClick}
  disabled={!queries}>
  {#if hasMultipleQueries}
    {#if showTradeLinks}
      Hide Trade Links
    {:else}
      Show Trade Links
    {/if}
  {:else}
    Trade
  {/if}
</button>
