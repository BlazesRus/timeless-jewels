<!-- @migration-task Error while migrating Svelte code: `<script>` was left open -->
<script lang="ts">
  import SkillTree from '../../lib/components/SkillTree.svelte';
  import Select from 'svelte-select';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { Node } from '../../lib/skill_tree_types';
  import { getAffectedNodes, skillTree, translateStat, constructQueries } from '../../lib/skill_tree';
  import { syncWrap } from '../../lib/worker';
  import { proxy } from 'comlink';
  import type { Query, ReverseSearchConfig, StatConfig } from '../../lib/skill_tree';
  import SearchResults from '../../lib/components/SearchResults.svelte';
  import { statValues } from '../../lib/values';
  import { data, calculator } from '../../lib/types';
  import TradeButton from '$lib/components/TradeButton.svelte';
  import TradeLinks from '$lib/components/TradeLinks.svelte';

  const searchParams = $page.url.searchParams;

  // Defensive: fallback to empty object if undefined
  const timelessJewels = data?.TimelessJewels ?? {};
  const timelessJewelConquerors = data?.TimelessJewelConquerors ?? {};
  const timelessJewelSeedRanges = data?.TimelessJewelSeedRanges ?? {};
  const treeToPassive = data?.TreeToPassive ?? {};
  const allPossibleStats: { [key: string]: { [key: string]: number } } = data?.PossibleStats ? JSON.parse(data.PossibleStats) : {};

  const jewels = Object.keys(timelessJewels).map((k) => ({
    value: Number(k),
    label: timelessJewels[Number(k)]
  }));

  let selectedJewel = (searchParams.has('jewel') && jewels.find((j) => j.value === Number(searchParams.get('jewel')))) || undefined;

  $: conquerors = selectedJewel && timelessJewelConquerors[selectedJewel.value]
    ? Object.keys(timelessJewelConquerors[selectedJewel.value] ?? {}).map((k) => ({
        value: k,
        label: k
      }))
    : [];

  $: dropdownConqs = conquerors.concat([{ value: 'Any', label: 'Any' }]);

  let dropdownConqueror = searchParams.has('conqueror')
    ? {
        value: searchParams.get('conqueror'),
        label: searchParams.get('conqueror')
      }
    : undefined;

  $: anyConqueror = dropdownConqueror?.value === 'Any';

  $: selectedConqueror = dropdownConqueror?.value === 'Any' ? conquerors[0] : dropdownConqueror;

  let seed: number = searchParams.has('seed') ? parseInt(searchParams.get('seed')) : 0;

  //Trying to reduce need to check location twice while still staying preventing parsing null
  function getCircledNode(): number | undefined {
    if(searchParams.has('location'))
    {
        nodeLoc = searchParams.get('location');
        if(nodeLoc)
            return parseInt(nodeLoc)
        else
            return undefined
    }
    return undefined
  }

  let circledNode: number | undefined = getCircledNode();

  $: affectedNodes = circledNode
    ? getAffectedNodes(skillTree.nodes[circledNode]).filter((n) => !n.isJewelSocket && !n.isMastery)
    : [];

  // Fix usages in affectedNodes/seedResults mapping
  // Fix: ensure getTreeToPassive only called with defined skill
  function getTreeToPassiveSafe(skill: number | undefined) {
    if (typeof skill !== 'number') return undefined;
    return treeToPassive && typeof treeToPassive[skill] !== 'undefined' ? treeToPassive[skill] : undefined;
  }

  // Fix: remove type predicate in .filter, just use .filter(Boolean) and cast as needed
  $: seedResults =
    !seed ||
    !selectedJewel ||
    !selectedConqueror ||
    !(timelessJewelConquerors[selectedJewel.value]) ||
    Object.keys(timelessJewelConquerors[selectedJewel.value] ?? {}).indexOf(selectedConqueror.value ?? '') < 0
      ? []
      : affectedNodes
          .map((n) => getTreeToPassiveSafe(n.skill))
          .filter(Boolean)
          .map((tp) => ({
            node: (tp as { Index: number }).Index, // Specify type instead of any
            result: calculator.Calculate(
              selectedJewel?.value ?? 0,
              seed,
              selectedJewel?.value ?? 0,
              selectedConqueror?.value ?? ''
            )
          }));

  let selectedStats: Record<number, StatConfig> = {};
  if (searchParams.has('stat')) {
    for (const s of searchParams.getAll('stat')) {
      const nStat = parseInt(s);
      selectedStats[nStat] = {
        weight: 1,
        min: 0,
        id: nStat,
        minStatTotal: 0
      };
    }
  }

  let mode = searchParams.has('mode') ? searchParams.get('mode') : '';

  const updateUrl = () => {
    if (!_window || !_URL) return;
    const url = new _URL(_window.location.origin + _window.location.pathname);
    if (selectedJewel)
      url.searchParams.append('jewel', selectedJewel.value.toString());
    if (dropdownConqueror && dropdownConqueror.value !== undefined && dropdownConqueror.value !== null && dropdownConqueror.value !== '')
      url.searchParams.append('conqueror', String(dropdownConqueror.value));
    else
      url.searchParams.append('conqueror', "Any");
    if (typeof seed === 'number' && !isNaN(seed))
      url.searchParams.append('seed', seed.toString());
    if (circledNode !== undefined && circledNode !== null)
      url.searchParams.append('location', circledNode.toString());
    if (mode && mode !== '') 
      url.searchParams.append('mode', mode);

    Object.keys(selectedStats).forEach((s) => {
      url.searchParams.append('stat', s.toString());
    });

    goto(url.toString());
  };

  const setMode = (newMode: string) => {
    mode = newMode;
    updateUrl();
  };

  let disabled = new Set();
  const clickNode = (node: Node) => {
    if (node.isJewelSocket) {
      circledNode = node.skill;
      updateUrl();
    } else if (!node.isMastery) {
      if (disabled.has(node.skill)) {
        disabled.delete(node.skill);
      } else {
        disabled.add(node.skill);
      }
      // Re-assign to update svelte
      disabled = disabled;
    }
  };

  function getStatValue(id: string | number) {
    return (statValues as Record<string, number>)[String(id)] || 0;
  }
  function getAllPossibleStat(jewel: number | undefined, id: string | number) {
    if (!jewel || !allPossibleStats[jewel]) return 0;
    return (allPossibleStats[jewel] as Record<string | number, number>)[id] || 0;
  }
  function sanitize(html: string): string {
    // Very basic sanitizer: strips script/style tags and on* attributes
    return html.replace(/<script.*?>.*?<\/script>/gi, '')
               .replace(/<style.*?>/*$$__STYLE_CONTENT__$$*/</style>
