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
