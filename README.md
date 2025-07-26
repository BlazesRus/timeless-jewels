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

### Quick Start
```powershell
# Modern Mode (Svelte 5) - Default
cd frontend && pnpm run dev
```

## 📁 Project Structure

```
timeless-jewels_Partial/
├── 📄 README.md                    # Main project documentation
├── 📄 go.mod, go.sum              # Go module dependencies
├── 📄 LICENSE                     # Project license
├── 📄 LICENSE-EXCEPTIONS.md       # License exceptions documentation
├── 📄 timeless-jewels.code-workspace # VS Code workspace configuration
│
├── 📁 .github/                    # 🤖 GitHub configuration
│   └── copilot-instructions.md   # GitHub Copilot development guidelines
│
├── 📁 docs/                       # 📚 Comprehensive documentation
│   ├── 📋 INDEX.md               # Documentation index and navigation
│   ├── 🏗️ BUILD_FIXES_COMPLETE.md # Build system with dual Svelte support
│   ├── 🚀 QUICK_START_VERSION_AWARE.md # Quick start guide
│   ├── 📦 PNPM_V10_MIGRATION.md  # Package manager migration
│   ├── 🎯 SVELTE_5_MIGRATION_PREP.md # Framework upgrade guide
│   ├── 🔧 COMLINK_MODERNIZATION.md # Web Worker modernization
│   ├── 🎨 SELECT_COMPONENT_FIX.md # Component updates
|   ├── 📄 PWA-IMPLEMENTATION.md       # Progressive Web App implementation guide
│   └── 🤖 COPILOT_*.md           # AI development tools integration
│
├── 📁 frontend/                   # 💻 Svelte 5 Frontend
│   ├── 📦 package.json           # Main package configuration
│   ├── 🔧 pnpmfile.cjs           # Dynamic dependency hook system  
│   ├── 📄 tsconfig.json          # Root TypeScript configuration
│   ├── 📄 tsconfig.Modern.json   # Svelte 5 TypeScript config
│   ├── 📄 tsconfig.electron.json # Electron TypeScript config
│   ├── 🎨 tailwind.config.js     # Tailwind CSS configuration
│   ├── ⚡ postcss.config.cjs     # PostCSS for Tailwind
│   ├── 🔧 vite.config.ts         # Vite build configuration
│   ├── 🔧 svelte.config.ts       # Svelte configuration
│   ├── 🧪 vitest.config.ts       # Vitest testing configuration
│   ├── 📁 .config-deps/          # Local configuration packages
│   │   └── timeless-jewels-modern-config/  # Svelte 5 config package
│   │
│   ├── 📁 scripts/               # Build and automation scripts
│   │   ├── build-wasm.ps1        # WebAssembly build script
│   │   └── version-manager.js    # Version management utility
│   │
│   ├── 📁 tests/                 # Test configuration and utilities
│   │   └── scripts/              # Test automation scripts
│   │
│   ├── 📁 src/                   # Source code
│   │   ├── 🏠 app.html           # HTML template
│   │   ├── 🎨 app.css            # Global styles
│   │   ├── 🔧 hooks.client.ts    # SvelteKit client hooks
│   │   │
│   │   ├── 📁 lib/               # Shared libraries
│   │   │   ├── 🔄 skill_tree_modern.ts    # Skill tree logic
│   │   │   ├── 👷 *worker*.ts             # Web Workers with Comlink
│   │   │   ├── 📁 components/             # Svelte components
│   │   │   ├── 📁 services/               # Data services
│   │   │   │   └── wasiDataService.svelte.ts # WASI data service
│   │   │   ├── 📁 ModernWasm/             # Modern WebAssembly utilities
│   │   │   │   └── enhanced-wasi-loader.ts # Enhanced WASI loader
│   │   │   ├── 📁 types/                  # TypeScript type definitions
│   │   │   ├── 📁 utils/                  # Utility functions
│   │   │   │   └── cross-origin-check.ts  # Cross-origin isolation check
│   │   │   └── 📁 workers/                # Web Worker implementations
│   │   │
│   │   ├── 📁 routes-modern/              # SvelteKit routes
│   │   │   ├── +layout.svelte             # Layout component
│   │   │   ├── +page.svelte               # Home page
│   │   │   ├── 📁 about/                  # About page
│   │   │   ├── 📁 tree/                   # Tree page
│   │   │   └── 📁 test/                   # Test/debug page
│   │   │       └── +page.svelte           # Cross-origin & PWA testing
│   │   │
│   │   └── 📁 styles/            # Style definitions
│   │
│   ├── 📁 src-electron/          # Electron TypeScript code
│   ├── 📁 dist-electron/         # Electron compiled JavaScript
│   ├── 📁 build/                 # Built application output
│   │   ├── calculator.wasm       # WebAssembly calculator
│   │   └── _app/                 # SvelteKit application assets
│   │
│   └── 📁 static/                # Static assets
│       ├── calculator.wasm       # Go WebAssembly calculator
│       ├── favicon.png           # Site icon
│       ├── licenses.html         # License information
│       └── *.png                 # Additional images
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
│   └── internal_types.go         # Internal data type definitions
│
├── 📁 wasm/                      # 🌐 WebAssembly build targets
│   └── main.go                   # WASI formatted WASM main entry
│
├── 📁 random/                    # 🎲 Random utilities
│   └── main.go                   # Random number generation
│
└── 📁 PowershellSettings/        # 🔧 Development environment settings
    └── Microsoft.PowerShell_profile.ps1 # PowerShell profile
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