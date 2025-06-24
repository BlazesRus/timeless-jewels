# Comprehensive Dual-Mode Testing Script for Timeless Jewels Generator
# Tests both Legacy (Svelte 4) and Modern (Svelte 5) modes

param(
    [string]$Mode = "both",
    [switch]$Clean = $false,
    [switch]$Build = $false
)

Write-Host "🧪 Timeless Jewels Dual-Mode Testing Script" -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Magenta
Write-Host ""

# Function to test a specific mode
function Test-Mode {
    param([string]$TestMode)
    
    Write-Host "🎯 Testing $TestMode mode..." -ForegroundColor Cyan
    Write-Host "-----------------------------------" -ForegroundColor DarkCyan
    
    # Set environment
    $env:SVELTE_MODE = $TestMode.ToLower()
    
    # Clean if requested
    if ($Clean) {
        Write-Host "🧹 Cleaning node_modules and lockfile..." -ForegroundColor Yellow
        Remove-Item pnpm-lock.yaml -Force -ErrorAction SilentlyContinue
        Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Install dependencies
    Write-Host "📦 Installing dependencies for $TestMode mode..." -ForegroundColor Blue
    $installOutput = pnpm install 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Install failed for $TestMode mode!" -ForegroundColor Red
        return $false
    }
    
    # Check versions
    Write-Host "📋 Checking installed versions..." -ForegroundColor Yellow
    try {
        $svelteVersion = node -e "console.log(require('svelte/package.json').version)" 2>$null
        Write-Host "  Svelte version: $svelteVersion" -ForegroundColor Green
        
        # Verify expected version
        $expectedMajor = if ($TestMode -eq "Legacy") { "4" } else { "5" }
        if ($svelteVersion -match "^$expectedMajor\.") {
            Write-Host "  ✅ Correct Svelte version for $TestMode mode" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Unexpected Svelte version for $TestMode mode" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ Could not determine Svelte version" -ForegroundColor Red
    }
    
    # Test type checking
    Write-Host "🔍 Running type check..." -ForegroundColor Blue
    $checkCmd = if ($TestMode -eq "Legacy") { "check:legacy" } else { "check:modern" }
    $checkOutput = pnpm run $checkCmd 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Type check passed" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Type check had issues" -ForegroundColor Yellow
    }
    
    # Build if requested
    if ($Build) {
        Write-Host "🏗️ Building for $TestMode mode..." -ForegroundColor Blue
        $buildOutput = pnpm run build 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Build successful" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Build failed" -ForegroundColor Red
            return $false
        }
    }
    
    Write-Host ""
    return $true
}

# Main test execution
try {
    $allPassed = $true
    
    if ($Mode -eq "both") {
        # Test both modes
        $legacyResult = Test-Mode "Legacy"
        $modernResult = Test-Mode "Modern"
        $allPassed = $legacyResult -and $modernResult
    } elseif ($Mode -eq "legacy") {
        $allPassed = Test-Mode "Legacy"
    } elseif ($Mode -eq "modern") {
        $allPassed = Test-Mode "Modern"
    } else {
        Write-Host "❌ Invalid mode: $Mode. Use 'legacy', 'modern', or 'both'" -ForegroundColor Red
        exit 1
    }
    
    # Summary
    Write-Host "📊 Test Summary" -ForegroundColor Magenta
    Write-Host "===============" -ForegroundColor Magenta
    if ($allPassed) {
        Write-Host "🎉 All tests passed successfully!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "❌ Some tests failed!" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "💥 Error during testing: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
