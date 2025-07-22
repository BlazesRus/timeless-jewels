// Package main provides the WASI entry point for the Timeless Jewel calculator.
package main

import (
	"encoding/json"
	"unsafe"

	"github.com/BlazesRus/timeless-jewels/calculator"
	"github.com/BlazesRus/timeless-jewels/data"
)

//go:wasmexport Calculate
func Calculate(passiveSkillId, seed, jewelId int32, conquerorPtr, conquerorLen int32) int32 {
	// Convert the conqueror string from WASM memory
	conqueror := readStringFromMemory(conquerorPtr, conquerorLen)
	
	// Call the actual calculation function
	result := calculator.Calculate(uint32(passiveSkillId), uint32(seed), data.JewelType(jewelId), data.Conqueror(conqueror))
	
	// Serialize result to JSON and store in memory
	jsonData, err := json.Marshal(result)
	if err != nil {
		return 0 // Error indicator
	}
	
	// Store JSON in a global location that JS can access
	return writeStringToMemory(string(jsonData))
}

//go:wasmexport ReverseSearch
func ReverseSearch(passiveIdsPtr, passiveIdsLen, statIdsPtr, statIdsLen, jewelId int32, conquerorPtr, conquerorLen int32) int32 {
	// Read passive IDs and stat IDs from WASM memory
	passiveIds := readUint32ArrayFromMemory(passiveIdsPtr, passiveIdsLen)
	statIds := readUint32ArrayFromMemory(statIdsPtr, statIdsLen)
	
	// Convert the conqueror string from WASM memory
	conqueror := readStringFromMemory(conquerorPtr, conquerorLen)
	
	// Call the reverse search function
	results := calculator.ReverseSearch(passiveIds, statIds, data.JewelType(jewelId), data.Conqueror(conqueror), nil)
	
	// Serialize result to JSON
	jsonData, err := json.Marshal(results)
	if err != nil {
		return 0
	}
	
	return writeStringToMemory(string(jsonData))
}

//go:wasmexport GetStatByIndex
func GetStatByIndex(index int32) int32 {
	stat := data.GetStatByIndex(uint32(index))
	jsonData, err := json.Marshal(stat)
	if err != nil {
		return 0
	}
	return writeStringToMemory(string(jsonData))
}

//go:wasmexport GetAlternatePassiveSkillByIndex
func GetAlternatePassiveSkillByIndex(index int32) int32 {
	skill := data.GetAlternatePassiveSkillByIndex(uint32(index))
	jsonData, err := json.Marshal(skill)
	if err != nil {
		return 0
	}
	return writeStringToMemory(string(jsonData))
}

//go:wasmexport GetAlternatePassiveAdditionByIndex
func GetAlternatePassiveAdditionByIndex(index int32) int32 {
	addition := data.GetAlternatePassiveAdditionByIndex(uint32(index))
	jsonData, err := json.Marshal(addition)
	if err != nil {
		return 0
	}
	return writeStringToMemory(string(jsonData))
}

//go:wasmexport GetPassiveSkillByIndex
func GetPassiveSkillByIndex(index int32) int32 {
	skill := data.GetPassiveSkillByIndex(uint32(index))
	jsonData, err := json.Marshal(skill)
	if err != nil {
		return 0
	}
	return writeStringToMemory(string(jsonData))
}

//go:wasmexport GetTimelessJewelsData
func GetTimelessJewelsData() int32 {
	// Create a data structure with all the exposed data
	exposedData := map[string]interface{}{
		"TimelessJewels": map[data.JewelType]string{
			data.GloriousVanity:  data.GloriousVanity.String(),
			data.LethalPride:     data.LethalPride.String(),
			data.BrutalRestraint: data.BrutalRestraint.String(),
			data.MilitantFaith:   data.MilitantFaith.String(),
			data.ElegantHubris:   data.ElegantHubris.String(),
		},
		"TimelessJewelConquerors": data.TimelessJewelConquerors,
		"TimelessJewelSeedRanges": data.TimelessJewelSeedRanges,
		"PassiveSkills":           data.GetApplicablePassives(),
		"SkillTree":               string(data.SkillTreeJSON),
		"StatTranslationsJSON":    string(data.StatTranslationsJSON),
		"PassiveSkillStatTranslationsJSON":     string(data.PassiveSkillStatTranslationsJSON),
		"PassiveSkillAuraStatTranslationsJSON": string(data.PassiveSkillAuraStatTranslationsJSON),
		"PossibleStats":                        string(data.PossibleStatsJSON),
	}
	
	// Create TreeToPassive mapping
	treeToPassive := make(map[uint32]*data.PassiveSkill)
	for _, skill := range data.PassiveSkills {
		treeToPassive[skill.PassiveSkillGraphID] = skill
	}
	exposedData["TreeToPassive"] = treeToPassive
	
	// Serialize to JSON
	jsonData, err := json.Marshal(exposedData)
	if err != nil {
		return 0
	}
	
	return writeStringToMemory(string(jsonData))
}

// Memory management functions for WASI
var globalMemory []byte
var memoryOffset int32 = 1024 // Start after some reserved space

func writeStringToMemory(s string) int32 {
	data := []byte(s)
	startOffset := memoryOffset
	
	// Ensure we have enough space
	needed := len(data) + 8 // 4 bytes for length + 4 bytes for offset + data
	if int(memoryOffset)+needed > len(globalMemory) {
		// Expand memory
		newSize := len(globalMemory) + needed + 1024
		newMemory := make([]byte, newSize)
		copy(newMemory, globalMemory)
		globalMemory = newMemory
	}
	
	// Write length at current offset
	length := int32(len(data))
	globalMemory[memoryOffset] = byte(length)
	globalMemory[memoryOffset+1] = byte(length >> 8)
	globalMemory[memoryOffset+2] = byte(length >> 16)
	globalMemory[memoryOffset+3] = byte(length >> 24)
	memoryOffset += 4
	
	// Write data
	copy(globalMemory[memoryOffset:], data)
	memoryOffset += int32(len(data))
	
	return startOffset
}

func readStringFromMemory(ptr, length int32) string {
	if int(ptr+length) > len(globalMemory) {
		return ""
	}
	return string(globalMemory[ptr : ptr+length])
}

func readUint32ArrayFromMemory(ptr, length int32) []uint32 {
	result := make([]uint32, length)
	for i := int32(0); i < length; i++ {
		offset := ptr + i*4
		if int(offset+4) > len(globalMemory) {
			break
		}
		value := uint32(globalMemory[offset]) |
			uint32(globalMemory[offset+1])<<8 |
			uint32(globalMemory[offset+2])<<16 |
			uint32(globalMemory[offset+3])<<24
		result[i] = value
	}
	return result
}

//go:wasmexport getMemoryPointer
func getMemoryPointer() int32 {
	if globalMemory == nil {
		globalMemory = make([]byte, 1024*1024) // 1MB initial
	}
	return int32(uintptr(unsafe.Pointer(&globalMemory[0])))
}

//go:wasmexport getMemorySize
func getMemorySize() int32 {
	return int32(len(globalMemory))
}

//go:wasmexport init
func init() {
	// Initialize memory
	globalMemory = make([]byte, 1024*1024) // 1MB initial
}

func main() {
	// WASI programs need a main function, but in reactor mode it doesn't need to do anything
}
