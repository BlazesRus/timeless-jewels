# Quick Start Guide - Version-Aware System

## 🚀 Getting Started

The Timeless Jewel Generator now supports both Svelte 4 and Svelte 5 through an intelligent version-aware system that automatically detects your Svelte version and loads the appropriate implementation.

## 📋 Prerequisites

- Node.js 18+ 
- pnpm 10+
- Modern browser with JavaScript enabled

## ⚡ Quick Commands

```bash
# Install dependencies
pnpm install

# Start development (Svelte 4 - current default)
pnpm run dev

# Test version detection
pnpm run test:version

# Build for production
pnpm run build
```

## 🔧 Version Management

### Current Setup (Svelte 4)
```bash
# Default development
pnpm run dev
# or explicitly
pnpm run dev:svelte4

# Production build
pnpm run build:svelte4
```

### Future Svelte 5 Support
```bash
# When ready for Svelte 5
pnpm run dev:svelte5
pnpm run build:svelte5
```

## 🌐 Accessing the Application

Once the dev server starts, visit:
- **Main App**: http://localhost:5173/timeless-jewels
- **Tree Page**: http://localhost:5173/timeless-jewels/tree

## 🔍 How It Works

1. **Automatic Detection**: System detects Svelte version on page load
2. **Dynamic Loading**: Loads appropriate component implementation
3. **Graceful Fallback**: Falls back to Svelte 4 if detection fails
4. **Consistent UI**: Same interface regardless of version

## 📱 User Experience

### Loading Sequence
1. Page shows loading spinner with version detection message
2. System determines Svelte version (usually < 100ms)
3. Appropriate implementation loads dynamically
4. Full application interface becomes available

### Error Handling
- If version detection fails → Falls back to Svelte 4
- If component loading fails → Shows error with reload button
- All errors are logged to console for debugging

## 🛠 Development Features

### Version Detection API
```typescript
import { detectSvelteVersion, isSvelte5OrHigher } from '$lib/utils/version-detection';

// Get version info
const version = detectSvelteVersion();
console.log(`Running Svelte ${version.major}.${version.minor}.${version.patch}`);

// Version checks
if (isSvelte5OrHigher()) {
  // Modern Svelte 5 features
} else {
  // Traditional Svelte 4 patterns
}
```

### Configuration
```typescript
import { versionConfig } from '$lib/utils/version-config';

// Check feature availability
if (versionConfig.features.runes) {
  // Use $state, $derived, $effect
} else {
  // Use traditional reactivity
}
```

## 📊 Monitoring

### Browser Console
The system logs helpful information:
```
[Version Detection] Detected Svelte version: 4.2.20
[Component Loader] Loading Svelte 4 tree page implementation...
[Component Loader] Component loaded successfully
```

### Version Status
```bash
# Check current versions
pnpm run test:version
pnpm list svelte
pnpm list @sveltejs/kit
```

## 🔧 Troubleshooting

### Common Issues

1. **Loading Stuck**: Check browser console for errors
2. **Version Detection Fails**: System will fallback to Svelte 4
3. **Build Errors**: Ensure all dependencies are installed

### Debug Mode
Enable detailed logging in `src/lib/utils/version-config.ts`:
```typescript
export const versionConfig = {
  enableVersionLogging: true, // Set to true for debug info
  // ...
};
```

### Manual Override
If needed, you can force a specific version:
```typescript
// In version-detection.ts
export function detectSvelteVersion(): SvelteVersion {
  // Force Svelte 4 for testing
  return { major: 4, minor: 2, patch: 0, full: '4.2.0' };
}
```

## 🎯 Key Benefits

- **Zero Disruption**: Existing functionality unchanged
- **Future Ready**: Prepared for Svelte 5 migration
- **Performance**: Only loads what's needed
- **Reliability**: Multiple fallback mechanisms
- **Developer Friendly**: Clear logging and error messages

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all dependencies are installed (`pnpm install`)
3. Try restarting the dev server
4. Check the troubleshooting section above

## 🎉 Success!

You're now running the version-aware Timeless Jewel Generator! The system will automatically handle version detection and component loading, providing a seamless experience regardless of which Svelte version you're using.

Happy coding! 🚀
