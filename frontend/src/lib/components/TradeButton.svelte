<script lang="ts">
  import type { Query } from '$lib/utils/trade_utils';
  import { openQueryTrade } from '$lib/utils/trade_utils';

  export let queries: Query[];
  export let showTradeLinks = false;

  $: hasMultipleQueries = queries.length > 1;

  const handleOnClick = () => {
    if (queries.length === 1) {
      // if all filter fit into a single query, link straight to trade website
      openQueryTrade(queries[0]);
    } else if (hasMultipleQueries) {
      // otherwise toggle display of batched trade links
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
