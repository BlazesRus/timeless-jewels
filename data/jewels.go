// Package data provides types and constants for Timeless Jewels and their conquerors.
package data

// JewelType represents the type of a Timeless Jewel.
type JewelType uint

const (
	// GloriousVanity is the Glorious Vanity jewel type.
	GloriousVanity JewelType = iota + 1
	// LethalPride is the Lethal Pride jewel type.
	LethalPride
	// BrutalRestraint is the Brutal Restraint jewel type.
	BrutalRestraint
	// MilitantFaith is the Militant Faith jewel type.
	MilitantFaith
	// ElegantHubris is the Elegant Hubris jewel type.
	ElegantHubris
)

// String returns the string representation of the JewelType.
func (t JewelType) String() string {
	switch t {
	case GloriousVanity:
		return "Glorious Vanity"
	case LethalPride:
		return "Lethal Pride"
	case BrutalRestraint:
		return "Brutal Restraint"
	case MilitantFaith:
		return "Militant Faith"
	case ElegantHubris:
		return "Elegant Hubris"
	default:
		return "N/A"
	}
}

// Conqueror represents a conqueror associated with a Timeless Jewel.
type Conqueror string

const (
	// Xibaqua is a conqueror for Glorious Vanity.
	Xibaqua Conqueror = "Xibaqua"
	// Zerphi is a conqueror for Glorious Vanity.
	Zerphi Conqueror = "Zerphi"
	// Ahuana is a conqueror for Glorious Vanity.
	Ahuana Conqueror = "Ahuana"
	// Doryani is a conqueror for Glorious Vanity.
	Doryani Conqueror = "Doryani"
	// Kaom is a conqueror for Lethal Pride.
	Kaom Conqueror = "Kaom"
	// Rakiata is a conqueror for Lethal Pride.
	Rakiata Conqueror = "Rakiata"
	// Kiloava is a conqueror for Lethal Pride.
	Kiloava Conqueror = "Kiloava"
	// Akoya is a conqueror for Lethal Pride.
	Akoya Conqueror = "Akoya"
	// Deshret is a conqueror for Brutal Restraint.
	Deshret Conqueror = "Deshret"
	// Balbala is a conqueror for Brutal Restraint.
	Balbala Conqueror = "Balbala"
	// Asenath is a conqueror for Brutal Restraint.
	Asenath Conqueror = "Asenath"
	// Nasima is a conqueror for Brutal Restraint.
	Nasima Conqueror = "Nasima"
	// Venarius is a conqueror for Militant Faith.
	Venarius Conqueror = "Venarius"
	// Maxarius is a conqueror for Militant Faith.
	Maxarius Conqueror = "Maxarius"
	// Dominus is a conqueror for Militant Faith.
	Dominus Conqueror = "Dominus"
	// Avarius is a conqueror for Militant Faith.
	Avarius Conqueror = "Avarius"
	// Cadiro is a conqueror for Elegant Hubris.
	Cadiro Conqueror = "Cadiro"
	// Victario is a conqueror for Elegant Hubris.
	Victario Conqueror = "Victario"
	// Chitus is a conqueror for Elegant Hubris.
	Chitus Conqueror = "Chitus"
	// Caspiro is a conqueror for Elegant Hubris.
	Caspiro Conqueror = "Caspiro"
)

// TimelessJewelConquerors maps each JewelType and Conqueror to its TimelessJewelConqueror struct.
var TimelessJewelConquerors = map[JewelType]map[Conqueror]*TimelessJewelConqueror{
	GloriousVanity: {
		Xibaqua: &TimelessJewelConqueror{
			Index:   1,
			Version: 0,
		},
		Zerphi: &TimelessJewelConqueror{
			Index:   2,
			Version: 0,
		},
		Ahuana: &TimelessJewelConqueror{
			Index:   2,
			Version: 1,
		},
		Doryani: &TimelessJewelConqueror{
			Index:   3,
			Version: 0,
		},
	},
	LethalPride: {
		Kaom: &TimelessJewelConqueror{
			Index:   1,
			Version: 0,
		},
		Rakiata: &TimelessJewelConqueror{
			Index:   2,
			Version: 0,
		},
		Kiloava: &TimelessJewelConqueror{
			Index:   3,
			Version: 0,
		},
		Akoya: &TimelessJewelConqueror{
			Index:   3,
			Version: 1,
		},
	},
	BrutalRestraint: {
		Deshret: &TimelessJewelConqueror{
			Index:   1,
			Version: 0,
		},
		Balbala: &TimelessJewelConqueror{
			Index:   1,
			Version: 1,
		},
		Asenath: &TimelessJewelConqueror{
			Index:   2,
			Version: 0,
		},
		Nasima: &TimelessJewelConqueror{
			Index:   3,
			Version: 0,
		},
	},
	MilitantFaith: {
		Venarius: &TimelessJewelConqueror{
			Index:   1,
			Version: 0,
		},
		Maxarius: &TimelessJewelConqueror{
			Index:   1,
			Version: 1,
		},
		Dominus: &TimelessJewelConqueror{
			Index:   2,
			Version: 0,
		},
		Avarius: &TimelessJewelConqueror{
			Index:   3,
			Version: 0,
		},
	},
	ElegantHubris: {
		Cadiro: &TimelessJewelConqueror{
			Index:   1,
			Version: 0,
		},
		Victario: &TimelessJewelConqueror{
			Index:   2,
			Version: 0,
		},
		Chitus: &TimelessJewelConqueror{
			Index:   3,
			Version: 0,
		},
		Caspiro: &TimelessJewelConqueror{
			Index:   3,
			Version: 1,
		},
	},
}

// Range represents a range of valid jewel seeds, with an optional special flag.
type Range struct {
	Min     uint32
	Max     uint32
	Special bool
}

// TimelessJewelSeedRanges maps each JewelType to its valid seed range.
var TimelessJewelSeedRanges = map[JewelType]Range{
	GloriousVanity: {
		Min: 100,
		Max: 8000,
	},
	LethalPride: {
		Min: 10000,
		Max: 18000,
	},
	BrutalRestraint: {
		Min: 500,
		Max: 8000,
	},
	MilitantFaith: {
		Min: 2000,
		Max: 10000,
	},
	ElegantHubris: {
		Min:     2000,
		Max:     160000,
		Special: true,
	},
}
