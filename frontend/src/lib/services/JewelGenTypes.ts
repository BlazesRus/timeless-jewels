// src/lib/services/JewelGenTypes.ts

// Data structures mirroring the WASM exports (from tools.go → types/index.d.ts)

export interface AlternatePassiveAddition {
  Index: number
  ID: string
  AlternateTreeVersionsKey: number
  SpawnWeight: number
  StatsKeys?: number[]
  Stat1Min: number
  Stat1Max: number
  Stat2Min: number
  Stat2Max: number
  PassiveType?: number[]
  GetStatMinMax(includeUpper: boolean, statIndex: number): number
}

export interface AlternatePassiveAdditionInformation {
  AlternatePassiveAddition?: AlternatePassiveAddition
  StatRolls?: Record<number, number>
}

export interface AlternatePassiveSkill {
  Index: number
  ID: string
  AlternateTreeVersionsKey: number
  Name: string
  PassiveType?: number[]
  StatsKeys?: number[]
  Stat1Min: number
  Stat1Max: number
  Stat2Min: number
  Stat2Max: number
  Stat3Min: number
  Stat3Max: number
  Stat4Min: number
  Stat4Max: number
  SpawnWeight: number
  ConquerorIndex: number
  RandomMin: number
  RandomMax: number
  ConquerorVersion: number
  GetStatMinMax(includeUpper: boolean, statIndex: number): number
}

export interface AlternatePassiveSkillInformation {
  AlternatePassiveSkill?: AlternatePassiveSkill
  StatRolls?: Record<number, number>
  AlternatePassiveAdditionInformations?: AlternatePassiveAdditionInformation[]
}

export interface PassiveSkill {
  Index: number
  ID: string
  StatIndices?: number[]
  PassiveSkillGraphID: number
  Name: string
  IsKeystone: boolean
  IsNotable: boolean
  IsJewelSocket: boolean
}

export interface Stat {
  Index: number
  ID: string
  Text: string
  Category?: number
}

export interface Range {
  Min: number
  Max: number
  Special: boolean
}

export interface TimelessJewelConqueror {
  Index: number
  Version: number
}

/**
 * This interface represents the full set of WASM-exported functions
 * and data tables for Timeless Jewel calculations.
 */
export interface TimelessJewelsData {
  // core calculate functions
  Calculate(
    passiveID: number,
    seed: number,
    timelessJewelType: number,
    conqueror: string
  ): AlternatePassiveSkillInformation

  ReverseSearch(
    passiveIDs?: number[],
    statIDs?: number[],
    timelessJewelType?: number,
    conqueror?: string,
    updates?: (progress: number) => Promise<void>
  ): Promise<
    | Record<
        number,
        Record<number, Record<number, number> | undefined> | undefined
      >
    | undefined
  >

  // lookup helpers
  GetAlternatePassiveAdditionByIndex(
    index: number
  ): AlternatePassiveAddition | undefined

  GetAlternatePassiveSkillByIndex(
    index: number
  ): AlternatePassiveSkill | undefined

  GetPassiveSkillByIndex(index: number): PassiveSkill | undefined

  GetStatByIndex(index: number): Stat | undefined

  // raw JSON/string tables
  PassiveSkillAuraStatTranslationsJSON: string
  PassiveSkillStatTranslationsJSON: string
  PassiveSkills?: Array<PassiveSkill | undefined>
  PossibleStats: string
  SkillTree: string
  StatTranslationsJSON: string

  // lookup maps
  TimelessJewelConquerors?: Record<
    number,
    Record<string, TimelessJewelConqueror | undefined> | undefined
  >
  TimelessJewelSeedRanges?: Record<number, Range>
  TimelessJewels?: Record<number, string>
  TreeToPassive?: Record<number, PassiveSkill | undefined>
}
