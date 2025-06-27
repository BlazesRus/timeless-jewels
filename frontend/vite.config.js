import { sveltekit } from '@sveltejs/kit/vite';
import { VERSION as SVELTE_VER } from 'svelte/compiler';

const majorVer = +SVELTE_VER.split('.')[0];
const isSvelte5 = majorVer >= 5;

console.log(`Building with Svelte ${majorVer} (${isSvelte5 ? 'Modern' : 'Legacy'} mode)`);

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [
    sveltekit(),
    // Add Vite 7 optimizations for modern mode
    ...(isSvelte5 ? [
      // Top-level await support for modern development
      {
        name: 'top-level-await',
        async buildStart() {
          // Enable top-level await in modern mode
          this.getModuleInfo = this.getModuleInfo || (() => null);
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
  // Vite 7 enhanced build configuration
  build: {
    target: isSvelte5 ? 'es2022' : 'es2020',      rollupOptions: {
        // Externalize legacy files and their dependencies when building in Svelte 5 mode
        // This prevents them from being processed during build while still allowing dynamic imports
        external: isSvelte5 ? [
          // Legacy component dependencies that shouldn't be bundled in Svelte 5 builds
          'svelte-select',
          // Legacy files (but allow dynamic imports to handle missing files gracefully)
          /.*Legacy.*\.svelte$/
        ] : [
          // Modern files shouldn't be bundled in Svelte 4 builds  
          /.*Modern.*\.svelte$/,
          /.*Svelte5.*\.svelte$/
        ],
      output: {
        // Vite 7 optimized chunk splitting (remove comlink to avoid external module error)
        manualChunks: isSvelte5 ? {
          svelte: ['svelte'],
          'svelte-kit': ['@sveltejs/kit']
        } : undefined
      }
    },
    // Enhanced minification for modern builds
    minify: isSvelte5 ? 'esbuild' : 'terser',
    // Vite 7 enhanced CSS code splitting
    cssCodeSplit: true
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
    // Vite 7 dependency pre-bundling optimizations
    ...(isSvelte5 && {
      esbuildOptions: {
        target: 'es2022',
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
  // Vite 7 enhanced preview configuration
  preview: {
    port: 4173,
    strictPort: true
  }
};

export default config;
