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

	// Update modern (Svelte 5) version of index.d.ts intelligently
	updateModernTypeDefinitions(tsFile)

	// Note: ModernTypes.js has been removed - we now use ModernTypes.svelte.ts with runes
}
}

func updateModernTypeDefinitions(originalTs string) {
	modernTypesPath := "./frontend/src/lib/types/index.modern.d.ts"

	// Check if index.modern.d.ts exists
	if _, err := os.Stat(modernTypesPath); os.IsNotExist(err) {
		// Create it if it doesn't exist
		createModernTypeDefinitions(originalTs)
		return
	}

	// Read existing file
	existingContent, err := os.ReadFile(modernTypesPath)
	if err != nil {
		panic(err)
	}

	existingStr := string(existingContent)

	// Update only the generated type definitions section, preserving Svelte 5 enhancements
	updatedContent := updateGeneratedTypeSection(existingStr, originalTs)

	// Write back the updated content
	if err := os.WriteFile(modernTypesPath, []byte(updatedContent), 0777); err != nil {
		panic(err)
	}
}

func createModernTypeDefinitions(originalTs string) {
	// Create Svelte 5 compatible TypeScript definitions using runes (no legacy compatibility)
	modernTs := `/* eslint-disable */
// Modern (Svelte 5) TypeScript definitions - WASM types with rune enhancements
// Generated from: go run -tags=tools tools.go types
// Auto-updated: ` + strings.Replace(strings.Replace(getCurrentTimestamp(), "\n", "", -1), "\r", "", -1) + `

// ===== GENERATED TYPES SECTION START =====
` + originalTs + `
// ===== GENERATED TYPES SECTION END =====

// Svelte 5 rune-based reactive state declarations
export declare const calculatorState: {
  readonly current: {
    Calculate: typeof calculator.Calculate;
    ReverseSearch: typeof calculator.ReverseSearch;
  } | null;
};

export declare const dataState: {
  readonly current: {
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
  } | null;
};

// Enhanced initialization for Svelte 5 with rune support
export declare const initializeCrystalline: () => void;

// Rune-based reactive utilities for Svelte 5
export declare function useCalculator(): {
  readonly current: typeof calculatorState.current;
};

export declare function useData(): {
  readonly current: typeof dataState.current;
};`

	if err := os.WriteFile("./frontend/src/lib/types/index.modern.d.ts", []byte(modernTs), 0777); err != nil {
		panic(err)
	}
}

func updateGeneratedTypeSection(existingContent, newOriginalTs string) string {
	// Find and update the generated types section
	startMarker := "// ===== GENERATED TYPES SECTION START ====="
	endMarker := "// ===== GENERATED TYPES SECTION END ====="

	startIndex := strings.Index(existingContent, startMarker)
	if startIndex == -1 {
		// If markers don't exist, recreate the file
		createModernTypeDefinitions(newOriginalTs)
		return ""
	}

	endIndex := strings.Index(existingContent, endMarker)
	if endIndex == -1 {
		endIndex = len(existingContent)
	} else {
		endIndex += len(endMarker)
	}

	// Keep everything before and after the generated section
	beforeSection := existingContent[:startIndex]
	afterSection := existingContent[endIndex:]

	// Create updated generated section with timestamp
	timestamp := strings.Replace(strings.Replace(getCurrentTimestamp(), "\n", "", -1), "\r", "", -1)
	
	// Update the timestamp in the header if it exists
	updatedBefore := beforeSection
	if strings.Contains(beforeSection, "// Auto-updated:") {
		lines := strings.Split(beforeSection, "\n")
		for i, line := range lines {
			if strings.Contains(line, "// Auto-updated:") {
				lines[i] = "// Auto-updated: " + timestamp
				break
			}
		}
		updatedBefore = strings.Join(lines, "\n")
	}

	newSection := startMarker + "\n" + newOriginalTs + "\n" + endMarker

	return updatedBefore + newSection + afterSection
}

func getCurrentTimestamp() string {
	return "2025-06-22T" + strings.Replace(strings.Replace("12:00:00Z", ":", "", -1), "-", "", -1)
}

// Note: updateModernTypesJs() and createModernTypesJs() functions removed
// We now use ModernTypes.svelte.ts with Svelte 5 runes instead of ModernTypes.js

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
