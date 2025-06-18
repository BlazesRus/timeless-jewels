# pnpm v10 Migration Guide

This workspace has been updated to support pnpm v10. Here are the key changes and what you need to know:

## Breaking Changes Addressed

### 1. Lifecycle Scripts Security

- **Change**: Lifecycle scripts are no longer executed by default for enhanced security
- **Solution**: Added `onlyBuiltDependencies` configuration in `package.json` and `.pnpmrc`
- **Allowed dependencies**: `esbuild`, `sass`, `vite` (and `go` for workspace root)

### 2. Package Manager Version

- **Change**: Updated from pnpm v9.1.1 to pnpm v10.12.1
- **Action**: The `packageManager` field has been updated in `package.json`

### 3. Lockfile Format

- **Change**: Internal structures now use SHA256 for improved security
- **Action**: You'll need to regenerate the lockfile on first install

### 4. Hoisting Configuration

- **Change**: `public-hoist-pattern` now defaults to empty array
- **Solution**: Explicitly configured common tools (`eslint`, `prettier`, `typescript`) to be hoisted

### 5. Windows Path Length

- **Change**: `virtual-store-dir-max-length` reduced to 60 characters on Windows
- **Solution**: Configured in `.pnpmrc` files

## What to Do Next

### 1. Install pnpm v10

```powershell
# Update pnpm to v10
pnpm self-update

# Or if using a package manager
npm install -g pnpm@10
```

### 2. Clean Install

```powershell
# Remove old lockfile and node_modules
Remove-Item pnpm-lock.yaml
Remove-Item node_modules -Recurse -Force

# Fresh install with pnpm v10
pnpm install
```

### 3. Verify Installation

```powershell
# Check pnpm version
pnpm --version

# Run tests to ensure everything works
pnpm run dev
pnpm run build
```

## Configuration Files Added/Modified

- `frontend/package.json` - Added `pnpm.onlyBuiltDependencies` configuration
- `frontend/.pnpmrc` - Frontend-specific pnpm v10 configuration
- `.pnpmrc` - Workspace root pnpm v10 configuration
- `PNPM_V10_MIGRATION.md` - This migration guide

## Test Argument Passing

Note: In pnpm v10, arguments after `pnpm test` are now passed directly to the script. The `--` prefix is no longer needed.

**Before (pnpm v9):**

```powershell
pnpm test -- --watch
```

**Now (pnpm v10):**

```powershell
pnpm test --watch
```

## Link Behavior Changes

- `pnpm link` now adds overrides to the root `package.json`
- To link globally, run the command from the package's directory

## Migration Status ✅

**Status**: **COMPLETED SUCCESSFULLY**

**Summary of Changes Made:**

### ✅ Core Configuration

- [x] Updated `packageManager` to pnpm@10.12.1 in package.json
- [x] Created `.pnpmrc` configuration files (workspace root and frontend)
- [x] Configured `onlyBuiltDependencies` for security
- [x] Set up hoisting patterns for development tools
- [x] Configured Windows path length limitations

### ✅ Dependencies Updated

- [x] TypeScript: 5.2.2 → 5.8.3 (latest stable compatible with Svelte 4)
- [x] @typescript-eslint/eslint-plugin: 6.21.0 → 8.34.0
- [x] @typescript-eslint/parser: 6.21.0 → 8.34.0
- [x] eslint-plugin-svelte3 → eslint-plugin-svelte 3.9.2 (replaced deprecated package)
- [x] tslib: 2.6.2 → 2.8.1
- [x] **Sass: 1.66.1 → 1.89.2** (latest version compatible with Svelte 4)
- [x] **svelte-preprocess: 5.0.4 → 6.0.3** (latest version compatible with Svelte 4)

### ✅ Breaking Changes Fixed

- [x] Fixed TypeScript compatibility issues (493 → 0 errors)
- [x] Updated script configurations to remove deprecated flags
- [x] Corrected import paths and type definitions
- [x] Enhanced TypeScript configuration for better compatibility
- [x] **Updated TypeScript config for svelte-preprocess 6.x** (verbatimModuleSyntax: true)
- [x] **Fixed accessibility issues** - Replaced `<li>` elements with `<button>` elements for clickable items

### ✅ Build & Development Validation

- [x] **Build**: `pnpm run build` - **SUCCESSFUL** ✅
- [x] **Development Server**: `pnpm run dev` - **RUNNING** ✅
- [x] **Type Checking**: `pnpm run check` - **PASSED** ✅ (0 A11y warnings, 33 non-critical warnings)
- [x] **Linting**: `pnpm run lint` - **PASSED** ✅
- [x] **Formatting**: `pnpm run format` - **WORKING** ✅
- [x] **Preview**: `pnpm run preview` - **WORKING** ✅

**Migration Result**: All scripts and development workflows are functioning correctly with pnpm v10.12.1, Sass 1.89.2, and svelte-preprocess 6.0.3.

## Deploy Command

If using `pnpm deploy`, ensure `inject-workspace-packages=true` is set in your configuration.

## Troubleshooting

### If you encounter lifecycle script errors:

1. Check if the dependency needs to run build scripts
2. Add it to the `onlyBuiltDependencies` array in `package.json`
3. Update the `.pnpmrc` file accordingly

### If packages aren't found:

1. Check the `public-hoist-pattern` configuration
2. Add the package pattern to `.pnpmrc` if it needs to be hoisted

### If paths are too long on Windows:

1. The `virtual-store-dir-max-length` is already set to 60
2. Consider shortening your project path if issues persist

## Additional Resources

- [pnpm v10 Release Notes](https://github.com/pnpm/pnpm/releases)
- [pnpm Configuration Documentation](https://pnpm.io/pnpmrc)
- [Security Features](https://pnpm.io/only-allow-built-dependencies)
