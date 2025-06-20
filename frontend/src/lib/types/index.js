/* eslint-disable */
const wrap = (fn) => {
  return (...args) => {
    const result = fn.call(undefined, ...args);
    if (globalThis.goInternalError) {
      const error = new Error(globalThis.goInternalError);
      globalThis.goInternalError = undefined;
      throw error;
    }
    return result;
  }
};

export let calculator;
export let data;

export const initializeCrystalline = () => {
  calculator = {
    Calculate: wrap(globalThis['go']['timeless-jewels']['calculator']['Calculate']),
    ReverseSearch: wrap(globalThis['go']['timeless-jewels']['calculator']['ReverseSearch'])
  };
  data = {
    GetAlternatePassiveAdditionByIndex: wrap(globalThis['go']['timeless-jewels']['data']['GetAlternatePassiveAdditionByIndex']),
    GetAlternatePassiveSkillByIndex: wrap(globalThis['go']['timeless-jewels']['data']['GetAlternatePassiveSkillByIndex']),
    GetPassiveSkillByIndex: wrap(globalThis['go']['timeless-jewels']['data']['GetPassiveSkillByIndex']),
    GetStatByIndex: wrap(globalThis['go']['timeless-jewels']['data']['GetStatByIndex']),
    PassiveSkillAuraStatTranslationsJSON: globalThis['go']['timeless-jewels']['data']['PassiveSkillAuraStatTranslationsJSON'],
    PassiveSkillStatTranslationsJSON: globalThis['go']['timeless-jewels']['data']['PassiveSkillStatTranslationsJSON'],
    PassiveSkills: globalThis['go']['timeless-jewels']['data']['PassiveSkills'],
    PossibleStats: globalThis['go']['timeless-jewels']['data']['PossibleStats'],
    SkillTree: globalThis['go']['timeless-jewels']['data']['SkillTree'],
    StatTranslationsJSON: globalThis['go']['timeless-jewels']['data']['StatTranslationsJSON'],
    TimelessJewelConquerors: globalThis['go']['timeless-jewels']['data']['TimelessJewelConquerors'],
    TimelessJewelSeedRanges: globalThis['go']['timeless-jewels']['data']['TimelessJewelSeedRanges'],
    TimelessJewels: globalThis['go']['timeless-jewels']['data']['TimelessJewels'],
    TreeToPassive: globalThis['go']['timeless-jewels']['data']['TreeToPassive']
  };
};