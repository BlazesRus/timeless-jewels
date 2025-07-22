# Timeless Jewel Generator - Version Manager PowerShell Wrapper
# This script provides a convenient interface for managing Svelte versions on Windows
# NOTE: The system now auto-detects Svelte versions at runtime, but this script
# maintains backward compatibility for explicit version switching.

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

MODERN BEHAVIOR:
  The system now auto-detects Svelte versions at runtime using the compiler.
  This script provides backward compatibility for explicit version switching.

Usage:
  .\scripts\version-manager.ps1 [command] [-Version <4|5>] [-Force]

Commands:
  switch    Switch package.json based on configuration (auto-detects if possible)
  status    Show current version configuration status
  help      Show this help message

Parameters:
  -Version  Set specific Svelte version (4 or 5) before switching
  -Force    Force operation without confirmation

Examples:
  .\scripts\version-manager.ps1 switch -Version 5
  .\scripts\version-manager.ps1 status
  .\scripts\version-manager.ps1 help

Modern Usage:
  Most operations now auto-detect the Svelte version from your installed packages.
  You typically only need: pnpm run dev (auto-detects version)

Configuration:
  Edit version.ini for backward compatibility or explicit version control
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
        Write-Host "  • Run 'pnpm run dev' to start development server (auto-detects version)" -ForegroundColor White
        Write-Host "  • Run 'pnpm run version:status' to check current configuration" -ForegroundColor White
        Write-Host "  • System now uses runtime Svelte version detection" -ForegroundColor White
    }

} catch {
    Write-Host "❌ Error running version manager: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
