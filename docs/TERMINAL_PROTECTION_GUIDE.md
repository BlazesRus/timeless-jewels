# Terminal Protection Guide

## Current Configuration

Our VS Code workspace is configured to selectively protect important terminals while allowing regular user terminals to close normally.

### Terminal Protection Settings

#### Selective Protection (Applied)
```json
{
  "terminal.integrated.confirmOnExit": "hasChildProcesses",
  "terminal.integrated.confirmOnKill": "hasChildProcesses",
  "terminal.integrated.showExitAlert": true,
  "terminal.integrated.enablePersistentSessions": true,
  "terminal.integrated.persistentSessionReviveProcess": "onExitAndWindowClose"
}
```

#### What This Means:
- ✅ **Protects important terminals**: Dev servers, build processes, long-running tasks
- ✅ **Allows regular terminals to close**: Simple command terminals, one-off operations
- ✅ **Persistent sessions**: Important terminals can be restored if accidentally closed
- ✅ **Smart detection**: Only shows confirmation when child processes are running

### Protected Terminal Types

#### Automatically Protected:
1. **Dev Server terminals** - Running `pnpm run dev` or similar
2. **Build processes** - Active compilation or bundling
3. **WASM building** - Go build processes
4. **Background tasks** - Long-running scripts or watchers
5. **Extension terminals** - Terminals managed by VS Code extensions

#### Not Protected (Normal behavior):
1. **Empty terminals** - No active processes
2. **Completed commands** - Commands that have finished
3. **User command terminals** - Interactive PowerShell sessions
4. **One-off commands** - Single commands that complete quickly

### Task-Level Protection

Our important tasks have additional protection:

#### Dev Server Task:
```json
{
  "presentation": {
    "panel": "dedicated",    // Dedicated panel (harder to close accidentally)
    "close": false,         // Prevents automatic closing
    "showReuseMessage": false,
    "clear": false
  },
  "isBackground": true      // Runs in background, protected from accidental termination
}
```

## Best Practices

### For Development Work:
1. **Use tasks for important processes**: Dev servers, builds, etc.
2. **Keep dedicated terminals**: Let VS Code manage long-running processes
3. **Use multiple terminals**: Separate terminals for different purposes
4. **Regular terminals for quick commands**: File operations, git commands, etc.

### Terminal Management:
1. **Name your terminals**: Right-click terminal tab → "Rename"
2. **Use terminal icons**: Tasks automatically get appropriate icons
3. **Pin important terminals**: Keep dev server terminals visible
4. **Close empty terminals**: Prevent clutter while preserving important ones

## Troubleshooting

### If You Accidentally Close an Important Terminal:
1. **Check persistent sessions**: VS Code may restore it automatically
2. **Use task runner**: Re-run the task instead of manual commands
3. **Check terminal history**: Previous commands may be preserved

### If You Get Too Many Confirmation Dialogs:
- The protection only triggers when child processes are running
- Empty or completed terminals close without confirmation
- This is intentional to protect only what matters

### Terminal Clutter Prevention:
- Regular terminals (no child processes) close normally
- Completed task terminals can be closed without confirmation
- Extension-managed terminals are handled by their respective extensions

## Quick Commands

### Restart Dev Server:
```powershell
# Use the task (recommended)
Ctrl+Shift+P → "Tasks: Run Task" → "Dev Server (Auto-detect Version)"

# Or manually in frontend directory:
pnpm run dev
```

### Check Terminal Status:
```powershell
# See what processes are running
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*pnpm*"}
```

### Manual Terminal Protection:
```powershell
# Keep a PowerShell session alive (prevents accidental closure)
while ($true) { Start-Sleep -Seconds 60 }
```

## Integration with Development Workflow

This configuration is designed to:
- **Protect your dev server** from accidental closure
- **Allow normal terminal use** without excessive protection
- **Preserve important work** through persistent sessions
- **Maintain clean workspace** by allowing clutter cleanup

The system intelligently distinguishes between terminals you want to keep (with active processes) and terminals you can safely close (empty or completed commands).
