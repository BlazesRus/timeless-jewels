import { sveltekit } from '@sveltejs/kit/vite';

// Since we're using a .js config file, we need to import the plugin differently
// or convert this to a .ts file. For now, let's use a simpler approach
/** @type {import('vite').UserConfig} */  
const config = {
  plugins: [sveltekit()],
  define: {
    // Inject Svelte version at build time
    __SVELTE_VERSION__: JSON.stringify(process.env.npm_package_devDependencies_svelte || '4.2.0')
  },
  // Updated worker config for Vite 6
  worker: {
    plugins: () => [
      {
        name: 'remove-manifest',
        configResolved(c) {
          const manifestPlugin = c.worker.plugins.findIndex((p) => p.name === 'vite:manifest');
          if (manifestPlugin >= 0) c.worker.plugins.splice(manifestPlugin, 1);
          const ssrManifestPlugin = c.worker.plugins.findIndex((p) => p.name === 'vite:ssr-manifest');
          if (ssrManifestPlugin >= 0) c.plugins.splice(ssrManifestPlugin, 1);
        }
      }
    ]
  }
};

export default config;
