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

// Since we're using a .js config file, we need to import the plugin differently
// or convert this to a .ts file. For now, let's use a simpler approach
/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
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
  // Updated worker config for Vite 6
  worker: {
    plugins: () => [
      {
        name: 'remove-manifest',
        configResolved(c) {
          if (c.worker && c.worker.plugins && Array.isArray(c.worker.plugins)) {
            const manifestPlugin = c.worker.plugins.findIndex((p) => p && p.name === 'vite:manifest');
            if (manifestPlugin >= 0) c.worker.plugins.splice(manifestPlugin, 1);
          }
          if (c.plugins && Array.isArray(c.plugins)) {
            const ssrManifestPlugin = c.plugins.findIndex((p) => p && p.name === 'vite:ssr-manifest');
            if (ssrManifestPlugin >= 0) c.plugins.splice(ssrManifestPlugin, 1);
          }
        }
      }
    ]
  }
};

export default config;
