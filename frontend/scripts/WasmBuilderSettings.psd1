<#
  WasmBuilderSettings.psd1

  This file holds configuration for build-wasm.ps1.
  Comments here are ignored by Import-PowerShellDataFile.
#>

@{
  # If true, allow to continue with older versions of wasmopt that don't support export
  allowOldWasmOpt      = $false

  # Path to the TinyGo executable
  tinygoExe             = 'C:\PLanguages\tinygo\bin\tinygo.exe'

  # Ensure the Go SDK bin folder is on PATH
  goRoot                = 'C:\PLanguages\Go\bin'

  # Minimum Binaryen version for --export support
  minimumExportVersion  = 109  # bump to 125+ to require newer flags
}