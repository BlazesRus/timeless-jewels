# Project Status and Configuration Report for Timeless Jewels Generator
# Provides comprehensive overview of the dual-mode TypeScript/Tailwind setup

Write-Host "📊 Timeless Jewels Generator - Project Status Report" -ForegroundColor Magenta
Write-Host "====================================================" -ForegroundColor Magenta
Write-Host ""

# Function to check file existence with colored output
function Check-File {
    param([string]$Path, [string]$Description)
    if (Test-Path $Path) {
        Write-Host "  ✅ $Description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ❌ $Description" -ForegroundColor Red
        return $false
    }
}

# Function to get package version
function Get-PackageVersion {
    param([string]$PackageName)
    try {
        $version = node -e "console.log(require('$PackageName/package.json').version)" 2>$null
        return $version
    } catch {
        return "Not found"
    }
}

Write-Host "🏗️ Configuration Files Status" -ForegroundColor Cyan
Write-Host "-----------------------------" -ForegroundColor DarkCyan

# Core config files
Check-File "package.json" "Main package.json"
Check-File "pnpmfile.cjs" "Dynamic pnpmfile.cjs hook"
Check-File "svelte.config.js" "Svelte configuration"
Check-File "vite.config.js" "Vite configuration"

# TypeScript configs
Write-Host ""
Write-Host "📝 TypeScript Configuration" -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor DarkCyan
Check-File "tsconfig.json" "Root TypeScript config"
Check-File "tsconfig.Modern.json" "Modern (Svelte 5) TypeScript config"
Check-File "tsconfig.Legacy.json" "Legacy (Svelte 4) TypeScript config"

# Tailwind configs
Write-Host ""
Write-Host "🎨 Tailwind CSS Configuration" -ForegroundColor Cyan
Write-Host "-----------------------------" -ForegroundColor DarkCyan
Check-File "tailwind.config.js" "Tailwind config (ESM)"
Check-File "tailwind.config.cjs" "Tailwind config (CJS)"
Check-File "postcss.config.cjs" "PostCSS configuration (dynamic modern/legacy)"

# Config dependencies
Write-Host ""
Write-Host "⚙️ Config Dependencies" -ForegroundColor Cyan
Write-Host "----------------------" -ForegroundColor DarkCyan
Check-File ".config-deps/timeless-jewels-legacy-config" "Legacy config package directory"
Check-File ".config-deps/timeless-jewels-modern-config" "Modern config package directory"
Check-File ".config-deps/timeless-jewels-modern-config/timeless-jewels-modern-config-1.0.0.tgz" "Modern config tarball"

# Source structure
Write-Host ""
Write-Host "📁 Source Code Structure" -ForegroundColor Cyan
Write-Host "------------------------" -ForegroundColor DarkCyan
Check-File "src" "Source directory"
Check-File "src/routes" "Routes directory"
Check-File "src/lib" "Library directory"
Check-File "LegacyMode" "Legacy mode source files"
Check-File "ModernMode" "Modern mode source files"

# Current installation status
Write-Host ""
Write-Host "📦 Current Installation Status" -ForegroundColor Cyan
Write-Host "------------------------------" -ForegroundColor DarkCyan

$currentSvelte = Get-PackageVersion "svelte"
$currentKit = Get-PackageVersion "@sveltejs/kit"
$currentTailwind = Get-PackageVersion "tailwindcss"
$currentTypeScript = Get-PackageVersion "typescript"

Write-Host "  Svelte version: $currentSvelte" -ForegroundColor $(if ($currentSvelte -match "^5\.") { "Green" } elseif ($currentSvelte -match "^4\.") { "Yellow" } else { "Red" })
Write-Host "  SvelteKit version: $currentKit" -ForegroundColor Green
Write-Host "  Tailwind CSS version: $currentTailwind" -ForegroundColor Green
Write-Host "  TypeScript version: $currentTypeScript" -ForegroundColor Green

# Detect current mode
Write-Host ""
Write-Host "🎯 Mode Detection" -ForegroundColor Cyan
Write-Host "----------------" -ForegroundColor DarkCyan

$envMode = $env:SVELTE_MODE
if ($envMode) {
    Write-Host "  Environment mode: $envMode" -ForegroundColor Yellow
} else {
    Write-Host "  Environment mode: Not set (defaults to modern)" -ForegroundColor Gray
}

$detectedMode = if ($currentSvelte -match "^4\.") { "Legacy (Svelte 4)" } elseif ($currentSvelte -match "^5\.") { "Modern (Svelte 5)" } else { "Unknown" }
Write-Host "  Detected mode: $detectedMode" -ForegroundColor Green

# Available scripts
Write-Host ""
Write-Host "🚀 Available Scripts" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor DarkCyan

$scripts = @(
    "dev", "dev:legacy", "dev:modern",
    "build", "build:legacy", "build:modern", 
    "check", "check:legacy", "check:modern",
    "install:legacy", "install:modern",
    "lint", "lint:css", "format"
)

foreach ($script in $scripts) {
    Write-Host "  pnpm run $script" -ForegroundColor Gray
}

# Quick usage guide
Write-Host ""
Write-Host "📖 Quick Usage Guide" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor DarkCyan
Write-Host "  Switch to Legacy mode:  pnpm run install:legacy && pnpm run dev:legacy" -ForegroundColor Yellow
Write-Host "  Switch to Modern mode:   pnpm run install:modern && pnpm run dev:modern" -ForegroundColor Yellow
Write-Host "  Run comprehensive test:  ./test-dual-mode.ps1 -Mode both -Build" -ForegroundColor Yellow
Write-Host "  Check project status:    ./project-status.ps1" -ForegroundColor Yellow

Write-Host ""
Write-Host "✨ Project setup complete! Ready for dual-mode development." -ForegroundColor Green
