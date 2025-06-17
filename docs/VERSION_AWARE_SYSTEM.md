# Version-Aware Page Naming System

This document describes the version-aware page naming system implemented for the Timeless Jewel Generator, which automatically detects the Svelte version and loads the appropriate component implementation.

## Overview

The system enables seamless support for both Svelte 4 and Svelte 5 in the same codebase by:

1. **Automatic Version Detection** - Runtime detection of the current Svelte version
2. **Dynamic Component Loading** - Loading the appropriate page implementation based on version
3. **Version-Specific UI Libraries** - Using svelte-select for Svelte 4 and modern components for Svelte 5
4. **Graceful Fallbacks** - Falling back to Svelte 4 implementation if version detection fails

## Architecture

### Core Components

#### 1. Version Detection (`src/lib/utils/version-detection.ts`)

- Detects Svelte version at runtime using multiple strategies
- Build-time version injection via Vite plugin
- Runtime feature detection as fallback
- Provides utility functions for version checking

#### 2. Version Configuration (`src/lib/utils/version-config.ts`)

- Centralized configuration for version-specific features
- Feature flags for different Svelte versions
- UI library configuration management

#### 3. Vite Plugin (`src/lib/utils/vite-svelte-version-plugin.ts`)

- Injects Svelte version at build time
- Reads version from package.json
- Makes version available as global constant

#### 4. Version-Specific Implementations

- **`Svelte4Page.svelte`** - Svelte 4 implementation using svelte-select
- **`Svelte5Page.svelte`** - Svelte 5 implementation using runes and modern components
- **`ModernSelect.svelte`** - Svelte 5 compatible select component

#### 5. Main Router (`src/routes/tree/+page.svelte`)

- Detects version on mount
- Dynamically imports appropriate component
- Provides loading states and error handling

## Usage

### Development Scripts

The package.json includes version-specific scripts:

```bash
# Default (Svelte 4)
pnpm run dev

# Explicit Svelte 4
pnpm run dev:svelte4

# Test with Svelte 5
pnpm run dev:svelte5

# Check current version
pnpm run test:version
```

### Version Detection API

```typescript
import {
  detectSvelteVersion,
  isSvelte5OrHigher,
  isSvelte4,
} from "$lib/utils/version-detection";

// Get detailed version info
const version = detectSvelteVersion();
console.log(version.major, version.minor, version.patch, version.full);

// Simple version checks
if (isSvelte5OrHigher()) {
  // Use Svelte 5 features
} else if (isSvelte4()) {
  // Use Svelte 4 patterns
}
```

### Configuration

```typescript
import { versionConfig, updateFeatureFlags } from "$lib/utils/version-config";

// Get UI library config for current version
const uiConfig = getUILibraryConfig(5); // or 4

// Update feature flags based on version
const config = updateFeatureFlags(5);
console.log(config.features.runes); // true for Svelte 5
```

## Key Differences Between Implementations

### Svelte 4 Implementation (`Svelte4Page.svelte`)

- Uses traditional reactivity with `$:` statements
- Event handling with `on:event` syntax
- Component references with `bind:this`
- svelte-select for dropdown components
- localStorage handled with reactive statements

### Svelte 5 Implementation (`Svelte5Page.svelte`)

- Uses runes: `$state`, `$derived`, `$effect`
- Event handling with `onclick` attributes
- Modern event handler patterns
- Custom ModernSelect component
- Effects for side effects like localStorage

### Component Differences

#### Event Handling

**Svelte 4:**

```svelte
<button on:click={() => (collapsed = true)}>
<Select on:change={handleSelectStat} />
```

**Svelte 5:**

```svelte
<button onclick={() => (collapsed = true)}>
<ModernSelect onchange={handleSelectStat} />
```

#### State Management

**Svelte 4:**

```javascript
let selectedJewel = undefined;
$: conquerors = selectedJewel ? getConquerors(selectedJewel) : [];
$: if (browser) localStorage.setItem("setting", value);
```

**Svelte 5:**

```javascript
let selectedJewel = $state(undefined);
const conquerors = $derived(selectedJewel ? getConquerors(selectedJewel) : []);
$effect(() => {
  if (browser) localStorage.setItem("setting", value);
});
```

## Migration Strategy

### Phase 1: Preparation (Current)

- ✅ Fixed TypeScript and compilation issues
- ✅ Enhanced type safety
- ✅ Improved SSR compatibility
- ✅ Created version detection system
- ✅ Built version-specific implementations

### Phase 2: Testing

- Test Svelte 4 implementation thoroughly
- Validate version detection works correctly
- Test dynamic component loading
- Verify fallback mechanisms

### Phase 3: Svelte 5 Integration

- Install Svelte 5 as optional dependency
- Test Svelte 5 implementation
- Validate runes and modern syntax
- Test ModernSelect component

### Phase 4: Production Deployment

- Choose default version (Svelte 4 for stability)
- Deploy with version-aware system
- Monitor for any issues
- Gradual migration to Svelte 5 when ready

## Error Handling

The system includes comprehensive error handling:

1. **Version Detection Failure** - Falls back to Svelte 4
2. **Component Loading Failure** - Shows error message with reload option
3. **Dynamic Import Failure** - Attempts fallback to Svelte 4 implementation
4. **Runtime Errors** - Graceful degradation with user feedback

## Performance Considerations

- **Code Splitting** - Only loads the required implementation
- **Build-time Optimization** - Version injection at build time
- **Lazy Loading** - Components loaded only when needed
- **Fallback Caching** - Caches successful imports to avoid repeated failures

## Testing

### Manual Testing

```bash
# Test version detection
pnpm run test:version

# Test Svelte 4 mode
pnpm run dev:svelte4

# Test Svelte 5 mode (when ready)
pnpm run dev:svelte5
```

### Automated Testing

- Unit tests for version detection functions
- Component tests for both implementations
- Integration tests for dynamic loading
- E2E tests for user workflows

## Future Enhancements

1. **Smart Caching** - Cache version detection results
2. **User Preference** - Allow users to choose implementation
3. **A/B Testing** - Test different versions with different users
4. **Performance Monitoring** - Track loading times and errors
5. **Automatic Migration** - Gradually migrate users to newer versions

## Troubleshooting

### Common Issues

1. **Version Detection Fails**

   - Check if `__SVELTE_VERSION__` is defined
   - Verify Vite plugin is configured correctly
   - Check browser console for detection logs

2. **Component Loading Fails**

   - Verify both implementation files exist
   - Check for import errors in browser console
   - Ensure fallback mechanism is working

3. **Svelte 5 Features Not Working**
   - Confirm Svelte 5 is installed
   - Check for syntax errors in Svelte 5 implementation
   - Verify runes are enabled in Svelte config

### Debug Mode

Enable detailed logging by setting `enableVersionLogging: true` in version-config.ts.

## Conclusion

This version-aware system provides a robust foundation for supporting multiple Svelte versions while maintaining a single codebase. It enables smooth transitions between versions and provides excellent developer and user experience during the migration process.
