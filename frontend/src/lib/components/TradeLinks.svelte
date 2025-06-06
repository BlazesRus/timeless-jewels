<script lang="ts">
  import { openQueryTrade, type Query } from '$lib/utils/trade_utils';

  // Use $props() for runes mode compatibility
  interface Props {
    queries: Query[];
  }
  let { queries }: Props = $props();
</script>

<div class="flex flex-wrap gap-2.5 my-2">
  {#each queries as query, index (index)}
    <button class="p-1 px-3 bg-blue-500/40 rounded" onclick={() => openQueryTrade(query)}>
      Trade Batch {index + 1}
    </button>
  {/each}
</div>
