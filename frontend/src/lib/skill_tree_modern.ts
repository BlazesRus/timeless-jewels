import type { Translation, Node, SkillTreeData, Group, Sprite, TranslationFile } from './skill_tree_types';
import { data } from './types/ModernTypes';
import { get } from 'svelte/store';
import { type Filter, type Query, filterGroupsToQuery, filtersToFilterGroup } from './utils/trade_utils';
import { chunkArray } from './utils/utils';

// Re-export types for convenience
export type { Query, Filter } from './utils/trade_utils';

export let skillTree: SkillTreeData;

export const drawnGroups: Record<number, Group> = {};
export const drawnNodes: Record<number, Node> = {};

export const inverseSprites: Record<string, Sprite> = {};
export const inverseSpritesActive: Record<string, Sprite> = {};

export const inverseTranslations: Record<string, Translation> = {};

export const passiveToTree: Record<number, number> = {};

export const loadSkillTree = () => {
  const dataValue = get(data) as any;
  if (!dataValue) {
    console.error('Data not available for skill tree loading');
    return;
  }
  
  skillTree = JSON.parse(dataValue.SkillTree);
  console.log('Loaded skill tree', skillTree);

  Object.keys(skillTree.groups).forEach(groupId => {
    const group = skillTree.groups[groupId];
    if (!group) {
      return;
    }
    
    group.nodes.forEach(nodeId => {
      const node = skillTree.nodes[nodeId];
      if (!node) {
        return;
      }

      // Do not care about proxy passives
      if (node.isProxy) {
        return;
      }

      // Do not care about class starting nodes
      if ('classStartIndex' in node) {
        return;
      }

      // Do not care about cluster jewels
      if (node.expansionJewel) {
        if (node.expansionJewel.parent) {
          return;
        }
      }

      // Do not care about blighted nodes
      if (node.isBlighted) {
        return;
      }

      // Do not care about ascendancies
      if (node.ascendancyName) {
        return;
      }

      drawnGroups[parseInt(groupId)] = group;
      drawnNodes[parseInt(nodeId)] = node;
    });
  });

  // Initialize sprites with null checks
  const scale = '0.3835';
  if (skillTree.sprites?.keystoneInactive?.[scale]?.coords) {
    const sprite = skillTree.sprites.keystoneInactive[scale];
    if (sprite) {
      Object.keys(sprite.coords).forEach(c => (inverseSprites[c] = sprite));
    }
  }
  if (skillTree.sprites?.notableInactive?.[scale]?.coords) {
    const sprite = skillTree.sprites.notableInactive[scale];
    if (sprite) {
      Object.keys(sprite.coords).forEach(c => (inverseSprites[c] = sprite));
    }
  }
  if (skillTree.sprites?.normalInactive?.[scale]?.coords) {
    const sprite = skillTree.sprites.normalInactive[scale];
    if (sprite) {
      Object.keys(sprite.coords).forEach(c => (inverseSprites[c] = sprite));
    }
  }
  if (skillTree.sprites?.masteryInactive?.[scale]?.coords) {
    const sprite = skillTree.sprites.masteryInactive[scale];
    if (sprite) {
      Object.keys(sprite.coords).forEach(c => (inverseSprites[c] = sprite));
    }
  }

  if (skillTree.sprites?.keystoneActive?.[scale]?.coords) {
    const sprite = skillTree.sprites.keystoneActive[scale];
    if (sprite) {
      Object.keys(sprite.coords).forEach(c => (inverseSpritesActive[c] = sprite));
    }
  }
  if (skillTree.sprites?.notableActive?.[scale]?.coords) {
    const sprite = skillTree.sprites.notableActive[scale];
    if (sprite) {
      Object.keys(sprite.coords).forEach(c => (inverseSpritesActive[c] = sprite));
    }
  }
  if (skillTree.sprites?.normalActive?.[scale]?.coords) {
    const sprite = skillTree.sprites.normalActive[scale];
    if (sprite) {
      Object.keys(sprite.coords).forEach(c => (inverseSpritesActive[c] = sprite));
    }
  }
  if (skillTree.sprites?.masteryInactive?.[scale]?.coords) {
    const sprite = skillTree.sprites.masteryInactive[scale];
    if (sprite) {
      Object.keys(sprite.coords).forEach(c => (inverseSpritesActive[c] = sprite));
    }
  }

  if (skillTree.sprites?.groupBackground?.[scale]?.coords) {
    const sprite = skillTree.sprites.groupBackground[scale];
    if (sprite) {
      Object.keys(sprite.coords).forEach(c => (inverseSprites[c] = sprite));
    }
  }
  if (skillTree.sprites?.frame?.[scale]?.coords) {
    const sprite = skillTree.sprites.frame[scale];
    if (sprite) {
      Object.keys(sprite.coords).forEach(c => (inverseSprites[c] = sprite));
    }
  }

  const dataForTranslations = get(data) as any;
  const translationFiles = [dataForTranslations.StatTranslationsJSON, dataForTranslations.PassiveSkillStatTranslationsJSON, dataForTranslations.PassiveSkillAuraStatTranslationsJSON];

  translationFiles.forEach(f => {
    const translations: TranslationFile = JSON.parse(f);

    translations.descriptors.forEach(t => {
      t.ids.forEach(id => {
        if (!(id in inverseTranslations)) {
          inverseTranslations[id] = t;
        }
      });
    });
  });

  // Checks if TreeToPassive is available before running code
  const dataForPassive = get(data) as any;
  if (dataForPassive && dataForPassive.TreeToPassive) {
    Object.keys(dataForPassive.TreeToPassive ?? {}).forEach(k => {
      const treeToPassiveEntry = dataForPassive.TreeToPassive?.[parseInt(k)];
      if (treeToPassiveEntry && typeof treeToPassiveEntry.Index !== 'undefined') {
        passiveToTree[treeToPassiveEntry.Index] = parseInt(k);
      }
    });
  }
};

const indexHandlers: Record<string, number> = {
  negate: -1,
  times_twenty: 1 / 20,
  canonical_stat: 1,
  per_minute_to_per_second: 60,
  milliseconds_to_seconds: 1000,
  display_indexable_support: 1,
  divide_by_one_hundred: 100,
  milliseconds_to_seconds_2dp_if_required: 1000,
  deciseconds_to_seconds: 10,
  old_leech_percent: 1,
  old_leech_permyriad: 10000,
  times_one_point_five: 1 / 1.5,
  '30%_of_value': 100 / 30,
  divide_by_one_thousand: 1000,
  divide_by_twelve: 12,
  divide_by_six: 6,
  per_minute_to_per_second_2dp_if_required: 60,
  '60%_of_value': 100 / 60,
  double: 1 / 2,
  negate_and_double: 1 / -2,
  multiply_by_four: 1 / 4,
  per_minute_to_per_second_0dp: 60,
  milliseconds_to_seconds_0dp: 1000,
  mod_value_to_item_class: 1,
  milliseconds_to_seconds_2dp: 1000,
  multiplicative_damage_modifier: 1,
  divide_by_one_hundred_2dp: 100,
  per_minute_to_per_second_1dp: 60,
  divide_by_one_hundred_2dp_if_required: 100,
  divide_by_ten_1dp_if_required: 10,
  milliseconds_to_seconds_1dp: 1000,
  divide_by_fifty: 50,
  per_minute_to_per_second_2dp: 60,
  divide_by_ten_0dp: 10,
  divide_by_one_hundred_and_negate: -100,
  tree_expansion_jewel_passive: 1,
  passive_hash: 1,
  divide_by_ten_1dp: 10,
  affliction_reward_type: 1,
  divide_by_five: 5,
  metamorphosis_reward_description: 1,
  divide_by_two_0dp: 2,
  divide_by_fifteen_0dp: 15,
  divide_by_three: 3,
  divide_by_twenty_then_double_0dp: 10,
  divide_by_four: 4
};

export type Point = {
  x: number;
  y: number;
};

export const toCanvasCoords = (x: number, y: number, offsetX: number, offsetY: number, scaling: number): Point => ({
  x: (Math.abs(skillTree.min_x) + x + offsetX) / scaling,
  y: (Math.abs(skillTree.min_y) + y + offsetY) / scaling
});

export const rotateAroundPoint = (center: Point, target: Point, angle: number): Point => {
  const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const nx = cos * (target.x - center.x) + sin * (target.y - center.y) + center.x;
  const ny = cos * (target.y - center.y) - sin * (target.x - center.x) + center.y;
  return {
    x: nx,
    y: ny
  };
};

export const orbit16Angles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
export const orbit40Angles = [0, 10, 20, 30, 40, 45, 50, 60, 70, 80, 90, 100, 110, 120, 130, 135, 140, 150, 160, 170, 180, 190, 200, 210, 220, 225, 230, 240, 250, 260, 270, 280, 290, 300, 310, 315, 320, 330, 340, 350];

export const orbitAngleAt = (orbit: number, index: number): number => {
  const nodesInOrbit = skillTree.constants?.skillsPerOrbit?.[orbit];
  if (!nodesInOrbit) {
    return 0;
  }
  
  if (nodesInOrbit == 16) {
    return orbit16Angles[orbit16Angles.length - index] || 0;
  } else if (nodesInOrbit == 40) {
    return orbit40Angles[orbit40Angles.length - index] || 0;
  } else {
    return 360 - (360 / nodesInOrbit) * index;
  }
};

export const calculateNodePos = (node: Node, offsetX: number, offsetY: number, scaling: number): Point => {
  if (node.group === undefined || node.orbit === undefined || node.orbitIndex === undefined) {
    return { x: 0, y: 0 };
  }

  const targetGroup = skillTree.groups[node.group];
  if (!targetGroup) {
    return { x: 0, y: 0 };
  }
  
  const targetAngle = orbitAngleAt(node.orbit, node.orbitIndex);

  const targetGroupPos = toCanvasCoords(targetGroup.x, targetGroup.y, offsetX, offsetY, scaling);
  const orbitRadius = skillTree.constants?.orbitRadii?.[node.orbit] || 0;
  const targetNodePos = toCanvasCoords(targetGroup.x, targetGroup.y - orbitRadius, offsetX, offsetY, scaling);
  return rotateAroundPoint(targetGroupPos, targetNodePos, targetAngle);
};

export const distance = (p1: Point, p2: Point): number => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

export const formatStats = (translation: Translation, stat: number): string | undefined => {
  let selectedTranslation = -1;

  for (let i = 0; i < translation.list.length; i++) {
    const t = translation.list[i];
    if (!t) {
      continue;
    }

    let matches = true;
    if (t.conditions?.length > 0) {
      const first = t.conditions[0];
      if (!first) {
        continue;
      }
      
      if (first.min !== undefined) {
        if (stat < first.min) {
          matches = false;
        }
      }

      if (first.max !== undefined) {
        if (stat > first.max) {
          matches = false;
        }
      }

      if (first.negated) {
        matches = !matches;
      }
    }

    if (matches) {
      selectedTranslation = i;
      break;
    }
  }

  if (selectedTranslation == -1) {
    return undefined;
  }

  const datum = translation.list[selectedTranslation];
  if (!datum) {
    return undefined;
  }

  let finalStat = stat;

  if (datum.index_handlers !== undefined) {
    if (Array.isArray(datum.index_handlers)) {
      if (datum.index_handlers?.length > 0 && datum.index_handlers[0]) {
        datum.index_handlers[0].forEach(handler => {
          finalStat = finalStat / (indexHandlers[handler] || 1);
        });
      }
    } else {
      Object.keys(datum.index_handlers).forEach(handler => {
        finalStat = finalStat / (indexHandlers[handler] || 1);
      });
    }
  }

  return datum.string.replace(/\{0(?::(.*?)d(.*?))\}/, '$1' + finalStat.toString() + '$2').replace(`{0}`, parseFloat(finalStat.toFixed(2)).toString());
};

export const baseJewelRadius = 1800;

export const getAffectedNodes = (socket: Node): Node[] => {
  const result: Node[] = [];

  const socketPos = calculateNodePos(socket, 0, 0, 1);
  for (const node of Object.values(drawnNodes)) {
    const nodePos = calculateNodePos(node, 0, 0, 1);

    if (distance(nodePos, socketPos) < baseJewelRadius) {
      result.push(node);
    }
  }

  return result;
};

type Stat = { Index: number; ID: string; Text: string };

const statCache: Record<number, Stat> = {};
export const getStat = (id: number | string): Stat => {
  const nId = typeof id === 'string' ? parseInt(id) : id;
  // Checks if stat is valid before running code
  if (!(nId in statCache)) {
    const dataForStat = get(data) as any;
    if (!dataForStat || typeof dataForStat.GetStatByIndex !== 'function') {
      throw new Error(`Data or GetStatByIndex method not available for stat id: ${nId}`);
    }
    const stat = dataForStat.GetStatByIndex(nId);
    if (!stat) {
      throw new Error(`Stat not found for id: ${nId}`);
    }
    statCache[nId] = stat;
  }
  const result = statCache[nId];
  if (!result) {
    throw new Error(`Stat not found in cache for id: ${nId}`);
  }
  return result;
};

export interface StatConfig {
  //Minimum number of node with related stat to include in search
  min: number;
  id: number;
  weight: number;
  //Minimum number of stat total in jewel in order to allow in search results
  minStatTotal: number;
}

export interface ReverseSearchConfig {
  jewel: number;
  conqueror: string;
  nodes: number[];
  stats: StatConfig[];
  minTotalWeight: number;
  //Minimum number of total targeted stats in search area
  minTotalStats: number;
}

export interface SearchWithSeed {
  seed: number;
  weight: number;
  statCounts: Record<number, number>;
  skills: {
    passive: number;
    stats: { [key: string]: number };
  }[];
  statTotal: Record<number, number>;
  //Total value of targeted stats in search area
  totalStats: number;
}

export interface SearchResults {
  grouped: { [key: number]: SearchWithSeed[] };
  raw: SearchWithSeed[];
}

export const translateStat = (id: number, roll?: number | undefined): string => {
  const stat = getStat(id);
  const translation = inverseTranslations[stat.ID];
  if (roll && translation) {
    return formatStats(translation, roll) || stat.ID;
  }

  let translationText = stat.Text || stat.ID;
  if (translation && translation.list && translation.list.length && translation.list[0]) {
    translationText = translation.list[0].string;
    translationText = translationText.replace(/\{\d(?::(.*?)d(.*?))\}/, '$1#$2').replace(/\{\d\}/, '#');
  }
  return translationText;
};

export const translateStatData = (id: string, roll?: number | undefined): string => {
  const stat = getStat(id);
  const translation = inverseTranslations[stat.ID];
  if (roll && translation) {
    return formatStats(translation, roll) || stat.ID;
  }

  let translationText = stat.Text || stat.ID;
  if (translation && translation.list && translation.list.length && translation.list[0]) {
    translationText = translation.list[0].string;
    translationText = translationText.replace(/\{\d(?::(.*?)d(.*?))\}/, '$1#$2').replace(/\{\d\}/, '#');
  }
  return translationText;
};

const tradeStatNames: { [key: number]: { [key: string]: string } } = {
  1: {
    Ahuana: 'explicit.pseudo_timeless_jewel_ahuana',
    Xibaqua: 'explicit.pseudo_timeless_jewel_xibaqua',
    Doryani: 'explicit.pseudo_timeless_jewel_doryani',
    Zerphi: 'explicit.pseudo_timeless_jewel_zerphi'
  },
  2: {
    Kaom: 'explicit.pseudo_timeless_jewel_kaom',
    Rakiata: 'explicit.pseudo_timeless_jewel_rakiata',
    Kiloava: 'explicit.pseudo_timeless_jewel_kiloava',
    Akoya: 'explicit.pseudo_timeless_jewel_akoya'
  },
  3: {
    Deshret: 'explicit.pseudo_timeless_jewel_deshret',
    Balbala: 'explicit.pseudo_timeless_jewel_balbala',
    Asenath: 'explicit.pseudo_timeless_jewel_asenath',
    Nasima: 'explicit.pseudo_timeless_jewel_nasima'
  },
  4: {
    Venarius: 'explicit.pseudo_timeless_jewel_venarius',
    Maxarius: 'explicit.pseudo_timeless_jewel_maxarius',
    Dominus: 'explicit.pseudo_timeless_jewel_dominus',
    Avarius: 'explicit.pseudo_timeless_jewel_avarius'
  },
  5: {
    Cadiro: 'explicit.pseudo_timeless_jewel_cadiro',
    Victario: 'explicit.pseudo_timeless_jewel_victario',
    Chitus: 'explicit.pseudo_timeless_jewel_chitus',
    Caspiro: 'explicit.pseudo_timeless_jewel_caspiro'
  }
};

export const constructSingleResultQuery = (jewel: number, conqueror: string | null, result: SearchWithSeed): Query => {
  const anyConqueror = conqueror === null;
  const jewelStats = tradeStatNames[jewel];
  
  if (!jewelStats) {
    throw new Error(`No trade stat names found for jewel: ${jewel}`);
  }

  const filters: Filter[] = Object.keys(jewelStats).map(conq => {
    const statId = jewelStats[conq];
    if (!statId) {
      throw new Error(`No stat ID found for conqueror: ${conq}`);
    }
    return {
      id: statId,
      value: {
        min: result.seed,
        max: result.seed
      },
      disabled: anyConqueror ? false : conq != conqueror
    };
  });

  const filterGroup = filtersToFilterGroup(filters, false);
  const query: Query = filterGroupsToQuery([filterGroup]);
  return query;
};

const constructSearchFilter = (jewel: number, conqueror: string | null, result: SearchWithSeed): Filter[] => {
  // null conqueror indicates to search for any conqueror
  const anyConqueror = conqueror === null;
  const jewelStats = tradeStatNames[jewel];
  
  if (!jewelStats) {
    throw new Error(`No trade stat names found for jewel: ${jewel}`);
  }
  
  const conquerors = anyConqueror ? Object.keys(jewelStats) : [conqueror].filter(c => c !== null);

  return conquerors.map(conq => {
    const statId = jewelStats[conq];
    if (!statId) {
      throw new Error(`No stat ID found for conqueror: ${conq}`);
    }
    return {
      id: statId,
      value: {
        min: result.seed,
        max: result.seed
      }
    };
  });
};

export const constructQueries = (jewel: number, conqueror: string | null, results: SearchWithSeed[]) => {
  const max_filter_length = 50;
  const max_filters = 4;
  const max_query_length = max_filter_length * max_filters;

  // convert all results into filters
  const allFilters = results.flatMap(result => constructSearchFilter(jewel, conqueror, result));

  // group filters into groups of max_query_length, where each group is further grouped into chunks of max_filter_length
  // this represents multiple trade links, where each trade link has multiple filter groups, and each filter group has multiple filters
  const queryFilterGroups = chunkArray(allFilters, max_query_length).map(chunk => chunkArray(chunk, max_filter_length));

  // map filters groups to queries
  const tradeQueries = queryFilterGroups.map(queryFilterGroup => {
    // for each query, map the chunks within it to filter groups
    const tradeFilterGroups = queryFilterGroup.map((filters, index) => filtersToFilterGroup(filters, index !== 0));
    const tradeQuery: Query = filterGroupsToQuery(tradeFilterGroups);
    return tradeQuery;
  });

  return tradeQueries;
};
