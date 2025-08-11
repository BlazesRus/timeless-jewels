import path from 'path';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import vike from 'vike/plugin';
import { vikeSvelte } from '@blazesrus/vike-svelte';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import wasm from 'vite-plugin-wasm';
import tailwindcss from '@tailwindcss/vite';
import Inspect from 'vite-plugin-inspect';
import checker from 'vite-plugin-checker';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { builtinModules } from 'module';

export default defineConfig(({ mode }) => {
  // BUILD_TARGET=ghpages for GH Pages, otherwise default to app+electron
  const target = process.env.BUILD_TARGET
  const isGhPages = target === 'ghpages'

  return {
    root: '.',
    base: isGhPages ? '/timeless-jewels/' : undefined,

    resolve: {
      alias: {
        $lib: path.resolve(__dirname, 'src/lib'),
        '$lib/*': path.resolve(__dirname, 'src/lib/*'),
        $routes: path.resolve(__dirname, 'src/routes'),
        '$routes/*': path.resolve(__dirname, 'src/routes/*'),
        'svelte/src/internal/server': path.resolve(
          __dirname,
          'node_modules/svelte/ssr/index.js'
        )
      }
    },

    publicDir: 'static',

    assetsInclude: [
      '**/*.wasm',
      '**/*.js',
      '**/*.{png,jpg,jpeg,gif,svg,ico}',
      '**/*.pdf',
      '**/*.html',
      '.nojekyll'
    ],

    optimizeDeps: {
      exclude: ['@wasmer/sdk', '@wasmer/wasi']
    },

    define: {
      __NODE_VERSION__: JSON.stringify(process.versions.node || '24.4.1')
    },

    server: {
      fs: { allow: ['..'] },
      hmr: { overlay: true },
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Resource-Policy': 'cross-origin'
      }
    },

    preview: {
      port: 4173,
      strictPort: true
    },

    build: {
      outDir: isGhPages ? 'dist/ghpages' : 'dist/ElectronApp',
      emptyOutDir: isGhPages
    },

    plugins: [
      // copy your icon folder to dist/ElectronApp/icons
      viteStaticCopy({
        targets: [
          {
            src: 'electron/assets/icons/*',
            dest: 'icons'
          }
        ]
      }),
      // 1) CSP Injection
      {
        name: 'html-transform-csp',
        transformIndexHtml(html) {
          return html.replace(
            '<head>',
            `<head>
  <meta http-equiv="Content-Security-Policy" content="
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    worker-src 'self' blob:;
    object-src 'none';
  ">
`
          )
        }
      },

      // 2) SSR + Prerender via Vike
      vike({
        pagesDir: 'src/routes',
        noExternal: ['@wasmer/sdk', '@wasmer/wasi'],
        prerender: {
          entries: ['/'],
          crawlLinks: true,
          onPrerenderError: 'warn'
        }
      }),

      // 3) Svelte SSR + client hydration
      vikeSvelte(),

      // 4) Svelte plugin
      svelte({ inspector: true }),

      // 5) Wasm + Tailwind + Inspect
      wasm(),
      tailwindcss(),
      Inspect(),

      // 6) Type checking
      checker({ typescript: { tsconfigPath: './tsconfig.json' } }),

      // 7) PWA for GitHub Pages only
      isGhPages &&
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: [
            'favicon.png',
            'robots.txt',
            'calculator.wasm',
            'debug-wasm.js'
          ],
          manifest: {
            name: 'Timeless Jewel Generator',
            short_name: 'JewelGen',
            description: 'Timeless Jewel calculator with passive tree view',
            start_url: '/timeless-jewels/',
            display: 'standalone',
            background_color: '#ffffff',
            theme_color: '#3b82f6',
            icons: [{ src: 'favicon.png', sizes: '192x192', type: 'image/png' }]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html}', '**/*.wasm', 'favicon.png'],
            runtimeCaching: [
              {
                urlPattern: /\.(?:wasm)$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'wasm-cache',
                  expiration: { maxEntries: 10, maxAgeSeconds: 7 * 24 * 3600 }
                },
                plugins: [
                  {
                    cacheKeyWillBeUsed: async ({ request }) =>
                      `${request.url}?cache-headers=wasm`
                  }
                ]
              },
              {
                urlPattern: /\.(?:js|css|html)$/,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'static-resources',
                  expiration: { maxEntries: 50, maxAgeSeconds: 24 * 3600 }
                }
              },
              {
                urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico)$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'images-cache',
                  expiration: { maxEntries: 20, maxAgeSeconds: 30 * 24 * 3600 }
                }
              }
            ]
          }
        }),

      // 8) Electron main + preload build (only for non-ghpages)
      !isGhPages &&
        electron({
          main: {
            entry: 'electron/main.ts',
            vite: {
              build: {
                target: `node${process.versions.node}`
                outDir: 'dist/ElectronApp/main', emptyOutDir: true,
                sourcemap: true,
                commonjsOptions: {
                  transformMixedEsModules: true,
                  include: [/electron-store/, /electron-log/]
                },
                rollupOptions: {
                  external: [
                    ...builtinModules,
                    'electron',
                    'electron-updater',
                    'electron-store',
                    'electron-log'
                  ],
                  output: { format: 'cjs'/*← Electron’s default loader expects CommonJS*/ }
                }
              }
            }
          },
          preload: {
            input: 'electron/preload.ts',
            vite: {
              build: {
                target: `node${process.versions.node}`
                outDir: 'dist/ElectronApp/preload', emptyOutDir: true,
                sourcemap: true,
                commonjsOptions: {
                  transformMixedEsModules: true,
                  include: [/electron-store/, /electron-log/]
                },
                rollupOptions: {
                  external: [...builtinModules, 'electron']
                  output: { format: 'cjs'/*← Electron’s default loader expects CommonJS*/ }
                }
              }
            }
          },
          builderOptions: {
            productName: 'Timeless Jewel Generator',
            directories: { buildResources: 'electron/assets/icons' },
            win: { icon: 'icon.ico' },
            mac: { icon: 'icon.icns' },
            linux: { icon: 'tray-icon.png' }
          },
          onstart(options) {
            options.spawnProcess();// dev: launch Electron
            options.reload();      // dev: reload renderer on HMR
          }
        })
    ].filter(Boolean)
  }
})
