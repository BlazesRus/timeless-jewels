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

// Choose adapter - use static adapter for both modes to match gh-pages structure
// Svelte 5: SPA mode with client-side routing, Svelte 4: traditional static
const adapter = isSvelte5 
  ? adapterStatic({ 
      pages: 'build', 
      assets: 'build', 
      fallback: '404.html',         // Critical for SPA mode on GitHub Pages
      precompress: false,           // Skip compression for simplicity
      strict: false                 // Allow dynamic imports and flexible routes
    })
  : adapterStatic({ 
      pages: 'build', 
      assets: 'build', 
      fallback: '404.html'          // Use same fallback for consistency
    });

// unify preprocess with a legacy flag
const preprocess = vitePreprocess({
  postcss: { configFilePath: postcssConfigPath },
  typescript: {
    tsconfigFile: './tsconfig.json',
    compilerOptions: { verbatimModuleSyntax: false, skipLibCheck: true }
  },
  // in Svelte4-land, support `<script>` without lang=ts
  ...(isSvelte5 ? {} : { script: true })
});

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess,
  kit: {
    adapter,
    // Use different app.html files and routes folders for modern vs legacy mode
    files: {
      appTemplate: isSvelte5
        ? 'src/app-modern.html'
        : 'src/app-legacy.html',
      routes: isSvelte5
        ? 'src/routes-modern'
        : 'src/routes-legacy'
    },
    paths: { 
      base: process.env.NODE_ENV === 'production' ? '/timeless-jewels' : '',
      relative: false  // Force absolute paths for GitHub Pages compatibility
    },
    // SPA configuration for client-side routing
    ...(isSvelte5 && {
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
      }
    }),
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
      // Exclude legacy files from type checking in modern mode
      //and exclude modern files from type checking in legacy
      config: (tsconfig) => {
        if (isSvelte5) {
          tsconfig.exclude?.push('**/Legacy*.{svelte,ts,js}', '**/*legacy*/**');
        } else {
          tsconfig.exclude?.push('**/Modern*.{svelte,ts,js}', '**/*modern*/**');
        }
        return tsconfig;
      }
    }
  },
  // Enable Svelte 5 runes experimental feature
  experimental: {
    runes: isSvelte5 // Enable runes only for Svelte 5
  },
  compilerOptions: {
    // Additional compiler options for better development experience
    dev: process.env.NODE_ENV !== 'production',
    hydratable: true
  },
  dynamicCompileOptions: ({ filename }) => getCompilerOptions(filename)
};