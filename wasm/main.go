// Package main provides the entry point for the WASM build of the Timeless Jewel calculator.
package main

import (
	"fmt"

	"github.com/BlazesRus/timeless-jewels/wasm/exposition"
)

func main() {
	exposition.Expose()
	fmt.Println("Calculator Initialized")
	select {}
}
