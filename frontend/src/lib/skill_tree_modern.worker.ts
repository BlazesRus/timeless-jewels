import type { Translation, Node, SkillTreeData, Group, Sprite, TranslationFile } from './skill_tree_types';
import { data } from './types/ModernTypes.worker';
import { type Filter, type Query, filterGroupsToQuery, filtersToFilterGroup } from './utils/trade_utils';
import { chunkArray } from './utils/utils';

// Re-export types for convenience
export type { Query, Filter } from './utils/trade_utils';

export let skillTree: SkillTreeData;
export let alternateTreeVersions: any;
export let alternatePassiveSkills: any;
export let alternatePassiveAdditions: any;

export async function loadSkillTree(): Promise<void> {
  const dataValue = data.get() as any;
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
  const dataForPassive = data.get() as any;
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
export interface SearchWithSeed {
  seed: number;
  nodes: number[];
  stats: Array<{ id: string; text: string }>;
  jewel: number;
  conqueror: string;
}

export interface ReverseSearchConfig {
  nodes: number[];
  stats: Array<{ id: string; text: string }>;
  jewel: number;
  conqueror: string;
  seedRange?: { min: number; max: number };
  maxResults?: number;
}

export interface SearchResults {
  results: SearchWithSeed[];
  totalSearched: number;
  completed: boolean;
  error?: string;
}
