import { sveltekit } from '@sveltejs/kit/vite';
import { VERSION as SVELTE_VER } from 'svelte/compiler';

const majorVer = +SVELTE_VER.split('.')[0];
const isSvelte5 = majorVer >= 5;

console.log(`Building with Svelte ${majorVer} (${isSvelte5 ? 'Modern' : 'Legacy'} mode)`);

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  define: {
    // Inject the build-time Svelte version into the client code
    __SVELTE_BUILD_VERSION__: majorVer
  },
  build: {
    rollupOptions: {
      external: isSvelte5 ? [
        // Exclude Legacy files when building in modern mode (Svelte 5)
        // These will be handled gracefully at runtime
        /.*Legacy.*\.svelte$/
      ] : [
        // Exclude Modern files when building in legacy mode (Svelte 4)
        /.*Modern.*\.svelte$/,
        /.*Svelte5.*\.svelte$/
      ]
    }
  },
  // Vite 7 worker configuration
  worker: {
    plugins: () => [
      // Clean worker plugin configuration for Vite 7
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
  // Optimized dependency handling for Vite 7
  optimizeDeps: {
    include: ['comlink'],
    exclude: ['@sveltejs/kit']
  },
  // Enhanced server configuration for development
  server: {
    fs: {
      allow: ['..']
    }
  }
};

export default config;
