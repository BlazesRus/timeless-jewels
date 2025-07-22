<script lang="ts">
  import { openQueryTrade, type Query } from '$lib/utils/trade_utils';

  interface Props {
    queries: Query[];
    showTradeLinks?: boolean;
  }

  let { queries, showTradeLinks = $bindable(false) }: Props = $props();

  const hasMultipleQueries = $derived(queries?.length > 1);

  function handleOnClick() {
    if (queries?.length === 1 && queries[0]) {
      openQueryTrade(queries[0]);
    } else if (hasMultipleQueries) {
      showTradeLinks = !showTradeLinks;
    }
  }
</script>

<button class="p-1 px-3 bg-blue-500/40 rounded disabled:bg-blue-900/40 mr-2" onclick={handleOnClick} disabled={!queries || queries.length === 0}>
  {hasMultipleQueries ? (showTradeLinks ? 'Hide Trade Links' : 'Show Trade Links') : 'Trade'}
</button>
