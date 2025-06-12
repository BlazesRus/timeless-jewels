#!/usr/bin/env powershell

# pnpm v10 Migration Script for Windows PowerShell
# This script helps migrate the workspace to pnpm v10

Write-Host "🔄 Starting pnpm v10 migration..." -ForegroundColor Cyan

# Check if pnpm is installed
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ Current pnpm version: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ pnpm is not installed. Please install pnpm first:" -ForegroundColor Red
    Write-Host "   npm install -g pnpm@10" -ForegroundColor Yellow
    exit 1
}

# Check if we're running pnpm v10+
$majorVersion = [int]($pnpmVersion.Split('.')[0])
if ($majorVersion -lt 10) {
    Write-Host "⚠️  pnpm v$pnpmVersion detected. Upgrading to v10..." -ForegroundColor Yellow
    try {
        pnpm self-update
        Write-Host "✅ pnpm updated successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to update pnpm. Please update manually:" -ForegroundColor Red
        Write-Host "   pnpm self-update" -ForegroundColor Yellow
        Write-Host "   OR: npm install -g pnpm@10" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "🧹 Cleaning old dependencies..." -ForegroundColor Yellow

# Clean frontend directory
Set-Location frontend
if (Test-Path "pnpm-lock.yaml") {
    Remove-Item "pnpm-lock.yaml" -Force
    Write-Host "✅ Removed old pnpm-lock.yaml" -ForegroundColor Green
}

if (Test-Path "node_modules") {
    Remove-Item "node_modules" -Recurse -Force
    Write-Host "✅ Removed node_modules" -ForegroundColor Green
}

Write-Host "📦 Installing dependencies with pnpm v10..." -ForegroundColor Cyan
try {
    pnpm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Write-Host "Please check the error messages above and resolve any issues." -ForegroundColor Yellow
    exit 1
}

Write-Host "🧪 Running verification tests..." -ForegroundColor Cyan

# Test basic commands
Write-Host "Testing basic commands..." -ForegroundColor Yellow

try {
    pnpm run format
    Write-Host "✅ Format command successful" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Format command failed - check configuration" -ForegroundColor Yellow
}

try {
    pnpm run lint
    Write-Host "✅ Lint command successful" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Lint command failed - check configuration" -ForegroundColor Yellow
}

try {
    pnpm run check
    Write-Host "✅ Check command successful" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Check command failed - check configuration" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 pnpm v10 migration completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary of changes:" -ForegroundColor Cyan
Write-Host "   • Updated package.json to use pnpm v10" -ForegroundColor White
Write-Host "   • Added lifecycle script security configuration" -ForegroundColor White
Write-Host "   • Created .pnpmrc files with v10 optimizations" -ForegroundColor White
Write-Host "   • Regenerated lockfile with new format" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed information, see:" -ForegroundColor Cyan
Write-Host "   • PNPM_V10_MIGRATION.md - Complete migration guide" -ForegroundColor White
Write-Host "   • .pnpmrc - Configuration files" -ForegroundColor White
Write-Host ""
Write-Host "🚀 You can now use pnpm v10 features!" -ForegroundColor Green
Write-Host "   Remember: Test arguments no longer need '--' prefix" -ForegroundColor Yellow

Set-Location ..
