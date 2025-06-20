package data

import (
	"bytes"
	"compress/gzip"
	"encoding/json"
	"io"

	_ "embed"
)

//go:embed alternate_passive_additions.json.gz
var alternatePassiveAdditionsGz []byte

// AlternatePassiveAdditions holds all alternate passive additions loaded from the embedded JSON.
var AlternatePassiveAdditions []*AlternatePassiveAddition

var (
	idToAlternatePassiveAddition     = make(map[uint32]*AlternatePassiveAddition)
	reverseAlternatePassiveAdditions = make(map[PassiveSkillType]map[uint32][]*AlternatePassiveAddition)
)

//go:embed alternate_passive_skills.json.gz
var alternatePassiveSkillsGz []byte

// AlternatePassiveSkills holds all alternate passive skills loaded from the embedded JSON.
var AlternatePassiveSkills []*AlternatePassiveSkill

var (
	idToAlternatePassiveSkill     = make(map[uint32]*AlternatePassiveSkill)
	reverseAlternatePassiveSkills = make(map[PassiveSkillType]map[uint32][]*AlternatePassiveSkill)
)

//go:embed alternate_tree_versions.json.gz
var alternateTreeVersionsGz []byte

// AlternateTreeVersions holds all alternate tree versions loaded from the embedded JSON.
var AlternateTreeVersions []*AlternateTreeVersion

var idToAlternateTreeVersion = make(map[uint32]*AlternateTreeVersion)

//go:embed passive_skills.json.gz
var passiveSkillsGz []byte

// PassiveSkills holds all passive skills loaded from the embedded JSON.
var PassiveSkills []*PassiveSkill

var idToPassiveSkill = make(map[uint32]*PassiveSkill)

//go:embed stats.json.gz
var statsGz []byte

// Stats holds all stats loaded from the embedded JSON.
var Stats []*Stat

var idToStat = make(map[uint32]*Stat)

//go:embed SkillTree.json.gz
var skillTreeGz []byte

var (
	// SkillTreeJSON contains the marshaled skill tree data as JSON.
	SkillTreeJSON []byte
	// SkillTreeData holds the unmarshaled skill tree data.
	SkillTreeData SkillTree
)

//go:embed stat_descriptions.json.gz
var statTranslationsGz []byte

// StatTranslationsJSON contains the stat translations as JSON.
var StatTranslationsJSON []byte

//go:embed passive_skill_stat_descriptions.json.gz
var passiveSkillStatTranslationsGz []byte

// PassiveSkillStatTranslationsJSON contains the passive skill stat translations as JSON.
var PassiveSkillStatTranslationsJSON []byte

//go:embed passive_skill_aura_stat_descriptions.json.gz
var passiveSkillAuraStatTranslationsGz []byte

// PassiveSkillAuraStatTranslationsJSON contains the passive skill aura stat translations as JSON.
var PassiveSkillAuraStatTranslationsJSON []byte

//go:embed possible_stats.json.gz
var possibleStatsGz []byte

// PossibleStatsJSON contains the possible stats as JSON.
var PossibleStatsJSON []byte

func init() {
	AlternatePassiveAdditions = unzipJSONTo[[]*AlternatePassiveAddition](alternatePassiveAdditionsGz)

	for _, alt := range AlternatePassiveAdditions {
		idToAlternatePassiveAddition[alt.Index] = alt

		for _, skillType := range alt.PassiveType {
			if _, ok := reverseAlternatePassiveAdditions[skillType]; !ok {
				reverseAlternatePassiveAdditions[skillType] = make(map[uint32][]*AlternatePassiveAddition)
			}

			reverseAlternatePassiveAdditions[skillType][alt.AlternateTreeVersionsKey] = append(reverseAlternatePassiveAdditions[skillType][alt.AlternateTreeVersionsKey], alt)
		}
	}

	AlternatePassiveSkills = unzipJSONTo[[]*AlternatePassiveSkill](alternatePassiveSkillsGz)

	for _, alt := range AlternatePassiveSkills {
		idToAlternatePassiveSkill[alt.Index] = alt

		for _, skillType := range alt.PassiveType {
			if _, ok := reverseAlternatePassiveSkills[skillType]; !ok {
				reverseAlternatePassiveSkills[skillType] = make(map[uint32][]*AlternatePassiveSkill)
			}

			reverseAlternatePassiveSkills[skillType][alt.AlternateTreeVersionsKey] = append(reverseAlternatePassiveSkills[skillType][alt.AlternateTreeVersionsKey], alt)
		}
	}

	AlternateTreeVersions = unzipJSONTo[[]*AlternateTreeVersion](alternateTreeVersionsGz)

	for _, alt := range AlternateTreeVersions {
		idToAlternateTreeVersion[alt.Index] = alt
	}

	PassiveSkills = unzipJSONTo[[]*PassiveSkill](passiveSkillsGz)

	for _, skill := range PassiveSkills {
		idToPassiveSkill[skill.Index] = skill
	}

	Stats = unzipJSONTo[[]*Stat](statsGz)

	for _, stat := range Stats {
		idToStat[stat.Index] = stat
	}

	SkillTreeData = unzipJSONTo[SkillTree](skillTreeGz)

	var err error
	SkillTreeJSON, err = json.Marshal(SkillTreeData)
	if err != nil {
		panic(err)
	}

	StatTranslationsJSON = unzipTo(statTranslationsGz)
	PassiveSkillStatTranslationsJSON = unzipTo(passiveSkillStatTranslationsGz)
	PassiveSkillAuraStatTranslationsJSON = unzipTo(passiveSkillAuraStatTranslationsGz)

	PossibleStatsJSON = unzipTo(possibleStatsGz)
}

func unzipJSONTo[T any](data []byte) T {
	out := new(T)
	if err := json.Unmarshal(unzipTo(data), &out); err != nil {
		panic(err)
	}

	return *out
}

func unzipTo(data []byte) []byte {
	reader, err := gzip.NewReader(bytes.NewReader(data))
	if err != nil {
		panic(err)
	}

	all, err := io.ReadAll(reader)
	if err != nil {
		panic(err)
	}

	return all
}
