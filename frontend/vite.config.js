import { sveltekit } from '@sveltejs/kit/vite';
import fs from 'fs';
import path from 'path';

// Read version configuration
function getCurrentSvelteVersion() {
  try {
    const versionConfig = fs.readFileSync(path.resolve('./version.ini'), 'utf8');
    const versionMatch = versionConfig.match(/version\s*=\s*(\d+)/);
    return versionMatch ? parseInt(versionMatch[1]) : 5;
  } catch {
    return 5; // Default to Svelte 5
  }
}

const currentVersion = getCurrentSvelteVersion();
console.log(`Building with Svelte ${currentVersion}`);

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  define: {
    // Inject the build-time Svelte version into the client code
    __SVELTE_BUILD_VERSION__: currentVersion
  },
  build: {
    rollupOptions: {
      external: currentVersion >= 5 ? [
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
