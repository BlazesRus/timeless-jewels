<#
  MIT License

  Copyright (c) 2025 James Armstrong (github.com/BlazesRus)

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
    
  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
    
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.

  .SYNOPSIS
    Build and optimize the WASM module.
#>

[string] $InputFileName = 'wasi-main.go'

Set-StrictMode -Version Latest

#── Load our shared PowerShell profile so `wasmOpt` is available ──
$profilePath = Join-Path $PSScriptRoot '..' '..' 'PowershellSettings' 'PowerShellTerminal.ps1'

if (Test-Path $profilePath) {
		. $profilePath
} else {
		Write-Error "Shared profile not found at $profilePath"
		throw
}

if (-not (Get-Command wasmOpt -ErrorAction SilentlyContinue)) {
		Write-Error "Failed to load wasmOpt alias; check your profile."
		throw
}

$BuildDir   = Join-Path $PSScriptRoot '..' '..' 'wasm'
$OutputPath = Join-Path $PSScriptRoot '..' '..' 'frontend' 'static' 'main.wasm'

Write-Verbose "Will write optimized WASM to $OutputPath"

# Ensure output directory exists
$outputDir = Split-Path $OutputPath -Parent
if (-not (Test-Path $outputDir)) {
		New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

Write-Verbose "Building optimized WASM module…"

# 1) Resolve directories
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$settingsFile = Join-Path $scriptDir 'WasmBuilderSettings.psd1'
$settings = Import-PowerShellDataFile $settingsFile

$allowOldWasmOpt       = $settings.allowOldWasmOpt
$tinygoExe              = $settings.tinygoExe
$goRoot                 = $settings.goRoot
$minimumExportVersion   = $settings.minimumExportVersion

if (-not (Get-Command go -ErrorAction SilentlyContinue) -and (Test-Path $goRoot)) {
	$env:PATH = "$goRoot;$env:PATH"
	Write-Host "Prepended $goRoot to PATH to satisfy TinyGo’s go dependency" -ForegroundColor Cyan
}

# projectRoot: go up two levels: from scripts → frontend → project root
$projectRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)

if (-not (Test-Path $BuildDir)) {
	Write-Host "ERROR: WASM directory not found: $BuildDir" -ForegroundColor Red
	throw
}

Set-Location $BuildDir
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host "📋 Available Go files:" -ForegroundColor Yellow
Get-ChildItem *.go | Format-Table Name, Length, LastWriteTime

# ─── 3) Pick builder ──────────────────────────────────────────────────────────
$hasDirectTinyGo = $false

if (Test-Path $tinygoExe) {
	$builder = 'tinygo'
	Write-Verbose "Using TinyGo for build"
	$hasDirectTinyGo = $true
}
elseif (Get-Command tinygo -ErrorAction SilentlyContinue) {
	$builder = 'tinygo'
	Write-Verbose "Using TinyGo for build"
}
elseif (Get-Command go -ErrorAction SilentlyContinue) {
	$builder = 'go'
	Write-Verbose "TinyGo not found; falling back to Go"
}
else {
	Write-Error "ERROR: Neither TinyGo nor Go found. Install one to proceed."
	throw
}

# ─── 4) Check for wasm-strip shim ───────────────────────────────────────────────────────

$hasStrip = [bool](Get-Command wasm-strip -ErrorAction SilentlyContinue)
if ($hasStrip) {
	Write-Host "wasm-strip available" -ForegroundColor Green
} else {
	Write-Host "wasm-strip not found; skipping debug-strip" -ForegroundColor Yellow
}

# ─── 4.5) Prepare export flag guard ──────────────────────────────────
# assume we can do exports until proven otherwise
$supportsExports = $true

# ─── 5) Verify --export support ────────────────────────────────────────────────

if ($global:wasmOptVer -lt $minimumExportVersion) {
	if($allowOldWasmOpt){
		Write-Warning "wasmOpt v${wasmOptVersion} < ${minimumExportVersion}: skipping explicit exports."
		$supportsExports = $false
	}
	else
	{
		Write-Error "wasmOpt v${wasmOptVersion} < ${minimumExportVersion}: Skipping build of wasi .wasm file because of missing features."
		#Error out the script the build so doesn't try building site without wasi version of .wasm file
		throw
	}
} else {
	Write-Host "Detected wasmOpt v$wasmOptVersion; --export is available." -ForegroundColor Green
}

# ─── 6) Build the WASM ────────────────────────────────────────────────────────
if ($hasDirectTinyGo) {
	Write-Host "`nRunning direct tinygo build..." -ForegroundColor Cyan
	& $tinygoExe build -target wasi -no-debug -opt=2 -scheduler=none `
		-o $OutputPath $InputFileName
} elseif ($builder -eq 'tinygo') {
	Write-Host "`nRunning tinygo build..." -ForegroundColor Cyan
	tinygo build -target wasi -no-debug -opt=2 -scheduler=none `
		-o $OutputPath $InputFileName
} else {
	Write-Host "`nRunning go build -ldflags '-s -w'..." -ForegroundColor Cyan
	go build -ldflags '-s -w' -o $OutputPath $InputFileName
}

$initialSize = (Get-Item $OutputPath).Length
Write-Host "Build succeeded: $initialSize bytes" -ForegroundColor Green

# ─── 7) Strip debug sections ───────────────────────────────────────────────────

if ($hasStrip) {
	Write-Host "`nStripping debug sections..." -ForegroundColor Cyan
	wasm-strip $OutputPath
}

# ─── 8) Dead-code eliminate & explicit exports ────────────────────────────────
#Avoiding dce if exports not supported
if($supportsExports){
	$tempPath = "$OutputPath.tmp"
	Write-Host "`nRunning wasmOpt with DCE + explicit exports..." -ForegroundColor Cyan

	$exports = @(
	'-O1',
	'--strip-debug',
	'--enable-bulk-memory',
	'--dce',
	'--export=_start',
	'--export=Calculate',
	'--export=ReverseSearch',
	'--export=GetStatByIndex',
	'--export=GetAlternatePassiveSkillByIndex',
	'--export=GetAlternatePassiveAdditionByIndex',
	'--export=GetPassiveSkillByIndex',
	'--export=GetTimelessJewelsData',
	'--export=getMemoryPointer',
	'--export=getMemorySize',
	'--export=memory',
	$OutputPath,
	'-o', $tempPath
	)

	Write-Host "🔧 Invoking: wasmOpt $($exports -join ' ')" -ForegroundColor Cyan
	wasmOpt @exports
} else {
	$tempPath = "$OutputPath.tmp"
	Write-Host "`nRunning wasmOpt without dce and explicit exports..." -ForegroundColor Cyan

	$exports = @(
	'-O1',
	'--strip-debug',
	'--enable-bulk-memory',
	$OutputPath,
	'-o', $tempPath
	)
	
	Write-Host "🔧 Invoking: wasmOpt $($exports -join ' ')" -ForegroundColor Cyan
	wasmOpt @exports
}

#Catch if wasmOpt fails
if ($LASTEXITCODE -ne 0) {
	Write-Host "WARNING: wasmOpt failed (exit code $LASTEXITCODE)" -ForegroundColor Yellow
	throw
}

Move-Item $tempPath $OutputPath -Force
$finalSize = (Get-Item $OutputPath).Length
$saved     = $initialSize - $finalSize
$pct       = [math]::Round(($saved / $initialSize) * 100, 1)
Write-Host "Optimized: saved $saved bytes ($pct%), final size $finalSize bytes" -ForegroundColor Green

# Use ${outputPath} to avoid ':' parsing issue
Write-Host "`nRemaining exports in ${outputPath}:" -ForegroundColor Cyan
wasm-objdump -x $OutputPath | Select-String 'Export'

Write-Host "`nDone! Your slim WASM is ready at $OutputPath" -ForegroundColor Green
