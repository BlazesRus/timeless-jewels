//go:build tools

package main

import (
	"compress/gzip"
	"encoding/json"
	"os"
	"strings"

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

	// Keep original files for legacy (Svelte 4.x) - these are stable
	if err := os.WriteFile("./frontend/src/lib/types/index.js", []byte(jsFile), 0777); err != nil {
		panic(err)
	}

	if err := os.WriteFile("./frontend/src/lib/types/index.d.ts", []byte(tsFile), 0777); err != nil {
		panic(err)
	}

	// Generate modern (Svelte 5) version of index.d.ts
	modernTsFile := generateModernTypeDefinitions(tsFile)
	if err := os.WriteFile("./frontend/src/lib/types/index.modern.d.ts", []byte(modernTsFile), 0777); err != nil {
		panic(err)
	}

	// Update modern version of ModernTypes.js if it exists
	updateModernTypesJs(jsFile)
}

func generateModernTypeDefinitions(originalTs string) string {
	// Generate Svelte 5 compatible TypeScript definitions
	modernTs := `/* eslint-disable */
// Modern (Svelte 5) TypeScript definitions
// Generated from: go run -tags=tools tools.go types

import type { Writable } from 'svelte/store';

` + originalTs + `

// Svelte 5 store-based exports for cross-component reactivity
export declare const calculator: Writable<{
  Calculate: typeof calculator.Calculate;
  ReverseSearch: typeof calculator.ReverseSearch;
} | null>;

export declare const data: Writable<{
  GetAlternatePassiveAdditionByIndex: typeof data.GetAlternatePassiveAdditionByIndex;
  GetAlternatePassiveSkillByIndex: typeof data.GetAlternatePassiveSkillByIndex;
  GetPassiveSkillByIndex: typeof data.GetPassiveSkillByIndex;
  GetStatByIndex: typeof data.GetStatByIndex;
  PassiveSkillAuraStatTranslationsJSON: typeof data.PassiveSkillAuraStatTranslationsJSON;
  PassiveSkillStatTranslationsJSON: typeof data.PassiveSkillStatTranslationsJSON;
  PassiveSkills: typeof data.PassiveSkills;
  PossibleStats: typeof data.PossibleStats;
  SkillTree: typeof data.SkillTree;
  StatTranslationsJSON: typeof data.StatTranslationsJSON;
  TimelessJewelConquerors: typeof data.TimelessJewelConquerors;
  TimelessJewelSeedRanges: typeof data.TimelessJewelSeedRanges;
  TimelessJewels: typeof data.TimelessJewels;
  TreeToPassive: typeof data.TreeToPassive;
} | null>;

// Enhanced initialization for Svelte 5
export declare const initializeCrystalline: () => void;`

	return modernTs
}

func updateModernTypesJs(originalJs string) {
	modernTypesPath := "./frontend/src/lib/types/ModernTypes.js"

	// Check if ModernTypes.js exists
	if _, err := os.Stat(modernTypesPath); os.IsNotExist(err) {
		// Create it if it doesn't exist
		createModernTypesJs(originalJs)
		return
	}

	// Read existing file
	existingContent, err := os.ReadFile(modernTypesPath)
	if err != nil {
		panic(err)
	}

	existingStr := string(existingContent)

	// Update the comment section with new generated data
	updatedContent := updateGeneratedSection(existingStr, originalJs)

	// Write back the updated content
	if err := os.WriteFile(modernTypesPath, []byte(updatedContent), 0777); err != nil {
		panic(err)
	}
}

func createModernTypesJs(originalJs string) string {
	// Create a new ModernTypes.js if it doesn't exist
	modernTemplate := `/* eslint-disable */
// @ts-nocheck
import { writable } from 'svelte/store';

// Wrapper function to handle Go WASM errors
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

// Use Svelte stores for reactivity in Svelte 5 (for cross-component compatibility)
export const calculator = writable(null);
export const data = writable(null);

export const initializeCrystalline = () => {
  // Access WASM exports through globalThis (generated from: ` + "`" + `go run tools.go types` + "`" + `)
  const wasmGlobal = /** @type {any} */ (globalThis);
  
  const calculatorValue = {
    Calculate: wrap(wasmGlobal["go"]["timeless-jewels"]["calculator"]["Calculate"]),
    ReverseSearch: wrap(wasmGlobal["go"]["timeless-jewels"]["calculator"]["ReverseSearch"]),
  };
  
  const dataValue = {
    GetAlternatePassiveAdditionByIndex: wrap(wasmGlobal["go"]["timeless-jewels"]["data"]["GetAlternatePassiveAdditionByIndex"]),
    GetAlternatePassiveSkillByIndex: wrap(wasmGlobal["go"]["timeless-jewels"]["data"]["GetAlternatePassiveSkillByIndex"]),
    GetPassiveSkillByIndex: wrap(wasmGlobal["go"]["timeless-jewels"]["data"]["GetPassiveSkillByIndex"]),
    GetStatByIndex: wrap(wasmGlobal["go"]["timeless-jewels"]["data"]["GetStatByIndex"]),
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
  console.log('Generated from data folder:', new Date().toISOString());
};

// Original generated code for reference:
/*
` + originalJs + `
*/`

	if err := os.WriteFile("./frontend/src/lib/types/ModernTypes.js", []byte(modernTemplate), 0777); err != nil {
		panic(err)
	}

	return modernTemplate
}

func updateGeneratedSection(existingContent, newOriginalJs string) string {
	// Find and update the generated code section
	startMarker := "// Original generated code for reference:"

	startIndex := len(existingContent)
	if idx := strings.Index(existingContent, startMarker); idx != -1 {
		startIndex = idx
	}

	// Keep everything before the generated section
	beforeSection := existingContent[:startIndex]

	// Add updated generated section
	newSection := startMarker + `
/*
` + newOriginalJs + `
*/`

	return beforeSection + newSection
}
