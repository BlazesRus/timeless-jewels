// Package exposition exposes Go functions and data for WASM usage.
package exposition

import (
	"syscall/js"
	"github.com/Vilsol/crystalline"

	"github.com/BlazesRus/timeless-jewels/calculator"
	"github.com/BlazesRus/timeless-jewels/data"
)

// Expose registers all relevant functions and data for WASM interop.
func Expose() *crystalline.Exposer {
	e := crystalline.NewExposer("timeless-jewels")

	e.ExposeFuncOrPanic(calculator.Calculate)
	e.ExposeFuncOrPanic(calculator.ReverseSearch)
	e.ExposeFuncOrPanic(data.GetStatByIndex)
	e.ExposeFuncOrPanic(data.GetAlternatePassiveSkillByIndex)
	e.ExposeFuncOrPanic(data.GetAlternatePassiveAdditionByIndex)
	e.ExposeFuncOrPanic(data.GetPassiveSkillByIndex)

	e.ExposeOrPanic(map[data.JewelType]string{
		data.GloriousVanity:  data.GloriousVanity.String(),
		data.LethalPride:     data.LethalPride.String(),
		data.BrutalRestraint: data.BrutalRestraint.String(),
		data.MilitantFaith:   data.MilitantFaith.String(),
		data.ElegantHubris:   data.ElegantHubris.String(),
	}, "data", "TimelessJewels")

	e.ExposeOrPanic(data.TimelessJewelConquerors, "data", "TimelessJewelConquerors")
	e.ExposeOrPanic(data.TimelessJewelSeedRanges, "data", "TimelessJewelSeedRanges")
	e.ExposeOrPanic(data.GetApplicablePassives(), "data", "PassiveSkills")
	e.ExposeOrPanic(string(data.SkillTreeJSON), "data", "SkillTree")

	treeToPassive := make(map[uint32]*data.PassiveSkill)
	for _, skill := range data.PassiveSkills {
		treeToPassive[skill.PassiveSkillGraphID] = skill
	}

	e.ExposeOrPanic(treeToPassive, "data", "TreeToPassive")
	e.ExposeOrPanic(string(data.StatTranslationsJSON), "data", "StatTranslationsJSON")
	e.ExposeOrPanic(string(data.PassiveSkillStatTranslationsJSON), "data", "PassiveSkillStatTranslationsJSON")
	e.ExposeOrPanic(string(data.PassiveSkillAuraStatTranslationsJSON), "data", "PassiveSkillAuraStatTranslationsJSON")
	e.ExposeOrPanic(string(data.PossibleStatsJSON), "data", "PossibleStats")

	// MANUAL DATA EXPOSURE - bypass crystalline's eval mechanism
	// Since crystalline's eval is failing due to ES6 module syntax, we'll manually put data on globalThis
	ManuallyExposeData(e)

	return e
}

// ManuallyExposeData manually puts the data on globalThis.data to bypass crystalline's eval issues
func ManuallyExposeData(e *crystalline.Exposer) {
	// Create the data object on globalThis
	global := js.Global()
	dataObj := make(map[string]interface{})

	// Manually populate the data that crystalline would have exposed
	dataObj["TimelessJewels"] = map[data.JewelType]string{
		data.GloriousVanity:  data.GloriousVanity.String(),
		data.LethalPride:     data.LethalPride.String(),
		data.BrutalRestraint: data.BrutalRestraint.String(),
		data.MilitantFaith:   data.MilitantFaith.String(),
		data.ElegantHubris:   data.ElegantHubris.String(),
	}

	dataObj["TimelessJewelConquerors"] = data.TimelessJewelConquerors
	dataObj["TimelessJewelSeedRanges"] = data.TimelessJewelSeedRanges
	dataObj["PassiveSkills"] = data.GetApplicablePassives()
	dataObj["SkillTreeJSON"] = string(data.SkillTreeJSON)

	treeToPassive := make(map[uint32]*data.PassiveSkill)
	for _, skill := range data.PassiveSkills {
		treeToPassive[skill.PassiveSkillGraphID] = skill
	}
	dataObj["TreeToPassive"] = treeToPassive

	dataObj["StatTranslationsJSON"] = string(data.StatTranslationsJSON)
	dataObj["PassiveSkillStatTranslationsJSON"] = string(data.PassiveSkillStatTranslationsJSON)
	dataObj["PassiveSkillAuraStatTranslationsJSON"] = string(data.PassiveSkillAuraStatTranslationsJSON)
	dataObj["PossibleStatsJSON"] = string(data.PossibleStatsJSON)

	// Set globalThis.data directly
	global.Set("data", dataObj)

	// Also expose the functions directly on globalThis for easy access
	global.Set("Calculate", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) < 4 {
			return map[string]interface{}{"error": "Calculate requires 4 arguments"}
		}
		passiveSkillId := args[0].Int()
		seed := args[1].Int()
		jewelId := args[2].Int()
		conqueror := args[3].String()
		
		jewelType := data.JewelType(jewelId)
		conquerorEnum := data.Conqueror(conqueror)
		
		result := calculator.Calculate(uint32(passiveSkillId), uint32(seed), jewelType, conquerorEnum)
		return result
	}))

	global.Set("ReverseSearch", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		// ReverseSearch is more complex and requires proper argument parsing
		// For now, return a placeholder
		return map[string]interface{}{"error": "ReverseSearch not implemented in manual exposure yet"}
	}))

	global.Set("GetStatByIndex", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) < 1 {
			return nil
		}
		index := args[0].Int()
		return data.GetStatByIndex(uint32(index))
	}))

	global.Set("GetAlternatePassiveSkillByIndex", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) < 1 {
			return nil
		}
		index := args[0].Int()
		return data.GetAlternatePassiveSkillByIndex(uint32(index))
	}))

	global.Set("GetAlternatePassiveAdditionByIndex", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) < 1 {
			return nil
		}
		index := args[0].Int()
		return data.GetAlternatePassiveAdditionByIndex(uint32(index))
	}))

	global.Set("GetPassiveSkillByIndex", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) < 1 {
			return nil
		}
		index := args[0].Int()
		return data.GetPassiveSkillByIndex(uint32(index))
	}))
}
