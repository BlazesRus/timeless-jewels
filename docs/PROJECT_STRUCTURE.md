# Project Structure - Technical Overview

## 📁 Complete Directory Structure

This document provides a detailed technical overview of the Timeless Jewel Generator project structure, including file purposes, dependencies, and architectural decisions.

### 🏗️ Root Level Structure

```
timeless-jewels_Partial/
├── 📄 README.md                    # Main project documentation
├── 📄 go.mod                       # Go module definition
├── 📄 go.sum                       # Go dependency checksums  
├── 📄 LICENSE                      # MIT license
├── 📄 jewel_test.go               # Go unit tests for jewel logic
├── 📄 reverse_test.go             # Reverse engineering tests
├── 📄 tools.go                    # Go tools and utilities
│
├── 🔧 devbox.json, devbox.lock   # Devbox environment configuration
├── 🔧 migrate-to-pnpm-v10.ps1    # pnpm v10 migration script
├── 🔧 upgrade-to-svelte5.ps1     # Svelte 5 upgrade automation
├── 🔧 test-copilot-integration.ps1 # AI integration testing
├── 🔧 update_assets.sh           # Asset update automation
├── 🔧 Microsoft.PowerShell_profile.ps1 # PowerShell profile
│
├── 🖼️ CorrectFrontPage.png        # Reference screenshot
├── 📋 FUNDING.yml                 # GitHub sponsorship configuration
├── 📋 timeless-jewels_Partial.code-workspace # VS Code workspace
│
├── 📁 docs/                       # 📚 Documentation directory
├── 📁 frontend/                   # 💻 Web application
├── 📁 calculator/                 # ⚙️ Go calculator (WebAssembly)
├── 📁 data/                       # 📊 Game data processing
├── 📁 wasm/                       # 🌐 WebAssembly builds
└── 📁 random/                     # 🎲 Utility functions
```

## 📚 Documentation Structure (`docs/`)

### **Complete Documentation Catalog**

```
docs/
├── 📋 INDEX.md                           # Documentation navigation hub
│
├── 🏗️ System Architecture & Build
│   ├── BUILD_FIXES_COMPLETE.md          # Complete build system with dual Svelte support
│   ├── VERSION_AWARE_SYSTEM.md          # Version-aware architecture design
│   └── VERSION_AWARE_IMPLEMENTATION_COMPLETE.md # Implementation summary
│
├── 🔄 Migration & Setup Guides  
│   ├── PNPM_V10_MIGRATION.md            # Package manager migration
│   ├── SVELTE_5_MIGRATION_PREP.md       # Framework upgrade preparation
│   └── QUICK_START_VERSION_AWARE.md     # Quick start guide
│
├── 🛠️ Component & Integration
│   ├── SELECT_COMPONENT_FIX.md          # Select component updates
│   ├── SVELTE_SELECT_UPDATE_COMPLETE.md # svelte-select library updates
│   └── COMLINK_MODERNIZATION.md         # Web Worker modernization
│
└── 🤖 Development Tools
    ├── COPILOT_INTEGRATION_SUCCESS.md   # GitHub Copilot integration
    ├── COPILOT_TERMINAL_FIX.md          # Terminal integration fixes
    └── COPILOT_TERMINAL_INTEGRATION_FIXED.md # Complete terminal solution
```

### **Documentation Categories**

| Category | Purpose | Files |
|----------|---------|-------|
| **Architecture** | System design and build configuration | 3 files |
| **Migration** | Upgrade guides and setup procedures | 3 files |
| **Components** | UI component updates and fixes | 3 files |
| **Tools** | Development tool integration | 3 files |

## 💻 Frontend Structure (`frontend/`)

### **Package Management System**

```
frontend/
├── 📦 Package Configuration
│   ├── package.json                     # 🎯 Active configuration (Svelte 5 default)
│   ├── Svelte5Package.json             # 📋 Svelte 5 template
│   ├── LegacyPackage.json              # 📋 Svelte 4 template
│   ├── Svelte5PackageBackup.json       # 🛡️ Svelte 5 safety backup
│   ├── LegacyPackageBackup.json        # 🛡️ Svelte 4 safety backup
│   └── pnpm-lock.yaml                  # 📦 Dependency lock file
│
├── ⚙️ Configuration Files
│   ├── version.ini                     # INI-based version management
│   ├── vite.config.js                  # Vite build configuration
│   ├── svelte.config.js                # Svelte compiler config
│   ├── tailwind.config.cjs             # TailwindCSS configuration
│   ├── postcss.config.cjs              # PostCSS configuration
│   └── tsconfig.json                   # TypeScript configuration
│
├── 🛠️ Build & Management Scripts
│   └── scripts/
│       ├── version-manager.js          # Node.js version manager
│       └── version-manager.ps1         # PowerShell wrapper
│
├── 📁 Frontend Documentation
│   ├── BACKUP_FILE_STRUCTURE.md        # Backup system documentation
│   ├── INI_DEPENDENCY_SYSTEM_COMPLETE.md # INI system complete guide
│   └── BACKUP_QUICK_REFERENCE.md       # Emergency recovery procedures
```

### **Source Code Structure (`src/`)**

```
src/
├── 🏠 Application Entry Points
│   ├── app.html                        # HTML template
│   ├── app.scss                        # Global styles
│   └── wasm_exec.js                    # WebAssembly execution support
│
├── 📁 lib/                            # Shared Libraries
│   ├── 🔄 Core Logic
│   │   ├── skill_tree.ts               # Skill tree data structures
│   │   ├── skill_tree_types.ts         # Type definitions
│   │   └── values.ts                   # Constant values
│   │
│   ├── 👷 Web Workers (Comlink Integration)
│   │   ├── modern-sync-worker.ts       # Modern synchronous worker
│   │   ├── modern-worker.ts            # Modern asynchronous worker
│   │   ├── modern-worker-types.ts      # Worker type definitions
│   │   ├── sync_worker.ts              # Legacy sync worker
│   │   └── worker.ts                   # Base worker implementation
│   │
│   ├── 📁 components/                  # Svelte Components
│   │   ├── ModernSelect.svelte         # Modern select component (Svelte 5)
│   │   ├── SearchResult.svelte         # Search result display
│   │   └── [other components...]
│   │
│   ├── 📁 types/                       # TypeScript Definitions
│   │   └── [type definition files...]
│   │
│   └── 📁 utils/                       # Utility Functions
│       ├── version-detection.ts        # Runtime version detection
│       ├── version-config.ts           # Version configuration management
│       ├── vite-svelte-version-plugin.ts # Build-time version plugin
│       ├── trade_utils.ts              # Trade-related utilities
│       └── utils.ts                    # General utilities
│
├── 📁 routes/                          # SvelteKit Routing
│   ├── +layout.svelte                  # Global layout component
│   ├── +layout.ts                      # Layout configuration
│   ├── +page.svelte                    # Home page component
│   ├── +page.ts                        # Home page configuration
│   │
│   └── 📁 tree/                        # Tree Page (Version-Aware)
│       ├── +page.svelte                # Main router with dynamic imports
│       ├── TreePageSvelte4.svelte      # Svelte 4 implementation
│       └── TreePageSvelte5.svelte      # Svelte 5 implementation
│
└── 📁 static/                          # Static Assets
    ├── calculator.wasm                  # Go WebAssembly calculator
    ├── favicon.png                     # Site favicon
    ├── mf-academy-logo.png             # Logo asset
    └── [other static files...]
```

## ⚙️ Backend Structure

### **Calculator Module (`calculator/`)**

```
calculator/
├── main.go                             # Calculator entry point
└── tree_manager.go                     # Tree management logic
```

**Purpose**: Core calculation engine compiled to WebAssembly for frontend use.

### **Data Processing (`data/`)**

```
data/
├── 📊 Game Data Files (Compressed)
│   ├── alternate_passive_additions.json.gz    # Alternate passive additions
│   ├── alternate_passive_skills.json.gz       # Alternate passive skills
│   ├── alternate_tree_versions.json.gz        # Tree version data
│   ├── passive_skill_aura_stat_descriptions.json.gz # Aura descriptions
│   ├── passive_skill_stat_descriptions.json.gz      # Stat descriptions
│   ├── passive_skills.json.gz                 # Passive skill data
│   ├── possible_stats.json.gz                # Possible stat combinations
│   ├── SkillTree.json.gz                     # Complete skill tree
│   ├── stat_descriptions.json.gz             # Stat descriptions
│   └── stats.json.gz                         # Statistics data
│
├── 🔧 Go Processing Code
│   ├── main.go                        # Data processing entry point
│   ├── manager.go                     # Data management
│   ├── jewels.go                      # Jewel-specific logic
│   ├── types.go                       # Data type definitions
│   ├── internal_types.go              # Internal type definitions
│   └── skill_tree_types.go            # Skill tree type definitions
```

**Purpose**: Processes Path of Exile game data for use in calculations.

### **WebAssembly Builds (`wasm/`)**

```
wasm/
├── main.go                            # WASM build entry point
└── exposition/
    └── main.go                        # Export functionality for WASM
```

**Purpose**: WebAssembly compilation targets for browser execution.

### **Utilities (`random/`)**

```
random/
└── main.go                           # Random number generation utilities
```

## 🔧 Configuration & Build Files

### **VS Code Workspace (`.vscode/`)**

```
.vscode/
├── settings.json                     # Enhanced Copilot integration settings
├── tasks.json                       # Build and development tasks
├── launch.json                      # Debug configurations
└── keybindings.json                 # Custom keybindings
```

### **Package Manager & Dependencies**

| File | Purpose | Technology |
|------|---------|------------|
| `go.mod`, `go.sum` | Go dependencies | Go modules |
| `frontend/package.json` | Node.js dependencies | pnpm v10 |
| `frontend/pnpm-lock.yaml` | Dependency lock | pnpm |

## 🔄 Version Management System

### **INI-Based Configuration**

The project uses an innovative INI-based system for managing Svelte versions:

```
frontend/
├── version.ini                       # Configuration file
├── scripts/version-manager.js        # Management logic
└── src/lib/utils/version-*.ts        # Detection utilities
```

### **Backup Strategy**

Multiple layers of protection against file corruption:

```
frontend/
├── package.json                      # Active (current version)
├── Svelte5Package.json              # Template (Svelte 5)
├── LegacyPackage.json               # Template (Svelte 4)
├── Svelte5PackageBackup.json        # Safety backup (Svelte 5)
└── LegacyPackageBackup.json         # Safety backup (Svelte 4)
```

## 📊 Architecture Summary

### **Technology Stack**

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Svelte 4/5, TypeScript, Vite | User interface |
| **Calculation** | Go → WebAssembly | High-performance calculations |
| **Data** | Go, JSON compression | Game data processing |
| **Build** | pnpm, Vite, Go compiler | Development workflow |
| **Documentation** | Markdown, organized structure | Comprehensive guides |

### **Key Architectural Decisions**

1. **Dual Svelte Support**: Maintains compatibility while allowing modern features
2. **WebAssembly Calculations**: High-performance Go code in the browser
3. **INI-Based Management**: Simple configuration for complex version switching
4. **Comprehensive Backups**: Multiple safety layers prevent data loss
5. **Organized Documentation**: Logical structure with clear navigation

### **Development Workflow**

```
1. Clone repository
2. cd frontend
3. pnpm install
4. pnpm run version:status  # Check configuration
5. pnpm run dev            # Start development (defaults to Svelte 5)
```

This structure supports both legacy compatibility and modern development practices, ensuring a smooth transition path while maintaining project stability.

---

*For quick navigation, see the [📋 Documentation Index](INDEX.md) or [🚀 Quick Start Guide](QUICK_START_VERSION_AWARE.md)*
