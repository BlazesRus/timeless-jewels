// Package calculator provides functions for calculating and searching alternate passive skill information
// for Timeless Jewels in Path of Exile.
package calculator

import (
	"github.com/BlazesRus/timeless-jewels/data"
	"github.com/BlazesRus/timeless-jewels/random"
)

// UpdateFunc is a callback function used to report progress during calculations.
type UpdateFunc func(seed uint32)

var calculationCache = make(map[data.Conqueror]map[data.JewelType]map[uint32]map[uint32]data.AlternatePassiveSkillInformation)

// Calculate computes the alternate passive skill information for a given passive ID, seed, jewel type, and conqueror.
func Calculate(passiveID uint32, seed uint32, timelessJewelType data.JewelType, conqueror data.Conqueror) data.AlternatePassiveSkillInformation {
	passiveSkill := data.GetPassiveSkillByIndex(passiveID)

	if !data.IsPassiveSkillValidForAlteration(passiveSkill) {
		return data.AlternatePassiveSkillInformation{
			AlternatePassiveAdditionInformations: make([]data.AlternatePassiveAdditionInformation, 0),
		}
	}

	alternateTreeVersion := data.GetAlternateTreeVersionIndex(uint32(timelessJewelType))

	timelessJewelConqueror := data.TimelessJewelConquerors[timelessJewelType][conqueror]

	timelessJewel := data.TimelessJewel{
		Seed:                   seed,
		AlternateTreeVersion:   alternateTreeVersion,
		TimelessJewelConqueror: timelessJewelConqueror,
	}

	alternateTreeManager := AlternateTreeManager{
		PassiveSkill:  passiveSkill,
		TimelessJewel: timelessJewel,
	}

	rng := random.NewRNG()
	if alternateTreeManager.IsPassiveSkillReplaced(rng) {
		return alternateTreeManager.ReplacePassiveSkill(rng)
	}

	additions := alternateTreeManager.AugmentPassiveSkill(rng)
	if additions == nil {
		additions = make([]data.AlternatePassiveAdditionInformation, 0)
	}

	return data.AlternatePassiveSkillInformation{
		AlternatePassiveAdditionInformations: additions,
	}
}

// ReverseSearch searches for seeds that produce specific stat IDs for given passive IDs and jewel parameters.
// It returns a nested map of results indexed by seed, passive skill index, and stat key.
func ReverseSearch(passiveIDs []uint32, statIDs []uint32, timelessJewelType data.JewelType, conqueror data.Conqueror, updates UpdateFunc) map[uint32]map[uint32]map[uint32]uint32 {
	passiveSkills := make(map[uint32]*data.PassiveSkill)
	for _, id := range passiveIDs {
		skill := data.GetPassiveSkillByIndex(id)
		if data.IsPassiveSkillValidForAlteration(skill) {
			passiveSkills[id] = skill
		}
	}

	alternateTreeVersion := data.GetAlternateTreeVersionIndex(uint32(timelessJewelType))

	timelessJewelConqueror := data.TimelessJewelConquerors[timelessJewelType][conqueror]

	timelessJewel := data.TimelessJewel{
		AlternateTreeVersion:   alternateTreeVersion,
		TimelessJewelConqueror: timelessJewelConqueror,
	}

	alternateTreeManager := AlternateTreeManager{}

	statMap := make(map[uint32]bool)
	for _, id := range statIDs {
		statMap[id] = true
	}

	if _, ok := calculationCache[conqueror]; !ok {
		calculationCache[conqueror] = make(map[data.JewelType]map[uint32]map[uint32]data.AlternatePassiveSkillInformation)
	}

	if _, ok := calculationCache[conqueror][timelessJewelType]; !ok {
		calculationCache[conqueror][timelessJewelType] = make(map[uint32]map[uint32]data.AlternatePassiveSkillInformation)
	}

	results := make(map[uint32]map[uint32]map[uint32]uint32)

	minValue := data.TimelessJewelSeedRanges[timelessJewelType].Min
	maxValue := data.TimelessJewelSeedRanges[timelessJewelType].Max

	if data.TimelessJewelSeedRanges[timelessJewelType].Special {
		minValue /= 20
		maxValue /= 20
	}

	rng := random.NewRNG()
	for seed := minValue; seed <= maxValue; seed++ {
		realSeed := seed
		if data.TimelessJewelSeedRanges[timelessJewelType].Special {
			realSeed *= 20
		}

		if seed%10 == 0 && updates != nil {
			updates(realSeed)
		}

		timelessJewel.Seed = realSeed
		alternateTreeManager.TimelessJewel = timelessJewel

		if _, ok := calculationCache[conqueror][timelessJewelType][realSeed]; !ok {
			calculationCache[conqueror][timelessJewelType][realSeed] = make(map[uint32]data.AlternatePassiveSkillInformation)
		}

		for _, skill := range passiveSkills {
			alternateTreeManager.PassiveSkill = skill

			var result data.AlternatePassiveSkillInformation
			if cacheHit, ok := calculationCache[conqueror][timelessJewelType][realSeed][skill.Index]; ok {
				result = cacheHit
			} else {
				if alternateTreeManager.IsPassiveSkillReplaced(rng) {
					result = alternateTreeManager.ReplacePassiveSkill(rng)
				} else {
					result = data.AlternatePassiveSkillInformation{
						AlternatePassiveAdditionInformations: alternateTreeManager.AugmentPassiveSkill(rng),
					}
				}
				calculationCache[conqueror][timelessJewelType][realSeed][skill.Index] = result
			}

			if result.AlternatePassiveSkill != nil {
				for i, key := range result.AlternatePassiveSkill.StatsKeys {
					if _, ok := statMap[key]; ok {
						if _, ok := results[realSeed]; !ok {
							results[realSeed] = make(map[uint32]map[uint32]uint32)
						}

						if _, ok := results[realSeed][skill.Index]; !ok {
							results[realSeed][skill.Index] = make(map[uint32]uint32)
						}

						if result.StatRolls != nil {
							results[realSeed][skill.Index][key] = result.StatRolls[uint32(i)]
						}
					}
				}
			}

			for _, augment := range result.AlternatePassiveAdditionInformations {
				if augment.AlternatePassiveAddition != nil {
					for i, key := range augment.AlternatePassiveAddition.StatsKeys {
						if _, ok := statMap[key]; ok {
							if _, ok := results[realSeed]; !ok {
								results[realSeed] = make(map[uint32]map[uint32]uint32)
							}

							if _, ok := results[realSeed][skill.Index]; !ok {
								results[realSeed][skill.Index] = make(map[uint32]uint32)
							}

							if augment.StatRolls != nil {
								results[realSeed][skill.Index][key] = augment.StatRolls[uint32(i)]
							}
						}
					}
				}
			}
		}
	}

	return results
}

// ClearCache resets the calculation cache used by the calculator package.
func ClearCache() {
	calculationCache = make(map[data.Conqueror]map[data.JewelType]map[uint32]map[uint32]data.AlternatePassiveSkillInformation)
}
