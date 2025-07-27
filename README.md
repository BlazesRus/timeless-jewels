# timeless-jewels 
![GitHub go.mod Go version](https://img.shields.io/github/go-mod/go-version/vilsol/timeless-jewels) ![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/vilsol/timeless-jewels) 
[![GitHub license](https://img.shields.io/github/license/Vilsol/timeless-jewels)](https://github.com/BlazesRus/timeless-jewels/blob/master/LICENSE)

An advanced Svelte 5 application with WebAssembly, SSR, PWA and Electron support.  
This repo powers both a browser-based UI and a standalone desktop app.  
It includes strict TypeScript, fast bundling with Vite, and a modern build pipeline designed for cross-platform deployment.

A fork of Vilsol’s timeless-jewels, enhanced with:

- Conqueror-keystone selection or “any” option  
- Trade-search split into 200-seed batches  
- Duplicate-filter bug fix  
- Experimental “stat total” search  

Original version:  [https://vilsol.github.io/timeless-jewels](https://vilsol.github.io/timeless-jewels)
Hosted GitHub page: [https://BlazesRus.github.io/timeless-jewels](https://BlazesRus.github.io/timeless-jewels)
Source of ImHamba Branch(Conqueror-keystone selection or “any” option feature):[https://github.com/ImHamba/timeless-jewels](https://github.com/ImHamba/timeless-jewels)
Uses data extracted with https://github.com/Vilsol/go-pob-data

---
## Table of Contents

- [Prerequisites](#prerequisites)  
- [Installation](#installation)  
- [Project Structure](#project-structure)  
- [Development Commands](#development-commands)  
- [Build & Deployment](#build--deployment)  
- [Packaging the Electron App](#packaging-the-electron-app)  
- [Utilities](#utilities)  
- [Configuration](#configuration)  
- [License](#license)  

---

## Prerequisites

- Node.js 22+  
- pnpm 10+  
- (Windows) PowerShell 7+ for script compatibility 
- VSCode if want to use VSCode project

---

## Installation

- Install with git, gitKrakenm or any other git repository downloader
- cd to frontend of the repository
```
pnpm install
corepack enable pnpm
```

Simplified frontend structure:
- **src/** — Svelte application source (renderer)
- **src-electron/** — Electron main-process code
- **dist/renderer/**  — Bundled renderer output
  Vite’s client build for local preview or Electron dev  
  → from `pnpm run build:web`
- **dist/ghpages/** - Generated WebAssembly and intermediate artifacts for GitHub pages
  Final prerendered static site(deployed to GitHub Pages) (HTML, JS, WASM, etc.)  
  → from `pnpm run build:ghpages`  
- **dist/main/** — Bundled Electron main output
- **scripts/** — Utility scripts (e.g. build-wasm.ps1)
- **static/**  
  Source public assets (WASM, manifest, favicon, etc.). Used by Vite during build.




- **dist/ghpages/**  
  Final prerendered static site(deployed to GitHub Pages) (HTML, JS, WASM, etc.)  
  → from `pnpm run build:ghpages`  

- **dist/main/**  
  Electron main & preload bundles  
  → from `pnpm run build:electron`

(Other files exist other than shown here these are just some of them)
📁 timeless-jewels/
├── README.md
├── LICENSE
├── LICENSE-EXCEPTIONS.md
├── go.mod
├── go.sum
├── timeless-jewels.code-workspace
│
├── 📁.github/
│   └── copilot-instructions.md
│
├── 📁docs/   (2024Extended Exclusive for now until reduce documentation)
│   ├── INDEX.md
│   └── *.md
│
├───📁 frontend/
│   ├── package.json
│   ├── pnpmfile.cjs                     (2024Extended Exclusive)
│   ├── tsconfig.json
│   ├── tsconfig.electron.json
│   ├── tailwind.config.js
│   ├── postcss.config.cjs
│   ├── svelte.config.ts
│   ├── vite.base.config.ts    (Base file for vite config variants)
│   ├── vite.electron.config.ts
│   ├── vite.ghpages.config.ts
│   ├── vite.renderer.config.ts
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── tsconfig.Modern.json    (2024Extended Exclusive)
│   ├── 📁.config-deps/                     (2024Extended Exclusive)
│   │   └── timeless-jewels-modern-config/
│   ├── 📁scripts/
│   │   ├── build-wasm.ps1
│   │   └── version-manager.js
│   ├── 📁tests/
│   │   └── scripts/
│   ├── 📁 src-electron/       # Typescript source code for electron
│   ├── 📁 dist-electron/      # Compiled code from src-electron
│   ├── 📁static/
│   │   ├── .nojekyll
│   │   ├── calculator.wasm       # WebAssembly calculator
│   │   ├── favicon.png
│   │   ├── licenses.html         # License information
│   │   └── *.*         # Other files
│   ├── 📁src/
│   │   ├── app.html
│   │   ├── app.css
│   │   ├── hooks.client.ts
│   │   ├── 📁lib/               # Shared libraries
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
│   │   ├── 📁styles/            # Style definitions
│   │   └── 📁routes/ (or any routes* folder)
│   │       ├── +layout.svelte             # Layout component
│   │       ├── +page.svelte               # Home page
│   │       ├── 📁 about/                  # About page
│   │       ├── 📁 tree/                   # Tree page
│   │       └── 📁 test/                   # Test/debug page
│   │           └── +page.svelte           # Cross-origin & PWA testing
│   │
│   └──📁dist  (Output directory for output folders)
│
│
│
│
│
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
| `frontend/`   | 💻 Web application             | Svelte 5, TypeScript, Vite   |
| `calculator/` | ⚙️ Core calculations           | Go → WebAssembly            |
| `data/`       | 📊 Game data processing        | Go, JSON                     |
| `wasm/`       | 🌐 WebAssembly builds          | Go                           |


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

---
### Development Commands

Clean previous outputs and produce production builds for web, GH Pages, and Electron.
```bash
# Generate or rebuild the WebAssembly calculator
pnpm run generateWasm
pnpm run prepare:wasm

# Preview GitHub Pages routing locally
pnpm run dev:gh

# Launch Electron (renderer + main) with hot reload
pnpm run dev:electron

# Remove build artifacts
pnpm run clean

# Start web renderer in dev mode (SSR + HMR)
pnpm run dev:web

# Preview GitHub Pages routing locally
pnpm run dev:gh

# Launch Electron (renderer + main) with hot reload
pnpm run dev:electron

# Run web and Electron dev in parallel
pnpm run dev:all

# Preview the static web build
pnpm run preview:web
```

---
## Building the GitPages build

run
```bash
# Build and deploy to GitHub Pages
pnpm run build:ghpages
pnpm run deploy:gh
```

Pre-renders every route as a static HTML file, outputs into dist/ghpages/.


## Packaging the Electron App
Create distributable desktop installers or portable executables for each platform.


```bash
# Build electron static web build
pnpm run build:web

# Bundle Electron (main + preload + renderer)
pnpm run build:electron

# Serve electron build
pnpm run electron:serve

# Full cross-platform packaging with electron-builder
pnpm run package:electron

# Windows portable executable
pnpm run offline:win

# macOS DMG and ZIP
pnpm run offline:mac

# Linux AppImage and DEB
pnpm run offline:linux

# All platforms without publishing
pnpm run offline:all

# Legacy packager commands (optional)
pnpm run packOfflineBuild:win
pnpm run packOfflineBuild:linux
pnpm run packOfflineBuild:mac

```

---
## Utilities
```bash

# Lint source code and styles
pnpm run lint
pnpm run lint:css
pnpm run lint:css:fix

# Format files consistently
pnpm run format

# Type-check Svelte + TS
pnpm run check
pnpm run check:watch

# Run unit tests with Vitest
pnpm run test:modern
pnpm run test:coverage
pnpm run test:watch
```

---
## Configuration

Environment is controlled via BUILD_TARGET:

  - renderer — Standard web build

  - ghpages — Static output for GitHub Pages

Further options can be found in the Vite configs:

  - vite.renderer.config.ts

  - vite.ghpages.config.ts

  - vite.electron.config.ts

Electron build settings live in package.json under the build section.

---
## License

This repository combines code under multiple licenses:

  - The original codebase is licensed under GPL v3.
	- For specific liceases on other files check frontend/static/liceases.html

License

This project merges code under multiple licenses:

    GPL-3.0-only for the original codebase
    MIT, MIT-0 and BSD-3-Clause for select additions and scripts

Always consult LICENSE (GPL-3.0-only) 
and LICENSE-EXCEPTIONS.md or frontend/static/liceases.html for full license details.