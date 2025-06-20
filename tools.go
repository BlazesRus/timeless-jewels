//go:build tools

package main

import (
	"compress/gzip"
	"encoding/json"
	"os"

	"github.com/BlazesRus/timeless-jewels/calculator"
	"github.com/BlazesRus/timeless-jewels/data"
	"github.com/BlazesRus/timeless-jewels/wasm/exposition"
)

// Uses separate steps so finder step has the new data loaded by data package

//go:generate go run tools.go find
//go:generate go run tools.go types

func main() {
	if len(os.Args) < 2 {
		return
	}

	switch os.Args[1] {
	case "find":
		findAll()
	case "types":
		generateTypes()
	}
}

func writeZipped(path string, data interface{}) {
	b, err := json.Marshal(data)
	if err != nil {
		panic(err)
	}

	out, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0777)
	if err != nil {
		panic(err)
	}

	writer := gzip.NewWriter(out)
	if _, err := writer.Write(b); err != nil {
		panic(err)
	}

	if err := writer.Close(); err != nil {
		panic(err)
	}
}

func findAll() {
	foundStats := make(map[data.JewelType]map[uint32]int)
	applicable := data.GetApplicablePassives()

	for jewelType := range data.TimelessJewelConquerors {
		foundStats[jewelType] = make(map[uint32]int)

		var firstConqueror data.Conqueror
		for conqueror := range data.TimelessJewelConquerors[jewelType] {
			firstConqueror = conqueror
			break
		}

		println(jewelType.String())

		minValue := data.TimelessJewelSeedRanges[jewelType].Min
		maxValue := data.TimelessJewelSeedRanges[jewelType].Max

		if data.TimelessJewelSeedRanges[jewelType].Special {
			minValue /= 20
			maxValue /= 20
		}

		for seed := minValue; seed <= maxValue; seed++ {
			realSeed := seed
			if data.TimelessJewelSeedRanges[jewelType].Special {
				realSeed *= 20
			}

			if realSeed%500 == 0 {
				println(realSeed)
			}

			for _, skill := range applicable {
				if skill.IsKeystone {
					continue
				}

				results := calculator.Calculate(skill.Index, realSeed, jewelType, firstConqueror)
				if results.AlternatePassiveSkill != nil {
					for _, key := range results.AlternatePassiveSkill.StatsKeys {
						foundStats[jewelType][key]++
					}
				}

				for _, info := range results.AlternatePassiveAdditionInformations {
					if info.AlternatePassiveAddition != nil {
						for _, key := range info.AlternatePassiveAddition.StatsKeys {
							foundStats[jewelType][key]++
						}
					}
				}
			}
		}
	}

	writeZipped("./data/possible_stats.json.gz", foundStats)
}

func generateTypes() {
	e := exposition.Expose()
	tsFile, jsFile, err := e.Build()
	if err != nil {
		panic(err)
	}

	// Create base files with eslint-disable
	tsFile = "/* eslint-disable */\n" + tsFile
	jsFile = "/* eslint-disable */\n" + jsFile

	// Create directory
	if err := os.MkdirAll("./frontend/src/lib/types", 0777); err != nil {
		if !os.IsExist(err) {
			panic(err)
		}
	}

	// Generate Legacy version (Svelte 4 with stores)
	legacyJsFile := generateLegacyTypes(jsFile)
	if err := os.WriteFile("./frontend/src/lib/types/LegacyTypes.js", []byte(legacyJsFile), 0777); err != nil {
		panic(err)
	}

	// Generate Modern version (Svelte 5 with runes)
	modernJsFile := generateModernTypes(jsFile)
	if err := os.WriteFile("./frontend/src/lib/types/ModernTypes.js", []byte(modernJsFile), 0777); err != nil {
		panic(err)
	}

	// Keep original files for backward compatibility (for now)
	if err := os.WriteFile("./frontend/src/lib/types/index.js", []byte(jsFile), 0777); err != nil {
		panic(err)
	}

	if err := os.WriteFile("./frontend/src/lib/types/index.d.ts", []byte(tsFile), 0777); err != nil {
		panic(err)
	}
}

func generateLegacyTypes(originalJs string) string {
	// Replace the original export pattern with Svelte 4 store-based pattern
	legacyTemplate := `/* eslint-disable */
// @ts-nocheck
import { writable } from 'svelte/store';

// Use Svelte stores for reactivity in Svelte 4
export const calculator = writable(null);
export const data = writable(null);

export const initializeCrystalline = () => {
  // Access WASM exports through globalThis
  const wasmGlobal = /** @type {any} */ (globalThis);
  
  const calculatorValue = {
    Calculate: wasmGlobal["go"]["timeless-jewels"]["calculator"]["Calculate"],
    ReverseSearch: wasmGlobal["go"]["timeless-jewels"]["calculator"]["ReverseSearch"],
  };
  
  const dataValue = {
    GetAlternatePassiveAdditionByIndex: wasmGlobal["go"]["timeless-jewels"]["data"]["GetAlternatePassiveAdditionByIndex"],
    GetAlternatePassiveSkillByIndex: wasmGlobal["go"]["timeless-jewels"]["data"]["GetAlternatePassiveSkillByIndex"],
    GetPassiveSkillByIndex: wasmGlobal["go"]["timeless-jewels"]["data"]["GetPassiveSkillByIndex"],
    GetStatByIndex: wasmGlobal["go"]["timeless-jewels"]["data"]["GetStatByIndex"],
    PassiveSkillAuraStatTranslationsJSON: wasmGlobal["go"]["timeless-jewels"]["data"]["PassiveSkillAuraStatTranslationsJSON"],
    PassiveSkillStatTranslationsJSON: wasmGlobal["go"]["timeless-jewels"]["data"]["PassiveSkillStatTranslationsJSON"],
    PassiveSkills: wasmGlobal["go"]["timeless-jewels"]["data"]["PassiveSkills"],
    PossibleStats: wasmGlobal["go"]["timeless-jewels"]["data"]["PossibleStats"],
    SkillTree: wasmGlobal["go"]["timeless-jewels"]["data"]["SkillTree"],
    StatTranslationsJSON: wasmGlobal["go"]["timeless-jewels"]["data"]["StatTranslationsJSON"],
    TimelessJewelConquerors: wasmGlobal["go"]["timeless-jewels"]["data"]["TimelessJewelConquerors"],
    TimelessJewelSeedRanges: wasmGlobal["go"]["timeless-jewels"]["data"]["TimelessJewelSeedRanges"],
    TimelessJewels: wasmGlobal["go"]["timeless-jewels"]["data"]["TimelessJewels"],
    TreeToPassive: wasmGlobal["go"]["timeless-jewels"]["data"]["TreeToPassive"],
  };
  
  // Update the stores
  calculator.set(calculatorValue);
  data.set(dataValue);
  
  console.log('WASM calculator and data initialized and stores updated (Legacy/Svelte 4)');
};`

	return legacyTemplate
}

func generateModernTypes(originalJs string) string {
	// Replace the original export pattern with Svelte 5 store-based pattern
	// Using stores for cross-component reactivity compatibility
	modernTemplate := `/* eslint-disable */
// @ts-nocheck
import { writable } from 'svelte/store';

// Use Svelte stores for reactivity in Svelte 5 (for cross-component compatibility)
export const calculator = writable(null);
export const data = writable(null);

export const initializeCrystalline = () => {
  // Access WASM exports through globalThis
  const wasmGlobal = /** @type {any} */ (globalThis);
  
  const calculatorValue = {
    Calculate: wasmGlobal["go"]["timeless-jewels"]["calculator"]["Calculate"],
    ReverseSearch: wasmGlobal["go"]["timeless-jewels"]["calculator"]["ReverseSearch"],
  };
  
  const dataValue = {
    GetAlternatePassiveAdditionByIndex: wasmGlobal["go"]["timeless-jewels"]["data"]["GetAlternatePassiveAdditionByIndex"],
    GetAlternatePassiveSkillByIndex: wasmGlobal["go"]["timeless-jewels"]["data"]["GetAlternatePassiveSkillByIndex"],
    GetPassiveSkillByIndex: wasmGlobal["go"]["timeless-jewels"]["data"]["GetPassiveSkillByIndex"],
    GetStatByIndex: wasmGlobal["go"]["timeless-jewels"]["data"]["GetStatByIndex"],
    PassiveSkillAuraStatTranslationsJSON: wasmGlobal["go"]["timeless-jewels"]["data"]["PassiveSkillAuraStatTranslationsJSON"],
    PassiveSkillStatTranslationsJSON: wasmGlobal["go"]["timeless-jewels"]["data"]["PassiveSkillStatTranslationsJSON"],
    PassiveSkills: wasmGlobal["go"]["timeless-jewels"]["data"]["PassiveSkills"],
    PossibleStats: wasmGlobal["go"]["timeless-jewels"]["data"]["PossibleStats"],
    SkillTree: wasmGlobal["go"]["timeless-jewels"]["data"]["SkillTree"],
    StatTranslationsJSON: wasmGlobal["go"]["timeless-jewels"]["data"]["StatTranslationsJSON"],
    TimelessJewelConquerors: wasmGlobal["go"]["timeless-jewels"]["data"]["TimelessJewelConquerors"],
    TimelessJewelSeedRanges: wasmGlobal["go"]["timeless-jewels"]["data"]["TimelessJewelSeedRanges"],
    TimelessJewels: wasmGlobal["go"]["timeless-jewels"]["data"]["TimelessJewels"],
    TreeToPassive: wasmGlobal["go"]["timeless-jewels"]["data"]["TreeToPassive"],
  };
  
  // Update the stores
  calculator.set(calculatorValue);
  data.set(dataValue);
  
  console.log('WASM calculator and data initialized and stores updated (Modern/Svelte 5)');
};`

	return modernTemplate
}
