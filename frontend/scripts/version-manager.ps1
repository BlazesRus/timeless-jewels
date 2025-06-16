# Timeless Jewel Generator - Version Manager PowerShell Wrapper
# This script provides a convenient interface for managing Svelte versions on Windows

param(
    [Parameter(Position=0)]
    [ValidateSet("switch", "status", "help", "")]
    [string]$Command = "switch",
    
    [Parameter()]
    [ValidateSet("4", "5")]
    [string]$Version,
    
    [Parameter()]
    [switch]$Force
)

# Change to the frontend directory
$frontendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $frontendDir

Write-Host "🚀 Timeless Jewel Generator - Version Manager" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# If version is specified, update the INI file first
if ($Version) {
    Write-Host "📝 Updating version.ini to use Svelte $Version..." -ForegroundColor Yellow
    
    $iniPath = "version.ini"
    if (Test-Path $iniPath) {
        $content = Get-Content $iniPath
        $newContent = $content -replace "version = [45]", "version = $Version"
        $newContent | Set-Content $iniPath
        Write-Host "✅ Updated version.ini" -ForegroundColor Green
    } else {
        Write-Host "❌ version.ini not found!" -ForegroundColor Red
        exit 1
    }
}

# Run the Node.js version manager
try {
    switch ($Command) {
        "switch" {
            Write-Host "🔄 Switching package configuration..." -ForegroundColor Yellow
            node scripts/version-manager.js switch
        }
        "status" {
            Write-Host "📊 Checking version status..." -ForegroundColor Yellow
            node scripts/version-manager.js status
        }
        "help" {
            Write-Host @"
PowerShell Version Manager for Timeless Jewel Generator

Usage:
  .\scripts\version-manager.ps1 [command] [-Version <4|5>] [-Force]

Commands:
  switch    Switch package.json based on version.ini configuration
  status    Show current version configuration status
  help      Show this help message

Parameters:
  -Version  Set specific Svelte version (4 or 5) before switching
  -Force    Force operation without confirmation

Examples:
  .\scripts\version-manager.ps1 switch -Version 5
  .\scripts\version-manager.ps1 status
  .\scripts\version-manager.ps1 help

Configuration:
  Edit version.ini to change default settings and options
"@ -ForegroundColor White
        }
        default {
            node scripts/version-manager.js switch
        }
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Operation completed successfully!" -ForegroundColor Green
        
        # Show next steps
        Write-Host "`n💡 Next steps:" -ForegroundColor Cyan
        Write-Host "  • Run 'pnpm run dev' to start development server" -ForegroundColor White
        Write-Host "  • Run 'pnpm run version:status' to check current configuration" -ForegroundColor White
        Write-Host "  • Edit version.ini to change default settings" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Error running version manager: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
