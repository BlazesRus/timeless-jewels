import type { Translation, Node, SkillTreeData, Group, Sprite, TranslationFile } from './skill_tree_types_legacy';
import { data } from './types/LegacyTypes';
import { get } from 'svelte/store';
import { type Filter, type Query, filterGroupsToQuery, filtersToFilterGroup } from './utils/trade_utils';
import { chunkArray } from './utils/utils';

// Re-export types for convenience
export type { Query, Filter } from './utils/trade_utils';

export let skillTree: SkillTreeData;
export let treeToPassive: Record<number, number> = {};
export let passiveToTree: Record<number, number> = {};
export let translations: Record<string, Translation> = {};
export let statTranslations: Record<string, Translation> = {};

type Conqueror = "VAAL" | "KARUI" | "ETERNAL" | "MARAKETH" | "TEMPLAR";

interface ReverseSearchConfig {
  nodes: number[];
  stats: StatConfig[];
  jewel: number;
  conqueror: number;
  minTotalWeight: number;
  minTotalStats: number;
}

interface StatConfig {
  id: number;
  weight: number;
  min: number;
  minStatTotal: number;
}

interface SearchWithSeed {
  skills: Array<{
    passive: number;
    stats: Record<number, number>;
  }>;
  seed: number;
  weight: number;
  statCounts: Record<number, number>;
  statTotal: Record<number, number>;
  totalStats: number;
}

interface SearchResults {
  grouped: { [key: number]: SearchWithSeed[] };
  raw: SearchWithSeed[];
}

export type { ReverseSearchConfig, StatConfig, SearchWithSeed, SearchResults };

export async function loadSkillTree() {
  console.log('loadSkillTree called');
  if (skillTree) {
    console.log('skillTree already loaded');
    return;
  }

  const dataValue = get(data);
  if (!dataValue) {
    console.error('Data not available');
    return;
  }

  try {
    const skillTreeData = JSON.parse(dataValue.SkillTree()) as SkillTreeData;
    skillTree = skillTreeData;
    console.log('skillTree loaded');

    // Build tree to passive mapping
    Object.keys(skillTree.nodes).forEach(nodeIdStr => {
      const nodeId = parseInt(nodeIdStr);
      const node = skillTree.nodes[nodeId];
      if (node.isKeystone || node.isNotable || node.isJewelSocket || (!node.isAscendancyStart && !node.ascendancyName)) {
        treeToPassive[nodeId] = node.skill || nodeId;
        passiveToTree[node.skill || nodeId] = nodeId;
      }
    });

    console.log('Tree to passive mapping built:', Object.keys(treeToPassive).length, 'entries');

    // Load translations
    const translationsData = JSON.parse(dataValue.StatTranslationsJSON()) as TranslationFile;
    translations = translationsData.reduce((acc, item) => {
      acc[item.ids.join(',')] = item;
      return acc;
    }, {} as Record<string, Translation>);

    const statTranslationsData = JSON.parse(dataValue.PassiveSkillStatTranslationsJSON()) as TranslationFile;
    statTranslations = statTranslationsData.reduce((acc, item) => {
      acc[item.ids.join(',')] = item;
      return acc;
    }, {} as Record<string, Translation>);

    console.log('Translations loaded:', Object.keys(translations).length, 'stat translations:', Object.keys(statTranslations).length);

  } catch (error) {
    console.error('Error loading skill tree:', error);
  }
}

export function nodeToTreeId(nodeId: number): number {
  return passiveToTree[nodeId] || nodeId;
}

export function treeToNode(treeId: number): number {
  return treeToPassive[treeId] || treeId;
}

export function getNodeById(nodeId: number): Node | undefined {
  return skillTree?.nodes?.[nodeId];
}

export function getNodeByTreeId(treeId: number): Node | undefined {
  const nodeId = treeToPassive[treeId] || treeId;
  return getNodeById(nodeId);
}

export function getTranslation(statIds: number[]): Translation | undefined {
  const key = statIds.join(',');
  return translations[key] || statTranslations[key];
}

export function translateStat(statIds: number[], values: number[]): string {
  const translation = getTranslation(statIds);
  if (!translation) {
    return `Unknown stat: ${statIds.join(', ')}`;
  }

  // Use the first format string for now
  let format = translation.english[0].format[0] || '';
  
  // Simple placeholder replacement
  values.forEach((value, index) => {
    format = format.replace(`{${index}}`, value.toString());
    format = format.replace(`{${index}:+d}`, value > 0 ? `+${value}` : value.toString());
    format = format.replace(`{${index}:d}`, value.toString());
  });

  return format;
}

export function formatStatValue(value: number, statId: number): string {
  // Basic formatting - can be enhanced based on stat type
  if (value === 0) return '0';
  if (value > 0) return `+${value}`;
  return value.toString();
}

// Enhanced search functionality
export function searchNodesByName(query: string): Node[] {
  if (!skillTree || !query.trim()) return [];
  
  const searchTerm = query.toLowerCase().trim();
  const results: Node[] = [];

  Object.values(skillTree.nodes).forEach(node => {
    if (node.name && node.name.toLowerCase().includes(searchTerm)) {
      results.push(node);
    }
  });

  return results.slice(0, 50); // Limit results
}

export function getNodesInRadius(centerNodeId: number, radius: number): Node[] {
  if (!skillTree) return [];
  
  const visited = new Set<number>();
  const queue: Array<{nodeId: number, distance: number}> = [{nodeId: centerNodeId, distance: 0}];
  const results: Node[] = [];

  while (queue.length > 0) {
    const {nodeId, distance} = queue.shift()!;
    
    if (visited.has(nodeId) || distance > radius) continue;
    visited.add(nodeId);

    const node = skillTree.nodes[nodeId];
    if (node) {
      results.push(node);
      
      // Add connected nodes
      if (distance < radius && node.out) {
        node.out.forEach(connectedId => {
          if (!visited.has(connectedId)) {
            queue.push({nodeId: connectedId, distance: distance + 1});
          }
        });
      }
    }
  }

  return results;
}

export function getPathBetweenNodes(fromId: number, toId: number): number[] {
  if (!skillTree || fromId === toId) return [];

  const visited = new Set<number>();
  const queue: Array<{nodeId: number, path: number[]}> = [{nodeId: fromId, path: [fromId]}];

  while (queue.length > 0) {
    const {nodeId, path} = queue.shift()!;
    
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    if (nodeId === toId) {
      return path;
    }

    const node = skillTree.nodes[nodeId];
    if (node && node.out) {
      node.out.forEach(connectedId => {
        if (!visited.has(connectedId)) {
          queue.push({nodeId: connectedId, path: [...path, connectedId]});
        }
      });
    }
  }

  return []; // No path found
}

// Group and class utilities
export function getNodesByGroup(groupId: number): Node[] {
  if (!skillTree) return [];
  
  return Object.values(skillTree.nodes).filter(node => node.g === groupId);
}

export function getNodesByClass(className: string): Node[] {
  if (!skillTree) return [];
  
  const classId = getClassIdByName(className);
  if (classId === -1) return [];
  
  return Object.values(skillTree.nodes).filter(node => 
    node.spc && node.spc.includes(classId)
  );
}

export function getClassIdByName(className: string): number {
  if (!skillTree) return -1;
  
  const classMap: Record<string, number> = {
    'Scion': 0,
    'Marauder': 1,
    'Ranger': 2,
    'Witch': 3,
    'Duelist': 4,
    'Templar': 5,
    'Shadow': 6
  };
  
  return classMap[className] ?? -1;
}

// Jewel socket utilities
export function getJewelSockets(): Node[] {
  if (!skillTree) return [];
  
  return Object.values(skillTree.nodes).filter(node => node.isJewelSocket);
}

export function getNodesInJewelRadius(jewelSocketId: number): Node[] {
  if (!skillTree) return [];
  
  const jewelSocket = skillTree.nodes[jewelSocketId];
  if (!jewelSocket || !jewelSocket.isJewelSocket) return [];
  
  // Standard jewel radius is typically 2-3 nodes
  return getNodesInRadius(jewelSocketId, 3);
}

// Enhanced stat utilities
export function getStatById(statId: number): any {
  const dataValue = get(data);
  if (!dataValue) return null;
  
  try {
    return dataValue.GetStatByIndex(statId);
  } catch (error) {
    console.error('Error getting stat:', error);
    return null;
  }
}

export function getPassiveSkillById(skillId: number): any {
  const dataValue = get(data);
  if (!dataValue) return null;
  
  try {
    return dataValue.GetPassiveSkillByIndex(skillId);
  } catch (error) {
    console.error('Error getting passive skill:', error);
    return null;
  }
}

// Trade utility integration
export function createTradeQuery(filters: Filter[]): Query {
  const filterGroup = filtersToFilterGroup(filters);
  return filterGroupsToQuery([filterGroup]);
}

export function processTradeResults(results: any[]): any[] {
  // Process and chunk trade results
  return chunkArray(results, 50);
}

// Validation utilities
export function validateNodeId(nodeId: number): boolean {
  return skillTree && nodeId in skillTree.nodes;
}

export function validateStatId(statId: number): boolean {
  const dataValue = get(data);
  if (!dataValue) return false;
  
  try {
    const stat = dataValue.GetStatByIndex(statId);
    return stat != null;
  } catch {
    return false;
  }
}

// Cache management
let skillTreeCache: SkillTreeData | null = null;

export function clearSkillTreeCache(): void {
  skillTreeCache = null;
  skillTree = undefined as any;
  treeToPassive = {};
  passiveToTree = {};
  translations = {};
  statTranslations = {};
}

export function getSkillTreeCached(): SkillTreeData | null {
  return skillTreeCache || skillTree || null;
}

// Export validation
export function isSkillTreeLoaded(): boolean {
  return !!skillTree && Object.keys(skillTree.nodes).length > 0;
}

// Conqueror utilities for legacy compatibility
export function getConquerorName(conquerorId: number): string {
  const conquerorNames: Record<number, string> = {
    1: "Vaal",
    2: "Karui", 
    3: "Eternal",
    4: "Maraketh",
    5: "Templar"
  };
  return conquerorNames[conquerorId] || "Unknown";
}

export function getTimelessJewelName(jewelId: number): string {
  const dataValue = get(data);
  if (!dataValue) return "Unknown";
  
  try {
    const jewels = JSON.parse(dataValue.TimelessJewels());
    return jewels[jewelId]?.name || "Unknown";
  } catch {
    return "Unknown";
  }
}
