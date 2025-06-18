# INI-Based Dependency Management System

## Overview

The Timeless Jewel Generator now features an advanced INI-based dependency management system that allows seamless switching between Svelte 4 and Svelte 5 configurations. The system defaults to **Svelte 5** for modern development while maintaining full backward compatibility with Svelte 4.

## Quick Start

### Default Configuration (Svelte 5)

```powershell
# The system defaults to Svelte 5 - no configuration needed!
pnpm run dev
```

### Switch to Svelte 4

```powershell
# Method 1: Edit version.ini manually
# Change: version = 5 to version = 4

# Method 2: Use PowerShell script (Windows)
.\scripts\version-manager.ps1 switch -Version 4

# Method 3: Use Node.js script directly
node scripts/version-manager.js switch
```

### Check Current Status

```powershell
pnpm run version:status
```

## Configuration File (version.ini)

The `version.ini` file controls all aspects of version management:

```ini
[svelte]
# Version can be: 4 or 5
# Default: 5 (for latest features and performance improvements)
version = 5

[packages]
svelte5_package = package.json
svelte4_package = LegacyPackage.json

[options]
# auto_install: Automatically run pnpm install after package switching
auto_install = true

# backup_current: Create backup of current package.json before switching
backup_current = true

[components]
# Strategy can be: dynamic (runtime detection) or static (build-time)
loading_strategy = dynamic

# Fallback behavior when version detection fails
fallback_version = 5
```

## Package Files

The system manages two package.json files:

### package.json (Svelte 5 - Default)

- **Svelte**: 5.33.18
- **SvelteKit**: 2.21.3
- **Vite**: 6.3.5
- **Modern tooling**: ESLint 9, Tailwind CSS 4
- **Features**: Runes, modern reactivity, enhanced performance

### LegacyPackage.json (Svelte 4 - Compatibility)

- **Svelte**: 4.2.17
- **SvelteKit**: 2.0.0
- **Vite**: 6.0.0
- **Legacy tooling**: ESLint 8, Tailwind CSS 3
- **Features**: Traditional reactivity, stable API

## Usage Examples

### Development Scripts

```powershell
# Start with current configuration (default: Svelte 5)
pnpm run dev

# Force Svelte 4 development
pnpm run dev:svelte4

# Force Svelte 5 development (same as default)
pnpm run dev:svelte5

# Build with current configuration
pnpm run build

# Version-specific builds
pnpm run build:svelte4
pnpm run build:svelte5
```

### Version Management Commands

```powershell
# Switch package based on version.ini
pnpm run version:switch

# Show current status
pnpm run version:status

# Get help
pnpm run version:help
```

### PowerShell Scripts (Windows)

```powershell
# Quick switch to Svelte 4
.\scripts\version-manager.ps1 switch -Version 4

# Quick switch to Svelte 5
.\scripts\version-manager.ps1 switch -Version 5

# Check status
.\scripts\version-manager.ps1 status

# Get help
.\scripts\version-manager.ps1 help
```

## Component Architecture

The system automatically loads the appropriate components based on the detected Svelte version:

### Dynamic Loading (Default)

```typescript
// Runtime detection and dynamic imports
const TreePage = await import(
  svelteVersion >= 5 ? "./Svelte5Page.svelte" : "./Svelte4Page.svelte"
);
```

### Version-Specific Components

#### Svelte 5 Components

- Use runes syntax (`$state`, `$derived`, `$effect`)
- Modern event handling
- Enhanced reactivity patterns
- `ModernSelect` component

#### Svelte 4 Components

- Traditional reactivity patterns
- `svelte-select` component
- Legacy event handling
- Backwards compatibility

## Migration Workflow

### From Svelte 4 to Svelte 5

1. Current configuration should already default to Svelte 5
2. If not, update `version.ini`: `version = 5`
3. Run: `pnpm run version:switch`
4. Test the application: `pnpm run dev`

### From Svelte 5 to Svelte 4 (Rollback)

1. Update `version.ini`: `version = 4`
2. Run: `pnpm run version:switch`
3. Test with legacy setup: `pnpm run dev`

## Troubleshooting

### Common Issues

#### Package Switching Fails

```powershell
# Check current status
pnpm run version:status

# Manually install dependencies
pnpm install

# Force clean install
Remove-Item -Recurse -Force node_modules
pnpm install
```

#### Version Detection Issues

```powershell
# Check detected version
pnpm run test:version

# Check version configuration
node -e "console.log(require('./src/lib/utils/version-config.ts'))"
```

#### Component Loading Errors

- Ensure all components exist for both Svelte versions
- Check import paths in version-specific components
- Verify component compatibility with target Svelte version

### Debug Mode

Enable detailed logging by setting in `version-config.ts`:

```typescript
enableVersionLogging: true;
```

## Best Practices

### Development

1. **Use Svelte 5 by default** - it's the future of Svelte
2. **Test both versions** when making changes
3. **Keep components version-specific** - don't mix syntaxes
4. **Use the INI system** for easy switching

### Deployment

1. **Build with target version** using appropriate scripts
2. **Test builds** with both versions in CI/CD
3. **Use static builds** for production (set `loading_strategy = static`)

### Maintenance

1. **Keep both package files updated** with security patches
2. **Update version detection logic** when adding new Svelte features
3. **Monitor deprecation warnings** in Svelte 4 components

## Advanced Configuration

### Custom Package Files

```ini
[packages]
svelte5_package = package.production.json
svelte4_package = package.legacy.json
```

### Build-Time Version Selection

```ini
[components]
loading_strategy = static
```

### Automated CI/CD Integration

```powershell
# In your CI/CD pipeline
node scripts/version-manager.js switch
pnpm install
pnpm run build
```

## Support

For issues with the version management system:

1. Check `pnpm run version:status`
2. Review the configuration in `version.ini`
3. Check component compatibility in version-specific files
4. Ensure both package files are properly maintained

The system is designed to be robust and handle most edge cases automatically, with comprehensive logging and error messages to help with troubleshooting.
