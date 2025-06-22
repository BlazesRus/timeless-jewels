// Modern (Svelte 5) version of skill tree types
// This file includes all the original types plus modern enhancements

export interface Asset {
  '0.1246': string;
  '0.2109': string;
  '0.2972': string;
  '0.3835': string;
}

export interface FlavourTextRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Ascendancy {
  id: string;
  name: string;
  flavourText?: string;
  flavourTextColour?: string;
  flavourTextRect?: FlavourTextRect;
}

export interface CharacterAttributes {
  Strength: number;
  Dexterity: number;
  Intelligence: number;
}

export interface Classes {
  StrDexIntClass: number;
  StrClass: number;
  DexClass: number;
  IntClass: number;
  StrDexClass: number;
  StrIntClass: number;
  DexIntClass: number;
}

export interface Constants {
  classes: Classes;
  characterAttributes: CharacterAttributes;
  PSSCentreInnerRadius: number;
  skillsPerOrbit: number[];
  orbitRadii: number[];
}

export interface ExtraImage {
  x: number;
  y: number;
  image: string;
}

export interface Group {
  x: number;
  y: number;
  orbits: number[];
  nodes: string[];
  isProxy?: boolean;
}

export interface ExpansionJewel {
  size: number;
  index: number;
  proxy: string;
  parent?: string;
}

export interface MasteryEffect {
  effect: number;
  stats: string[];
  reminderText?: string[];
}

export interface Node {
  skill?: number;
  name?: string;
  icon?: string;
  isNotable?: boolean;
  recipe?: string[];
  stats?: string[];
  group?: number;
  orbit?: number;
  orbitIndex?: number;
  out?: string[];
  in?: string[];
  reminderText?: string[];
  isMastery?: boolean;
  inactiveIcon?: string;
  activeIcon?: string;
  activeEffectImage?: string;
  masteryEffects?: MasteryEffect[];
  grantedStrength?: number;
  ascendancyName?: string;
  grantedDexterity?: number;
  isAscendancyStart?: boolean;
  isMultipleChoice?: boolean;
  grantedIntelligence?: number;
  isJewelSocket?: boolean;
  expansionJewel?: ExpansionJewel;
  grantedPassivePoints?: number;
  isKeystone?: boolean;
  flavourText?: string[];
  isProxy?: boolean;
  isMultipleChoiceOption?: boolean;
  isBlighted?: boolean;
  classStartIndex?: number;
}

export interface Points {
  totalPoints: number;
  ascendancyPoints: number;
}

export interface Coord {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Sprite {
  filename: string;
  coords: { [key: string]: Coord };
}

export interface Sprites {
  normalActive: { [key: string]: Sprite };
  notableActive: { [key: string]: Sprite };
  keystoneActive: { [key: string]: Sprite };
  normalInactive: { [key: string]: Sprite };
  notableInactive: { [key: string]: Sprite };
  keystoneInactive: { [key: string]: Sprite };
  mastery: { [key: string]: Sprite };
  masteryConnected: { [key: string]: Sprite };
  masteryActiveSelected: { [key: string]: Sprite };
  masteryInactive: { [key: string]: Sprite };
  masteryActiveEffect: { [key: string]: Sprite };
  groupBackground: { [key: string]: Sprite };
  frame: { [key: string]: Sprite };
}

export interface RenderParams {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
}

export type RenderFunc = (params: RenderParams) => void;

export interface Condition {
  min?: number;
  max?: number;
  negated?: boolean;
}

export interface TranslationData {
  conditions: Condition[];
  index_handlers: Array<string[]> | { [key: string]: unknown };
  string: string;
}

export interface Translation {
  list: TranslationData[];
  ids: string[];
  hidden?: boolean;
}

export interface TranslationFile {
  descriptors: Translation[];
  includes: string[];
}

export interface Class {
  name: string;
  base_str: number;
  base_dex: number;
  base_int: number;
  ascendancies: Ascendancy[];
}

export interface SkillTreeData {
  tree: string;
  classes: Class[];
  groups: { [key: string]: Group };
  nodes: { [key: string]: Node };
  extraImages: { [key: string]: ExtraImage };
  jewelSlots: number[];
  min_x: number;
  min_y: number;
  max_x: number;
  max_y: number;
  assets: { [key: string]: Asset };
  constants: Constants;
  sprites: Sprites;
  imageZoomLevels: number[];
  points: Points;
}

// Modern enhancements - Additional types for WASM integration
export interface AlternatePassiveSkillInformation {
  AlternatePassiveSkill?: {
    Index: number;
    ID: string;
    AlternateTreeVersionsKey: number;
    Name: string;
    PassiveType?: Array<number>;
    StatsKeys?: Array<number>;
    Stat1Min: number;
    Stat1Max: number;
    Stat2Min: number;
    Stat2Max: number;
    Stat3Min: number;
    Stat3Max: number;
    Stat4Min: number;
    Stat4Max: number;
    SpawnWeight: number;
    ConquerorIndex: number;
    RandomMin: number;
    RandomMax: number;
    ConquerorVersion: number;
    GetStatMinMax(arg1: boolean, arg2: number): number;
  };
  StatRolls?: Record<number, number>;
  AlternatePassiveAdditionInformations?: Array<{
    AlternatePassiveAddition?: {
      Index: number;
      ID: string;
      AlternateTreeVersionsKey: number;
      SpawnWeight: number;
      StatsKeys?: Array<number>;
      Stat1Min: number;
      Stat1Max: number;
      Stat2Min: number;
      Stat2Max: number;
      PassiveType?: Array<number>;
      GetStatMinMax(arg1: boolean, arg2: number): number;
    };
    StatRolls?: Record<number, number>;
  }>;
}

// Modern search and interaction types
export interface NodeClickHandler {
  (node: Node): void;
}

export interface NodeSelection {
  circledNode?: number;
  disabled: Set<number>;
  highlighted: number[];
}

// Modern state management types for Svelte 5 runes
export interface JewelOption {
  value: number;
  label: string;
}

export interface ConquerorOption {
  value: string;
  label: string;
}

export interface SearchState {
  selectedJewel?: JewelOption;
  selectedConqueror?: ConquerorOption;
  seed: number;
  mode: 'seed' | 'stats' | '';
  isSearching: boolean;
  results: boolean;
}

// Enhanced type safety for modern usage
export type SkillTreeMode = 'seed' | 'stats';
export type SearchMode = 'seed' | 'stats' | '';

// Type guards for runtime checks
export function isValidNode(node: unknown): node is Node {
  return typeof node === 'object' && node !== null && 'skill' in node;
}

export function isJewelSocket(node: Node): boolean {
  return node.isJewelSocket === true;
}

export function isMastery(node: Node): boolean {
  return node.isMastery === true;
}

export function isNotable(node: Node): boolean {
  return node.isNotable === true;
}

export function isKeystone(node: Node): boolean {
  return node.isKeystone === true;
}

// Modern utility types
export type NodeFilter = (node: Node) => boolean;
export type NodeMapper<T> = (node: Node) => T;

// Export all types for modern usage
export type {
  Node as ModernNode,
  SkillTreeData as ModernSkillTreeData,
  Group as ModernGroup,
  Constants as ModernConstants,
  Sprites as ModernSprites
};
