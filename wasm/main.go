// Package main provides the entry point for the WASM build of the Timeless Jewel calculator.
package main

import (
	"fmt"

	"github.com/BlazesRus/timeless-jewels/wasm/exposition"
)

func main() {
	// Create and expose all functions/data - this automatically registers them
	exposition.Expose()
	
	fmt.Println("Calculator Initialized")
	select {}
}
