// Package data contains core types and structures for Timeless Jewels and passive skill calculations.
package data

// TimelessJewel represents a Timeless Jewel with its seed, tree version, and conqueror.
type TimelessJewel struct {
	Seed                   uint32
	AlternateTreeVersion   *AlternateTreeVersion
	TimelessJewelConqueror *TimelessJewelConqueror
}

// GetSeed returns the normalized seed for the TimelessJewel, handling special cases for Elegant Hubris.
func (t TimelessJewel) GetSeed() uint32 {
	if t.AlternateTreeVersion.Index != uint32(ElegantHubris) {
		return t.Seed
	}
	return t.Seed / 20
}

// TimelessJewelConqueror represents a conqueror associated with a Timeless Jewel.
type TimelessJewelConqueror struct {
	Index   uint32
	Version uint32
}

// PassiveSkillType represents the type of a passive skill node.
type PassiveSkillType uint32

const (
	// None indicates no passive skill type.
	None PassiveSkillType = iota
	// SmallAttribute indicates a small attribute node.
	SmallAttribute
	// SmallNormal indicates a small normal node.
	SmallNormal
	// Notable indicates a notable node.
	Notable
	// KeyStone indicates a keystone node.
	KeyStone
	// JewelSocket indicates a jewel socket node.
	JewelSocket
)

// AlternatePassiveSkillInformation contains information about an alternate passive skill and its additions.
type AlternatePassiveSkillInformation struct {
	AlternatePassiveSkill                *AlternatePassiveSkill
	StatRolls                            map[uint32]uint32
	AlternatePassiveAdditionInformations []AlternatePassiveAdditionInformation
}

// AlternatePassiveAdditionInformation contains information about an alternate passive addition and its stat rolls.
type AlternatePassiveAdditionInformation struct {
	AlternatePassiveAddition *AlternatePassiveAddition
	StatRolls                map[uint32]uint32
}
