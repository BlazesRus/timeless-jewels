# AI Assistant File Formatting Guidelines

## 🎯 Purpose

This document provides comprehensive guidelines for AI assistants (GitHub Copilot, Claude, ChatGPT, etc.) to preserve file formatting, layout, and structure when making code edits or suggestions.

## 🔴 CRITICAL: PowerShell-Only Environment

**⚠️ MANDATORY REQUIREMENT: This project EXCLUSIVELY uses PowerShell FOR TERMINAL COMMANDS**

- **ALL terminal commands MUST use PowerShell syntax**
- **Bash operators (`&&`, `||`, `|&`) DO NOT WORK in PowerShell terminal and WILL CAUSE FAILURES**
- **Use semicolons (`;`) for command chaining in terminal, NEVER `&&`**
- **When suggesting terminal commands, ALWAYS use PowerShell syntax**

### **🚨 CRITICAL DISTINCTION: Terminal vs Code Files**

#### **❌ FORBIDDEN - Terminal Commands Only:**

```powershell
# ❌ WILL FAIL in PowerShell terminal
npm install && npm run dev
cd frontend && pnpm install
```

#### **✅ REQUIRED - Terminal Commands:**

```powershell
# ✅ CORRECT PowerShell terminal syntax
npm install; npm run dev
cd frontend; pnpm install
```

#### **✅ PERFECTLY FINE - Inside Code Files:**

```typescript
// ✅ && works perfectly in TypeScript/JavaScript files
if (condition && anotherCondition) {
  return value1 && value2;
}

// ✅ Logical operators are normal language syntax
const result = isValid && hasPermission && isReady;
```

```json
{
  "scripts": {
    "build": "npm run compile && npm run bundle"
  }
}
```

#### **✅ PERFECTLY FINE - Language-Specific Files:**

```powershell
#!/bin/bash
# ✅ && works fine in bash script files
npm install && npm run dev
```

### **Quick Reference - Context Matters:**

| Context                  | `&&` Usage   | Syntax Required            |
| ------------------------ | ------------ | -------------------------- |
| **PowerShell Terminal**  | ❌ Forbidden | Use `;` for chaining       |
| **VS Code Tasks**        | ❌ Forbidden | Use `;` for chaining       |
| **TypeScript/JS Files**  | ✅ Normal    | Standard language syntax   |
| **Package.json Scripts** | ✅ Works     | npm handles cross-platform |
| **Bash Script Files**    | ✅ Normal    | Standard bash syntax       |

**See [PowerShell Command Standards](#️-powershell-command-standards) section for complete terminal command guidelines.**

## 🏗️ Project-Specific Guidelines

### **Timeless Jewel Generator Architecture**

This project uses a unique **version-aware architecture** with dual Svelte 4/5 support. Understanding this structure is crucial for proper file editing:

#### **Version-Aware Components**

- **Main Router**: `src/routes/tree/+page.svelte` - Version detection and dynamic imports
- **Svelte 4 Implementation**: `src/routes/tree/LegacyPage.svelte` - Legacy compatibility
- **Svelte 5 Implementation**: `src/routes/tree/ModernPage.svelte` - Modern features
- **Modern Components**: `src/lib/components/ModernSelect.svelte` - Cross-version compatibility

#### **File Naming Conventions**

**🔴 CRITICAL**: Understanding file naming patterns is essential for proper editing:

- **`*Svelte4.svelte`** files = **Legacy (Svelte 4)** compatible versions
- **`*Svelte5.svelte`** files = **Modern (Svelte 5)** compatible versions
- **`Legacy/` subfolders** = **Legacy (Svelte 4)** compatible versions
- **`Svelte5/` subfolders** = **Modern (Svelte 5)** compatible versions

**Examples:**

- `LegacyPage.svelte` → Use Svelte 4 syntax (`let data = []`, `$: reactive`)
- `ModernPage.svelte` → Use Svelte 5 syntax (`let data = $state([])`, `$derived`)
- `components/Legacy/Select.svelte` → Use Svelte 4 syntax
- `components/Svelte5/Select.svelte` → Use Svelte 5 syntax

#### **Package Management System**

- **Active Package**: `package.json` (defaults to Svelte 5)
- **Templates**: `Svelte5Package.json`, `LegacyPackage.json`
- **Safety Backups**: `Svelte5PackageBackup.json`, `LegacyPackageBackup.json`
- **Configuration**: `version.ini` controls version switching

### **Critical Project Rules**

#### **1. NEVER Edit Version Management Files Without Context**

```ini
# ❌ DON'T change version.ini without understanding impact
[svelte]
version = 4  # This affects entire build system!

# ✅ DO verify current configuration first
[svelte]
version = 5  # Current default, matches active package.json
```

#### **2. Preserve Backup File Integrity**

- **NEVER** modify `*Backup.json` files directly
- **NEVER** delete backup files during edits
- **ALWAYS** verify backup files exist before major changes

#### **3. Version-Aware Component Editing**

When editing version-specific components, understand the target:

**🎯 NAMING CONVENTION RULES:**

- **Files ending with `Svelte4.svelte`** → Use **Svelte 4** syntax only
- **Files ending with `Svelte5.svelte`** → Use **Svelte 5** syntax only
- **Files in `Legacy/` folders** → Use **Svelte 4** syntax only
- **Files in `Svelte5/` folders** → Use **Svelte 5** syntax only

```typescript
// ✅ GOOD - Svelte 5 syntax in ModernPage.svelte
let data = $state([]);
let loading = $state(false);

// ✅ GOOD - Svelte 4 syntax in LegacyPage.svelte
let data = [];
let loading = false;

// ❌ BAD - Mixing syntaxes in wrong files
// DON'T use $state in *Svelte4.svelte files
// DON'T use reactive statements in *Svelte5.svelte files
```

#### **4. Respect Current Mode Configuration**

**🔒 CURRENT MODE AWARENESS: Check `frontend/version.ini` before suggesting version changes**

```ini
# When version.ini shows:
[svelte]
version = 5

# ✅ DO: Focus on Svelte 5 development
# ✅ DO: Suggest testing with current version
# ✅ DO: Use Svelte 5 syntax for new components
# ❌ DON'T: Suggest switching to Svelte 4 unless explicitly requested
# ❌ DON'T: Recommend `switchTo4` command during normal development
```

**🎯 INTELLIGENT MODE RESPECT:**

- **When `version = 5`**: Work within Svelte 5 ecosystem, avoid unnecessary version switching
- **When `version = 4`**: Work within Svelte 4 ecosystem, maintain compatibility
- **Only suggest version switching**: When user explicitly requests it or when there's a specific technical requirement

**⚡ TESTING PHILOSOPHY:**

- Test and develop using the **current configured version**
- Avoid suggesting package reinstalls unless necessary
- Focus on making current version work optimally

## 🎯 QUICK REFERENCE: File Naming Conventions

### **📂 Visual Guide for AI Assistants**

```
🔴 LEGACY (Svelte 4) Files - Use Traditional Syntax:
├── LegacyPage.svelte               ← "Svelte4" in filename
├── ComponentSvelte4.svelte          ← "Svelte4" in filename
├── Legacy/
│   ├── Select.svelte                ← "Legacy/" folder
│   └── Button.svelte                ← "Legacy/" folder
└── components/Legacy/
    └── ModernSelect.svelte          ← "Legacy/" folder

🟢 MODERN (Svelte 5) Files - Use Runes Syntax:
├── ModernPage.svelte               ← "Svelte5" in filename
├── ComponentSvelte5.svelte          ← "Svelte5" in filename
├── Svelte5/
│   ├── Select.svelte                ← "Svelte5/" folder
│   └── Button.svelte                ← "Svelte5/" folder
└── components/Svelte5/
    └── ModernSelect.svelte          ← "Svelte5/" folder
```

### **🎯 Syntax Decision Tree**

```
Does filename contain "Svelte4"? ──YES──► Use Svelte 4 syntax
│                                         (let data = [], $: reactive)
NO
│
Does path contain "Legacy/"? ─────YES──► Use Svelte 4 syntax
│                                         (let data = [], $: reactive)
NO
│
Does filename contain "Svelte5"? ──YES──► Use Svelte 5 syntax
│                                         (let data = $state([]), $derived)
NO
│
Does path contain "Svelte5/"? ────YES──► Use Svelte 5 syntax
│                                         (let data = $state([]), $derived)
NO
│
└─► Check project default (version.ini) or ask for clarification
```

## ⚠️ Critical Rules for File Edits

### **1. NEVER Remove or Modify Line Breaks**

❌ **DON'T DO THIS:**

```json
"scripts": {"dev": "vite dev","build": "vite build"}
```

✅ **DO THIS:**

```json
"scripts": {
  "dev": "vite dev",
  "build": "vite build"
}
```

### **2. Preserve Existing Indentation**

❌ **DON'T DO THIS:**

```json
{
  "name": "frontend",
  "scripts": {
    "dev": "vite dev"
  }
}
```

✅ **DO THIS:**

```json
{
  "name": "frontend",
  "scripts": {
    "dev": "vite dev"
  }
}
```

### **3. Maintain Consistent Spacing**

❌ **DON'T DO THIS:**

```json
"dependencies":{
"svelte":"^5.33.18","vite":"^6.3.5"
}
```

✅ **DO THIS:**

```json
"dependencies": {
  "svelte": "^5.33.18",
  "vite": "^6.3.5"
}
```

## 📋 File-Specific Guidelines

### **JSON Files (package.json, tsconfig.json, etc.)**

#### **Formatting Rules:**

- **Indentation**: 2 spaces (never tabs)
- **Trailing commas**: Follow existing pattern
- **Quote style**: Double quotes only
- **Array formatting**: One item per line for readability

#### **Example of Proper JSON Editing:**

```json
{
  "name": "frontend",
  "version": "0.0.2",
  "scripts": {
    "dev": "vite dev",
    "dev:svelte4": "node scripts/version-manager.js switchTo4 && vite dev",
    "dev:svelte5": "node scripts/version-manager.js switchTo5 && vite dev",
    "build": "vite build",
    "build:svelte4": "node scripts/version-manager.js switchTo4 && vite build",
    "build:svelte5": "node scripts/version-manager.js switchTo5 && vite build"
  },
  "devDependencies": {
    "@eslint/js": "^9.28.0",
    "@sveltejs/kit": "^2.21.3",
    "svelte": "^5.33.18",
    "vite": "^6.3.5"
  }
}
```

### **Version-Aware Svelte Files**

#### **Router Files (`+page.svelte`)**

```svelte
<!-- Main router pattern - preserve dynamic import structure -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { detectSvelteVersion } from '$lib/utils/version-detection.js';

  let version: number | null = null;
  let TreeComponent: any = null;
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      version = await detectSvelteVersion();
        if (version === 4) {
        const module = await import('./LegacyPage.svelte');
        TreeComponent = module.default;
      } else {
        const module = await import('./ModernPage.svelte');
        TreeComponent = module.default;
      }
    } catch (err) {
      error = `Failed to load component: ${err}`;
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="loading">
    <div class="spinner"></div>
    <p>Loading Svelte {version || '?'} components...</p>
  </div>
{:else if error}
  <div class="error">
    <h2>⚠️ Component Load Error</h2>
    <p>{error}</p>
  </div>
{:else if TreeComponent}
  <svelte:component this={TreeComponent} />
{:else}
  <div class="error">
    <h2>⚠️ No Component Loaded</h2>
    <p>Unknown error occurred</p>
  </div>
{/if}
```

### **Svelte Files (.svelte)**

#### **Formatting Rules:**

- **Script section**: Standard TypeScript formatting
- **Template section**: HTML-like formatting with proper indentation
- **Style section**: CSS formatting with proper nesting

#### **Example of Proper Svelte Editing:**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let data = $state([]);
  let loading = $state(false);

  onMount(() => {
    loadData();
  });

  function loadData() {
    loading = true;
    // ...existing code...
  }
</script>

<div class="container">
  {#if loading}
    <div class="loading">Loading...</div>
  {:else}
    <div class="content">
      {#each data as item}
        <div class="item">{item.name}</div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .container {
    padding: 1rem;
    background: white;
  }

  .loading {
    text-align: center;
    color: #666;
  }
</style>
```

### **Version Management Scripts**

#### **Node.js Scripts (`scripts/version-manager.js`)**

```javascript
// Follow existing patterns for console output
console.log(`🎯 Current Svelte version: ${version}`);
console.log(`📋 Using template: ${templateFile}`);
console.log(`✅ Success: Switched to Svelte ${version}`);

// Preserve error handling patterns
if (!existsSync(templatePath)) {
  console.error(`❌ Error: Template file not found: ${templatePath}`);
  process.exit(1);
}
```

#### **PowerShell Scripts (`scripts/version-manager.ps1`)**

```powershell
# Preserve PowerShell formatting with proper error handling
try {
    Write-Host "🎯 Switching to Svelte version: $Version" -ForegroundColor Green
    node "version-manager.js" "switchTo$Version"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Success: Version switched successfully" -ForegroundColor Green
    } else {
        Write-Error "❌ Error: Version switch failed"
        exit 1
    }
}
catch {
    Write-Error "❌ Error: $($_.Exception.Message)"
    exit 1
}
```

### **TypeScript/JavaScript Files (.ts, .js)**

#### **Formatting Rules:**

- **Indentation**: 2 spaces
- **Semicolons**: Follow existing pattern
- **Quote style**: Single quotes preferred
- **Function spacing**: Consistent spacing around functions

#### **Example of Proper TS/JS Editing:**

```typescript
export interface SelectItem {
  value: any;
  label: string;
}

export class VersionManager {
  private configPath: string;

  constructor() {
    this.configPath = resolve("version.ini");
  }

  loadConfig(): Config {
    if (!existsSync(this.configPath)) {
      throw new Error(`Configuration file not found: ${this.configPath}`);
    }

    // ...existing code...
    return config;
  }

  switchToVersion(version: string): boolean {
    console.log(`🎯 Switching to version ${version}`);

    // ...existing code...

    return true;
  }
}
```

### **Configuration Files**

#### **INI Files (`version.ini`)**

```ini
# Timeless Jewel Generator Configuration
# DO NOT EDIT unless you understand the impact

[svelte]
version = 5

[packages]
svelte5_package = Svelte5Package.json
svelte4_package = LegacyPackage.json

[options]
auto_install = true
backup_current = false

[components]
loading_strategy = dynamic
fallback_version = 5
```

#### **Vite Configuration (`vite.config.js`)**

```javascript
// Preserve plugin structure for version detection
export default defineConfig({
  plugins: [
    sveltekit(),
    svelteVersionPlugin(), // Custom plugin for version injection
  ],

  // Preserve server configuration
  server: {
    fs: {
      allow: [".."],
    },
  },

  // WebAssembly support
  assetsInclude: ["**/*.wasm"],
});
```

### **Markdown Files (.md)**

#### **Formatting Rules:**

- **Headers**: Consistent spacing after #
- **Lists**: Proper indentation for nested items
- **Code blocks**: Consistent language tags
- **Links**: Proper formatting with descriptive text

#### **Example of Proper Markdown Editing:**

````markdown
# Project Title

## Getting Started

### Prerequisites

Before starting, ensure you have:

- Node.js >= 18.0.0
- pnpm >= 10.0.0
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/example/repo.git
   cd repo
   ```
````

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Start development:**
   ```bash
   pnpm run dev
   ```

## Configuration

The project uses a configuration file `version.ini`:

```ini
[svelte]
version = 5

[options]
auto_install = true
```

For more information, see [Configuration Guide](docs/CONFIG.md).

````

## 🛠️ Tool-Specific Guidelines

### **When Using `replace_string_in_file`**

#### **Include Adequate Context:**
```typescript
// ❌ BAD - Too little context
oldString: '"dev": "vite dev"'
newString: '"dev": "vite dev --host"'

// ✅ GOOD - Adequate context
oldString: `  "scripts": {
    "dev": "vite dev",
    "build": "vite build"`

newString: `  "scripts": {
    "dev": "vite dev --host",
    "build": "vite build"`
````

#### **Preserve Exact Formatting:**

```json
// ❌ BAD - Changes formatting
oldString: `"devDependencies":{
"@eslint/js":"^9.28.0",
"svelte":"^5.33.18"}`

// ✅ GOOD - Preserves formatting
oldString: `  "devDependencies": {
    "@eslint/js": "^9.28.0",
    "svelte": "^5.33.18"`
```

#### **Version-Aware Component Context**

```typescript
// ✅ GOOD - Include version context for component files
oldString: `// ModernPage.svelte - Svelte 5 implementation
<script lang="ts">
  let data = $state([]);
  let loading = $state(false);`;

newString: `// ModernPage.svelte - Svelte 5 implementation  
<script lang="ts">
  let data = $state([]);
  let loading = $state(false);
  let error = $state<string | null>(null);`;
```

### **When Using `insert_edit_into_file`**

#### **Use Comments for Existing Code:**

```typescript
// ✅ GOOD - Uses comments to represent unchanged code
class VersionManager {
  // ...existing code...

  updateFileVisibility() {
    const svelteVersion = this.getSvelteVersion();

    // ...existing code...

    if (svelteVersion === 5) {
      this.hideFiles(["**/*Svelte4*"]);
    }

    // ...existing code...
  }

  // ...existing code...
}
```

#### **Don't Repeat Large Code Blocks:**

```typescript
// ❌ BAD - Repeats entire file
export class VersionManager {
  constructor() { ... }
  loadConfig() { ... }
  // ... 50 lines of existing code ...
  newMethod() { ... }
}

// ✅ GOOD - Uses comments
export class VersionManager {
  // ...existing code...

  newMethod() {
    // New functionality here
  }

  // ...existing code...
}
```

#### **Component-Specific Patterns**

```svelte
<!-- ✅ GOOD - Use appropriate Svelte syntax for target version -->

<!-- For Svelte 5 files (ModernPage.svelte OR Svelte5/*.svelte) -->
<script lang="ts">
  // ...existing code...
  let newFeature = $state(false);

  // ...existing code...
</script>

<!-- For Svelte 4 files (LegacyPage.svelte OR Legacy/*.svelte) -->
<script lang="ts">
  // ...existing code...
  let newFeature = false;

  // ...existing code...
</script>
```

**🔍 QUICK IDENTIFICATION GUIDE:**

- **File path contains `Svelte4`** → Legacy (Svelte 4) syntax
- **File path contains `Svelte5`** → Modern (Svelte 5) syntax
- **File path contains `Legacy/`** → Legacy (Svelte 4) syntax
- **File path contains `Svelte5/`** → Modern (Svelte 5) syntax

## 📝 Common Mistakes to Avoid

### **1. JSON Formatting Errors**

❌ **Common mistakes:**

- Missing commas: `"key1": "value1" "key2": "value2"`
- Trailing commas in arrays: `["item1", "item2",]`
- Single quotes: `{'key': 'value'}`
- Inconsistent indentation

✅ **Correct approach:**

- Always use double quotes
- Proper comma placement
- Consistent 2-space indentation
- No trailing commas in final elements

### **2. Line Break Destruction**

❌ **Don't collapse well-formatted code:**

```json
// Don't turn this:
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build"
  }
}

// Into this:
{"scripts":{"dev":"vite dev","build":"vite build"}}
```

### **3. Indentation Inconsistency**

❌ **Mixed indentation:**

```typescript
class Example {
  method1() {
    // 4 spaces
    return true; // 6 spaces
  }
  method2() {
    // 2 spaces
    return false; // 8 spaces
  }
}
```

✅ **Consistent indentation:**

```typescript
class Example {
  method1() {
    // 2 spaces
    return true; // 2 spaces
  }

  method2() {
    // 2 spaces
    return false; // 2 spaces
  }
}
```

### **4. Version-Specific Syntax Errors**

❌ **Wrong syntax for target version:**

```svelte
<!-- In LegacyPage.svelte - DON'T use Svelte 5 syntax -->
<script>
  let data = $state([]); // ❌ $state is Svelte 5 only
</script>

<!-- In ModernPage.svelte - DON'T use outdated patterns -->
<script>
  import { writable } from 'svelte/store'; // ❌ Use $state instead
  let data = writable([]);
</script>

<!-- In Legacy/ComponentName.svelte - DON'T use Svelte 5 syntax -->
<script>
  let count = $state(0); // ❌ Legacy folder means Svelte 4 only
</script>

<!-- In Svelte5/ComponentName.svelte - DON'T use Svelte 4 patterns -->
<script>
  let count = 0;
  $: doubled = count * 2; // ❌ Use $derived instead
</script>
```

✅ **Correct syntax for each version:**

```svelte
<!-- LegacyPage.svelte OR Legacy/ComponentName.svelte -->
<script>
  let data = [];
  $: loading = false;
  let count = 0;
  $: doubled = count * 2;
</script>

<!-- ModernPage.svelte OR Svelte5/ComponentName.svelte -->
<script>
  let data = $state([]);
  let loading = $state(false);
  let count = $state(0);
  const doubled = $derived(count * 2);
</script>
```

### **5. Package Management Errors**

❌ **Common backup file mistakes:**

- Editing backup files directly
- Deleting safety backups
- Confusing templates with active files

✅ **Correct approach:**

- Use version manager for switching: `node scripts/version-manager.js switchTo5`
- Verify backup integrity before major changes
- Edit active `package.json` only when necessary

## 🎯 Best Practices for AI Assistants

### **1. Always Analyze Before Editing**

- Read the existing file structure
- Identify the formatting patterns
- Match the existing style exactly

### **2. Minimal Changes Only**

- Change only what's necessary
- Preserve surrounding code
- Maintain existing structure

### **3. Validate JSON After Edits**

- Ensure proper syntax
- Check for missing/extra commas
- Verify quote consistency

### **4. Use Appropriate Tools**

- `replace_string_in_file` for targeted changes
- `insert_edit_into_file` for adding new code
- Include proper context for both

### **5. Test Understanding**

- If unsure about formatting, ask for clarification
- Provide examples of proposed changes
- Confirm before making destructive edits

### **6. Understand Project Architecture**

- **Read documentation first**: Check `docs/PROJECT_STRUCTURE.md`
- **Identify file purpose**: Template vs Active vs Backup
- **Verify version context**: Svelte 4 vs Svelte 5 components
- **Check configuration**: Review `version.ini` before edits

### **7. Version-Aware Development**

- **Match syntax to target**: Use appropriate Svelte syntax for version
- **Preserve compatibility**: Don't break existing version support
- **Test understanding**: Ask about version-specific requirements
- **Document context**: Include version info in change descriptions

## 📋 Validation Checklist

Before making any file edit, verify:

- [ ] **Indentation**: Matches existing pattern (2 spaces for JSON/JS/TS)
- [ ] **Line breaks**: Preserved from original
- [ ] **Spacing**: Consistent with surrounding code
- [ ] **Quotes**: Correct style (double for JSON, single for JS/TS)
- [ ] **Syntax**: Valid for file type AND Svelte version
- [ ] **Context**: Adequate surrounding code for replacement
- [ ] **Comments**: Used appropriately for unchanged sections
- [ ] **Version compatibility**: Appropriate syntax for target Svelte version
- [ ] **Backup integrity**: Safety files remain untouched
- [ ] **Configuration impact**: Changes don't break version management

## 🔧 Recovery from Formatting Errors

If formatting gets corrupted:

### **For JSON files:**

```powershell
# Use built-in PowerShell to reformat
Get-Content package.json | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Set-Content package.json
```

### **For version management recovery:**

```powershell
# Restore from backup
cp Svelte5PackageBackup.json package.json

# Or use version manager
node scripts/version-manager.js switchTo5
```

### **For TypeScript/JavaScript:**

```powershell
# Use Prettier if available
pnpm run format
```

### **Manual recovery:**

```powershell
# Restore from backup
Copy-Item Svelte5PackageBackup.json package.json
```

## 🖥️ PowerShell Command Standards

### **🔴 MANDATORY PowerShell Syntax**

This project uses **PowerShell as the EXCLUSIVE command interface**. All terminal commands **MUST** follow PowerShell syntax and best practices.

#### **🚫 CRITICAL: Bash Operators DO NOT WORK in PowerShell**

**❌ THESE COMMANDS WILL FAIL:**

```powershell
# ❌ FATAL ERROR - && operator does not exist in PowerShell
npm install && npm run dev  # WILL FAIL!

# ❌ FATAL ERROR - Bash syntax not supported
cd frontend && pnpm install && pnpm run dev  # WILL FAIL!

# ❌ FATAL ERROR - Pipe operators work differently
ls | grep package  # WILL FAIL!

# ❌ FATAL ERROR - Bash-style redirects
echo "hello" > file.txt  # May work differently or fail!
```

#### **✅ MANDATORY PowerShell Equivalents**

**✅ USE THESE COMMANDS INSTEAD:**

```powershell
# ✅ CORRECT - Use semicolons for command chaining
npm install; npm run dev

# ✅ CORRECT - Use proper PowerShell conditional structure
cd frontend; if ($LASTEXITCODE -eq 0) { pnpm install; if ($LASTEXITCODE -eq 0) { pnpm run dev } }

# ✅ CORRECT - Use PowerShell pipeline syntax
Get-ChildItem | Where-Object { $_.Name -like "*package*" }

# ✅ CORRECT - Use PowerShell output redirection
Write-Output "hello" | Out-File -FilePath "file.txt"
```

### **Command Format Guidelines**

This project uses **PowerShell as the primary command interface** for optimal GitHub Copilot integration. All terminal commands should follow PowerShell syntax and best practices.

#### **Basic PowerShell Command Structure**

```powershell
# Use proper PowerShell cmdlets
Get-ChildItem -Path . -Filter "*.json"

# Use Write-Host for colored output
Write-Host "✅ Operation completed successfully!" -ForegroundColor Green

# Use proper parameter syntax with hyphens
Set-Location -Path "frontend"

# Chain commands with semicolons (NEVER use &&)
Write-Host "Starting process..." -ForegroundColor Yellow; Start-Process "notepad.exe"
```

#### **🔴 CRITICAL: Command Chaining Rules**

**✅ CORRECT PowerShell Terminal Command Chaining:**

```powershell
# Use semicolons for sequential execution in terminal
command1; command2; command3

# Use conditional execution with if statements in terminal
pnpm install; if ($LASTEXITCODE -eq 0) { pnpm run dev }

# Use try-catch for error handling in terminal
try { pnpm install; pnpm run dev } catch { Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red }
```

**❌ FORBIDDEN - Only in PowerShell Terminal Context:**

```bash
# ❌ NEVER USE in terminal commands - Does not exist in PowerShell
command1 && command2  # WILL FAIL in PowerShell terminal!

# ❌ NEVER USE in terminal commands - Does not exist in PowerShell
command1 || command2  # WILL FAIL in PowerShell terminal!

# ❌ NEVER USE in terminal commands - Does not exist in PowerShell
command1 |& command2  # WILL FAIL in PowerShell terminal!
```

**✅ PERFECTLY FINE - In Programming Language Files:**

```typescript
// ✅ && is normal TypeScript/JavaScript syntax
if (isValid && hasPermission) {
  const result = process() && validate();
}

// ✅ Logical AND operator in conditional expressions
const shouldProceed = userInput && config.enabled && !isBlocked;
```

```json
{
  "scripts": {
    "build": "tsc && webpack",
    "deploy": "npm run build && npm run upload"
  }
}
```

#### **Project-Specific PowerShell Patterns**

**✅ Preferred PowerShell Commands:**

```powershell
# Directory navigation (cd is PowerShell alias for Set-Location)
cd frontend
Set-Location ..

# File operations
Copy-Item source.json destination.json
Remove-Item file.json -Force
Test-Path "package.json"

# Package management (with proper error checking)
pnpm install; if ($LASTEXITCODE -eq 0) { Write-Host "✅ Install successful" -ForegroundColor Green }
pnpm run dev
pnpm run build

# Version management
node scripts/version-manager.js status
.\scripts\version-manager.ps1 -Version 5

# Development server with status
Write-Host "🚀 Starting development server..." -ForegroundColor Green; pnpm run dev

# Status checks
Write-Host "📊 Checking current configuration..." -ForegroundColor Cyan; Get-ChildItem -Name "*Package*.json"
```

**❌ ABSOLUTELY FORBIDDEN - Only in PowerShell Terminal:**

```bash
# ❌ DO NOT USE in terminal commands - These will cause failures!
cd frontend && pnpm install  # && does not exist in PowerShell terminal!
npm install && npm run dev   # && does not exist in PowerShell terminal!
ls -la                       # Use Get-ChildItem instead in terminal
cp source.json dest.json     # Use Copy-Item instead in terminal
rm file.json                 # Use Remove-Item instead in terminal
echo "message"               # Use Write-Host or Write-Output instead in terminal
```

**✅ PERFECTLY FINE - In Code Files:**

```typescript
// ✅ && is standard TypeScript/JavaScript syntax
const isReady = hasData && isLoaded && !isProcessing;

if (user && user.permissions && user.permissions.canEdit) {
  // Normal conditional logic
}

// ✅ Short-circuit evaluation
const result = input && processInput(input);
```

```bash
#!/bin/bash
# ✅ && works fine in bash script files
npm install && npm run build && npm run deploy
```

```json
{
  "scripts": {
    "ci": "npm install && npm test && npm run build"
  }
}
```

#### **Error Handling in PowerShell Commands**

```powershell
# Use try-catch for robust error handling
try {
    pnpm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check exit codes
node scripts/version-manager.js switchTo5
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Version switch successful" -ForegroundColor Green
} else {
    Write-Host "❌ Version switch failed" -ForegroundColor Red
}

# Use Test-Path for file checks
if (Test-Path "package.json") {
    Write-Host "✅ Package.json found" -ForegroundColor Green
} else {
    Write-Host "❌ Package.json missing" -ForegroundColor Red
}
```

#### **Colored Output Standards**

```powershell
# Status messages
Write-Host "🚀 Starting..." -ForegroundColor Green
Write-Host "⚠️  Warning message" -ForegroundColor Yellow
Write-Host "❌ Error occurred" -ForegroundColor Red
Write-Host "📊 Information" -ForegroundColor Cyan
Write-Host "🎯 Target achieved" -ForegroundColor Blue
Write-Host "💡 Tip or suggestion" -ForegroundColor Magenta

# Progress indicators
Write-Host "🔄 Processing..." -ForegroundColor Yellow
Write-Host "✅ Completed successfully!" -ForegroundColor Green
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
Write-Host "🔍 Validating configuration..." -ForegroundColor Cyan
```

#### **Multi-Step Command Patterns**

```powershell
# Sequential operations with status updates
Write-Host "🔄 Switching to Svelte 5..." -ForegroundColor Yellow
node scripts/version-manager.js switchTo5

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Version switched successfully!" -ForegroundColor Green
    Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
    pnpm install

    if ($LASTEXITCODE -eq 0) {
        Write-Host "🚀 Starting development server..." -ForegroundColor Green
        pnpm run dev
    } else {
        Write-Host "❌ Dependency installation failed!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Version switch failed!" -ForegroundColor Red
}
```

#### **File Management Commands**

```powershell
# Configuration file operations
Write-Host "📝 Updating configuration..." -ForegroundColor Yellow
$config = Get-Content "version.ini"
$config -replace "version = 4", "version = 5" | Set-Content "version.ini"
Write-Host "✅ Configuration updated" -ForegroundColor Green

# Backup operations
Write-Host "🛡️ Creating backup..." -ForegroundColor Blue
Copy-Item "package.json" "package.json.backup"
Write-Host "✅ Backup created" -ForegroundColor Green

# Validation commands
Write-Host "🔍 Validating project structure..." -ForegroundColor Cyan
@('docs', 'frontend', 'frontend/src', 'frontend/scripts') | ForEach-Object {
    if (Test-Path $_) {
        Write-Host "  ✅ $_" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $_" -ForegroundColor Red
    }
}
```

#### **Development Workflow Commands**

```powershell
# Complete development setup
Write-Host "🎯 Setting up development environment..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Check configuration
Write-Host "1️⃣ Checking version configuration..." -ForegroundColor Yellow
node scripts/version-manager.js status

# Step 2: Install dependencies
Write-Host "2️⃣ Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Step 3: Start development
Write-Host "3️⃣ Starting development server..." -ForegroundColor Yellow
Write-Host "🌐 Open http://localhost:5173 in your browser" -ForegroundColor Green
pnpm run dev
```

#### **Debugging and Diagnostics**

```powershell
# System diagnostics
Write-Host "🔍 System Diagnostics:" -ForegroundColor Cyan
Write-Host "PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor Gray
Write-Host "VS Code Integration: $env:TERM_PROGRAM" -ForegroundColor Gray
Write-Host "Current Directory: $(Get-Location)" -ForegroundColor Gray

# Project diagnostics
Write-Host "🔍 Project Diagnostics:" -ForegroundColor Cyan
Write-Host "Node Version: $(node --version)" -ForegroundColor Gray
Write-Host "pnpm Version: $(pnpm --version)" -ForegroundColor Gray
Write-Host "Active Svelte Version: $(node -e "console.log(require('./package.json').devDependencies.svelte || 'Not found')")" -ForegroundColor Gray
```

### **GitHub Copilot Integration Commands**

```powershell
# Test Copilot integration
Write-Host "🤖 Testing GitHub Copilot integration..." -ForegroundColor Cyan
.\test-copilot-integration.ps1

# Manual completion signal (if needed)
Write-Host "Command completed" -ForegroundColor Green
done

# Profile reload
Write-Host "🔄 Reloading PowerShell profile..." -ForegroundColor Yellow
. $PROFILE
Write-Host "✅ Profile reloaded" -ForegroundColor Green
```

## 🎉 Summary

Following these guidelines ensures:

✅ **Clean, readable code**  
✅ **Consistent formatting**  
✅ **Preserved functionality**  
✅ **Professional appearance**  
✅ **Easy maintenance**  
✅ **Reduced conflicts**  
✅ **Version compatibility**  
✅ **Backup integrity**  
✅ **Architecture preservation**  
✅ **PowerShell-only command execution (MANDATORY)**  
✅ **No bash syntax failures**

### **🔴 CRITICAL REMINDERS:**

1. **NEVER use `&&` or `||` operators in terminal commands** - They don't exist in PowerShell
2. **ALWAYS use semicolons (`;`) for command chaining in terminal**
3. **USE PowerShell aliases (`cd`, `ls`) or full cmdlets (`Set-Location`, `Get-ChildItem`) in terminal**
4. **`&&` is PERFECTLY FINE in TypeScript, JavaScript, and other code files**
5. **`&&` works in package.json scripts** - npm handles cross-platform execution
6. **VERIFY version context** before editing version-specific files
7. **PRESERVE backup file integrity** at all costs

Remember: **When in doubt, preserve the existing format, verify the version context, and use PowerShell syntax for terminal commands only!**

---

_This document should be referenced before making any file edits to ensure consistency and quality. For project structure details, see [📁 Project Structure](PROJECT_STRUCTURE.md)._
