# timeless-jewels [![push](https://github.com/BlazesRus/timeless-jewels/actions/workflows/push.yml/badge.svg)](https://github.com/BlazesRus/timeless-jewels/actions/workflows/push.yaml) ![GitHub go.mod Go version](https://img.shields.io/github/go-mod/go-version/vilsol/timeless-jewels) ![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/vilsol/timeless-jewels) [![GitHub license](https://img.shields.io/github/license/Vilsol/timeless-jewels)](https://github.com/BlazesRus/timeless-jewels/blob/master/LICENSE)

# timeless-jewels [![push](https://github.com/BlazesRus/timeless-jewels/actions/workflows/push.yml/badge.svg)](https://github.com/BlazesRus/timeless-jewels/actions/workflows/push.yaml) ![GitHub go.mod Go version](https://img.shields.io/github/go-mod/go-version/vilsol/timeless-jewels) ![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/vilsol/timeless-jewels) [![GitHub license](https://img.shields.io/github/license/Vilsol/timeless-jewels)](https://github.com/BlazesRus/timeless-jewels/blob/master/LICENSE)

## 📄 License Exceptions

This project uses a multi-license structure. Most files are licensed under GPL-3.0-only, but many components and scripts are available under more permissive licenses (MIT, MIT-0, BSD-3-Clause). For a detailed list of exceptions and the exact license for each directory or file, see [LICENSE-EXCEPTIONS.md](./LICENSE-EXCEPTIONS.md).

**Always check LICENSE-EXCEPTIONS.md before reusing or redistributing any part of this project.**

A simple timeless jewel calculator with a skill tree view by Vilsol
with some modifications for better trade search functionality

- choose specific conqueror or select any conqueror if you don't care about keystone passive
- trade search gets split into multiple links with 200 seeds per link (max poe trade site can handle)
- fixed bug with duplicate filter groups in trade link

Original Hosted Version: [https://vilsol.github.io/timeless-jewels](https://vilsol.github.io/timeless-jewels)

Hosted Timeless Jewel Searcher:[https://blazesrus.github.io/timeless-jewels/tree]https://blazesrus.github.io/timeless-jewels/tree

Modified version: https://BlazesRus.github.io/timeless-jewels

Official Branch(Github):[https://github.com/vilsol/timeless-jewels](https://github.com/vilsol/timeless-jewels)

Source of ImHamba Branch(Github):[https://github.com/ImHamba/timeless-jewels](https://github.com/ImHamba/timeless-jewels)

Uses data extracted with https://github.com/Vilsol/go-pob-data

## ✅ Project Status: Dual-Mode Configuration Complete

This project has been successfully consolidated and modernized with robust dual-mode support:

- **🔄 Dual-Mode Frontend**: Seamless switching between Svelte 4 (Legacy) and Svelte 5 (Modern)
- **🛠️ Modern Tooling**: Tailwind CSS v4+, TypeScript 5.8+, Vite 6+, pnpm v10+
- **⚙️ Dynamic Configuration**: Environment-aware dependency management
- **🧪 Comprehensive Testing**: Automated validation for both modes
- **📚 Complete Documentation**: Detailed guides and status reports

### Quick Start
```powershell
# Modern Mode (Svelte 5) - Default
cd frontend && pnpm run dev:modern

# Legacy Mode (Svelte 4) 
cd frontend && pnpm run dev:legacy

# Test both modes
cd frontend && ./test-dual-mode.ps1 -Mode both
```

## 📁 Project Structure

```
timeless-jewels_Partial/
├── 📄 README.md                    # Main project documentation
├── 📄 go.mod, go.sum              # Go module dependencies
├── 📄 LICENSE                     # Project license
│
├── 📁 docs/                       # 📚 Comprehensive documentation
│   ├── 📋 INDEX.md               # Documentation index and navigation
│   ├── 🏗️ BUILD_FIXES_COMPLETE.md # Build system with dual Svelte support
│   ├── 🔄 VERSION_AWARE_SYSTEM.md # Version-aware architecture
│   ├── 🚀 QUICK_START_VERSION_AWARE.md # Quick start guide
│   ├── 📦 PNPM_V10_MIGRATION.md  # Package manager migration
│   ├── 🎯 SVELTE_5_MIGRATION_PREP.md # Framework upgrade guide
│   ├── 🔧 COMLINK_MODERNIZATION.md # Web Worker modernization
│   ├── 🎨 SELECT_COMPONENT_FIX.md # Component updates
│   └── 🤖 COPILOT_*.md           # AI development tools integration
│
├── 📁 frontend/                   # 💻 Dual-Mode Svelte Frontend (4 & 5)
│   ├── 📦 package.json           # Main package with dual-mode scripts
│   ├── � pnpmfile.cjs           # Dynamic dependency hook system  
│   ├── � tsconfig.json          # Root TypeScript configuration
│   ├── � tsconfig.Modern.json   # Svelte 5 TypeScript config
│   ├── � tsconfig.Legacy.json   # Svelte 4 TypeScript config
│   ├── 🎨 tailwind.config.js     # Tailwind v4+ ESM configuration
│   ├── 🎨 tailwind.config.cjs    # Tailwind v4+ CJS configuration  
│   ├── ⚡ postcss.config.cjs     # PostCSS for Tailwind v4+
│   ├── 🔧 vite.config.js         # Vite build configuration
│   ├── 🧪 test-dual-mode.ps1     # Comprehensive dual-mode testing
│   ├── 📊 project-status.ps1     # Project status and config report
│   ├── 📁 .config-deps/          # Local configuration packages
│   │   ├── timeless-jewels-legacy-config/  # Svelte 4 config package
│   │   └── timeless-jewels-modern-config/  # Svelte 5 config package
│   │
│   ├── 📁 scripts/               # Build and version management
│   │   ├── version-manager.js    # Node.js version manager
│   │   └── version-manager.ps1   # PowerShell wrapper
│   │
│   ├── 📁 src/                   # Source code
│   │   ├── 🏠 app.html           # HTML template
│   │   ├── 🎨 app.scss           # Global styles
│   │   ├── 🔧 wasm_exec.js       # WebAssembly support
│   │   │
│   │   ├── 📁 lib/               # Shared libraries
│   │   │   ├── 🔄 skill_tree.ts  # Skill tree logic
│   │   │   ├── 👷 *worker*.ts    # Web Workers with Comlink
│   │   │   ├── 📁 components/    # Svelte components
│   │   │   │   ├── ModernSelect.svelte # Modern select component
│   │   │   │   └── SearchResult.svelte # Search result display
│   │   │   ├── 📁 types/         # TypeScript type definitions
│   │   │   └── 📁 utils/         # Utility functions
│   │   │       ├── version-detection.ts # Runtime version detection
│   │   │       ├── version-config.ts    # Version configuration
│   │   │       └── vite-svelte-version-plugin.ts # Build-time plugin
│   │   │
│   │   └── 📁 routes/            # SvelteKit routes
│   │       ├── +layout.svelte    # Layout component
│   │       ├── +page.svelte      # Home page
│   │       └── 📁 tree/          # Tree page with version-aware loading
│   │           ├── +page.svelte  # Main router with dynamic imports
│   │           ├── LegacyPage.svelte    # Svelte 4 implementation
│   │           └── ModernPage.svelte    # Svelte 5 implementation
│   │
│   ├── 📁 static/                # Static assets
│   │   ├── calculator.wasm       # Go WebAssembly calculator
│   │   ├── favicon.png           # Site icon
│   │   └── *.png                 # Additional images
│   │
│   └── 📁 docs/                  # Frontend-specific documentation
│       ├── BACKUP_FILE_STRUCTURE.md   # Backup system guide
│       ├── INI_DEPENDENCY_SYSTEM_COMPLETE.md # INI system docs
│       └── BACKUP_QUICK_REFERENCE.md  # Emergency recovery guide
│
├── 📁 calculator/                # ⚙️ Go WebAssembly calculator
│   ├── main.go                   # Calculator entry point
│   └── tree_manager.go           # Tree management logic
│
├── 📁 data/                      # 📊 Path of Exile game data
│   ├── *.json.gz                 # Compressed game data files
│   ├── main.go                   # Data processing entry point
│   ├── manager.go                # Data management
│   ├── jewels.go                 # Jewel-specific logic
│   └── types.go                  # Data type definitions
│
├── 📁 wasm/                      # 🌐 WebAssembly build targets
│   ├── main.go                   # WASM main entry
│   └── 📁 exposition/            # Exposition/export functionality
│       └── main.go
│
└── 📁 random/                    # 🎲 Random utilities
    └── main.go                   # Random number generation
```

### 🗂️ Key Directory Functions:

| Directory     | Purpose                        | Technology                   |
| ------------- | ------------------------------ | ---------------------------- |
| `docs/`       | 📚 Comprehensive documentation | Markdown                     |
| `frontend/`   | 💻 Web application             | Svelte 4/5, TypeScript, Vite |
| `calculator/` | ⚙️ Core calculations           | Go → WebAssembly             |
| `data/`       | 📊 Game data processing        | Go, JSON                     |
| `wasm/`       | 🌐 WebAssembly builds          | Go                           |

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

- **[📋 Documentation Index](docs/INDEX.md)** - Complete documentation overview
- **[📁 Project Structure](docs/PROJECT_STRUCTURE.md)** - Detailed technical structure guide
- **[🚀 Quick Start Guide](docs/QUICK_START_VERSION_AWARE.md)** - Get started quickly
- **[🏗️ Build System Guide](docs/BUILD_FIXES_COMPLETE.md)** - Build system and fixes
- **[🔄 Version Management](docs/VERSION_AWARE_SYSTEM.md)** - Dual Svelte 4/5 support

### Key Documentation:

- **System Architecture**: [Version-Aware System](docs/VERSION_AWARE_SYSTEM.md)
- **Migration Guides**: [pnpm v10](docs/PNPM_V10_MIGRATION.md), [Svelte 5 Prep](docs/SVELTE_5_MIGRATION_PREP.md)
- **Component Updates**: [Select Components](docs/SELECT_COMPONENT_FIX.md), [Modern Workers](docs/COMLINK_MODERNIZATION.md)
- **Development Tools**: [Copilot Integration](docs/COPILOT_INTEGRATION_SUCCESS.md)
- **AI Assistant Guides**: [Formatting Guidelines](docs/AI_FORMATTING_GUIDELINES.md), [Context Guide](docs/AI_ASSISTANT_CONTEXT_GUIDE.md)

## Updates to new leagues

Whenever a new league is coming, the passive tree might get updated.
**But** it is not guaranteed to contain correct data until a game download is available.

Specifically, this project depends on the following data tables:

- Alternate Passive Additions
- Alternate Passive Skills
- Passive Skills
- Stats
- Translations

---------------------------------Local testing instruction------------------------
Update golangci-lint via running in console:
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

run command:
golangci-lint config verify
golangci-lint run ./... --default=none -E errcheck

## Frontend Development

This project uses **pnpm v10** for package management and features a **version-aware Svelte system** with comprehensive backup protection.

### 📋 System Overview

- **Default**: Svelte 5 with modern runes syntax
- **Fallback**: Svelte 4 compatibility maintained
- **Safety**: Multiple backup files protect against corruption
- **Switching**: INI-based dependency management

### 🛡️ Backup Protection

The system includes multiple safety layers:

- `Svelte5PackageBackup.json` - Emergency Svelte 5 restore
- `LegacyPackageBackup.json` - Emergency Svelte 4 restore
- See `frontend/BACKUP_FILE_STRUCTURE.md` for recovery procedures

```powershell
# Install or update to pnpm v10
pnpm self-update

# Or via npm
npm install -g pnpm@10
```

### First-time Setup

```powershell
cd frontend

# Install dependencies
pnpm install

# For migration from older pnpm versions, you may need to:
# 1. Remove old lockfile: Remove-Item pnpm-lock.yaml
# 2. Remove node_modules: Remove-Item node_modules -Recurse -Force
# 3. Fresh install: pnpm install
```

### Development Commands

```powershell
# After using cd frontend:
pnpm install
pnpm run format
pnpm run lint
pnpm run check
pnpm run prepare
pnpm run build

# Development server (uses default Svelte 5)
pnpm run dev

```

### 🔧 Emergency Recovery

```powershell
# If package.json gets corrupted:
cp Svelte5PackageBackup.json package.json  # Restore Svelte 5
cp LegacyPackageBackup.json package.json   # Restore Svelte 4
pnpm install  # Reinstall dependencies
```

### pnpm v10 Migration Notes

- See `PNPM_V10_MIGRATION.md` for detailed migration information
- Lifecycle scripts are now more secure (only specified dependencies can run build scripts)
- Test arguments no longer require `--` prefix: `pnpm test --watch` instead of `pnpm test -- --watch`

## Offline Builds

Electron will package your static site into `frontend/OfflineBuild/`.  
By default you get a Windows portable EXE, but you can also target macOS and Linux.

### Offline Build Folder layout
frontend/OfflineBuild/
├─ TimelessJewelGenerator.exe           ← Windows portable EXE (electron-builder)
├─ TimelessJewelGenerator Setup.exe     ← Windows NSIS installer (if enabled)
├─ mac/
│   ├─ TimelessJewelGenerator.dmg        ← macOS DMG
│   └─ TimelessJewelGenerator.zip        ← macOS ZIP
├─ linux/
│   ├─ TimelessJewelGenerator.AppImage   ← Linux AppImage
│   └─ TimelessJewelGenerator.deb        ← Linux DEB
└─ win-unpacked/
    └─ Timeless Jewels.exe               ← electron-packager output

## Electron offline‐build commands (package.json)

pnpm run electron:serve Rebuilds the site and launches it in Electron (dev mode)
pnpm run offline:win Generates a signed Windows portable EXE
pnpm run offline:mac Generates macOS .dmg and .zip
pnpm run offline:linux Generates Linux .AppImage and .deb
pnpm run offline:all Builds for all three platforms at once
pnpm run packOfflineBuild for Electron packaged exe without code signing