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
    __SVELTE_BUILD_VERSION__: majorVer,
    // Node.js 22 feature detection
    __NODE_VERSION__: process.versions.node
  },
  // Vite 7 enhanced build configuration
  build: {
    target: isSvelte5 ? 'es2022' : 'es2020',
    rollupOptions: {
      external: isSvelte5 ? [
        // Exclude Legacy files when building in modern mode (Svelte 5)
        /.*Legacy.*\.svelte$/
      ] : [
        // Exclude Modern files when building in legacy mode (Svelte 4)
        /.*Modern.*\.svelte$/,
        /.*Svelte5.*\.svelte$/
      ],
      output: {
        // Vite 7 optimized chunk splitting
        manualChunks: isSvelte5 ? {
          svelte: ['svelte'],
          'svelte-kit': ['@sveltejs/kit'],
          wasm: ['comlink']
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
    include: ['comlink'],
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
};

export default config;
