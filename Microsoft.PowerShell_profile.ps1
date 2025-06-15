# PowerShell Profile Configuration for Better GitHub Copilot Integration

# Ensure prompt loads quickly to prevent Copilot timing out
$ErrorActionPreference = "SilentlyContinue"

# Set up shell integration markers for better command detection
function prompt {
    # Add shell integration markers that help Copilot detect command completion
    $ESC = [char]27
    $BEL = [char]7
    
    # Command started marker
    Write-Host "$ESC]133;C$BEL" -NoNewline
    
    # Standard prompt
    $path = Get-Location
    $gitBranch = ""
    
    # Quick git branch detection (if in git repo)
    if (Test-Path ".git") {
        try {
            $gitBranch = " ($(git branch --show-current 2>$null))"
        } catch {}
    }
    
    # Command finished marker
    Write-Host "$ESC]133;D;$LASTEXITCODE$BEL" -NoNewline
    
    return "PS $path$gitBranch> "
}

# Improve command completion detection
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    $ESC = [char]27
    $BEL = [char]7
    Write-Host "$ESC]133;D;$LASTEXITCODE$BEL" -NoNewline
}

# Set console title for better terminal identification
$Host.UI.RawUI.WindowTitle = "PowerShell - GitHub Copilot Enhanced"

# Improve readline experience
if (Get-Module -ListAvailable PSReadLine) {
    Import-Module PSReadLine
    Set-PSReadLineOption -PredictionSource History
    Set-PSReadLineOption -HistorySearchCursorMovesToEnd
    Set-PSReadLineKeyHandler -Key Tab -Function Complete
}

# Quick function to signal command completion to Copilot
function Signal-Completion {
    $ESC = [char]27
    $BEL = [char]7
    Write-Host "$ESC]133;D;0$BEL" -NoNewline
    Write-Host "`nCommand completed successfully." -ForegroundColor Green
}

# Alias for easy use
Set-Alias -Name "done" -Value "Signal-Completion"

Write-Host "PowerShell profile loaded - GitHub Copilot integration enhanced" -ForegroundColor Cyan
