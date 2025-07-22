<script lang="ts">
  import { openQueryTrade } from '$lib/utils/trade_utils';
  import { constructSingleResultQuery, type SearchWithSeed } from '$lib/skill_tree_modern';
  import { skillTree, translateStat } from '$lib/skill_tree_modern';

  interface Props {
    highlight: (newSeed: number, passives: number[]) => void;
    set: SearchWithSeed;
    jewel: number;
    conqueror: string;
  }

  let { highlight, set, jewel, conqueror }: Props = $props();

  const handleOnClick = () =>
    highlight(
      set.seed,
      set.skills.map(s => s.passive)
    );
</script>

<div class="my-2 border-white/50 border p-2 flex flex-col cursor-pointer" onclick={handleOnClick} onkeydown={handleOnClick} role="button" tabindex="0">
  <div class="flex flex-row justify-between">
    <!-- Padding -->
    <button class="px-3 invisible">Trade</button>
    <div class="font-bold text-orange-500 text-center">
      Seed {set.seed} (weight {set.weight}) Stat Total: {set.totalStats}
    </div>
    <button class="px-3 bg-blue-500/40 rounded" onclick={() => openQueryTrade(constructSingleResultQuery(jewel, conqueror, set))}>Trade</button>
  </div>
  {#each set.skills as skill}
    <div class="mt-2">
      <span>
        {skillTree.nodes[skill.passive]?.name || 'Unknown'} ({skill.passive})
      </span>
      <ul class="list-disc pl-6 font-bold">
        {#each Object.keys(skill.stats) as stat}
          <li>{translateStat(parseInt(stat), skill.stats[stat])}</li>
        {/each}
      </ul>
    </div>
  {/each}
</div>
