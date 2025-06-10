 
// @ts-expect-error - Global types from Go WASM runtime
export let calculator;
// @ts-expect-error - Global types from Go WASM runtime
export let data;

export const initializeCrystalline = () => {
  calculator = {
    // @ts-expect-error - Global types from Go WASM runtime
    Calculate: globalThis["go"]["timeless-jewels"]["calculator"]["Calculate"],
    // @ts-expect-error - Global types from Go WASM runtime
    ReverseSearch: globalThis["go"]["timeless-jewels"]["calculator"]["ReverseSearch"],
  }
  data = {
    // @ts-expect-error - Global types from Go WASM runtime
    GetAlternatePassiveAdditionByIndex: globalThis["go"]["timeless-jewels"]["data"]["GetAlternatePassiveAdditionByIndex"],
    // @ts-expect-error - Global types from Go WASM runtime
    GetAlternatePassiveSkillByIndex: globalThis["go"]["timeless-jewels"]["data"]["GetAlternatePassiveSkillByIndex"],
    // @ts-expect-error - Global types from Go WASM runtime
    GetPassiveSkillByIndex: globalThis["go"]["timeless-jewels"]["data"]["GetPassiveSkillByIndex"],
    // @ts-expect-error - Global types from Go WASM runtime
    GetStatByIndex: globalThis["go"]["timeless-jewels"]["data"]["GetStatByIndex"],
    // @ts-expect-error - Global types from Go WASM runtime
    PassiveSkillAuraStatTranslationsJSON: globalThis["go"]["timeless-jewels"]["data"]["PassiveSkillAuraStatTranslationsJSON"],
    // @ts-expect-error - Global types from Go WASM runtime
    PassiveSkillStatTranslationsJSON: globalThis["go"]["timeless-jewels"]["data"]["PassiveSkillStatTranslationsJSON"],
    // @ts-expect-error - Global types from Go WASM runtime
    PassiveSkills: globalThis["go"]["timeless-jewels"]["data"]["PassiveSkills"],
    // @ts-expect-error - Global types from Go WASM runtime
    PossibleStats: globalThis["go"]["timeless-jewels"]["data"]["PossibleStats"],
    // @ts-expect-error - Global types from Go WASM runtime
    SkillTree: globalThis["go"]["timeless-jewels"]["data"]["SkillTree"],
    // @ts-expect-error - Global types from Go WASM runtime
    StatTranslationsJSON: globalThis["go"]["timeless-jewels"]["data"]["StatTranslationsJSON"],
    // @ts-expect-error - Global types from Go WASM runtime
    TimelessJewelConquerors: globalThis["go"]["timeless-jewels"]["data"]["TimelessJewelConquerors"],
    // @ts-expect-error - Global types from Go WASM runtime
    TimelessJewelSeedRanges: globalThis["go"]["timeless-jewels"]["data"]["TimelessJewelSeedRanges"],
    // @ts-expect-error - Global types from Go WASM runtime
    TimelessJewels: globalThis["go"]["timeless-jewels"]["data"]["TimelessJewels"],
    // @ts-expect-error - Global types from Go WASM runtime
    TreeToPassive: globalThis["go"]["timeless-jewels"]["data"]["TreeToPassive"],
  }
}