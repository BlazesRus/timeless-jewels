import { mergeConfig } from 'vite';
import base from './vite.base.config';

export default mergeConfig(base, {
  base: '/timeless-jewels/',
  build: {
    outDir: 'dist/ghpages',
    emptyOutDir: true,
    sourcemap: false
  }
});
