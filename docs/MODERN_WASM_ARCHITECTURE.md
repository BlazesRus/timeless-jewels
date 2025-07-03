# Modern WASM Architecture - LegacyWasm vs ModernWasm

## Overview

The project now uses a clear separation between legacy and modern WASM implementations:

- **`frontend/src/lib/LegacyWasm/`** - Contains legacy Svelte 4 compatible WASM files
- **`frontend/src/lib/ModernWasm/`** - Contains modern Svelte 5 runes-based WASM files

## File Structure

### LegacyWasm Folder
```
frontend/src/lib/LegacyWasm/
├── legacy-wasm-exec.ts
├── wasm-loader.js
├── wasm_exec.svelte.ts
└── wasm_exec.ts
```

### ModernWasm Folder  
```
frontend/src/lib/ModernWasm/
├── go-runtime.svelte.ts      # Modern Go WASM runtime with Svelte 5 runes
├── wasm-exec.svelte.ts       # Modern WASM executor
└── wasm-loader.svelte.ts     # Modern WASM loader using ?url imports
```

## VS Code Configuration

The workspace is configured to hide `LegacyWasm` folder in modern mode:

### Files Hidden in Modern Mode
- `frontend/src/lib/LegacyWasm/**`
- Legacy files excluded from TypeScript checking
- Legacy files excluded from search and file explorer

### Settings Applied
- **files.exclude**: Hides LegacyWasm from file explorer
- **search.exclude**: Hides LegacyWasm from search results  
- **typescript.exclude**: Excludes LegacyWasm from TypeScript validation
- **typescript.validate.exclude**: Excludes from VS Code problems panel

## Vite Configuration

### Build Exclusions
- **Modern builds**: Exclude `LegacyWasm/` pattern
- **Legacy builds**: Exclude `ModernWasm/` pattern
- **WASM assets**: Include `**/*.wasm` in assetsInclude

### Runtime Middleware
- Blocks requests to LegacyWasm files in modern mode
- Returns 404 for excluded legacy files during development

## Extensibility Pattern for New Go Functions

When new Go functions are added to the WASM exports, follow this pattern in `go-runtime.svelte.ts`:

### 1. Add Function Implementation
```typescript
//Place new go functions added here

// Example: Add a new Go function handler
private myNewGoFunction(sp: number) {
  sp >>>= 0;
  // Implementation here
  debugLog('New Go function called');
}
```

### 2. Add Function Binding
```typescript
private buildImports(): Record<string, Function> {
  return {
    'runtime.wasmExit': this.wasmExit.bind(this),
    'runtime.wasmWrite': this.wasmWrite.bind(this),
    // ...existing bindings...
    
    //Add new import bindings here
    'runtime.myNewGoFunction': this.myNewGoFunction.bind(this),
    
    ...this.buildJsSyscalls()
  };
}
```

## Import Usage

### Modern Components
```typescript
// Use ModernWasm imports
import { loadModernWasm, enhancedWasmState } from '$lib/ModernWasm/wasm-loader.svelte';
```

### Legacy Components (if needed)
```typescript
// Use LegacyWasm imports (hidden in modern mode)
import { loadWasm } from '$lib/LegacyWasm/wasm-loader.js';
```

## Benefits

1. **Clear Separation**: Legacy and modern code don't interfere
2. **VS Code Clean**: Legacy files hidden in modern development
3. **Type Safety**: Modern files use full TypeScript/Svelte 5 types
4. **Extensibility**: Easy pattern for adding new Go functions
5. **Build Optimization**: Each mode only includes relevant files

## Microsoft Copilot Integration

The ModernWasm files were reworked with Microsoft Copilot assistance to:
- Use Vite's `?url` imports for proper asset handling
- Implement Svelte 5 runes for reactive state
- Fix the "stuck at 50%" WASM loading issue
- Provide full TypeScript type safety
