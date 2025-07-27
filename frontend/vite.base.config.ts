import path from 'path';
import { defineConfig } from 'vite';
import ssr from 'vite-plugin-ssr/plugin';
import ssrSvelte from 'vite-plugin-ssr-svelte';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import wasm from 'vite-plugin-wasm';
import tailwindcss from '@tailwindcss/vite';
import Inspect from 'vite-plugin-inspect';
import checker from 'vite-plugin-checker';
import { VitePWA } from 'vite-plugin-pwa';

const isProduction = process.env.NODE_ENV === 'production';
const isGhPages = process.env.BUILD_TARGET === 'ghpages';

export default defineConfig({
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, 'src/lib'),
      '$lib/*': path.resolve(__dirname, 'src/lib/*'),
      $routes: path.resolve(__dirname, 'src/routes-modern'),
      '$routes/*': path.resolve(__dirname, 'src/routes-modern/*'),
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

  plugins: [
    // 1) CSP injection
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
        );
      }
    },

    // 2) SSR + Prerender
    ssr({
      pagesDir: 'src/routes-modern',
      noExternal: ['@wasmer/sdk', '@wasmer/wasi'],
      prerender: {
        entries: ['/'],
        crawlLinks: true,
        onPrerenderError: 'warn'
      }
    }),

    // 3) Svelte SSR + client hydration
    ssrSvelte(),

    // 4) Standard Svelte plugin
    svelte(),

    // 5) Utility plugins
    wasm(),
    tailwindcss(),
    Inspect(),
    checker({
      typescript: { tsconfigPath: './tsconfig.json' },
      svelte: true
    }),

    // 6) PWA (start_url adjusts automatically)
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: !isProduction },
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
        start_url: isGhPages ? '/timeless-jewels/' : './',
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
              expiration: { maxEntries: 10, maxAgeSeconds: 7 * 24 * 3600 },
              cacheKeyWillBeUsed: async ({ request }) =>
                `${request.url}?cache-headers=wasm`
            }
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

    // 7) Top-level await stub
    {
      name: 'top-level-await',
      async buildStart() {
        this.getModuleInfo = this.getModuleInfo || (() => null);
      }
    }
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
  }
});
