// svelte.config.ts
import adapterStatic      from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit }      from '@sveltejs/kit/vite';
import Components         from 'unplugin-components/vite';
import { VitePWA }        from 'vite-plugin-pwa';
import { defineConfig }   from 'vite';
import * as path          from 'path';
import { fileURLToPath }  from 'url';
import type { Config }    from '@sveltejs/kit';

import { getCompilerOptions } from './src/lib/svelte5-compatibility.js';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import Inspect from 'vite-plugin-inspect';
import checker from 'vite-plugin-checker';
import wasm from 'vite-plugin-wasm';

//Plugins not installed yet(not really planning to add at moment)
//import compression from 'vite-plugin-compression';
//import { visualizer } from 'rollup-plugin-visualizer';
//import imagemin from 'vite-plugin-imagemin';
//import AutoImport from 'unplugin-auto-import/vite';
//import Components from 'unplugin-components/vite';
//import Icons from 'unplugin-icons/vite';

//Might add these later
//import UnoCSS from 'unocss/vite';
//import progress from 'vite-plugin-progress';
//import critical from 'rollup-plugin-critical';

const __dirname          = path.dirname(fileURLToPath(import.meta.url));
const postcssConfigPath = path.join(__dirname, 'postcss.config.cjs');

/** @type {Config} */
const config: Config = {
  preprocess: vitePreprocess({
    postcss: { configFilePath: postcssConfigPath },
    typescript: {
      tsconfigFile: './tsconfig.json',
      compilerOptions: { verbatimModuleSyntax: false, skipLibCheck: true }
    }
  }),

  compilerOptions: {
    strict:     true,
    dev:        process.env.NODE_ENV !== 'production',
    hydratable: true
  },

  experimental: { runes: true },

  kit: {
    adapter: adapterStatic({
      pages:      'build',
      assets:     'build',
      fallback:   '404.html',
      precompress:false,
      strict:     true
    }),

    ssr: {
			noExternal: ['@wasmer/sdk', '@wasmer/wasi']
    },

    files: {
      hooks:       'src/hooks',
      routes:      'src/routes-modern',
      appTemplate: 'src/app-modern.html',
      lib:         'src/lib',
      params:      'src/params'
    },

    paths: {
      base:     process.env.NODE_ENV === 'production' ? '/timeless-jewels' : '',
      relative: false// Force absolute paths for GitHub Pages compatibility
    },
    // SPA configuration for client-side routing
    prerender: {
      entries:         ['/'],// Explicitly prerender the root page to generate index.html
      crawl:           true,// Enable automatic page discovery for linked pages
      handleHttpError: 'warn',
      handleMissingId: 'warn'
    },

    csp: {
      mode: 'auto',
      directives: {
        'script-src': ['self', 'unsafe-inline', 'unsafe-eval'],
        'worker-src': ['self', 'blob:'],
        'object-src': ['none']
      }
    },

    alias: {
      'svelte/src/internal/server': path.resolve(
        __dirname,
        'node_modules/svelte/ssr/index.js'
      ),
      $lib:    'src/lib',
      '$lib/*':'src/lib/*',
      $app:    '.svelte-kit/types/app',
      '$app/*':'.svelte-kit/types/app/*',
      $routes: 'src/routes-modern',
      '$routes/*':'src/routes-modern/*'
    },

    typescript: {
      config: (tsconfig) => tsconfig
    },
  
    vite: defineConfig({
      resolve: {
        // ensure Svelte 5 SSR paths
        alias: {
          'svelte/src/internal/server': path.resolve(
            __dirname,
            'node_modules/svelte/ssr/index.js'
          )
        }
      },
  
      plugins: [
        // core SvelteKit integration
        sveltekit(),
  
        // WASM import support
        wasm(),
  
        // Tailwind CSS via Vite
        tailwindcss(),
  
        // plugin inspector for troubleshooting
        Inspect(),
  
        // type + lint checking in dev overlay
        checker({ typescript: true, svelte: true }),
  
        // full PWA support (offline + manifest + caching)
        VitePWA({
          registerType: 'autoUpdate',
					//PWA dev mode
					devOptions: { enabled: process.env.NODE_ENV !== 'production' },
          includeAssets: [
            'favicon.png',
            'robots.txt',
            'calculator.wasm',
            'debug-wasm.js'
          ],
          manifest: {
            name:             'Timeless Jewel Generator',
            short_name:       'JewelGen',
            description:      'Timeless Jewel calculator with passive tree view',
            start_url:        '/timeless-jewels/',
            display:          'standalone',
            background_color: '#ffffff',
            theme_color:      '#3b82f6',
            icons: [{ src: 'favicon.png', sizes: '192x192', type: 'image/png' }]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html}', '**/*.wasm', 'favicon.png'],
            runtimeCaching: [
              {
                urlPattern: /\.(?:wasm)$/,
                handler:    'CacheFirst',
                options: {
                  cacheName:  'wasm-cache',
                  //Expires in 7 days
                  expiration: { maxEntries: 10, maxAgeSeconds: 7 * 24 * 3600 },
                  cacheKeyWillBeUsed: async ({ request }) => `${request.url}?cache-headers=wasm`
                }
              },
              {
                urlPattern: /\.(?:js|css|html)$/,
                handler:    'StaleWhileRevalidate',
                options: {
                  cacheName:  'static-resources',
                  //Expires in one day
                  expiration: { maxEntries: 50, maxAgeSeconds: 24 * 3600 }
                }
              },
              {
                urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico)$/,
                handler:    'CacheFirst',
                options: {
                  cacheName:  'images-cache',
                  //Expires in 30 days
                  expiration: { maxEntries: 20, maxAgeSeconds: 30 * 24 * 3600 }
                }
              }
            ]          }
        }),
        // allow top-level await in modules
        {
          name: 'top-level-await',
          async buildStart() {
            this.getModuleInfo = this.getModuleInfo || (() => null);
          }
        },
  
		    // Performance & Analysis(not using at moment might use later)
		    //compression({ algorithm: 'brotliCompress' }),
		    //visualizer({ open: true, filename: 'build/stats.html' }),
		    // Asset Optimization(don't need yet)
		    //imagemin(),

		    //Might use these 2 but not installed yet
		    //UnoCSS(),
		    //progress(),

        // auto-register your Svelte components
        Components({ extensions: ['svelte'] })
      ],
  
      // dependencies that must not be pre-bundled
      optimizeDeps: {
        exclude: ['@wasmer/sdk', '@wasmer/wasi'],
        include: []
      },
  
      // inject your Node.js version
      define: {
        __NODE_VERSION__: JSON.stringify(process.versions.node || '24.4.1')
      },
  
      // static asset directory
      publicDir: 'static',
  
      // extra asset globs
      assetsInclude: [
        '**/*.wasm','**/*.js','**/*.png','**/*.jpg','**/*.jpeg',
        '**/*.gif','**/*.svg','**/*.ico','**/*.pdf','**/*.html','.nojekyll'
      ],
  
      server: {
        fs: { allow: ['..'] },
        hmr: { overlay: true },
        headers: {
          'Cross-Origin-Embedder-Policy':  'require-corp',
          'Cross-Origin-Opener-Policy':    'same-origin',
          'Cross-Origin-Resource-Policy':  'cross-origin'
        },
        middlewares: [
          (req, res, next) => {
            if (!req.url) return next();
            if (req.url.endsWith('.wasm')) {
              res.setHeader('Content-Type','application/wasm');
              res.setHeader('Cross-Origin-Resource-Policy','cross-origin');
            } else if (req.url.includes('.wasm?import&url')) {
              res.setHeader('Content-Type','text/javascript');
              res.setHeader('Cross-Origin-Resource-Policy','cross-origin');
            }
            next();
          }
        ]
      },
  
      build: {
        target: 'es2023',
        rollupOptions: {
          output: {
            manualChunks: { svelte: ['svelte'], 'svelte-kit': ['@sveltejs/kit'] }
          }
        },
        minify:        'esbuild',
        cssCodeSplit:  true,
        sourcemap:     'inline',
        emptyOutDir:   false,
        // Ensure workers also compile under strict Svelte 5 syntax
        worker: {
          format: 'es',
          plugins: [
            svelte({
              compilerOptions: { strict: true }
            })
          ],
          rollupOptions: {
            output: {
              entryFileNames:       '_app/immutable/workers/[name]-[hash].js',
              chunkFileNames:       '_app/immutable/workers/chunks/[name]-[hash].js',
              assetFileNames:       '_app/immutable/workers/assets/[name]-[hash][extname]',
              inlineDynamicImports: false,
              exports:              'named'
            }
          }
        }
      },
  
      // path your site lives at (GitHub Pages, etc.)
      base: process.env.NODE_ENV === 'production' ? '/timeless-jewels/' : '',
  
      // preview server overrides
      preview: {
        port:       4173,
        strictPort: true
      }
    }
  },

  dynamicCompileOptions: ({ filename }) => getCompilerOptions(filename)
};

export default config;