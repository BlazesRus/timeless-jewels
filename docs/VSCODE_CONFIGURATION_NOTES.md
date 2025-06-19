# VS Code Configuration - Important Notes

## 📁 **CRITICAL: .vscode Folder Location**

**⚠️ WARNING: The `.vscode` folder belongs in the ROOT directory, NOT in the frontend folder!**

```
timeless-jewels_Partial/          ← ROOT (Correct location)
├── .vscode/
│   ├── settings.json            ← VS Code settings go here
│   ├── launch.json
│   └── tasks.json
├── docs/
├── frontend/                    ← NOT HERE! 
│   ├── src/
│   ├── package.json
│   └── ... (no .vscode folder)
└── ...
```

### Why This Matters:

1. **VS Code Workspace Scope**: The workspace is the root directory, not the frontend subdirectory
2. **Configuration Inheritance**: Settings in root `.vscode/` apply to the entire project
3. **File Pattern Matching**: ESLint and TypeScript configurations use paths relative to the workspace root
4. **Tool Integration**: Tasks, launch configurations, and extensions expect root-level configuration

## 🔧 Current Configuration Features

### ESLint Rules for Legacy Files
- **Pattern**: `**/Legacy*`, `**/*Legacy*`, `**/Svelte4*`
- **Suppressions**: 
  - `@typescript-eslint/no-unused-vars: off`
  - `svelte/valid-compile: off` 
  - `svelte/no-reactive-reassign: off`
  - `no-undef: off` (prevents `$page` errors in Legacy files)

### Svelte Compiler Warnings
- **`global_reference_invalid: ignore`** - Suppresses `$page` warnings in Legacy files
- **File-level suppressions** - `<!-- svelte-ignore global_reference_invalid -->`
- **Inline suppressions** - `// svelte-ignore global_reference_invalid`

### File Exclusions
- Legacy package files are hidden from explorer
- Backup files are excluded from search
- Version-specific components are filtered appropriately

### Context-Aware AI Assistance
- File patterns provide Svelte version context to GitHub Copilot
- Automatic syntax suggestions based on file naming convention
- Prevents version mixing in code generation

## 🚨 **AI Assistant Reminder**

**Never create `.vscode/` folders in subdirectories!**
- Always use the root `.vscode/settings.json`
- Frontend is a subdirectory, not the workspace root
- All VS Code configurations should be workspace-level, not folder-level

## 📝 Quick Reference

**Correct Path**: `timeless-jewels_Partial/.vscode/settings.json`  
**Incorrect Path**: `timeless-jewels_Partial/frontend/.vscode/settings.json` ❌

When adding VS Code configurations:
1. Always edit the root `.vscode/settings.json`
2. Use relative paths from the workspace root
3. Test that patterns match intended files using VS Code's file explorer
