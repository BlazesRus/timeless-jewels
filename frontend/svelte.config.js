import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess({
    postcss: true,
    typescript: {
      compilerOptions: {
        verbatimModuleSyntax: false,
        skipLibCheck: true
      },
      tsconfigFile: false
    }
  }),

  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html'//,
      //precompress: false
    }),
    paths: {
      base: '/timeless-jewels'
    },
    alias: {
      '$lib': 'src/lib',
      '$lib/*': 'src/lib/*',
      '$app': '.svelte-kit/types/app',
      '$app/*': '.svelte-kit/types/app/*',
      '$routes': 'src/routes',
      '$routes/*': 'src/routes/*'
    }
  },
  dynamicCompileOptions: ({ filename }) => {
    // Enable runes for Svelte 5 based files, disable runes for Legacy(Svelte 4) Mode
    const isSvelte5 = process.env.SVELTE_VERSION === '5';
    return { runes: isSvelte5 };
  }
};

export default config;
