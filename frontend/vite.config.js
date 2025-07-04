import fs   from 'fs';
import path from 'path';
import { sveltekit } from '@sveltejs/kit/vite';
import { VERSION as SVELTE_VER } from 'svelte/compiler';
import tailwindcss from '@tailwindcss/vite';

const majorVer = +SVELTE_VER.split('.')[0];
const isSvelte5 = majorVer >= 5;

// no __dirname in ESM by default!
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
                url.includes('wasm_exec.js') ||
                url.includes('wasm_exec.ts') ||
                url.includes('Legacy') ||
                url.includes('legacy') ||
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
              id.includes('wasm_exec.js') ||
              id.includes('wasm_exec.ts') ||
              id.includes('Legacy') ||
              id.includes('legacy') ||
              id.includes('LegacyTypes.js')) {
            return null; // Skip transformation
          }
        }
      },
      // Exclude static wasm_exec.js file from modern builds - runs BEFORE SvelteKit
      {
        name: 'exclude-static-wasm-exec-modern',
        enforce: 'pre', // Run before SvelteKit's static file copying
        configureServer(server) {
          // Block access to wasm_exec.js in dev mode
          server.middlewares.use((req, res, next) => {
            if (req.url === '/wasm_exec.js' || req.url === '/timeless-jewels/wasm_exec.js') {
              res.statusCode = 404;
              res.end('wasm_exec.js excluded in modern mode');
              return;
            }
            next();
          });
        },
        load(id) {
          // Intercept wasm_exec.js loading before SvelteKit processes it
          if (id.includes('static/wasm_exec.js') || id.endsWith('wasm_exec.js')) {
            console.log('� Intercepted wasm_exec.js load in modern mode');
            return 'export {}; // wasm_exec.js excluded from modern build';
          }
        },
        resolveId(id, importer) {
          // Prevent resolution of wasm_exec.js in modern mode
          if (id.includes('wasm_exec.js')) {
            console.log('🚫 Blocked wasm_exec.js resolution in modern mode');
            return null; // Don't resolve, effectively excluding it
          }
        },
        generateBundle(options, bundle) {
          // Remove wasm_exec.js from the output bundle in modern mode
          if (bundle['wasm_exec.js']) {
            delete bundle['wasm_exec.js'];
            console.log('🗑️ Excluded wasm_exec.js from modern build bundle');
          }
        }
      }
    ] : 
    [
      // copies wasm_exec.js into the root of `build/`
      {
        name: 'copy-wasm-exec-legacy',
        apply: 'build',       // only on `vite build`
        enforce: 'post',      // after Rollup finishes bundling
        generateBundle(_, bundle) {
          // read your moved file
          const src = path.resolve(__dirname,'src/lib/LegacyWasm/wasm_exec.js');
          // emit it as a top-level asset
          this.emitFile({type: 'asset',fileName: 'wasm_exec.js',source: fs.readFileSync(src),});
        }
      }
    ])
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
          // Modern select is only for Svelte 5+
          /.*\/components\/ModernSelect.svelte$/,
          // Modern component files (but NOT route files which are entry modules)
          /.*\/components\/Modern.*\.svelte$/,
          /.*\/lib\/.*Modern.*\.ts$/,
          /.*\/lib\/.*modern.*\.ts$/,
          // Specific modern files that should be excluded from modern builds
          /.*\/ModernTreePage\.svelte$/,
          /.*\/ModernHomePage\.svelte$/,
          // Modern types that shouldn't be processed in modern mode
          /.*\/types\/ModernTypes\.js$/,
          // Exclude ModernWasm folder from modern builds
          /.*\/ModernWasm\/.*$/
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
    }),
    // Enhanced worker configuration for optimal WASM and modern/legacy separation
    worker: {
      format: 'es', // Use ES modules for better tree-shaking and modern features
      plugins: () => [
        // Apply the same legacy/modern filtering to workers
        ...(isSvelte5 ? [
          // Worker-specific legacy file exclusion for modern mode
          {
            name: 'worker-exclude-legacy-modern',
            load(id) {
              // Block legacy files from being imported in workers during modern builds
              if (id.includes('wasm_exec.ts') || 
                  id.includes('wasm_exec.js') ||
                  id.includes('Legacy') ||
                  id.includes('legacy') ||
                  id.includes('LegacyWasm/') ||
                  id.includes('/LegacyWasm')) {
                return 'export {}; // Legacy file excluded from modern worker build';
              }
            },
            transform(code, id) {
              // Skip transformation of legacy files in workers
              if (id.includes('Legacy') || 
                  id.includes('legacy') ||
                  id.includes('wasm_exec')) {
                return null;
              }
            }
          }
        ] : [
          // Worker-specific modern file exclusion for legacy mode
          {
            name: 'worker-exclude-modern-legacy',
            load(id) {
              // Block modern files from being imported in workers during legacy builds
              if (id.includes('ModernWasm/') ||
                  id.includes('/ModernWasm') ||
                  id.includes('Modern') ||
                  id.includes('modern')) {
                return 'export {}; // Modern file excluded from legacy worker build';
              }
            }
          }
        ])
      ],
      rollupOptions: {
        // Worker-specific externalization - more permissive than main build
        external: isSvelte5 ? [
          // In modern mode, exclude legacy dependencies from workers
          'svelte-select',
          /.*\/Legacy.*\.ts$/,
          /.*\/legacy.*\.ts$/,
          /.*wasm_exec\.ts$/,
          /.*wasm_exec\.js$/,
          /.*\/LegacyWasm\/.*$/
        ] : [
          // In legacy mode, exclude modern dependencies from workers
          /.*\/Modern.*\.ts$/,
          /.*\/modern.*\.ts$/,
          /.*\/ModernWasm\/.*$/
        ],
        output: {
          // Optimize worker chunk naming and placement
          entryFileNames: '_app/immutable/workers/[name]-[hash].js',
          chunkFileNames: '_app/immutable/workers/chunks/[name]-[hash].js',
          assetFileNames: '_app/immutable/workers/assets/[name]-[hash][extname]',
          // Inline dynamic imports for better worker performance
          inlineDynamicImports: false, // Keep separate for better caching
          // Ensure proper exports for worker communication
          exports: 'named'
        }
      }
    }
  },
  // Static file configuration - exclude wasm_exec.js in modern mode
  publicDir: 'static',
  assetsInclude: isSvelte5 ? 
    // Modern mode: exclude wasm_exec.js but include WASM files
    ['**/*.wasm', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.ico', '**/*.pdf', '**/*.html', '.nojekyll'] :
    // Legacy mode: include all assets including wasm_exec.js
    ['**/*.wasm', '**/*.js', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.ico', '**/*.pdf', '**/*.html', '.nojekyll'],
  // Enhanced server configuration for development
  server: {
    fs: {
      allow: ['..']
    },
    // Vite 7 enhanced HMR
    hmr: {
      overlay: true
    },
    // Add WASM MIME type support for proper WASM loading
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    },
    // Custom middleware for WASM MIME type and import handling
    middlewares: [
      (req, res, next) => {
        if (req.url) {
          // Handle .wasm files with proper MIME type
          if (req.url.endsWith('.wasm')) {
            res.setHeader('Content-Type', 'application/wasm');
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
          }
          // Handle WASM imports with ?import&url query
          else if (req.url.includes('.wasm?import&url')) {
            res.setHeader('Content-Type', 'text/javascript');
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
          }
        }
        next();
      }
    ]
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
