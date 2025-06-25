import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getCompilerOptions } from './src/lib/svelte5-compatibility.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Detect current Svelte version from package.json
 */
function getCurrentSvelteVersion() {
  try {
    const packageJsonPath = join(__dirname, 'package.json');
    if (!existsSync(packageJsonPath)) return '5'; // Default to Svelte 5

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const svelteVersion = packageJson.devDependencies?.svelte;

    if (!svelteVersion) return '5';

    // Extract major version
    const match = svelteVersion.match(/(\^|~)?(\d+)/);
    return match ? match[2] : '5';
  } catch (error) {
    console.warn('Could not detect Svelte version, defaulting to 5:', error.message);
    return '5';
  }
}

/**
 * Get PostCSS config path based on Svelte version
 */
function getPostCSSConfigPath(svelteVersion) {
  return svelteVersion === '5' ? join(__dirname, 'PostCSSSettings', 'postcss.modern.config.cjs') : join(__dirname, 'PostCSSSettings', 'postcss.legacy.config.cjs');
}

// Detect current Svelte version
const currentSvelteVersion = getCurrentSvelteVersion();
const postcssConfigPath = getPostCSSConfigPath(currentSvelteVersion);

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess({
    postcss: {
      configFilePath: postcssConfigPath
    },    typescript: {
      compilerOptions: {
        verbatimModuleSyntax: false,
        skipLibCheck: true
      },
      tsconfigFile: './tsconfig.json'
    }
  }),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html' //,
      //precompress: false
    }),
    paths: {
      base: '/timeless-jewels'
    },
    alias: {
      $lib: 'src/lib',
      '$lib/*': 'src/lib/*',
      $app: '.svelte-kit/types/app',
      '$app/*': '.svelte-kit/types/app/*',
      $routes: 'src/routes',
      '$routes/*': 'src/routes/*'
    },
    // Exclude legacy files from type checking in modern mode
    typescript: {
      config: (config) => {
        // Add exclusions for legacy files
        if (config.exclude) {
          config.exclude.push(
            '**/Legacy*.svelte',
            '**/*Legacy*.svelte',
            '**/Legacy*.ts',
            '**/*Legacy*.ts',
            '**/Legacy*.js',
            '**/*Legacy*.js',
            '**/legacy*',
            '**/*legacy*'
          );
        }
        return config;
      }
    }
  },
  dynamicCompileOptions: ({ filename }) => {
    // Use the compatibility configuration to get proper compiler options
    return getCompilerOptions(filename);
  }
};

export default config;
