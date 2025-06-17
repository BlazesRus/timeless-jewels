# AI Assistant Context Guide

## 🎯 Quick Project Understanding

This guide helps AI assistants quickly understand the Timeless Jewel Generator's unique architecture and provide better assistance.

## 🏗️ Architecture Overview

### **Project Type**
- **Frontend**: SvelteKit web application with TypeScript
- **Backend**: Go WebAssembly for high-performance calculations
- **Target**: Path of Exile game tool for timeless jewel analysis

### **Unique Features**
- **Dual Svelte Support**: Runs on both Svelte 4 (legacy) and Svelte 5 (modern)
- **Version-Aware Components**: Dynamically loads appropriate implementation
- **INI-Based Management**: Simple configuration controls complex version switching
- **WebAssembly Integration**: Go code compiled for browser execution

## 📁 Key File Patterns

### **Package Management**
```
frontend/
├── package.json                 # 🎯 ACTIVE (current version)
├── version.ini                  # ⚙️ CONFIGURATION
├── Svelte5Package.json         # 📋 Template for Svelte 5
├── LegacyPackage.json          # 📋 Template for Svelte 4
├── Svelte5PackageBackup.json   # 🛡️ SAFETY BACKUP
└── LegacyPackageBackup.json    # 🛡️ SAFETY BACKUP
```

**CRITICAL**: Only edit `package.json` directly. Never touch backup files.

### **Version-Aware Components**
```
src/routes/tree/
├── +page.svelte              # 🔄 Router (detects version, loads component)
├── Svelte4Page.svelte        # 📱 Svelte 4 implementation
└── Svelte5Page.svelte        # 🚀 Svelte 5 implementation
```

**Pattern**: Main router detects Svelte version and dynamically imports appropriate component.

### **File Naming Convention System**
**🔴 CRITICAL**: File names and folders indicate required syntax:

| Pattern | Version | Syntax Required |
|---------|---------|----------------|
| `*Svelte4.svelte` | **Legacy (Svelte 4)** | Traditional Svelte syntax |
| `*Svelte5.svelte` | **Modern (Svelte 5)** | Runes syntax ($state, $derived) |
| `Legacy/*.svelte` | **Legacy (Svelte 4)** | Traditional Svelte syntax |
| `Svelte5/*.svelte` | **Modern (Svelte 5)** | Runes syntax ($state, $derived) |

**Examples:**
- `Svelte4Page.svelte` → `let data = []`, `$: reactive = data.length`
- `Svelte5Page.svelte` → `let data = $state([])`, `const reactive = $derived(data.length)`
- `components/Legacy/Select.svelte` → Traditional syntax only
- `components/Svelte5/Select.svelte` → Modern runes syntax only

### **Version Detection System**
```
src/lib/utils/
├── version-detection.ts      # Runtime version detection
├── version-config.ts         # Configuration management
└── vite-svelte-version-plugin.ts # Build-time version injection
```

## 🔧 Common Tasks

### **Adding New Components**

#### **For Cross-Version Components**
```svelte
<!-- src/lib/components/NewComponent.svelte -->
<script lang="ts">
  import { detectSvelteVersion } from '$lib/utils/version-detection.js';
  
  // Use compatible syntax that works in both versions
  export let data: any[] = [];
  
  let version: number | null = null;
  let modernFeatures = false;
  
  // Detect version and enable features accordingly
  detectSvelteVersion().then(v => {
    version = v;
    modernFeatures = v >= 5;
  });
</script>

{#if modernFeatures}
  <!-- Svelte 5 enhanced features -->
  <div class="modern-layout">
    <!-- Enhanced UI -->
  </div>
{:else}
  <!-- Svelte 4 compatible layout -->
  <div class="legacy-layout">
    <!-- Basic UI -->
  </div>
{/if}
```

#### **For Version-Specific Components**
Create two implementations following the naming convention:
- `ComponentNameSvelte4.svelte` - Using traditional Svelte syntax (Legacy)
- `ComponentNameSvelte5.svelte` - Using modern runes syntax (Modern)

**OR** organize in folders:
- `Legacy/ComponentName.svelte` - Using traditional Svelte syntax
- `Svelte5/ComponentName.svelte` - Using modern runes syntax

**🚨 NEVER mix syntaxes** - file name/folder determines required syntax!

### **Updating Package Dependencies**

#### **Method 1: Using Version Manager (Recommended)**
```bash
# Switch to specific version
node scripts/version-manager.js switchTo5

# Verify switch
node scripts/version-manager.js status

# Install dependencies
pnpm install
```

#### **Method 2: Direct Edit (Advanced)**
Only edit `package.json` directly. Templates and backups update automatically.

### **Adding Build Scripts**
```json
{
  "scripts": {
    "dev": "vite dev",
    "dev:svelte4": "node scripts/version-manager.js switchTo4 && vite dev",
    "dev:svelte5": "node scripts/version-manager.js switchTo5 && vite dev",
    "build": "vite build",
    "build:svelte4": "node scripts/version-manager.js switchTo4 && vite build",
    "build:svelte5": "node scripts/version-manager.js switchTo5 && vite build"
  }
}
```

## 🚨 Critical Warnings

### **NEVER Do These**
- ❌ Edit `*Backup.json` files
- ❌ Delete backup files
- ❌ Mix Svelte 5 syntax in `*Svelte4.svelte` files
- ❌ Mix Svelte 5 syntax in `Legacy/` folder files
- ❌ Use deprecated patterns in `*Svelte5.svelte` files
- ❌ Use deprecated patterns in `Svelte5/` folder files
- ❌ Modify `version.ini` without understanding impact

### **ALWAYS Do These**
- ✅ Check `version.ini` to understand current configuration
- ✅ Verify which version is active before editing components
- ✅ Use appropriate syntax for target Svelte version based on file name/folder
- ✅ Test both version paths when possible
- ✅ Preserve backup file integrity

## 🧭 Syntax Reference

### **Svelte 4 Patterns** (Use in `*Svelte4.svelte` files)
```svelte
<script lang="ts">
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';
  
  // State management
  let data: any[] = [];
  let loading = false;
  
  // Reactive statements
  $: filteredData = data.filter(item => item.visible);
  
  // Stores
  const userSettings = writable({});
  
  onMount(() => {
    loadData();
  });
  
  function loadData() {
    loading = true;
    // Load logic
    loading = false;
  }
</script>
```

### **Svelte 5 Patterns** (Use in `*Svelte5.svelte` files)
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  
  // Modern runes syntax
  let data = $state<any[]>([]);
  let loading = $state(false);
  
  // Derived state
  const filteredData = $derived(data.filter(item => item.visible));
  
  // Effects
  $effect(() => {
    console.log('Data changed:', data.length);
  });
  
  onMount(() => {
    loadData();
  });
  
  function loadData() {
    loading = true;
    // Load logic
    loading = false;
  }
</script>
```

## 📊 Project Context

### **Business Logic**
- **Purpose**: Analyze Path of Exile timeless jewels
- **Users**: Path of Exile players optimizing character builds
- **Data**: Game skill tree, passive skills, jewel modifications

### **Technical Context**
- **Performance**: WebAssembly for heavy calculations
- **Compatibility**: Supports old and new Svelte versions
- **Build System**: Vite with custom plugins
- **Package Manager**: pnpm v10

### **Development Priorities**
1. **Stability**: Never break existing functionality
2. **Compatibility**: Support both Svelte versions seamlessly  
3. **Performance**: Maintain fast calculations via WebAssembly
4. **User Experience**: Smooth version switching without user impact

## 🔍 Debugging Common Issues

### **"Component not loading"**
- Check `version.ini` configuration
- Verify appropriate component file exists
- Ensure dynamic import path is correct

### **"Syntax error in Svelte file"**
- Check if using correct syntax for Svelte version
- Verify file name indicates correct version: `*Svelte4.svelte` vs `*Svelte5.svelte`
- Check folder structure: `Legacy/` vs `Svelte5/`
- Ensure syntax matches file naming convention

### **"Package.json corruption"**
- Use backup: `cp Svelte5PackageBackup.json package.json`
- Or version manager: `node scripts/version-manager.js switchTo5`

### **"Build fails after dependency change"**
- Check if change is compatible with both Svelte versions
- Test both version builds: `pnpm run build:svelte4` and `pnpm run build:svelte5`

## 📚 Key Documentation

When helping with this project, reference:

1. **[📁 PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Complete technical overview
2. **[🔄 VERSION_AWARE_SYSTEM.md](VERSION_AWARE_SYSTEM.md)** - Architecture details
3. **[🎨 AI_FORMATTING_GUIDELINES.md](AI_FORMATTING_GUIDELINES.md)** - Formatting rules
4. **[📋 INDEX.md](INDEX.md)** - Documentation navigation

---

*This guide provides essential context for AI assistants. For complete project details, see the full documentation suite.*
