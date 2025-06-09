package data

// Stat represents a stat in the passive skill system.
type Stat struct {
	Index    uint32  `json:"_key"`
	ID       string  `json:"Id"`
	Text     string  `json:"Text"`
	Category *uint32 `json:"Category"`
}

// PassiveSkill represents a passive skill node.
type PassiveSkill struct {
	Index               uint32   `json:"_key"`
	ID                  string   `json:"Id"`
	StatIndices         []uint32 `json:"Stats"`
	PassiveSkillGraphID uint32   `json:"PassiveSkillGraphId"`
	Name                string   `json:"Name"`
	IsKeystone          bool     `json:"IsKeystone"`
	IsNotable           bool     `json:"IsNotable"`
	IsJewelSocket       bool     `json:"IsJewelSocket"`
}

// AlternateTreeVersion represents a version of the alternate tree.
type AlternateTreeVersion struct {
	Index                                  uint32 `json:"_key"`
	ID                                     string `json:"Id"`
	AreSmallAttributePassiveSkillsReplaced bool   `json:"Var1"`
	AreSmallNormalPassiveSkillsReplaced    bool   `json:"Var2"`
	MinimumAdditions                       uint32 `json:"Var5"`
	MaximumAdditions                       uint32 `json:"Var6"`
	NotableReplacementSpawnWeight          uint32 `json:"Var9"`
}

// AlternatePassiveSkill represents an alternate passive skill.
type AlternatePassiveSkill struct {
	Index                    uint32             `json:"_key"`
	ID                       string             `json:"Id"`
	AlternateTreeVersionsKey uint32             `json:"AlternateTreeVersionsKey"`
	Name                     string             `json:"Name"`
	PassiveType              []PassiveSkillType `json:"PassiveType"`
	StatsKeys                []uint32           `json:"StatsKeys"`
	Stat1Min                 uint32             `json:"Stat1Min"`
	Stat1Max                 uint32             `json:"Stat1Max"`
	Stat2Min                 uint32             `json:"Stat2Min"`
	Stat2Max                 uint32             `json:"Stat2Max"`
	Stat3Min                 uint32             `json:"Var9"`
	Stat3Max                 uint32             `json:"Var10"`
	Stat4Min                 uint32             `json:"Var11"`
	Stat4Max                 uint32             `json:"Var12"`
	SpawnWeight              uint32             `json:"SpawnWeight"`
	ConquerorIndex           uint32             `json:"Var18"`
	RandomMin                uint32             `json:"RandomMin"`
	RandomMax                uint32             `json:"RandomMax"`
	ConquerorVersion         uint32             `json:"Var24"`
}

// GetStatMinMax returns the min or max value for a stat index.
func (a *AlternatePassiveSkill) GetStatMinMax(isMin bool, index uint32) uint32 {
	switch isMin {
	case true:
		switch index {
		case 0:
			return a.Stat1Min
		case 1:
			return a.Stat2Min
		case 2:
			return a.Stat3Min
		case 3:
			return a.Stat4Min
		}
	case false:
		switch index {
		case 0:
			return a.Stat1Max
		case 1:
			return a.Stat2Max
		case 2:
			return a.Stat3Max
		case 3:
			return a.Stat4Max
		}
	}
	return 0
}

// AlternatePassiveAddition represents an alternate passive addition.
type AlternatePassiveAddition struct {
	Index                    uint32             `json:"_key"`
	ID                       string             `json:"Id"`
	AlternateTreeVersionsKey uint32             `json:"AlternateTreeVersionsKey"`
	SpawnWeight              uint32             `json:"SpawnWeight"`
	StatsKeys                []uint32           `json:"StatsKeys"`
	Stat1Min                 uint32             `json:"Stat1Min"`
	Stat1Max                 uint32             `json:"Stat1Max"`
	Stat2Min                 uint32             `json:"Var6"`
	Stat2Max                 uint32             `json:"Var7"`
	PassiveType              []PassiveSkillType `json:"PassiveType"`
}

// GetStatMinMax returns the min or max value for a stat index in an alternate passive addition.
func (a *AlternatePassiveAddition) GetStatMinMax(isMin bool, index uint32) uint32 {
	switch isMin {
	case true:
		switch index {
		case 0:
			return a.Stat1Min
		case 1:
			return a.Stat2Min
		}
	case false:
		switch index {
		case 0:
			return a.Stat1Max
		case 1:
			return a.Stat2Max
		}
	}
	return 0
}
