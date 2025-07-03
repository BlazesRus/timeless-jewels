# PowerShell script to ensure ModernWasm folder setup for generated files
# This script ensures any generated wasm-loader files go to the ModernWasm folder

param(
    [switch]$Help,
    [switch]$Clean,
    [switch]$Setup
)

if ($Help) {
    Write-Host "WASM Folder Management Script" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\manage-wasm-folders.ps1 -Setup    # Set up ModernWasm folder structure"
    Write-Host "  .\manage-wasm-folders.ps1 -Clean    # Clean generated files"
    Write-Host "  .\manage-wasm-folders.ps1 -Help     # Show this help"
    Write-Host ""
    Write-Host "Folders:" -ForegroundColor Yellow
    Write-Host "  ModernWasm/  # Modern Svelte 5 WASM files (visible in modern mode)"
    Write-Host "  LegacyWasm/  # Legacy Svelte 4 WASM files (hidden in modern mode)"
    exit 0
}

$ModernWasmPath = "frontend/src/lib/ModernWasm"
$LegacyWasmPath = "frontend/src/lib/LegacyWasm"

Write-Host "🔧 WASM Folder Management" -ForegroundColor Cyan

# Ensure directories exist
if (-not (Test-Path $ModernWasmPath)) {
    Write-Host "📁 Creating ModernWasm directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $ModernWasmPath -Force | Out-Null
}

if (-not (Test-Path $LegacyWasmPath)) {
    Write-Host "📁 Creating LegacyWasm directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $LegacyWasmPath -Force | Out-Null
}

if ($Setup) {
    Write-Host "🚀 Setting up ModernWasm folder structure..." -ForegroundColor Green
    
    # Check if ModernWasm files exist
    $modernFiles = @("wasm-loader.svelte.ts", "wasm-exec.svelte.ts", "go-runtime.svelte.ts")
    
    foreach ($file in $modernFiles) {
        $filePath = Join-Path $ModernWasmPath $file
        if (Test-Path $filePath) {
            Write-Host "  ✅ $file exists" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $file missing" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "🔍 Current folder structure:" -ForegroundColor Yellow
    if (Test-Path $ModernWasmPath) {
        $modernItems = Get-ChildItem $ModernWasmPath -Name
        Write-Host "  ModernWasm/: $($modernItems -join ', ')" -ForegroundColor Green
    }
    
    if (Test-Path $LegacyWasmPath) {
        $legacyItems = Get-ChildItem $LegacyWasmPath -Name
        Write-Host "  LegacyWasm/: $($legacyItems -join ', ')" -ForegroundColor Magenta
    }
}

if ($Clean) {
    Write-Host "🧹 Cleaning generated files..." -ForegroundColor Yellow
    
    # Remove any accidentally generated files in wrong locations
    $wrongLocations = @(
        "frontend/src/lib/wasm/modern-wasm-loader-v2.svelte.ts",
        "frontend/src/lib/wasm/modern-wasm-loader.svelte.ts"
    )
    
    foreach ($file in $wrongLocations) {
        if (Test-Path $file) {
            Write-Host "  🗑️ Removing $file (wrong location)" -ForegroundColor Red
            Remove-Item $file -Force
        }
    }
}

Write-Host ""
Write-Host "📋 WASM Folder Configuration:" -ForegroundColor Cyan
Write-Host "  ✅ Modern files: frontend/src/lib/ModernWasm/" -ForegroundColor Green
Write-Host "  🔒 Legacy files: frontend/src/lib/LegacyWasm/ (hidden in modern mode)" -ForegroundColor Magenta
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "  • All new modern WASM files should be created in ModernWasm/"
Write-Host "  • LegacyWasm/ is hidden from VS Code and TypeScript in modern mode"
Write-Host "  • Generated wasm-loader.js files should target ModernWasm/ for modern builds"
