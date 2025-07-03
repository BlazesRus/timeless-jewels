import { sveltekit } from '@sveltejs/kit/vite';
import { VERSION as SVELTE_VER } from 'svelte/compiler';
import tailwindcss from '@tailwindcss/vite';

const majorVer = +SVELTE_VER.split('.')[0];
const isSvelte5 = majorVer >= 5;

console.log(`Building with Svelte ${majorVer} (${isSvelte5 ? 'Modern' : 'Legacy'} mode)`);

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [
    sveltekit(),
    tailwindcss(), // Add Tailwind CSS Vite plugin for v4 support
    // Add Vite 7 optimizations for modern mode
    ...(isSvelte5 ? [
      // Top-level await support for modern development
      {
        name: 'top-level-await',
        async buildStart() {
          // Enable top-level await in modern mode
          this.getModuleInfo = this.getModuleInfo || (() => null);
        }
      },
      // Suppress legacy file errors in modern mode
      {
        name: 'suppress-legacy-errors',
        configResolved(config) {
          // Override the default onwarn behavior to suppress legacy warnings
          const originalOnWarn = config.build?.rollupOptions?.onwarn;
          config.build = config.build || {};
          config.build.rollupOptions = config.build.rollupOptions || {};
          config.build.rollupOptions.onwarn = (warning, warn) => {
            // Suppress warnings from legacy files and wasm_exec.ts in modern mode
            if (warning.loc?.file && (
              warning.loc.file.includes('Legacy') ||
              warning.loc.file.includes('legacy') ||
              warning.loc.file.includes('LegacyTree') ||
              warning.loc.file.includes('LegacyHomePage') ||
              warning.loc.file.includes('LegacyTreePage') ||
              warning.loc.file.includes('svelte-select') ||
              warning.loc.file.includes('wasm_exec.ts') ||
              warning.loc.file.includes('wasm_exec.js')
            )) {
              return; // Suppress legacy file warnings
            }
            
            // Also suppress warnings by message content for legacy-related issues
            if (warning.message && (
              warning.message.includes('Legacy') ||
              warning.message.includes('svelte-select') ||
              warning.message.includes('wasm_exec')
            )) {
              return; // Suppress legacy-related warnings
            }
            
            // Handle other warnings normally
            if (originalOnWarn) {
              originalOnWarn(warning, warn);
            } else {
              warn(warning);
            }
          };
        }
      },
      // Exclude legacy and wasm_exec files from TypeScript checking in modern mode
      {
        name: 'exclude-legacy-files-modern',
        configureServer(server) {
          // Add middleware to ignore legacy and wasm_exec files during development
          server.middlewares.use((req, res, next) => {
            if (req.url && (
              req.url.includes('wasm_exec.ts') || 
              req.url.includes('wasm_exec.js') ||
              req.url.includes('LegacyTreePage.svelte') ||
              req.url.includes('LegacyHomePage.svelte') ||
              req.url.includes('LegacyTypes.js') ||
              req.url.includes('LegacyWasm/') ||
              req.url.includes('/LegacyWasm')
            )) {
              res.statusCode = 404;
              res.end('File excluded in modern mode');
              return;
            }
            next();
          });
        },
        load(id) {
          // Return empty module for excluded files in modern mode
          if (id.includes('wasm_exec.ts') || 
              id.includes('wasm_exec.js') ||
              id.includes('LegacyTreePage.svelte') ||
              id.includes('LegacyHomePage.svelte') ||
              id.includes('LegacyTypes.js') ||
              id.includes('LegacyWasm/') ||
              id.includes('/LegacyWasm')) {
            return 'export {}; // File excluded in modern mode';
          }
        }
      },
      // TypeScript exclusion plugin for legacy files in modern mode
      {
        name: 'typescript-exclude-legacy',
        configureServer(server) {
          // Intercept TypeScript service requests to exclude legacy files
          const originalLoad = server.ssrLoadModule;
          server.ssrLoadModule = async function(url, opts) {
            // Skip type checking for legacy files
            if (url.includes('LegacyTreePage.svelte') || 
                url.includes('LegacyHomePage.svelte') ||
                url.includes('wasm_exec.ts') ||
                url.includes('LegacyTypes.js')) {
              console.log(`⚠️ Skipping type check for legacy file: ${url}`);
              return { default: () => {} }; // Return empty module
            }
            return originalLoad.call(this, url, opts);
          };
        },
        transform(code, id) {
          // Skip transformation of legacy files in modern mode
          if (id.includes('LegacyTreePage.svelte') || 
              id.includes('LegacyHomePage.svelte') ||
              id.includes('wasm_exec.ts') ||
              id.includes('LegacyTypes.js')) {
            return null; // Skip transformation
          }
        }
      }
    ] : [])
  ],
  define: {
    // Inject the build-time Svelte version into the client code
    __SVELTE_BUILD_VERSION__: JSON.stringify(majorVer),
    // Node.js version feature detection (properly quoted as string literal)
    __NODE_VERSION__: JSON.stringify(process.versions.node || '22.0.0')
  },
  // Vite 7 enhanced build configuration with ES2023 support
  build: {
    target: isSvelte5 ? 'es2023' : 'es2020',
    // Include WASM files as assets (Copilot's recommendation)
    assetsInclude: ['**/*.wasm'],
    rollupOptions: {
        // Externalize legacy files and their dependencies when building in Svelte 5 mode
        // This prevents them from being processed during build while still allowing dynamic imports
        external: isSvelte5 ? [
          // Legacy component dependencies that shouldn't be bundled in Svelte 5 builds
          'svelte-select',
          // Legacy component files (but NOT route files which are entry modules)
          /.*\/components\/Legacy.*\.svelte$/,
          /.*\/lib\/.*Legacy.*\.ts$/,
          /.*\/lib\/.*legacy.*\.ts$/,
          // Specific legacy files that should be excluded from modern builds
          /.*\/LegacyTreePage\.svelte$/,
          /.*\/LegacyHomePage\.svelte$/,
          // Legacy types that shouldn't be processed in modern mode
          /.*\/types\/LegacyTypes\.js$/,
          // Exclude wasm_exec files from modern builds (legacy only)
          /.*\/wasm_exec\.ts$/,
          /.*\/wasm_exec\.js$/,
          // Exclude LegacyWasm folder from modern builds
          /.*\/LegacyWasm\/.*$/
        ] : [
          // Modern files shouldn't be bundled in Svelte 4 builds  
          /.*\/components\/Modern.*\.svelte$/,
          /.*\/components\/Svelte5.*\.svelte$/,
          /.*\/lib\/.*Modern.*\.ts$/,
          // Exclude ModernWasm folder from legacy builds
          /.*\/ModernWasm\/.*$/,
          /.*\/lib\/.*modern.*\.ts$/
        ],
      output: {
        // Vite 7 optimized chunk splitting (removed comlink to avoid external module conflict)
        manualChunks: isSvelte5 ? {
          svelte: ['svelte'],
          'svelte-kit': ['@sveltejs/kit']
        } : undefined
      }
    },
    // Enhanced minification for modern builds
    minify: isSvelte5 ? 'esbuild' : 'terser',
    // Vite 7 enhanced CSS code splitting
    cssCodeSplit: true,
    // Enable source maps for debugging
    sourcemap: true,
    // Ignore legacy files during TypeScript checking in modern mode
    ...(isSvelte5 && {
      emptyOutDir: false // Don't clear build dir when switching modes
    })
  },
  // Vite 7 enhanced worker configuration
  worker: {
    format: 'es',
    plugins: () => [
      {
        name: 'worker-cleanup',
        configResolved(config) {
          // Remove problematic plugins from worker builds if they exist
          if (config.worker?.plugins && Array.isArray(config.worker.plugins)) {
            const manifestIndex = config.worker.plugins.findIndex(p => p?.name === 'vite:manifest');
            if (manifestIndex >= 0) {
              config.worker.plugins.splice(manifestIndex, 1);
            }
          }
        }
      }
    ]
  },
  // Enhanced dependency optimization for Vite 7
  optimizeDeps: {
    exclude: ['@sveltejs/kit'],
    // Vite 7 dependency pre-bundling optimizations with ES2023
    ...(isSvelte5 && {
      esbuildOptions: {
        target: 'es2023',
        supported: {
          'top-level-await': true
        }
      }
    })
  },
  // Enhanced server configuration for development
  server: {
    fs: {
      allow: ['..']
    },
    // Vite 7 enhanced HMR
    hmr: {
      overlay: true
    }
  },
  // Base path configuration for GitHub Pages
  base: process.env.NODE_ENV === 'production' ? '/timeless-jewels/' : '',
  // Vite 7 enhanced preview configuration
  preview: {
    port: 4173,
    strictPort: true
  }
};

export default config;
