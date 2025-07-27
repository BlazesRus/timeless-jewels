// vite.renderer.config.ts
import { mergeConfig } from 'vite';
import base from './vite.base.config';

export default mergeConfig(base, {
  base: './',
  build: {
    outDir: 'dist/renderer',
    ssrManifest: true,
  },
});
