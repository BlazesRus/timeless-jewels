// Package random provides a deterministic number generator for jewel calculations.
package random

import (
	"github.com/BlazesRus/timeless-jewels/data"
)

const (
	// InitialStateConstant0 is the first initial state constant for the RNG.
	InitialStateConstant0 = 0x40336050
	// InitialStateConstant1 is the second initial state constant for the RNG.
	InitialStateConstant1 = 0xCFA3723C
	// InitialStateConstant2 is the third initial state constant for the RNG.
	InitialStateConstant2 = 0x3CAC5F6F
	// InitialStateConstant3 is the fourth initial state constant for the RNG.
	InitialStateConstant3 = 0x3793FDFF

	// TinyMT32SH0 is a shift constant for the TinyMT32 RNG.
	TinyMT32SH0 = 1
	// TinyMT32SH1 is a shift constant for the TinyMT32 RNG.
	TinyMT32SH1 = 10
	// TinyMT32Mask is a mask constant for the TinyMT32 RNG.
	TinyMT32Mask = 0x7FFFFFFF
	// TinyMT32Alpha is an alpha constant for the TinyMT32 RNG.
	TinyMT32Alpha = 0x19660D
	// TinyMT32Bravo is a bravo constant for the TinyMT32 RNG.
	TinyMT32Bravo = 0x5D588B65
)

// NumberGenerator is a deterministic random number generator for jewel calculations.
type NumberGenerator struct {
	state [4]uint32
}

// NewRNG creates a new NumberGenerator instance.
func NewRNG() *NumberGenerator {
	return &NumberGenerator{state: [4]uint32{}}
}

// Reset initializes the RNG state for a given passive skill and jewel.
func (g *NumberGenerator) Reset(passiveSkill *data.PassiveSkill, timelessJewel data.TimelessJewel) {
	g.state[0] = InitialStateConstant0
	g.state[1] = InitialStateConstant1
	g.state[2] = InitialStateConstant2
	g.state[3] = InitialStateConstant3

	g.Initialize([]uint32{
		passiveSkill.PassiveSkillGraphID,
		timelessJewel.GetSeed(),
	})
}

// Initialize seeds the RNG with the provided seeds.
func (g *NumberGenerator) Initialize(seeds []uint32) {
	index := uint32(1)

	for _, seed := range seeds {
		roundState := ManipulateAlpha(
			g.state[(index%4)] ^
				g.state[((index+1)%4)] ^
				g.state[(((index+4)-1)%4)])

		g.state[((index + 1) % 4)] += roundState

		roundState += seed + index

		g.state[(((index + 1) + 1) % 4)] += roundState
		g.state[(index % 4)] = roundState

		index = (index + 1) % 4
	}

	for range 5 {
		roundState := ManipulateAlpha(
			g.state[(index%4)] ^
				g.state[((index+1)%4)] ^
				g.state[(((index+4)-1)%4)])

		g.state[((index + 1) % 4)] += roundState

		roundState += index

		g.state[(((index + 1) + 1) % 4)] += roundState
		g.state[(index % 4)] = roundState

		index = (index + 1) % 4
	}

	for range 4 {
		roundState := ManipulateBravo(
			g.state[(index%4)] +
				g.state[((index+1)%4)] +
				g.state[(((index+4)-1)%4)])

		g.state[((index + 1) % 4)] ^= roundState

		roundState -= index

		g.state[(((index + 1) + 1) % 4)] ^= roundState
		g.state[(index % 4)] = roundState

		index = (index + 1) % 4
	}

	for range 8 {
		g.GenerateNextState()
	}
}

// GenerateNextState advances the RNG state.
func (g *NumberGenerator) GenerateNextState() {
	a := g.state[3]
	b := ((g.state[0] & TinyMT32Mask) ^ g.state[1]) ^ g.state[2]

	a ^= a << TinyMT32SH0
	b ^= (b >> TinyMT32SH0) ^ a

	g.state[0] = g.state[1]
	g.state[1] = g.state[2]
	g.state[2] = a ^ (b << TinyMT32SH1)
	g.state[3] = b

	g.state[1] ^= -(b & 1) & 0x8F7011EE
	g.state[2] ^= -(b & 1) & 0xFC78FF1F
}

// Temper returns a tempered random value from the current state.
func (g *NumberGenerator) Temper() uint32 {
	b := g.state[0] + (g.state[2] >> 8)
	a := g.state[3] ^ b

	if (b & 1) != 0 {
		return a ^ 0x3793FDFF
	}

	return a
}

// GenerateUInt returns a random uint32 value.
func (g *NumberGenerator) GenerateUInt() uint32 {
	g.GenerateNextState()
	return g.Temper()
}

// GenerateSingle returns a random uint32 in [0, exclusiveMaximumValue).
func (g *NumberGenerator) GenerateSingle(exclusiveMaximumValue uint32) uint32 {
	return g.GenerateUInt() % exclusiveMaximumValue
}

// Generate returns a random uint32 in [minValue, maxValue].
func (g *NumberGenerator) Generate(minValue uint32, maxValue uint32) uint32 {
	a := minValue + 0x80000000
	b := maxValue + 0x80000000

	if minValue >= 0x80000000 {
		a = minValue + 0x80000000
	}

	if maxValue >= 0x80000000 {
		b = maxValue + 0x80000000
	}

	roll := g.GenerateSingle((b - a) + 1)

	return (roll + a) + 0x80000000
}

// ManipulateAlpha is a helper for RNG state manipulation.
func ManipulateAlpha(value uint32) uint32 {
	return (value ^ (value >> 27)) * TinyMT32Alpha
}

// ManipulateBravo is a helper for RNG state manipulation.
func ManipulateBravo(value uint32) uint32 {
	return (value ^ (value >> 27)) * TinyMT32Bravo
}
