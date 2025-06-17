# timeless-jewels [![push](https://github.com/BlazesRus/timeless-jewels/actions/workflows/push.yml/badge.svg)](https://github.com/BlazesRus/timeless-jewels/actions/workflows/push.yaml) ![GitHub go.mod Go version](https://img.shields.io/github/go-mod/go-version/vilsol/timeless-jewels) ![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/vilsol/timeless-jewels) [![GitHub license](https://img.shields.io/github/license/Vilsol/timeless-jewels)](https://github.com/BlazesRus/timeless-jewels/blob/master/LICENSE)

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

## Updates to new leagues

Whenever a new league is coming, the passive tree might get updated.
**But** it is not guaranteed to contain correct data until a game download is available.

Specifically, this project depends on the following data tables:

* Alternate Passive Additions
* Alternate Passive Skills
* Passive Skills
* Stats
* Translations

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

# Version-specific development
pnpm run dev:svelte5  # Svelte 5 with runes
pnpm run dev:svelte4  # Svelte 4 compatibility

# Version management
pnpm run version:status   # Check current version
pnpm run version:switch   # Switch based on INI config
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