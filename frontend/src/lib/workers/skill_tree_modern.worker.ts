import type { Translation, Node, SkillTreeData, Group, Sprite, TranslationFile } from '../skill_tree_types_modern';
import { getData } from '../types/ModernTypes.worker';
import { type Filter, type Query, filterGroupsToQuery, filtersToFilterGroup } from '../utils/trade_utils';
import { chunkArray } from '../utils/utils';

// Re-export types for worker use
export type { Query, Filter } from '../utils/trade_utils';

export let skillTree: SkillTreeData;
export let alternateTreeVersions: any;
export let alternatePassiveSkills: any;
export let alternatePassiveAdditions: any;

export async function loadSkillTree(): Promise<void> {
  const dataValue = getData() as any;
  if (!dataValue) {
    console.warn('Data not available for skill tree loading');
    return;
  }

  try {
    skillTree = dataValue.SkillTree;
    alternateTreeVersions = dataValue.AlternateTreeVersions;
    alternatePassiveSkills = dataValue.AlternatePassiveSkills;
    alternatePassiveAdditions = dataValue.AlternatePassiveAdditions;

    console.log('Skill tree loaded in worker');
  } catch (error) {
    console.error('Failed to load skill tree in worker:', error);
    throw error;
  }
}

export interface Point {
  x: number;
  y: number;
}

// Minimal tree to passive conversion for workers
export function passiveToTree(passiveSkillId: number): any {
  const dataForPassive = getData() as any;
  if (!dataForPassive?.PassiveSkills) {
    console.warn('PassiveSkills data not available');
    return null;
  }

  const passive = dataForPassive.PassiveSkills.find((p: any) => p?.PassiveSkillGraphID === passiveSkillId);
  if (!passive) {
    console.warn(`Passive skill ${passiveSkillId} not found`);
    return null;
  }

  return {
    id: passive.PassiveSkillGraphID,
    name: passive.Name || 'Unknown',
    stats: passive.Stats || []
  };
}

// Additional worker-specific search types and interfaces
export interface StatConfig {
  //Minimum number of node with related stat to include in search
  min: number;
  id: number;
  weight: number;
  //Minimum number of stat total in jewel in order to allow in search results
  minStatTotal: number;
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

export interface ReverseSearchConfig {
  jewel: number;
  conqueror: string;
  nodes: number[];
  stats: StatConfig[];
  minTotalWeight: number;
  //Minimum number of total targeted stats in search area
  minTotalStats: number;
}

export interface SearchResults {
  grouped: { [key: number]: SearchWithSeed[] };
  raw: SearchWithSeed[];
}
