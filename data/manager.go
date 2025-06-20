// Package data provides functions and types for managing alternate passive skills, jewels, and related data.
package data

import "strconv"

// GetApplicableAlternatePassiveAdditions returns all alternate passive additions for a passive skill and jewel.
func GetApplicableAlternatePassiveAdditions(passiveSkill *PassiveSkill, timelessJewel TimelessJewel) []*AlternatePassiveAddition {
	return reverseAlternatePassiveAdditions[GetPassiveSkillType(passiveSkill)][timelessJewel.AlternateTreeVersion.Index]
}

// GetPassiveSkillType returns the PassiveSkillType for a given passive skill.
func GetPassiveSkillType(passiveSkill *PassiveSkill) PassiveSkillType {
	switch {
	case passiveSkill.IsJewelSocket:
		return JewelSocket
	case passiveSkill.IsKeystone:
		return KeyStone
	case passiveSkill.IsNotable:
		return Notable
	case len(passiveSkill.StatIndices) == 1 && IsSmallAttribute(passiveSkill.StatIndices[0]):
		return SmallAttribute
	default:
		return SmallNormal
	}
}

// GetAlternatePassiveSkillKeyStone returns the keystone alternate passive skill for a given jewel.
func GetAlternatePassiveSkillKeyStone(timelessJewel TimelessJewel) *AlternatePassiveSkill {
	var alternatePassiveSkillKeyStone *AlternatePassiveSkill
	for _, skill := range AlternatePassiveSkills {
		if skill.AlternateTreeVersionsKey != timelessJewel.AlternateTreeVersion.Index {
			continue
		}

		if skill.ConquerorIndex != timelessJewel.TimelessJewelConqueror.Index {
			continue
		}

		if skill.ConquerorVersion != timelessJewel.TimelessJewelConqueror.Version {
			continue
		}

		alternatePassiveSkillKeyStone = skill
		break
	}

	if alternatePassiveSkillKeyStone == nil {
		return nil
	}

	hasApplicablePassives := false
	for _, passiveType := range alternatePassiveSkillKeyStone.PassiveType {
		if passiveType == KeyStone {
			hasApplicablePassives = true
			break
		}
	}

	if !hasApplicablePassives {
		return nil
	}

	return alternatePassiveSkillKeyStone
}

// GetApplicableAlternatePassiveSkills returns all alternate passive skills for a passive skill and jewel.
func GetApplicableAlternatePassiveSkills(passiveSkill *PassiveSkill, timelessJewel TimelessJewel) []*AlternatePassiveSkill {
	return reverseAlternatePassiveSkills[GetPassiveSkillType(passiveSkill)][timelessJewel.AlternateTreeVersion.Index]
}

// IsSmallAttribute returns true if the stat is a small attribute node.
func IsSmallAttribute(stat uint32) bool {
	bitPosition := (stat + 1) - 574
	if bitPosition <= 6 && (0x49&(1<<(bitPosition))) != 0 {
		return true
	}
	return false
}

// IsPassiveSkillValidForAlteration returns true if the passive skill can be altered by a jewel.
func IsPassiveSkillValidForAlteration(passiveSkill *PassiveSkill) bool {
	passiveSkillType := GetPassiveSkillType(passiveSkill)
	return (passiveSkillType != None) && (passiveSkillType != JewelSocket)
}

// GetPassiveSkillByIndex returns the PassiveSkill for a given index.
func GetPassiveSkillByIndex(index uint32) *PassiveSkill {
	return idToPassiveSkill[index]
}

// GetStatByIndex returns the Stat for a given index.
func GetStatByIndex(index uint32) *Stat {
	return idToStat[index]
}

// GetAlternatePassiveSkillByIndex returns the AlternatePassiveSkill for a given index.
func GetAlternatePassiveSkillByIndex(index uint32) *AlternatePassiveSkill {
	return idToAlternatePassiveSkill[index]
}

// GetAlternatePassiveAdditionByIndex returns the AlternatePassiveAddition for a given index.
func GetAlternatePassiveAdditionByIndex(index uint32) *AlternatePassiveAddition {
	return idToAlternatePassiveAddition[index]
}

// GetAlternateTreeVersionIndex returns the AlternateTreeVersion for a given index.
func GetAlternateTreeVersionIndex(index uint32) *AlternateTreeVersion {
	return idToAlternateTreeVersion[index]
}

// GetApplicablePassives returns all applicable passive skills for alteration.
func GetApplicablePassives() []*PassiveSkill {
	applicable := make([]*PassiveSkill, 0)
	for _, skill := range PassiveSkills {
		if skill.Name == "" {
			continue
		}

		if skill.IsJewelSocket {
			continue
		}

		if node, ok := SkillTreeData.Nodes[strconv.Itoa(int(skill.PassiveSkillGraphID))]; ok {
			if node.AscendancyName != nil {
				continue
			}

			if node.IsProxy != nil && *node.IsProxy {
				continue
			}

			if node.IsBlighted != nil && *node.IsBlighted {
				continue
			}

			if node.IsMastery != nil && *node.IsMastery {
				continue
			}

			applicable = append(applicable, skill)
		}
	}
	return applicable
}
