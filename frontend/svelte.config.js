// svelte.config.js
import adapterAuto from '@sveltejs/adapter-auto';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { VERSION as SVELTE_VER } from 'svelte/compiler';
import { getCompilerOptions } from './src/lib/svelte5-compatibility.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const postcssConfigPath = join(__dirname, 'postcss.config.cjs');

const majorVer = +SVELTE_VER.split('.')[0];
const isSvelte5 = majorVer >= 5;

// Choose adapter - use static adapter for SPA mode with client-side routing
const adapter = adapterStatic({ 
  pages: 'build', 
  assets: 'build', 
  fallback: '404.html',         // Critical for SPA mode on GitHub Pages
  precompress: false,           // Skip compression for simplicity
  strict: false                 // Allow dynamic imports and flexible routes
});

// Modern preprocess with TypeScript support
const preprocess = vitePreprocess({
  postcss: { configFilePath: postcssConfigPath },
  typescript: {
    tsconfigFile: './tsconfig.json',
    compilerOptions: { verbatimModuleSyntax: false, skipLibCheck: true }
  }
});

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess,
  kit: {
    adapter,
    // Use modern app.html and routes folder
    files: {
      appTemplate: 'src/app-modern.html',
      routes: 'src/routes-modern'
    },
    paths: { 
      base: process.env.NODE_ENV === 'production' ? '/timeless-jewels' : '',
      relative: false  // Force absolute paths for GitHub Pages compatibility
    },
    // SPA configuration for client-side routing
    prerender: {
      handleHttpError: 'warn',
      handleMissingId: 'warn',
      entries: ['/'],             // Explicitly prerender the root page to generate index.html
      crawl: true                 // Enable automatic page discovery for linked pages
    },
    csp: {
      mode: 'auto',
      directives: {
        'script-src': ['self', 'unsafe-inline', 'unsafe-eval'], // Allow WASM
        'worker-src': ['self', 'blob:'],
        'object-src': ['none']
      }
    },
    // Vite plugins no longer supported by SvelteKit v2+
    alias: {
      $lib:   'src/lib',
      '$lib/*': 'src/lib/*',
      $app:   '.svelte-kit/types/app',
      '$app/*': '.svelte-kit/types/app/*',
      $routes:'src/routes',
      '$routes/*': 'src/routes/*'
    },
    typescript: {
      // Modern TypeScript configuration
      config: (tsconfig) => {
        tsconfig.exclude?.push('**/Legacy*.{svelte,ts,js}', '**/*legacy*/**');
        return tsconfig;
      }
    }
  },
  // Enable Svelte 5 runes
  experimental: {
    runes: true // Enable runes for Svelte 5
  },
  compilerOptions: {
    // Additional compiler options for better development experience
    dev: process.env.NODE_ENV !== 'production',
    hydratable: true
  },
  dynamicCompileOptions: ({ filename }) => getCompilerOptions(filename)
};