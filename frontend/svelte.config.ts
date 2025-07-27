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

  dynamicCompileOptions: ({ filename }) => getCompilerOptions(filename)
};

export default config;